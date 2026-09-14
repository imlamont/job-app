# job-app for OpenCode

The same workflow as the Claude Code plugin: a `job-app` skill, the three review
subagents, and a plugin that confines each subagent to its own files inside the
active application.

See the [top-level README](../README.md) for the other variants and for maintenance.

## What's in it

```
.opencode/
├── skills/job-app/      # SKILL.md, references/, assets/
├── agents/              # resume-verifier.md, resume-critic.md, job-researcher.md
└── plugins/job-app.ts   # tool + read allowlist for those three agents
```

## Install

Into one project (merges with an existing `.opencode/`):

```shell
cp -r job-app-opencode/.opencode /path/to/your/project/
```

Or globally, for every project:

```shell
mkdir -p ~/.config/opencode
cp -r job-app-opencode/.opencode/{skills,agents,plugins} ~/.config/opencode/
```

The plugin has no dependencies. Check that everything was picked up by running
these from the project directory:

```shell
opencode debug skill                  # lists job-app
opencode debug agent resume-critic    # mode subagent; edit/bash/... denied
opencode debug config                 # "plugin" array includes job-app.ts
```

OpenCode also loads skills from `.claude/skills/` and `~/.claude/skills/`. Don't
also install the single-context `job-app` skill there, or two different skills
with the same name will be visible.

## How enforcement works

The workspace layout and `applications/.active` contract are identical to the
Claude Code plugin's.

- **Tools.** Each agent's `permission` frontmatter denies `edit`, `bash`, `glob`,
  `grep`, `task`, `skill`, `lsp`, `question`, and `external_directory`, and the
  critic and verifier are also denied the web. The plugin enforces the same
  allowlist independently.
- **Reads.** OpenCode's `tool.execute.before` hook does not identify the calling
  agent, so the plugin records each session's agent from `chat.params` and looks
  it up before every tool call. Subagents run in their own child sessions, so
  the mapping is exact. Read paths are canonicalized (`..` and symlinks resolve
  first) and must be one of that role's files in `applications/<active>/`.
- **Failure direction.** The plugin fails closed for the three roles: a missing
  `.active`, a path outside the project, or a non-allowlisted file blocks the
  call. Every other agent passes through untouched.

`read` path rules are not set in the agent frontmatter, because OpenCode matches
them against paths relative to the git worktree, and outside a git repository
they would block the agents' own files.

Tested against OpenCode 1.18.31. The plugin depends on `chat.params` carrying
`sessionID` and `agent`; if a future version changes that, `tests/opencode-plugin.ts`
still passes but real sessions go unenforced, so re-check the hook signature on upgrade.
