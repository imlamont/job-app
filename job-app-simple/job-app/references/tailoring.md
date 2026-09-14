# Tailoring a resume to a posting

Read `role-types.md` first. What counts as evidence differs by field, and it determines which of the person's experience deserves the space. Everything below assumes that classification is already made.

## Reading the posting for signal

Postings are written by several people and padded with boilerplate. Extract the parts that carry information:

**When the posting is generic, the company's stack is the real posting.** Specialized teams often publish boilerplate reqs — a few lines of "strong C++, optimize kernels, collaborate." There is almost no keyword surface there. The actual surface is what the team builds: their SDK, their architecture, their open-source repo, their docs. Research it (with permission) and tailor against that instead. This regularly reorders the resume, because a project that looks peripheral against the generic req can be the single best evidence against the real architecture.

**Weight by position and repetition.** The first two or three responsibilities are what the person will actually do. Requirements repeated in different words across sections are the real bar. A skill mentioned once at the bottom of "nice to have" is noise.

**Separate the team's work from the company's work.** A posting for an infrastructure team at a consumer app company is an infrastructure job. Tailor to the team.

**Note their vocabulary and adopt it where it's honest.** If the posting says "latency" and the resume says "speed," use latency. If it says "observability" and they built dashboards and alerting, that's observability. This isn't keyword stuffing — it's describing the same work in the reader's language so they recognize it. The limit is truth: never adopt a term for work that wasn't actually that.

**Infer what's hard for them.** A posting that emphasizes debugging, on-call, or "working across teams" is telling you what hurts. Experience that speaks to the pain point matters more than experience that merely matches a keyword.

**Identify the reader.** Startups and small teams read for ownership and breadth. Large companies read for depth and scale. Research-adjacent teams read for publications and rigor. The same experience gets emphasized differently for each.

## Rewriting bullets

A strong bullet says what they did, how, and what resulted. Most weak bullets are missing the result.

Lead with the action and the substance, not with a windup. "Responsible for" and "helped with" and "worked on" burn the first words of the line, which are the ones that get read.

**Keep real numbers; never manufacture them.** If they measured a speedup, a latency reduction, a request volume, a dataset size, keep it — numbers are the most credible thing on a resume. If they didn't measure anything, don't invent a plausible figure, and don't push them to guess. Scope can substitute for metrics: what the system did, who used it, what it replaced.

**Name the technology when the posting cares, and cut it when it doesn't.** The same project can be described as "built a data pipeline" or "built a Spark pipeline processing 2TB/day across a 40-node cluster." Choose by what the reader is scanning for.

**Match specificity to relevance.** The most relevant experience gets the most lines and the most detail. Less relevant experience gets compressed to one line, or cut. A tailored resume is mostly an exercise in deciding what to shrink.

### Examples

These show reframing the same real work for different readers — not adding anything new.

**Source bullet:** Built a caching layer for the API that reduced average response time.

For a performance-focused posting:
> Cut mean API response time by 60% (340ms → 135ms) with a Redis caching layer, sizing TTLs against measured access patterns

For a posting emphasizing product velocity and ownership:
> Designed and shipped the API caching layer end-to-end, from profiling the bottleneck to rollout, cutting response time 60%

*(Both require that the 60% and the 340ms figures came from the person. If they only said "reduced response time," neither number appears.)*

**Source bullet:** Wrote GPU kernels for a machine learning research project.

For a compiler/kernel posting:
> Implemented fused attention kernels in Triton, profiling with Nsight Compute to raise achieved occupancy and eliminate redundant global memory traffic

For a general ML engineering posting:
> Optimized model training throughput by replacing framework ops with custom fused GPU kernels

**Lead with a well-analyzed failure — where the field rewards it.** In systems, performance, research, and ML roles, a result that didn't work, understood precisely, is often the strongest bullet on the page: successes are sometimes luck and analyzed failures never are. "The tiling strategy I expected to win lost to the naive kernel, because idle halo threads and larger blocks cost more occupancy than the shared-memory reuse returned" demonstrates exactly the reasoning the job requires, and most applicants only list wins.

This does not generalize. On a sales resume a lost deal is a liability no matter how well analyzed; in product engineering a failed feature belongs in the interview, not on the page. Check `references/role-types.md` before reaching for this.

**Discount every keyword by its interview risk.** Keyword matching has a ceiling, and past it the calculation inverts: a technology the person has barely touched is worth less than the risk it carries, because it's precisely the line an interviewer pulls on. Someone who wrote two toy compute shaders should not list OpenCL when applying to a company whose kernel API is described as OpenCL-like. Drop it, say why, and keep the adjacent thing they're actually strong in.

**Resolve header ambiguity explicitly.** Location, availability date, and work authorization create unspoken doubts that end applications before the projects get read. Someone in one country applying to a role in another is an implicit question mark; "work authorization in hand, open to relocation, available May 2027" erases it in one line. Name the specific permit category if they know it — recruiters recognize the common ones instantly.

## Ordering and structure

**Order sections by what the reader wants first.** A student with a directly relevant project and an unrelated internship leads with projects. Someone whose current job is the strongest match leads with experience. Education goes near the top for current students and new grads, near the bottom afterward.

**Order within sections by relevance, not strictly by date,** when the format allows. Reverse-chronological is the norm within a job history, but projects and coursework are free to be ranked.

**Cut ruthlessly.** Old, irrelevant, or self-evident material. A senior person's first internship. "Proficient in Microsoft Office." Skills lists padded to look full — a short honest list reads stronger than a long one where half is aspirational.

**Skills sections should be scannable and true.** Group by category, order by relevance to this posting, and drop anything they'd be uncomfortable being asked about in an interview.

## The summary line

Optional. Include one when there's a story the bullets don't tell on their own — a career change, a specialization the job titles don't reveal, or an unusual combination the reader should notice up front. Skip it when the experience speaks for itself; a generic line about being a "results-driven engineer passionate about innovation" is worse than the whitespace it occupies.

When included: one or two lines, specific, tailored to this posting, and consistent with what the rest of the page proves.

## Applicant tracking systems

Keep the file parseable: standard section headings, no text inside images, no critical information in headers or footers, single-column layout for anything going through a large company's portal. Multi-column layouts often parse badly.

Don't over-optimize beyond that. Hidden white text and keyword walls get flagged, and most of the ATS folklore online is invented. Using the posting's actual vocabulary in real bullets handles the keyword matching honestly.

## Pending numbers and commented alternates

**The rendered document is always finished.** No visible placeholders, no blanks, no "[TBD]" in the PDF. Someone who does nothing further can send it today.

When a number is pending, phrase the bullet so it stands without one — scope, technique, and what was built are all still available — and put the pending value in a source comment marking where it goes. When a claim gets downgraded for lack of evidence, keep the stronger version as a comment directly beneath the defensible one:

```latex
\item Synthesized and implemented on a Zedboard
% SWAP IN once `make impl` confirms: Closed timing at 20 MHz on a Zedboard
```

This preserves the reasoning, makes restoring the line a one-word edit, and stops the same claim from being silently reintroduced in a later pass. Mark anything else needing verification with an inline TODO in the same style, and carry all of it into the improvement report at the end of the session.
