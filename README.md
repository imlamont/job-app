# job-app

Takes you from a job posting to a submitted application: an honest fit read, a
tailored resume, cover letters and outreach, interview prep, application
tracking, and a closing improvement report. The core rule is **selection, not
invention** — every claim on the resume must trace back to the candidate's own
fact base and survive the obvious follow-up question.

The same workflow is packaged three ways. Pick one:

| | Runs in | What it adds |
|---|---|---|
| **[`job-app-claudecode/`](job-app-claudecode/)** | Claude Code | Three subagents and a read-restriction hook. The fact-check and hiring-manager critique are run by agents that never saw the drafting. |
| **[`job-app-opencode/`](job-app-opencode/)** | OpenCode | The same skill and subagents, with a TypeScript plugin enforcing the same read restrictions. |
| **[`job-app-simple/`](job-app-simple/)** | claude.ai, or anywhere a bare skill works | The workflow in one context. No subagents, no hooks, nothing to configure. |

The difference that matters: with subagents, the reviewer starts with a fresh
context and cannot be swayed by reasoning it never saw. In the simple version
the same model checks its own draft, which is a weaker check but needs no setup.

## Install

**Claude Code**

```shell
/plugin marketplace add <owner>/<repo>     # or a local path to this repository
/plugin install job-app@imlamont-plugins
```

Confirm with `/agents` that `resume-verifier`, `resume-critic`, and
`job-researcher` are registered. The hook needs `python3` on PATH; without it
the plugin still runs, but the read restrictions are not enforced, and the hook
says so on stderr.

**OpenCode**

```shell
cp -r job-app-opencode/.opencode /path/to/your/project/                # one project
cp -r job-app-opencode/.opencode/{skills,agents,plugins} ~/.config/opencode/   # or globally
```

Check with `opencode debug skill`, `opencode debug agent resume-critic`, and
`opencode debug config`. See [`job-app-opencode/README.md`](job-app-opencode/README.md).

**claude.ai**

```shell
scripts/build-skill.sh
```

Upload `job-app-simple/job-app.skill` under Settings → Capabilities → Skills.
The zip is a build artifact and is not committed.

## Workspace

All three variants use one workspace layout, so a workspace moves between
them unchanged. The Claude Code and OpenCode enforcement depends on it:

```
applications/
├── .active              # one line: the slug being worked on
└── <slug>/
    ├── posting.md       # the posting, saved verbatim
    ├── resume.tex|docx  # working copy
    ├── resume.pdf       # compiled — what the critic reads
    ├── research.md
    ├── review.md        # verifier verdicts and critic feedback
    └── notes.md
profile/
├── facts.md             # fact base, shared across applications, append-only
└── base-resume.tex      # never edited in place
applications.md          # tracker
```

Before delegating, write the slug to `applications/.active`, or set
`JOB_APP_SLUG`. Without either one, the three subagents can't read anything.
The main session is unaffected.

## Repository layout

```
.claude-plugin/marketplace.json     # Claude Code marketplace — lists job-app-claudecode
job-app-claudecode/                 # Claude Code plugin: skills/ agents/ hooks/
job-app-opencode/.opencode/         # OpenCode: skills/ agents/ plugins/
job-app-simple/job-app/             # single-context skill (canonical references/ and assets/)
scripts/                            # sync-shared.sh, build-skill.sh
tests/                              # enforcement tests for the hook and the plugin
```

## Maintaining

**`references/` and `assets/` are duplicated across all three variants**, so each
one installs standalone. The canonical copy is `job-app-simple/job-app/`. Edit
it there, then run:

```shell
scripts/sync-shared.sh           # copy to the other two
scripts/sync-shared.sh --check   # fails if anything has drifted
```

**The three `SKILL.md` files are maintained by hand.** The simple one runs both
reviews inline. The Claude Code one adds the delegation stages and the
enforcement details of the shared working-directory contract. The OpenCode one is the Claude Code one with
OpenCode's mechanisms (plugin, `permission`, `question`). A change to a
workflow stage usually belongs in all three.

**The two enforcement implementations share one rule set.** Keep the `PROFILES`
tables in `job-app-claudecode/hooks/scripts/agent-readonly.sh` and
`job-app-opencode/.opencode/plugins/job-app.ts` identical, and run both test suites:

```shell
tests/claudecode-hook.sh
BUN_BE_BUN=1 opencode run tests/opencode-plugin.ts    # OpenCode's embedded Bun; or: bun tests/opencode-plugin.ts
```

Each test suite checks both ways enforcement can fail: blocking the main
session, and not enforcing for the three roles.

**Releasing.** Bump `version` in `job-app-claudecode/.claude-plugin/plugin.json`.
That is what decides whether existing Claude Code installs receive changes.
Validate with `claude plugin validate .` and
`claude plugin validate job-app-claudecode`. Validation checks structure, not
behavior, so run the tests too.

## Caveats on `source`

The marketplace's relative `source` path resolves only when the marketplace is
added via git or a local path; adding it by direct URL to `marketplace.json`
will not resolve it. Some Claude Code versions have also rejected string sources
with `Invalid schema: plugins.0.source`; the reported workaround is the object form:

```json
"source": { "source": "local", "path": "./job-app-claudecode" }
```
