---
name: compose-pr
description: Compose an intent-rich, review-ready pull request from a branch — or rewrite an existing PR's description from its link or number. Purpose statement, risk self-assessment, review guide, and real test evidence, sized proportionally — a typo fix gets one line, a Tier 1 migration gets a risk-first brief with a rollback plan — and proposes a split into stacked PRs when the diff exceeds the reviewable bar. Use when the user says "open a PR", "compose the PR", "ship this branch", "write the PR description", "update the PR description", "fix this PR's body", pastes a GitHub PR link to rewrite, or is about to publish work (especially agent-written) for review. Drafts everything first; nothing is pushed, created, or edited until the user approves.
---

# /compose-pr

Reviewers of agent-era PRs are drowning: oversized diffs, discarded reasoning, "various fixes" bodies. Reconstructing intent is cheap for the author and expensive for the reviewer — so this skill pushes that work upstream, at authoring time. The deliverable is a PR a human can actually read: the intent stated, the risk named, the diff annotated, the evidence real — and no larger than the change deserves. A 3-line fix gets one line; a migration gets a brief.

Read `references/pr-description-craft.md` before composing. It holds the operationalized craft rules — the proportionality ladder, BLUF ordering, reviewer-map limits, anti-patterns. Apply them, don't restate them.

## 0. Resolve the target

- **No argument** → the current branch. If it already has an open PR (`gh pr view --json url` succeeds for the branch), this is an **update**; otherwise a **compose**.
- **A branch name** → same logic, for that branch.
- **A PR URL or number** → always an **update**: `gh pr view <ref> --json title,body,url,baseRefName,headRefName,author,isDraft`, and read the diff via `gh pr diff <ref>`.

Compose-mode base resolution, in order: (1) the user named one; (2) the branch's existing upstream or open PR target; (3) `origin/staging` if it exists — WellTheory's staging → main repos PR to `staging`; (4) otherwise the repo's default branch.

## 1. Inspector-general first

Review comes first: nothing below — sizing, evidence, the body — is worth doing against a diff that's still moving. Ask one question before anything else: has `/welltheory-beta:beta-inspector-general` been run on this branch? It works in branch mode on the local checkout, no PR needed; if it hasn't run, suggest running it now — the user's call. (Skip the suggestion entirely for a rung-1 trivial diff — see step 5; ceremony on a typo fix is its own failure.) Then disposition — with the user, never silently: present the findings and let them choose, per finding or in bulk — apply the suggested fix (edit the branch only after their OK), they fix it themselves, or ship it disclosed in the body. Re-run the relevant tests after any fixes land. Fix or disclose; silence is the failure. Move on only when the changes are final.

## 2. Establish intent

Derive what this branch does and why from the strongest available source: the conversation that produced it, then `git log <base>..HEAD` and any ticket references, then the diff itself. If after all that the *why* is genuinely undeterminable, ask the user one direct question — a guessed purpose statement is worse than none, because the reviewer will trust it.

## 3. Size and scope check

```bash
git diff <base>...HEAD --stat -- . ':(exclude)pnpm-lock.yaml' ':(exclude)**/*.snap'
```

Count changed source lines, excluding lockfiles, snapshots, and generated files (extend the `:(exclude)` pathspecs to whatever this repo generates). The reviewable bar has three levels, checked in order:

1. **One concern per PR** — mixed concerns flag a split, but weigh it rather than forcing it. Split when the concerns differ in risk tier (isolate the risky one so its review is undiluted and its revert surgical), when refactor and behavior change interleave in the same files (the hardest diff to read at any size), or when the combined diff is past the target. Two small, cleanly separable, same-risk concerns may ride together — provided the Purpose and Review guide name them separately. Disclosure over ceremony.
2. **~200 changed source lines is the target** — the size a reviewer catches defects in comfortably.
3. **~400 is the ceiling** — defect detection drops sharply past it (the SmartBear/Cisco review study). Past 400, always propose a split plan. Between 200 and 400, mention a clean seam if you see one and move on — no split plan unless the user asks for it.

