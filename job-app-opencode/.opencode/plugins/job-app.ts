// Tool and read allowlist for the job-app plugin's subagents.
//
// This is the OpenCode counterpart of job-app-claudecode/hooks/scripts/agent-readonly.sh.
// tool.execute.before does not say which agent is calling, so the agent for each
// session is recorded from chat.params, which fires before the model can call a
// tool. Subagents run in their own child sessions, so session -> agent is exact.
//
//   main agents, or any agent not belonging to this plugin  -> allowed, untouched
//   resume-verifier   -> read: applications/<active>/resume.*  +  profile/facts.md
//   resume-critic     -> read: applications/<active>/resume.pdf, posting.md
//   job-researcher    -> read: applications/<active>/posting.md; also webfetch, websearch
//
// Enforcement is scoped to the ACTIVE application, so no agent can read any
// other application. The active slug comes from $JOB_APP_SLUG, else the first
// line of applications/.active. No slug means no reads, for the three roles
// only -- the main session is never affected by a missing .active.
//
// Paths are canonicalized before matching: `..` and symlinks resolve to their
// real target first. Throwing blocks the call and returns the message to the agent.
// Fails closed for the three roles, open for everyone else.

import type { Plugin } from "@opencode-ai/plugin"
import fs from "node:fs"
import path from "node:path"

const APPS = "applications"

const PROFILES: Record<string, { tools: string[]; names: RegExp[]; facts: boolean }> = {
  "resume-verifier": { tools: ["read"], names: [/resume\.[A-Za-z0-9]+/], facts: true },
  "resume-critic": { tools: ["read"], names: [/resume\.pdf/, /posting\.md/], facts: false },
  "job-researcher": { tools: ["read", "webfetch", "websearch"], names: [/posting\.md/], facts: false },
}

function realpath(p: string): string {
  try {
    return fs.realpathSync(p)
  } catch {
    // Missing file: resolve the parent so a symlinked directory still canonicalizes.
    try {
      return path.join(fs.realpathSync(path.dirname(p)), path.basename(p))
    } catch {
      return path.resolve(p)
    }
  }
}

function activeSlug(root: string): string {
  const env = (process.env.JOB_APP_SLUG ?? "").trim()
  if (env) return env
  try {
    return fs.readFileSync(path.join(root, APPS, ".active"), "utf8").split("\n")[0].trim()
  } catch {
    return ""
  }
}

function block(reason: string): never {
  throw new Error(
    `Blocked by the job-app plugin: this agent may use only its allowlisted tools and files inside the active application directory. ${reason}`,
  )
}

export const JobAppPlugin: Plugin = async ({ directory }) => {
  const root = realpath(directory)
  const agents = new Map<string, string>()

  return {
    "chat.params": async (input) => {
      agents.set(input.sessionID, input.agent)
    },

    "tool.execute.before": async (input, output) => {
      const agent = (agents.get(input.sessionID) ?? "").split(":").pop() ?? ""
      const profile = PROFILES[agent]
      if (!profile) return

      if (!profile.tools.includes(input.tool)) block(`tool ${input.tool} is not allowed for ${agent}`)
      if (input.tool !== "read") return

      const slug = activeSlug(root)
      if (!slug || slug.includes("/") || slug === "." || slug === "..") {
        block(`no active application. Write the slug to ${APPS}/.active before delegating.`)
      }

      const raw: string = output.args?.filePath ?? ""
      if (!raw) block("could not determine the target path from this tool call.")

      const expanded = raw.startsWith("~/") ? path.join(process.env.HOME ?? "~", raw.slice(2)) : raw
      const resolved = realpath(path.resolve(root, expanded))
      const rel = path.relative(root, resolved)
      if (rel.startsWith("..") || path.isAbsolute(rel)) block(`${resolved} is outside the project.`)

      const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const allowed = profile.names.map((n) => new RegExp(`^${escape(path.join(root, APPS, slug))}/${n.source}$`))
      if (profile.facts) allowed.push(new RegExp(`^${escape(path.join(root, "profile", "facts.md"))}$`))

      if (!allowed.some((re) => re.test(resolved))) block(`${resolved} (active application is '${slug}')`)
    },
  }
}
