//! macOS dock menu showing recent segments.
//!
//! Uses Objective-C runtime interop to add `applicationDockMenu:` to Tauri's
//! existing NSApp delegate at runtime. This is fragile and may need updating
//! if a future Tauri version adds its own dock menu support.

use std::sync::{Mutex, OnceLock};

use objc2::ffi::{class_addMethod, class_replaceMethod, object_getClass};
use objc2::rc::Retained;
use objc2::runtime::{AnyObject, Imp, Sel};
use objc2::{sel, MainThreadOnly};
use objc2_app_kit::{NSApplication, NSMenu, NSMenuItem};
use objc2_foundation::{MainThreadMarker, NSString};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tracing::{info, warn};

/// Minimal segment info for building dock menu items.
#[derive(Deserialize, Clone)]
pub struct DockSegmentInfo {
    pub name: String,
    pub path: String,
}

/// Payload emitted when user clicks a segment in the dock menu.
#[derive(Serialize, Clone)]
struct DockOpenPayload {
    path: String,
}

/// Global app handle for emitting events from ObjC callbacks.
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();

/// Wrapper to make Retained<NSMenu> Send+Sync. Safety: we only access the
/// underlying NSMenu from the main thread (applicationDockMenu: callback
/// and rebuild_menu, both guaranteed main-thread-only).
struct SendMenu(Option<Retained<NSMenu>>);
unsafe impl Send for SendMenu {}
unsafe impl Sync for SendMenu {}

/// The current dock menu. Rust keeps a strong reference; macOS adds its own
/// retain/release on top when returning from applicationDockMenu:.
static DOCK_MENU: Mutex<SendMenu> = Mutex::new(SendMenu(None));

/// Segment paths indexed by menu item tag. Accessed from main thread callbacks.
static SEGMENT_PATHS: Mutex<Vec<String>> = Mutex::new(Vec::new());

/// Distinguish "Open Folder..." item from segment items.
const OPEN_FOLDER_TAG: isize = -1;

/// Initialize dock menu support. Call once during app setup.
pub fn init(app: &AppHandle) {
    let _ = APP_HANDLE.set(app.clone());

    // Must run on main thread for NSApplication access.
    let app_clone = app.clone();
    let _ = app_clone.run_on_main_thread(move || {
        unsafe { install_dock_menu_method() };
    });
}

/// Rebuild the dock menu with the given segments.
pub fn update(segments: Vec<DockSegmentInfo>) {
    let Some(app) = APP_HANDLE.get() else {
        return;
    };
    let app = app.clone();
    let _ = app.run_on_main_thread(move || {
        unsafe { rebuild_menu(&segments) };
    });
}

/// Add `applicationDockMenu:` to Tauri's NSApp delegate class.
///
/// # Safety
/// Must be called on the main thread.
unsafe fn install_dock_menu_method() {
    let Some(mtm) = MainThreadMarker::new() else {
        warn!("dock_menu: not on main thread, skipping install");
        return;
    };

    let nsapp = NSApplication::sharedApplication(mtm);
    let Some(delegate) = nsapp.delegate() else {
        warn!("dock_menu: NSApp has no delegate, skipping");
        return;
    };

    // Get the delegate's class so we can add a method to it.
    let delegate_ptr: *const AnyObject = Retained::as_ptr(&delegate).cast();
    let cls = object_getClass(delegate_ptr);
    if cls.is_null() {
        warn!("dock_menu: could not get delegate class");
        return;
    }
    let cls_mut = cls as *mut _;

    let sel = sel!(applicationDockMenu:);
    // ObjC type encoding: returns id (@), takes self (@) and _cmd (:) and sender (@)
    let types = c"@@:@";

    let imp: Imp = std::mem::transmute(
        application_dock_menu
            as unsafe extern "C-unwind" fn(
                *const AnyObject,
                Sel,
                *const AnyObject,
            ) -> *const AnyObject,
    );

    let added = class_addMethod(cls_mut, sel, imp, types.as_ptr());
    if !added.as_bool() {
        warn!("dock_menu: applicationDockMenu: already exists on delegate, replacing");
        class_replaceMethod(cls_mut, sel, imp, types.as_ptr());
    }

    info!("dock_menu: installed applicationDockMenu: on delegate");

    // Also install the click handler for segment items.
    let click_sel = sel!(dockSegmentClicked:);
    let click_imp: Imp = std::mem::transmute(
        dock_segment_clicked
            as unsafe extern "C-unwind" fn(*const AnyObject, Sel, *const AnyObject),
    );
    let click_types = c"v@:@";
    let added = class_addMethod(cls_mut, click_sel, click_imp, click_types.as_ptr());
    if !added.as_bool() {
        class_replaceMethod(cls_mut, click_sel, click_imp, click_types.as_ptr());
    }
}