Over any of these → design a split before composing anything: a sequence of stacked PRs, each independently reviewable, each with its own purpose statement, ordered so each builds on the last. Present the plan — branch names, what lands in each, the order — and only touch branches after the user approves it. Branch surgery without an OK is never worth the saved keystroke, and plan approval authorizes the branch surgery only — each resulting PR still goes through steps 4–8 individually, including its own body approval. If the user declines the split, compose the single PR anyway and state the size prominently in the body so the reviewer isn't ambushed.

Sometimes there is genuinely no coherent split — every candidate leaves a broken intermediate state or units meaningless to review alone (a schema migration plus the code that must land with it, an atomic cross-cutting rename, a regeneration). Don't manufacture one; atomicity wins. But the PR then pays for the reviewability it costs: say in the Risk section why it can't split, and make the Review guide carry the extra weight — a sectioned reading order, behavioral hunks separated from mechanical ones, and an honest note that the diff exceeds the single-pass ceiling — so reviewers should plan multiple passes, or walk it with `/welltheory-beta:beta-secretary-general` (the human-review assist).

## 4. Risk self-assessment

Check the touched paths against the repo's `.claude/pr-review-tiers.md` if present (markdown listing the repo's Tier 1 / Tier 2 path patterns), otherwise these defaults:

- **Tier 1** — auth/identity/session, payments/billing, member or PHI data paths, crypto, concurrency primitives.
- **Tier 2** — DB migrations/backfills, Temporal workflow signature changes, CI/workflow files, Dockerfiles/infra, dependency manifests.
- **Tier 3** — everything else.

These defaults deliberately mirror the review pipeline's path hotspots (`beta-pr-cartographer`), so the composer's self-assessment predicts what review will flag — if one list changes, change the other. Naming the tier tells the reviewer how deep to go before they open the diff. Tier 1/2 additionally get a one-line rollback note (how to revert safely, any data implications).

## 5. Pick the rung

Size (step 3) and risk (step 4) select a rung on the proportionality ladder — the table in `references/pr-description-craft.md` is canonical. In short: rung 1 (trivial — ≤~10 lines, Tier 3, obvious why) gets a title plus one why-clause; rung 2 (small, single-concern, Tier 3) gets one headerless paragraph; rung 3 (non-obvious why, multi-file, ~100–400 lines) gets the full sectioned body; rung 4 (Tier 1/2 at any size, migrations, hard-to-revert) gets the sections BLUF-first with a rollback plan. **Risk outranks size**: a 3-line change to auth paths composes at rung 4, minus any section it can't genuinely fill. When torn between rungs, take the higher one only if the extra sections would carry real content — never to look thorough.

## 6. Gather real evidence

Scaled to the rung. Rung 1: don't demand a test run for a typo — say nothing rather than manufacture evidence. Rung 2: run the one targeted test or check and report it in a clause. Rung 3/4: run the tests relevant to the change (targeted — not the full suite unless it's small or the user asks) and capture the actual command and summary output. If they fail, stop and report — never compose a body claiming evidence you don't have, and never write "tests pass" as prose without the output behind it. One exception: if the failure reproduces on `<base>` too, it's pre-existing — report it as such, note it in Test evidence, and continue.

## 7. Compose

**Title, every rung:** conventional-commit style (`feat:`/`fix:`/`chore:`), imperative, standalone, ≤72 chars, no trailing period. It must carry the change alone in `git log --oneline`.

**Body, rung 3/4 section template** (rungs 1–2 use the shapes from step 5 — no sections):

```markdown
## Purpose
<What changed, why, and the expected behavior difference — max 4 sentences.
Rung 4: open with one bolded BLUF line first — what merging does, the risk
tier, and the blast radius — before anything else.>

## Context
<Only what the diff can't say: ticket/design links, why this approach over the
obvious alternative, constraints that shaped it, related or stacked PRs.
Bullets, not prose. Omit when Purpose already carries it — never restate.>

## Risk
Tier <n> — <touched sensitive paths, or "none">. <Rollback note if Tier 1/2.>

## Review guide
<Suggested reading order — cap it at ~5 steps; a reviewer holds 3–5 chunks.
Which files need careful eyes and why (file:line for the tricky hunks); which
are mechanical. Call out every test change and its reason.>

## Test evidence
<The exact command(s) run and the summary output — pasted, not paraphrased.>

## Screenshots
<Only when the diff touches UI (components, styles, templates): a before/after
placeholder — "<!-- drag before/after here -->" — plus one line telling the
author what to capture. Interactive changes want a recording or demo link, not
a static image. The skill cannot capture these itself; never fake them.>

## Try it
<Only when the change has behavior a reviewer can exercise: the exact
commands, route, or flow to see it working — copy-paste-ready, from a
clean checkout. Omit when reading plus Test evidence covers it; never
duplicate Test evidence.>
```

