# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

One job application workflow (`job-app`), packaged three ways. Almost all of the "code" is Markdown prompts; the rest is manifests, one bash/python hook, one TypeScript plugin, and shell scripts. There is no package manager and no build step apart from zipping the claude.ai skill.

| Directory | Runs in | Contents |
|---|---|---|
| `job-app-claudecode/` | Claude Code | Plugin: skill, three subagents, `PreToolUse` read hook |
| `job-app-opencode/.opencode/` | OpenCode | Same skill and subagents, plus a TS plugin enforcing the same rules |
| `job-app-simple/job-app/` | claude.ai, or anywhere a bare skill works | Single-context skill, no subagents; zipped to `job-app.skill` |

The root `.claude-plugin/marketplace.json` (`imlamont-plugins`) lists only the Claude Code plugin, with `source: ./job-app-claudecode`. In that plugin, `skills/`, `agents/`, and `hooks/` must stay at the plugin root. If they're inside `.claude-plugin/`, the plugin loads without error but those components silently go missing.

"job-app" is the project name. `applications/`, `applications/.active`, and `applications.md` are the user's workspace (job applications), not the project name, so don't rename them.

## Commands

```shell
scripts/sync-shared.sh            # copy references/ + assets/ from job-app-simple/job-app to the other two
scripts/sync-shared.sh --check    # exit 1 if they have drifted
scripts/build-skill.sh            # --check, then zip job-app-simple/job-app.skill (gitignored)

tests/claudecode-hook.sh                                        # Claude Code hook allow/block cases
BUN_BE_BUN=1 ~/.opencode/bin/opencode run tests/opencode-plugin.ts   # OpenCode plugin cases (or: bun tests/opencode-plugin.ts)

claude plugin validate .                    # marketplace manifest
claude plugin validate job-app-claudecode   # plugin manifest (structure only)
```

To check OpenCode discovery, copy `job-app-opencode/.opencode` into a scratch directory and run these from inside it: `opencode debug skill`, `opencode debug agent resume-critic` (shows the resolved permission rules), and `opencode debug config` (the `plugin` array should list `job-app.ts`).

## Architecture

**Shared files vs. divergent files.** `references/` and `assets/` are byte-identical in all three variants. The canonical copy is `job-app-simple/job-app/`: edit there, then run `sync-shared.sh`. The three `SKILL.md` files are maintained by hand and intentionally differ:
- The simple skill runs both review passes (groundedness, then a skeptical read) inline, in Stage 5b. Its working-directory section uses the same layout and `.active` file, unenforced, so workspaces are interchangeable across variants.
- The Claude Code skill adds the Setup and delegation sections, an enforcement version of the working-directory section, and delegates Stage 0 research and Stage 5b to subagents.
- The OpenCode skill is the Claude Code one with platform terms swapped: the hook becomes the plugin, `tools:` becomes `permission`, `AskUserQuestion` becomes the `question` permission, and `/agents` goes away.

A change to a workflow stage usually has to be applied to all three.

**Delegation model (claudecode and opencode).** The main session drafts the resume and is the only thing that talks to the user. `resume-verifier` (resume source + `profile/facts.md`, returns `APPROVED`/`VIOLATIONS`, capped at 3 rounds), `resume-critic` (`resume.pdf` + `posting.md` only), and `job-researcher` (`posting.md` + web) run in fresh contexts. The skill tells the main session to pass them paths, never its reasoning.

**Read enforcement: two implementations of one rule set.** Both confine the three roles to their files inside `applications/<active>/`. The active slug comes from `$JOB_APP_SLUG`, else from the first line of `applications/.active`. Paths are realpath-canonicalized and must be inside the project. Both fail closed for the three roles and open for every other agent. Keep the `PROFILES` tables in the two files in sync:
- `job-app-claudecode/hooks/scripts/agent-readonly.sh` runs as a `PreToolUse` hook on `Read`. It dispatches on the payload's `agent_type`, stripping any `job-app:` prefix. Exit 2 blocks. It needs `python3`; without it the hook warns and allows everything.
- `job-app-opencode/.opencode/plugins/job-app.ts`: OpenCode's `tool.execute.before` does not say which agent is calling. So the plugin records session → agent from `chat.params`, which fires on every model request (subagents get their own child sessions), then checks it in `tool.execute.before`. Throwing blocks. Unlike the hook, it also enforces a per-role tool allowlist, not just `read`.
- OpenCode agent frontmatter `permission` denies the unneeded tools as a second layer, but deliberately sets no `read` path rules. OpenCode matches `read` patterns against paths relative to the git worktree, which misfires outside a git repo, so path checks live only in the plugin.

**Filenames are a contract.** `posting.md`, `resume.pdf`, `resume.*`, `profile/facts.md`, and `applications/.active` are hardcoded in both `PROFILES` tables, in the claudecode and opencode `SKILL.md` tables, and in the agent prompts. Rename in one place without the others and that subagent is blocked from its input.

**Releasing.** A push to the `release` branch runs `.github/workflows/build-skill.yml`: it runs `build-skill.sh`, uploads the zip as a workflow artifact, and deletes and recreates the `job-app-skill` release with the zip attached, so the public download URL stays fixed. Bump `version` in `job-app-claudecode/.claude-plugin/plugin.json`. That is what decides whether already-installed Claude Code users receive changes. OpenCode and claude.ai installs are copies, so re-copying or re-uploading is the update.
