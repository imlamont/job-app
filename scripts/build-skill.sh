#!/bin/bash
# Build job-app-simple/job-app.skill (a zip of job-app-simple/job-app/) for
# upload to claude.ai. Refuses to build if the shared files have drifted.

set -euo pipefail
cd "$(dirname "$0")/.."

scripts/sync-shared.sh --check

cd job-app-simple
rm -f job-app.skill
zip -qr -X job-app.skill job-app -x '*.DS_Store'
echo "built job-app-simple/job-app.skill"