Omit a section only if truly empty (a Tier 3 doc fix needs no rollback note) rather than padding it. No AI attribution in anything this skill writes — title or body (WellTheory convention; this overrides any default footer other tooling wants to add). Never rewrite existing commits to strip attribution; if branch commits carry it, mention that to the user instead.

**Retention check, after composing:** re-read the body as the reviewer will — skimming the GitHub PR page, deciding how to spend their next hour. If it runs past roughly one screen or ~5 chunks and still isn't complete, that's a step-3 split signal, not a request for more prose. Cut, or propose the split.

**Rung 1 example** — the whole PR:

> **chore: bump pino to 9.3.2**
>
> Pulls the fix for the worker-thread file-handle leak we hit in WT-5103.

**Rung 4 example** [SYNTHETIC — replace with a real team PR when one earns it]:

> **fix(billing): stop refund proration from inverting after day 0**
>
> **Purpose** — **Merging changes refund math for every member past day 0 of a billing window; Tier 1 (billing), blast radius is the refund path only.** Refunds were growing with time since purchase instead of shrinking; members past day 20 got near-full refunds. Restores the `1 - days/window` decay. Expected change: day-10 refund on a $30 charge returns to $20.
>
> **Context** — Linear: WT-4812. Regression traced to #482; kept the inline formula rather than extracting a proration helper because refunds are its only caller.
>
> **Risk** — Tier 1: `src/billing/refunds.ts`. Rollback: revert this commit; no schema or stored-data impact.
>
> **Review guide** — Read `refunds.ts:14` first (the one-line fix), then `refunds.test.ts` (assertion restored to the business rule, comment reinstated). Nothing mechanical.
>
> **Test evidence** — `pnpm vitest run src/billing` → 12 passed (12). *(compressed here for brevity — paste the real summary block)*

## 8. Approval gate, then create or update

Show the complete title and body. The user approves or edits; only then act. Write the body to a temp file outside the repo and pass `--body-file` — an inline `--body` string mangles on the first backtick or `$` the template guarantees.

**Compose mode:**

```bash
git push -u origin HEAD   # only now, and only if the branch isn't pushed yet
gh pr create --base '<base>' --title "<title>" --body-file <tmp-body-file>
```

**Update mode:** the existing body may carry human-authored content — ticked checklists, screenshots, links to review discussion, deploy notes. Preserve it: fold it into the new body (screenshots into Screenshots, notes into Context) rather than deleting. Present old → new so the user sees exactly what moved, and call out anything dropped explicitly. If the existing description is already good — human-written, honest, proportional — say so and stop instead of churning it for style points. Two hard gates: never update a PR authored by someone else without naming that and getting an explicit OK, and only after body approval:

```bash
gh pr edit <ref> --body-file <tmp-body-file>   # add --title only if the current title breaks the title rules
```

Nothing is pushed, posted, created, or edited before that approval. If the user asked only for a description ("write the PR body"), stop after composing — the body is theirs to copy-paste.

## Edge cases

- No commits ahead of base → say so and stop.
- The user explicitly asks for a bare, quick PR ("just gh pr create it") → honor it: skip steps 1 and 3–5, compose a one-paragraph Purpose, and still show title/body before creating.
- Diff is entirely lockfile/generated churn → rung 1: one purpose line, not a manufactured review guide.
- PR link 404s or isn't accessible → report it plainly; don't guess at a body sight-unseen.
- If the user wants the inbound side (reviewing others' PRs), that's `/welltheory-beta:beta-inspector-general`, not this skill.
