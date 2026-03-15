#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.cargo/bin:$PATH"

echo "=== Rust workspace: fmt check ==="
cargo fmt --all -- --check

echo "=== Rust workspace: clippy ==="
cargo clippy --all --all-targets -- -D warnings

echo "=== Rust workspace: tests ==="
cargo test

echo "=== Tauri crate: check ==="
(cd crates/app/src-tauri && cargo check)

echo "=== Frontend: type check ==="
(cd crates/app && npx tsc --noEmit)

echo "=== Frontend: vitest ==="
(cd crates/app && npm test)

echo "✅ All checks passed"
