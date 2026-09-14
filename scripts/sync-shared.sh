#!/bin/bash
# Copy references/ and assets/ from the canonical skill (job-app-simple/job-app)
# into the Claude Code and OpenCode variants. Each variant keeps its own copy so
# it installs standalone. With --check, change nothing and exit 1 on drift.

set -euo pipefail
cd "$(dirname "$0")/.."

SRC=job-app-simple/job-app
TARGETS=(
  job-app-claudecode/skills/job-app
  job-app-opencode/.opencode/skills/job-app
)

status=0
for t in "${TARGETS[@]}"; do
  for d in references assets; do
    if [[ "${1:-}" == "--check" ]]; then
      if ! diff -r "$SRC/$d" "$t/$d" >/dev/null; then
        echo "drift: $t/$d differs from $SRC/$d" >&2
        status=1
      fi
    else
      rm -rf "${t:?}/$d"
      cp -r "$SRC/$d" "$t/$d"
    fi
  done
done

[[ "${1:-}" == "--check" && $status -eq 0 ]] && echo "shared files in sync"
exit $status
