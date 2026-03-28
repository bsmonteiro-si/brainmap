#!/usr/bin/env bash
#
# Launch or stop an isolated BrainMap app instance for AI-guided testing.
#
# Usage:
#   ./scripts/e2e-app.sh start          # launch on port 1520, seed workspace
#   ./scripts/e2e-app.sh start /path    # launch with a specific workspace
#   ./scripts/e2e-app.sh stop           # kill the instance and clean up
#   ./scripts/e2e-app.sh status         # check if running
#
# The app runs on port 1520 with MCP socket at /tmp/brainmap-mcp-isolated.sock
# Your dev instance on port 1420 is untouched.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_ROOT/crates/app"

SOCKET_PATH="/tmp/brainmap-mcp-isolated.sock"
PID_FILE="/tmp/brainmap-e2e-isolated.pid"
WORKSPACE_FILE="/tmp/brainmap-e2e-isolated.workspace"
LOG_FILE="$REPO_ROOT/tests/e2e/logs/isolated-app.log"
APP_LOG_DIR="$REPO_ROOT/tests/e2e/logs/app"
VITE_PORT=1520
VITE_HMR_PORT=1521

start() {
  if is_running; then
    echo "Already running (pid=$(cat "$PID_FILE")). Use '$0 stop' first."
    exit 1
  fi

  # Determine workspace path
  local workspace="${1:-}"
  local temp_workspace=""
  if [ -z "$workspace" ]; then
    # Copy seed/ to a temp directory
    temp_workspace=$(mktemp -d /tmp/brainmap-e2e-isolated-ws-XXXXXX)
    cp -R "$REPO_ROOT/seed/." "$temp_workspace/"
    workspace="$temp_workspace"
    echo "$temp_workspace" > "$WORKSPACE_FILE"
    echo "Using temp workspace: $temp_workspace"
  else
    echo "" > "$WORKSPACE_FILE"
    echo "Using workspace: $workspace"
  fi

  # Clean up stale socket
  rm -f "$SOCKET_PATH" "${SOCKET_PATH}.token"

  # Ensure log directories exist
  mkdir -p "$(dirname "$LOG_FILE")"
  mkdir -p "$APP_LOG_DIR"

  # Build the tauri config override
  local tauri_config
  tauri_config=$(printf '{"build":{"devUrl":"http://localhost:%s","beforeDevCommand":"vite --port %s"}}' "$VITE_PORT" "$VITE_PORT")

  echo "Launching BrainMap on port $VITE_PORT with socket $SOCKET_PATH ..."
  echo "Cargo/Vite log: $LOG_FILE"
  echo "App logs:       $APP_LOG_DIR/"

  # Launch in background
  # BRAINMAP_LOG_DIR separates app logs from the dev instance
  cd "$APP_DIR"
  BRAINMAP_MCP_SOCKET="$SOCKET_PATH" \
  BRAINMAP_LOG_DIR="$APP_LOG_DIR" \
  VITE_PORT="$VITE_PORT" \
  VITE_HMR_PORT="$VITE_HMR_PORT" \
  PATH="$HOME/.cargo/bin:$PATH" \
  npx tauri dev --config "$tauri_config" \
    > "$LOG_FILE" 2>&1 &

  local pid=$!
  echo "$pid" > "$PID_FILE"
  echo "Started (pid=$pid). Waiting for socket..."

  # Wait for socket file
  local elapsed=0
  while [ ! -S "$SOCKET_PATH" ]; do
    sleep 1
    elapsed=$((elapsed + 1))
    if [ $elapsed -ge 180 ]; then
      echo "Timed out waiting for socket after 180s. Check $LOG_FILE"
      stop
      exit 1
    fi
    # Check if process died
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "Process died before socket was ready. Check $LOG_FILE"
      rm -f "$PID_FILE"
      exit 1
    fi
  done

  echo "Socket ready. App is running."
  echo ""
  echo "To open the workspace, the AI agent will use:"
  echo "  openFolderAsSegment('$workspace')"
  echo ""
  echo "Stop with: $0 stop"
}

stop() {
  if [ ! -f "$PID_FILE" ]; then
    echo "No PID file found. Not running?"
    # Clean up socket anyway
    rm -f "$SOCKET_PATH" "${SOCKET_PATH}.token"
    return
  fi

  local pid
  pid=$(cat "$PID_FILE")
  echo "Stopping (pid=$pid)..."

  # Kill the process group
  if kill -0 "$pid" 2>/dev/null; then
    kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
    # Wait up to 5s for graceful shutdown
    local waited=0
    while kill -0 "$pid" 2>/dev/null && [ $waited -lt 5 ]; do
      sleep 1
      waited=$((waited + 1))
    done
    # Force kill if still alive
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 -- -"$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
    fi
  fi

  rm -f "$PID_FILE"

  # Clean up temp workspace if we created one
  if [ -f "$WORKSPACE_FILE" ]; then
    local temp_ws
    temp_ws=$(cat "$WORKSPACE_FILE")
    if [ -n "$temp_ws" ] && [ -d "$temp_ws" ]; then
      rm -rf "$temp_ws"
      echo "Cleaned up temp workspace: $temp_ws"
    fi
    rm -f "$WORKSPACE_FILE"
  fi

  # Clean up socket
  rm -f "$SOCKET_PATH" "${SOCKET_PATH}.token"

  echo "Stopped."
}

is_running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

status_cmd() {
  if is_running; then
    echo "Running (pid=$(cat "$PID_FILE"))"
    echo "Socket: $SOCKET_PATH"
    echo "Port: $VITE_PORT"
  else
    echo "Not running."
    rm -f "$PID_FILE"  # clean stale PID file
  fi
}

case "${1:-}" in
  start)  start "${2:-}" ;;
  stop)   stop ;;
  status) status_cmd ;;
  *)
    echo "Usage: $0 {start [workspace-path]|stop|status}"
    exit 1
    ;;
esac
