use std::path::Path;

use regex::Regex;

use crate::error::{BrainMapError, Result};
use crate::model::{Frontmatter, InlineLink, Note, NoteId, RelativePath};

pub fn parse_note(content: &str, path: &RelativePath) -> Result<Note> {
    let (raw_yaml, body) = split_frontmatter(content)?;
    let mut frontmatter: Frontmatter = serde_yaml::from_str(&raw_yaml).map_err(|e| {
        BrainMapError::InvalidYaml(format!("{}: {}", path, e))
    })?;

    if frontmatter.id.0.is_nil() {
        frontmatter.id = NoteId::new();
    }

    let inline_links = extract_inline_links(&body, path);

    Ok(Note {
        path: path.clone(),
        frontmatter,
        body,
        inline_links,
    })
}

pub fn serialize_note(note: &Note) -> Result<String> {
    let yaml = serde_yaml::to_string(&note.frontmatter)?;
    Ok(format!("---\n{}---\n{}", yaml, note.body))
}

pub fn parse_file(workspace_root: &Path, file_path: &Path) -> Result<Note> {
    let relative = file_path
        .strip_prefix(workspace_root)
        .map_err(|_| {
            BrainMapError::InvalidWorkspace(format!(
                "{} is not under {}",
                file_path.display(),
                workspace_root.display()
            ))
        })?;

    let rel_path = RelativePath::new(&relative.to_string_lossy());
    let content = std::fs::read_to_string(file_path)
        .map_err(|_| BrainMapError::FileNotFound(file_path.display().to_string()))?;

    parse_note(&content, &rel_path)
}

fn split_frontmatter(content: &str) -> Result<(String, String)> {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return Err(BrainMapError::InvalidYaml(
            "file does not start with ---".to_string(),
        ));
    }

    let after_first = &trimmed[3..];
    let after_first = after_first.strip_prefix('\n').unwrap_or(after_first);

    let end = after_first.find("\n---").ok_or_else(|| {
        BrainMapError::InvalidYaml("no closing --- found".to_string())
    })?;

    let yaml = after_first[..end].to_string();
    let body_start = end + 4; // skip \n---
    let body = if body_start < after_first.len() {
        let rest = &after_first[body_start..];
        rest.strip_prefix('\n').unwrap_or(rest).to_string()
    } else {
        String::new()
    };

    Ok((yaml, body))
}

fn extract_inline_links(body: &str, note_path: &RelativePath) -> Vec<InlineLink> {
    let re = Regex::new(r"\[([^\]]*)\]\(([^)]+\.md)\)").unwrap();
    re.captures_iter(body)
        .map(|cap| {
            let label = cap.get(1).map(|m| m.as_str().to_string());
            let raw_target = cap[2].to_string();
            let resolved = note_path.resolve_relative(&raw_target);

            InlineLink {
                target: resolved.as_str().to_string(),
                label: label.filter(|l| !l.is_empty()),
                position: cap.get(0).unwrap().start(),
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_note(yaml: &str, body: &str) -> String {
        format!("---\n{}\n---\n{}", yaml, body)
    }

    #[test]
    fn test_parse_minimal_concept() {
        let content = make_note(
            r#"id: "550e8400-e29b-41d4-a716-446655440000"
title: "Causality"
type: concept
tags: [causality, philosophy]
status: draft
created: 2025-01-15
modified: 2025-01-15
domain: philosophy
maturity: seed"#,
            "Some body content.\n",
        );

        let path = RelativePath::new("Concepts/Causality.md");
        let note = parse_note(&content, &path).unwrap();

        assert_eq!(note.frontmatter.title, "Causality");
        assert_eq!(note.frontmatter.note_type, "concept");
        assert_eq!(note.frontmatter.tags, vec!["causality", "philosophy"]);
        assert_eq!(note.body, "Some body content.\n");
        assert!(note.frontmatter.extra.contains_key("domain"));
        assert!(note.frontmatter.extra.contains_key("maturity"));
    }

    #[test]
    fn test_parse_with_links() {
        let content = make_note(
            r#"id: "550e8400-e29b-41d4-a716-446655440001"
title: "Test"
type: concept
created: 2025-01-15
modified: 2025-01-15
links:
  - target: Concepts/SCM.md
    type: related-to
    annotation: "see also""#,
            "Body text.\n",
        );

        let path = RelativePath::new("test.md");
        let note = parse_note(&content, &path).unwrap();

        assert_eq!(note.frontmatter.links.len(), 1);
        assert_eq!(note.frontmatter.links[0].target, "Concepts/SCM.md");
        assert_eq!(note.frontmatter.links[0].rel, "related-to");
        assert_eq!(
            note.frontmatter.links[0].annotation.as_deref(),
            Some("see also")
        );
    }

    #[test]
    fn test_extract_inline_links() {
        let body = "Read about [structural causal models](../Concepts/SCM.md) and [RCTs](../Concepts/RCT.md).";
        let path = RelativePath::new("Chapter 1/intro.md");
        let links = extract_inline_links(body, &path);

        assert_eq!(links.len(), 2);
        assert_eq!(links[0].target, "Concepts/SCM.md");
        assert_eq!(links[0].label.as_deref(), Some("structural causal models"));
        assert_eq!(links[1].target, "Concepts/RCT.md");
    }

    #[test]
    fn test_no_frontmatter_delimiter() {
        let result = parse_note("no frontmatter here", &RelativePath::new("test.md"));
        assert!(result.is_err());
    }

    #[test]
    fn test_round_trip_preserves_extra_fields() {
        let content = make_note(
            r#"id: "550e8400-e29b-41d4-a716-446655440002"
title: "Person Note"
type: person
created: 2025-01-15
modified: 2025-01-15
affiliation: "MIT"
field: "Computer Science"
era: modern"#,
            "Bio goes here.\n",
        );

        let path = RelativePath::new("People/Person.md");
        let note = parse_note(&content, &path).unwrap();

        assert!(note.frontmatter.extra.contains_key("affiliation"));
        assert!(note.frontmatter.extra.contains_key("field"));
        assert!(note.frontmatter.extra.contains_key("era"));

        let serialized = serialize_note(&note).unwrap();
        let reparsed = parse_note(&serialized, &path).unwrap();

        assert_eq!(reparsed.frontmatter.title, note.frontmatter.title);
        assert_eq!(reparsed.frontmatter.note_type, note.frontmatter.note_type);
        assert!(reparsed.frontmatter.extra.contains_key("affiliation"));
        assert!(reparsed.frontmatter.extra.contains_key("field"));
        assert!(reparsed.frontmatter.extra.contains_key("era"));
        assert_eq!(reparsed.body, note.body);
    }

    #[test]
    fn test_inline_links_skip_non_md() {
        let body = "See [image](photo.png) and [note](Concepts/X.md).";
        let path = RelativePath::new("test.md");
        let links = extract_inline_links(body, &path);

        assert_eq!(links.len(), 1);
        assert_eq!(links[0].target, "Concepts/X.md");
    }
}
