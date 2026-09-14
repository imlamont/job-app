# job-app for Claude Code

Takes you from a job posting to a submitted application: an honest fit read, a
tailored resume, supporting writing, interview prep, and an improvement report —
with the two review passes delegated to subagents that never saw the drafting.

See the [top-level README](../README.md) for the other variants and for maintenance.

## What's in it

- **Skill** `job-app`: the workflow, plus reference files on tailoring, role
  types, verification, cover letters, interview prep, and the improvement report
- **Subagents** `resume-verifier`, `resume-critic`, `job-researcher`
- **Hook** a `PreToolUse` read-allowlist confining each subagent to its own files
  inside the active application

## Install

The marketplace lives at the repository root and points here.

```shell
/plugin marketplace add imlamont/job-app@release
/plugin install job-app@imlamont-plugins
```

This follows the `release` branch. Pull new releases with
`/plugin marketplace update imlamont-plugins`.

Confirm with `/agents` that `resume-verifier`, `resume-critic`, and
`job-researcher` are registered.

Requires `python3` on PATH for the hook. Without it, the plugin still works but
the read restrictions are not enforced, and the hook says so on stderr.

## Workspace layout

The skill expects this layout, and the hook depends on it:

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

Write the slug to `applications/.active` before delegating. If there is no
`.active` file (and no `JOB_APP_SLUG` in the environment), the three subagents
are blocked from reading anything. The main session is unaffected.

The filenames are part of the contract: rename one and the subagent that reads
it gets blocked from everything and reports that it cannot reach its input.
