#!/bin/bash
# Exercise job-app-claudecode's read-allowlist hook in both failure directions:
# blocking the main session, and silently not enforcing for the three roles.

set -uo pipefail
cd "$(dirname "$0")/.."

H=job-app-claudecode/hooks/scripts/agent-readonly.sh
W=$(mktemp -d)
trap 'rm -rf "$W"' EXIT
W=$(realpath "$W")

mkdir -p "$W/applications/acme" "$W/applications/other" "$W/profile"
echo acme > "$W/applications/.active"
touch "$W"/applications/acme/{posting.md,resume.pdf,resume.tex,notes.md} "$W/applications/other/posting.md" "$W/profile/facts.md"
ln -s "$W/applications/other" "$W/applications/sneaky"

fails=0
check() { # expected-exit agent path [JOB_APP_SLUG]
  local want=$1 agent=$2 file=$3 slug=${4:-} got
  printf '{"agent_type":"%s","cwd":"%s","tool_input":{"file_path":"%s"}}' "$agent" "$W" "$file" \
    | JOB_APP_SLUG="$slug" "$H" 2>/dev/null
  got=$?
  if [[ $got == "$want" ]]; then
    echo "PASS $agent ${file#"$W"/}${slug:+ (JOB_APP_SLUG=$slug)} -> $got"
  else
    echo "FAIL $agent ${file#"$W"/}${slug:+ (JOB_APP_SLUG=$slug)}: expected $want, got $got"
    fails=$((fails + 1))
  fi
}

check 0 main                  "$W/profile/facts.md"
check 0 general-purpose       "$W/applications/other/posting.md"
check 0 resume-critic         "$W/applications/acme/resume.pdf"
check 0 job-app:resume-critic "$W/applications/acme/posting.md"
check 2 resume-critic         "$W/applications/acme/resume.tex"
check 2 resume-critic         "$W/profile/facts.md"
check 2 resume-critic         "$W/applications/other/posting.md"
check 2 resume-critic         "$W/applications/sneaky/posting.md"
check 2 resume-critic         "$W/applications/acme/../other/posting.md"
check 2 resume-critic         "/etc/passwd"
check 0 resume-verifier       "$W/applications/acme/resume.tex"
check 0 resume-verifier       "$W/profile/facts.md"
check 2 resume-verifier       "$W/applications/acme/notes.md"
check 0 job-researcher        "$W/applications/acme/posting.md"
check 2 job-researcher        "$W/applications/acme/resume.pdf"
check 0 resume-critic         "$W/applications/other/posting.md" other
check 2 resume-critic         "$W/applications/acme/posting.md" other

rm "$W/applications/.active"
check 2 resume-critic         "$W/applications/acme/resume.pdf"
check 0 main                  "$W/profile/facts.md"

if (( fails )); then echo "$fails FAILED"; exit 1; fi
echo "all passed"
