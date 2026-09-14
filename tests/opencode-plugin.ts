// Exercise job-app-opencode's plugin in both failure directions: blocking the
// main agent, and silently not enforcing for the three roles.
//
// Run with OpenCode's embedded Bun:  BUN_BE_BUN=1 opencode run tests/opencode-plugin.ts
// or with Bun directly:              bun tests/opencode-plugin.ts

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { JobAppPlugin } from "../job-app-opencode/.opencode/plugins/job-app.ts"

const W = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "job-app-")))
for (const d of ["applications/acme", "applications/other", "profile"]) fs.mkdirSync(path.join(W, d), { recursive: true })
for (const f of ["acme/posting.md", "acme/resume.pdf", "acme/resume.tex", "acme/notes.md", "other/posting.md"]) {
  fs.writeFileSync(path.join(W, "applications", f), "")
}
fs.writeFileSync(path.join(W, "profile/facts.md"), "")
fs.writeFileSync(path.join(W, "applications/.active"), "acme\n")
fs.symlinkSync(path.join(W, "applications/other"), path.join(W, "applications/sneaky"))

const hooks: any = await JobAppPlugin({ directory: W } as any)
let fails = 0
let n = 0

async function check(expectAllow: boolean, agent: string, tool: string, filePath?: string, slug?: string) {
  const sessionID = `session-${n++}`
  if (agent) await hooks["chat.params"]({ sessionID, agent }, {})
  if (slug === undefined) delete process.env.JOB_APP_SLUG
  else process.env.JOB_APP_SLUG = slug

  let allowed = true
  try {
    await hooks["tool.execute.before"]({ tool, sessionID, callID: "call" }, { args: filePath === undefined ? {} : { filePath } })
  } catch {
    allowed = false
  }
  const label = `${agent || "(unmapped session)"} ${tool} ${filePath?.replace(W + "/", "") ?? ""}${slug ? ` (JOB_APP_SLUG=${slug})` : ""}`
  if (allowed === expectAllow) console.log(`PASS ${label} -> ${allowed ? "allow" : "block"}`)
  else {
    console.log(`FAIL ${label}: expected ${expectAllow ? "allow" : "block"}`)
    fails++
  }
}

const app = (p: string) => path.join(W, "applications", p)
const facts = path.join(W, "profile/facts.md")

await check(true, "build", "read", facts)
await check(true, "build", "bash")
await check(true, "", "read", app("other/posting.md"))
await check(true, "resume-critic", "read", app("acme/resume.pdf"))
await check(true, "resume-critic", "read", "applications/acme/posting.md")
await check(false, "resume-critic", "read", app("acme/resume.tex"))
await check(false, "resume-critic", "read", facts)
await check(false, "resume-critic", "read", app("other/posting.md"))
await check(false, "resume-critic", "read", app("sneaky/posting.md"))
await check(false, "resume-critic", "read", app("acme/../other/posting.md"))
await check(false, "resume-critic", "read", "/etc/passwd")
await check(false, "resume-critic", "read", app("acme"))
await check(false, "resume-critic", "grep")
await check(false, "job-app:resume-critic", "read", app("acme/resume.tex"))
await check(true, "resume-verifier", "read", app("acme/resume.tex"))
await check(true, "resume-verifier", "read", facts)
await check(false, "resume-verifier", "read", app("acme/notes.md"))
await check(false, "resume-verifier", "webfetch")
await check(true, "job-researcher", "webfetch")
await check(true, "job-researcher", "read", app("acme/posting.md"))
await check(false, "job-researcher", "read", app("acme/resume.pdf"))
await check(false, "job-researcher", "read")
await check(true, "resume-critic", "read", app("other/posting.md"), "other")
await check(false, "resume-critic", "read", app("acme/posting.md"), "other")
await check(false, "resume-critic", "read", app("acme/posting.md"), "../acme")

fs.rmSync(path.join(W, "applications/.active"))
await check(false, "resume-critic", "read", app("acme/resume.pdf"))
await check(true, "build", "read", facts)

fs.rmSync(W, { recursive: true, force: true })
console.log(fails ? `${fails} FAILED` : "all passed")
process.exit(fails ? 1 : 0)
