#!/bin/bash
# PreToolUse read-allowlist for the job-app plugin's subagents.
#
# This hook fires for EVERY Read in the session, including the main
# conversation's. It dispatches on the agent_type field in the hook payload:
#
#   main, or any agent not belonging to this plugin  -> allowed, untouched
#   resume-verifier   -> applications/<active>/resume.*  +  profile/facts.md
#   resume-critic     -> applications/<active>/resume.pdf, posting.md
#   job-researcher    -> applications/<active>/posting.md
#
# Enforcement is scoped to the ACTIVE application, so no agent can read any
# other application. The active slug comes from $JOB_APP_SLUG, else
# the first line of applications/.active. No slug means no reads, for the
# three roles only -- the main session is never affected by a missing .active.
#
# Plugin subagents may report a scoped agent_type ("job-app:resume-critic"),
# so the prefix is stripped before matching.
#
# Paths are canonicalized before matching: `..` and symlinks resolve to their
# real target first. Exit 2 blocks the call and returns the message to the agent.
# Fails closed for the three roles, open for everyone else.

if ! command -v python3 >/dev/null 2>&1; then
  # Cannot parse the payload, so cannot tell who is calling. Blocking every
  # Read in the session would be worse than the missing check; say so loudly.
  echo "job-app plugin: hook needs python3 on PATH and did not find it. Subagent read restrictions are NOT being enforced." >&2
  exit 0
fi

RESULT=$(python3 -c '
import json, os, re, sys

PROFILES = {
    "resume-verifier": ([r"resume\.[A-Za-z0-9]+"], True),
    "resume-critic":   ([r"resume\.pdf", r"posting\.md"], False),
    "job-researcher":  ([r"posting\.md"], False),
}
APPS = "applications"

try:
    payload = json.load(sys.stdin)
except Exception:
    # Unparseable payload. We do not know who is calling, so we cannot
    # single out our own agents; let it through rather than breaking the session.
    print("ALLOW"); sys.exit(0)

agent = (payload.get("agent_type") or "main").split(":")[-1]
if agent not in PROFILES:
    print("ALLOW"); sys.exit(0)

names, may_read_facts = PROFILES[agent]

root = payload.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
root = os.path.realpath(os.path.abspath(root))

slug = os.environ.get("JOB_APP_SLUG", "").strip()
if not slug:
    try:
        with open(os.path.join(root, APPS, ".active")) as fh:
            slug = fh.readline().strip()
    except Exception:
        slug = ""
if not slug or "/" in slug or slug in (".", ".."):
    print("BLOCK: no active application. Write the slug to %s/.active before delegating." % APPS)
    sys.exit(0)

tool_input = payload.get("tool_input") or {}
raw = next((tool_input[k] for k in ("file_path", "path", "notebook_path")
            if tool_input.get(k)), "")
if not raw:
    print("BLOCK: could not determine the target path from this tool call."); sys.exit(0)

resolved = os.path.realpath(os.path.abspath(os.path.expanduser(raw)))
if os.path.commonpath([resolved, root]) != root:
    print("BLOCK: %s is outside the project." % resolved); sys.exit(0)

allowed = [re.escape(os.path.join(root, APPS, slug)) + "/" + n for n in names]
if may_read_facts:
    allowed.append(re.escape(os.path.join(root, "profile", "facts.md")))

if any(re.fullmatch(p, resolved) for p in allowed):
    print("ALLOW")
else:
    print("BLOCK: %s (active application is %r)" % (resolved, slug))
' 2>/dev/null)

case "$RESULT" in
  ALLOW) exit 0 ;;
  "")    echo "job-app plugin: the path check failed to run." >&2; exit 2 ;;
esac

echo "Blocked by the job-app plugin: this agent may read only its allowlisted files inside the active application directory. ${RESULT}" >&2
exit 2
