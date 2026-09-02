# PR description craft — operationalized rules

Operationalized from Bacchelli & Bird (ICSE 2013), Sadowski et al. "Modern Code Review at Google" (ICSE-SEIP 2018), the SmartBear/Cisco review study (Cohen 2006 — vendor, directional), Baum, Schneider & Bacchelli (EMSE 2019), Ford et al. eye-tracking (ICSE-SEIS 2019), Cowan's working-memory limit (BBS 2001), Kononenko et al. Shopify study (ICSE-SEIP 2018), Thongtanunam et al. (EMSE 2017), Liu et al. (ASE 2019), Google eng-practices ("Writing good CL descriptions"), Linux kernel SubmittingPatches, the Chromium contributing guide, Conventional Commits, and Palantir's code-review practice notes. Vendor figures (SmartBear, LinearB) are directional benchmarks, not laws.

## Prime directive

Code review is comprehension work, not bug-hunting — defect comments are roughly one-eighth of real review comments (Bacchelli & Bird). The diff already shows WHAT changed. The description exists to transfer the author's context the diff cannot carry: WHY the change exists, what it affects, where the risk lives, and how to navigate. Every sentence a reviewer reads that isn't load-bearing is pure cost — cut it.

## Title

- Imperative, standalone, ≤72 chars, no trailing period. Conventional-commit type (`feat:` / `fix:` / `chore:` at WellTheory).
- Must carry the change alone in `git log --oneline` and a notification subject line. "Fix bug" fails; `fix(billing): stop refund proration from inverting after day 0` passes.
- A reader who sees only the title should know what merging does.

## The proportionality ladder

Scale the body to **risk × non-obviousness**, never raw line count. A template that forces boilerplate onto a 3-line change is a broken template; a one-liner on a migration is negligence. Select the highest rung any signal triggers — **risk outranks size** (a 3-line auth change composes at rung 4, minus the sections it can't genuinely fill):

| Rung | Triggered by any of | Body shape |
|------|---------------------|------------|
| 1 — trivial | ≤ ~10 changed source lines, lowest risk tier, one obvious concern (typo, config/dep bump, rename) | Title + one why-clause. No sections, no ceremony. Empty body is legal when the title says it all. |
| 2 — small | Single concern, tens of lines, lowest risk tier, why fits in a sentence | One paragraph, 2–4 sentences: problem → approach → how verified. Headerless. Screenshot if UI. |
| 3 — medium | Non-obvious why at any size; multi-file feature; ~100–400 changed lines | Inverted-pyramid sections: purpose → context → risk → review guide → test evidence. Omit empties. |
| 4 — high-risk | Sensitive paths (auth, payments, PHI, migrations, infra) at ANY size; behavior change >200 lines; anything hard to revert | Rung 3 structure, BLUF-first: open with one bolded line — what merging does, risk, blast radius — then rollback plan and a reading-order review guide. |

## BLUF / inverted pyramid

- Front-load: the single most important point goes first. A reviewer who reads only the first sentence must still get the gist — readers skim and can stop at any point.
- For rung 4, the first line answers "what happens if this merges and what could go wrong," not "what this PR contains."
- Never bury the risk under narrative. Consequences before mechanism, mechanism before history.

## What earns a section (ranked by comprehension value)

1. **WHY / motivation** — the problem, and why this approach over the obvious alternative. The single highest-value element; near-universal across Google, kernel, Chromium.
2. **Blast radius** — what behavior changes, what it touches, backward compatibility ("newly introduced differences").
3. **Risk + rollback** — risk level named; for risky changes, how to revert safely and any data implications.
4. **Reviewer map** — reading order, "start here," which hunks need careful eyes and which are mechanical. Author annotation is the strongest single lever in the data: reviews with author preparation showed defect density capped near zero (SmartBear).
5. **Test evidence** — the actual commands and summary output, not the claim "tests pass."
6. **Screenshots / recordings** — before/after images for visual changes; a recording or demo link for interactive ones (static images miss interactivity).
7. **Links** — ticket, design doc, related PRs. Links supplement, never substitute: the description must stand alone against link rot.

A section that would be empty or restate another is omitted, not padded.

## Reviewer map rules

- Working memory holds ~3–5 chunks (Cowan); delocalized understanding is the hardest review work (Baum). Chunk accordingly: cap the reading order at ~5 steps.
- Point at the tricky hunks with `file:line`; label the mechanical ones so the reviewer spends attention where defects hide.
- Separate behavioral hunks from mechanical/refactor hunks explicitly — interleaved refactor + behavior is the hardest diff to read.
- Call out every test change and why it changed. A weakened assertion hidden in a big diff is a classic escape.

## Style

- Bullets and short paragraphs over prose walls. Whitespace is free; reviewer attention isn't.
- Write for a future outsider reading `git log`, not just today's reviewer — the description outlives the review.
- Plain declarative sentences. No filler ("this PR simply...", "just", "various improvements").
- Screenshots inline, not linked, for UI changes; before/after order.
- Wrap body text so it reads in the GitHub PR page without horizontal effort; ~72 chars is the kernel/Chromium habit for commit bodies.

## Split signals — write less, split instead

When the description strains, the PR is too big; more prose is the wrong fix:

- Changed source lines past ~400 (defect detection drops sharply beyond it; 200–400 is the effective ceiling, ~60 min the session limit — SmartBear).
- The description exceeds roughly one screen or ~5 chunks and still isn't complete — a reviewer can't retain it.
- Refactor and behavior change interleave in the same files.
- The purpose statement needs the word "and" between unrelated concerns.

Split into stacked, independently reviewable PRs, each with its own one-concern purpose. If it truly can't split (atomic migration + code, cross-cutting rename), say why in the risk section and make the reviewer map carry the extra weight.

## Anti-patterns (never ship these)

- **Empty description** — over a third of GitHub PRs ship with none (Liu et al.); an empty body on a non-trivial change forfeits the reviewer's context entirely.
- **"Various fixes" / "addresses feedback"** — content-free; the WHY is unrecoverable later.
- **Restating the diff** — narrating file-by-file what the reviewer can see. The description supplies what the diff can't.
- **Boilerplate template on a trivial change** — unfilled headers and "N/A" rows train reviewers to skip descriptions entirely (template fatigue is real: long templates get rubber-stamped).
- **"Tests pass" as prose** — evidence is a pasted command and summary, or an honest "not run because X."
- **Link-only body** — "see ticket" breaks on link rot and forces a context switch.
- **Padding for thoroughness** — length signals nothing; a reviewer's retention is the budget.

## The numbers (directional, cite when calibrating)

- 200–400 changed LOC: peak defect detection; sharp drop past 400 and past ~60 min of review (SmartBear/Cisco, vendor).
- Author-annotated reviews: defect density never above 30/kLOC, most commonly zero (SmartBear, correlational).
- ~1/8 of review comments are defects; the rest is comprehension and knowledge transfer (Bacchelli & Bird).
- Working memory: ~3–5 chunks (Cowan 2001).
- Reviewer gaze: ~57% on code, ~32% on supplemental context — descriptions are demonstrably read (Ford et al.).
- >34% of PRs have empty descriptions (Liu et al. 2019); description length affects whether invited reviewers show up at all (Thongtanunam et al.).
- Median PR at elite teams: <100 lines (LinearB, vendor).
