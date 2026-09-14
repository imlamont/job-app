# The improvement report

The last deliverable of a session: where this application could be stronger, and what it would cost to get there.

## It never holds the resume hostage

The resume delivered today is optimized for what exists today. Complete, submittable, no blanks. Someone who reads the improvement report and does none of it still has a finished application they can send this afternoon, and that has to be true or the report is a liability rather than a service.

Concretely:

- **No visible placeholders in the rendered document.** A bullet awaiting a number gets phrased to be complete and defensible without it. Pending values live in source comments, invisible in the PDF.
- **Weakened claims still read as finished lines**, not as stubs. "Synthesized and implemented on a Zedboard" is a complete bullet. The stronger version sits commented above it.
- **A weak coverage row is not a reason to delay.** Say plainly that it's a gap, tailor around it, and put it in the report.
- **Never imply the application should wait** unless a hard blocker makes it pointless. Most gaps are worth closing for the next application as much as this one.

## Structure

Two parts, because they cost very different amounts.

### Part 1 — Open items

Things already reflected in the document that need the person's input. Each with a status, so the next session can pick up without re-deriving anything:

| # | Item | Status |
|---|---|---|
| 1 | [Number to generate — units, baseline, hardware] | Bullet phrased to stand without it; comment marks where it goes |
| 2 | [Claim resting on inference] | Weakened version in use; original commented above |
| 3 | [Thing to read before sending the letter] | Sentence flagged in the source |
| 4 | [Fact to confirm — permit category, exact title, dates] | Generic phrasing used for now |

Most of these are minutes of work and upgrade a line that already exists. They're the cheapest improvements available and should be listed first.

### Part 2 — Gaps worth closing

Larger items, each mapped to a weak row in the coverage table. For each one: what it fills, honest effort, and what the person gets to *say* afterward.

State the effort in real units — half a day, a few hours, a weekend, a month. People decide entirely on this number.

State the payoff as the claim it unlocks, not the artifact. Wrapping a kernel as a framework extension isn't valuable for the toy model; it's valuable because they can then say they've shipped a kernel across a framework boundary and handled the layout, stride, and dtype contract. That's hard to fake in conversation.

## Prioritizing

**Recovering a lost result beats building something new.** A bullet that stops one sentence short of its own insight can often be completed in an afternoon, and it upgrades an existing line rather than adding one. Usually the highest return on the list.

**Reuse work already done.** A roofline analysis doesn't need a new project if a benchmark sweep already collected the counters. Same for a sales rep who has the numbers in a CRM but never pulled attainment by quarter.

**Check whether the gap is actually a gate.** Where the requirement sits in the posting matters. Something under "what you'll learn" isn't being screened for, and a weak row there deserves far less effort than one under "what we need." Sometimes the honest answer is that the gap matters less than the person assumes — say so.

**Some gaps aren't worth closing at all.** Theory-only familiarity with an adjacent technology, a capability nothing gates on. Keep them as interview answers instead: "I've done this in a different context, here's how it maps" is a strong response and costs nothing to prepare.

**Contributing to the company's own codebase has the highest ceiling and the longest runway.** A merged PR against the repo the team maintains outweighs most other items. Only recommend it when the timeline genuinely allows.

## Close with a sequence

Order the list by payoff against effort and against the real deadline. Say what to do this week, what next, and what to skip if time runs out — including when to send outreach relative to finishing the work, since having something concrete to point at changes what that message can say.

Scale the whole thing to the runway. Someone applying tonight gets Part 1 and a one-line note that the rest is for next time. Someone with months gets the full sequence.