/// Build the NSMenu with segment items.
///
/// # Safety
/// Must be called on the main thread.
unsafe fn rebuild_menu(segments: &[DockSegmentInfo]) {
    let Some(mtm) = MainThreadMarker::new() else {
        return;
    };

    let menu = NSMenu::new(mtm);

    // Update the path lookup table.
    if let Ok(mut paths) = SEGMENT_PATHS.lock() {
        paths.clear();
        paths.extend(segments.iter().map(|s| s.path.clone()));
    }

    let nsapp = NSApplication::sharedApplication(mtm);
    let delegate = nsapp.delegate();
    let target: Option<&AnyObject> = delegate.as_ref().map(|d| {
        let ptr: *const AnyObject = Retained::as_ptr(d).cast();
        &*ptr
    });

    let click_sel = sel!(dockSegmentClicked:);

    for (i, seg) in segments.iter().enumerate() {
        let title = NSString::from_str(&seg.name);
        let key_equiv = NSString::from_str("");
        let item = NSMenuItem::initWithTitle_action_keyEquivalent(
            NSMenuItem::alloc(mtm),
            &title,
            Some(click_sel),
            &key_equiv,
        );
        item.setTag(i as isize);
        if let Some(t) = target {
            item.setTarget(Some(t));
        }
        menu.addItem(&item);
    }

    // Separator + "Open Folder..."
    if !segments.is_empty() {
        let sep = NSMenuItem::separatorItem(mtm);
        menu.addItem(&sep);
    }

    let open_title = NSString::from_str("Open Folder...");
    let open_key = NSString::from_str("");
    let open_item = NSMenuItem::initWithTitle_action_keyEquivalent(
        NSMenuItem::alloc(mtm),
        &open_title,
        Some(click_sel),
        &open_key,
    );
    open_item.setTag(OPEN_FOLDER_TAG);
    if let Some(t) = target {
        open_item.setTarget(Some(t));
    }
    menu.addItem(&open_item);

    // Swap in the new menu. The old Retained<NSMenu> drops naturally, releasing it.
    if let Ok(mut guard) = DOCK_MENU.lock() {
        guard.0 = Some(menu);
    }
}

/// ObjC callback: `- (NSMenu *)applicationDockMenu:(NSApplication *)sender`
///
/// Called by macOS each time the user right-clicks the dock icon.
/// Returns the current dock menu, or nil if none is set.
///
/// # Safety
/// Called from Objective-C runtime on main thread.
unsafe extern "C-unwind" fn application_dock_menu(
    _this: *const AnyObject,
    _cmd: Sel,
    _sender: *const AnyObject,
) -> *const AnyObject {
    let Ok(guard) = DOCK_MENU.lock() else {
        return std::ptr::null();
    };
    match guard.0.as_ref() {
        Some(menu) => Retained::as_ptr(menu) as *const AnyObject,
        None => std::ptr::null(),
    }
}

/// ObjC callback: `- (void)dockSegmentClicked:(NSMenuItem *)sender`
///
/// Emits a Tauri event with the segment path so the frontend can open/switch.
///
/// # Safety
/// Called from Objective-C runtime on main thread.
unsafe extern "C-unwind" fn dock_segment_clicked(
    _this: *const AnyObject,
    _cmd: Sel,
    sender: *const AnyObject,
) {
    if sender.is_null() {
        return;
    }

    let Some(app) = APP_HANDLE.get() else {
        return;
    };

    // Cast sender to NSMenuItem to read tag.
    let item: &NSMenuItem = &*(sender as *const NSMenuItem);
    let tag = item.tag();

    if tag == OPEN_FOLDER_TAG {
        let _ = app.emit("brainmap://dock-open-folder", ());
        return;
    }

    // Look up path by tag index.
    let path = {
        let Ok(paths) = SEGMENT_PATHS.lock() else {
            return;
        };
        paths.get(tag as usize).cloned()
    };

    if let Some(path) = path {
        let _ = app.emit("brainmap://dock-open-segment", DockOpenPayload { path });
    }
}
