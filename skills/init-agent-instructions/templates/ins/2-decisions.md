# Agent instructions — decisions

<!-- Sweep 1 writes this; the USER marks it; sweep 2 gates on it. Rules for filling it:
     - Every item ends with a `> decision:` line. Unanswered = the line still contains the literal token
       `[mark]`. Sweep 2 greps for that token in the REQUIRED sections (A, B, C, D) and refuses to run while any
       remain. OPTIONAL sections (E, F, G, H) may stay blank — sweep 2 takes the safer reading and logs it.
     - Pre-mark every item with a recommendation derived from evidence. The user confirms or flips; they never
       author from scratch. Replace `[mark]` only with real evidence-backed recommendations, never with a guess
       dressed as one.
     - Evidence here MAY include counts and paths — this file is a review surface, not a durable guide.
     - The generated guides describe what IS. A practice the codebase does two ways cannot be codified until
       someone picks one; that is what §A is for.
     - `## Post-sweep` is empty at sweep 1. Sweep 2 appends to it (orchestrator only, never subagents). -->

Repo: `[repo-name]` · Date: `[YYYY-MM-DD]`
How to mark: replace `[mark]` on each `> decision:` line with one of the offered values (or free text after `adopt new:`). Save, then run `/init-agent-instructions` again.

REQUIRED: §A `[N]` · §B `[N]` · §C `[N]` · §D `[N]` — OPTIONAL: §E · §F · §G · §H

---

## A. Practice contradictions — REQUIRED
<!-- One `###` per practice the codebase does more than one way (or does one way while an existing guide claims
     another). Variants with evidence; a recommendation; the enforcement route once decided. Dozens of
     contradictions on one topic = one item here with the variant table, not dozens of items. -->

### A1. `[practice — e.g. "Error construction in services"]`
- **What the code does today:**
  | Variant | Evidence (paths, approx. count) | Notes |
  | --- | --- | --- |
  | `[variant 1 — e.g. "throw new AppError(code, meta)"]` | `[apps/api/src/… ×N]` | `[newest · oldest · in a guide?]` |
  | `[variant 2 — e.g. "throw new Error(string)"]` | `[…]` | `[…]` |
- **Existing guide says:** `[quote + path:line | nothing]`
- **Why it reads as inconsistent:** `[one sentence]`
- **Recommendation:** `[codify variant N because … | adopt new: …]`
- **Enforce via once decided:** `[lint: <rule id> (3-automation.md #n) | AGENTS.md: <workspace> → <section> | not enforceable — prose + review]`
  > decision: [mark]  ← `codify variant 1` · `codify variant 2` · `adopt new: …` · `leave undocumented (why)`

---

## B. Template policies — REQUIRED
<!-- Opinionated template defaults — proposals, not facts. Generated ONLY if the final mark is `adopt: yes`. A policy an
     existing guide already states counts as prior adoption: pre-mark `adopt: yes (already in force — <path>)`; flipping
     it to `no` is an explicit drop that lands in the Merge plan. If the code widely violates a policy, don't codify a
     lie — route it to §A instead and say so here. If a lint rule can carry the policy, say so and prefer §D routing. -->

### B1. Package Design Invariants (dep-footprint table, peer-deps rule, minimal exports, no upward imports)
- Evidence: `[dependency footprint check in 1-audit.md — N clean · N flagged]` · lint can carry: `[import/no-restricted-paths · @nx/enforce-module-boundaries · import/no-nodejs-modules — see 3-automation.md #n]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no` · `adopt: yes, lint-backed (prose carries only the table)`

### B2. Two-consumer rule (code graduates to `packages/` only at 2+ consumers)
- Evidence: `[single-consumer packages found: … | none]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no`

### B3. TSDoc every exported symbol in `packages/`
- Evidence: `[sampled exports with TSDoc: N of M]` · lint can carry: `[jsdoc/require-jsdoc publicOnly — 3-automation.md #n]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no` · `adopt: yes, lint-backed`

### B4. Error-handling MUSTs (no empty catch, typed error classes)
- Evidence: `[empty catch blocks: N · string throws: N]` · lint can carry: `[no-empty (allowEmptyCatch: false) · @typescript-eslint/only-throw-error — 3-automation.md #n]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no` · `adopt: yes, lint-backed`

### B5. Env validation at startup (schema)
- Evidence: `[schema found at … | none; process.env reads outside config: N]` · lint can carry: `[n/no-process-env scoped by overrides — 3-automation.md #n]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no`

### B6. Integration tests use real instances (never mock DB / network / fs)
- Evidence: `[test setup: … ]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no`

### B7. Changesets for consumer-visible package changes
- Evidence: `[.changeset/ exists: yes | no]`
  > decision: [mark]  ← `adopt: yes` · `adopt: no`

### B8. Sensitive-data metadata row (`PHI:` / `PII:` on every workspace guide)
- Evidence: `[domain: healthcare/PHI | payments/PII | none — a uniform "no" everywhere is noise]`
  > decision: [mark]  ← `adopt: PHI` · `adopt: PII` · `adopt: no`

### B9. Required root sections proposed for skipping
<!-- Only when 1-audit.md Section accounting marks a required root section "skipped — reason". Otherwise write
     "none — all required root sections are in". -->
- `[section — reason]`
  > decision: [mark]  ← `skip` · `keep`

---

## C. Change posture confirmations — REQUIRED
<!-- Postures are proposals until a human confirms. One row per workspace, derived values from 1-audit.md. The
     legend (what each tier permits) lives once, in the root guide. -->
| Workspace | Derived | Inputs | Decision |
| --- | --- | --- | --- |
| `/` | `[tier]` | `[…]` | `> decision: [mark]` ← `confirm` · `change to: <tier> (why)` |
| `[apps/x]` | `[tier]` | `[…]` | `> decision: [mark]` |
| `[packages/y]` | `[tier]` | `[…]` | `> decision: [mark]` |

---

## D. Automation routing — REQUIRED
<!-- Every rule that 3-automation.md classifies A–D (tooling enforces it today, or can). Default route is `lint`: the
     rule is kept OUT of every AGENTS.md and lives in the lint config (or the baseline proposal until that lands).
     The user may pull a rule back into prose during the gap before lint runs in CI — that line is then written with
     the marker `(interim — lint rule pending: <id>)` so the next audit can remove it. Class E (not automatable)
     rules are not listed here; they go to prose without a decision. -->
Lint runs in CI today: `[yes | no]` — if no, `prose-interim` is a reasonable choice for the handful of rules that bite most.

| # | Rule (as prose) | Source | Class | Tool · rule id | Decision |
| --- | --- | --- | --- | --- | --- |
| D1 | `[e.g. "no console.log in app code"]` | `[AGENTS.md path:line · policy B4 · practice A1 · observed]` | `[A enforced · B one line away · C needs plugin · D custom]` | `[no-console]` | `> decision: [mark]` ← `lint` · `prose-interim` · `prose (why lint can't)` |

---

## E. Generic content to relocate — OPTIONAL
<!-- Lines in existing guides that are true of any TS/Node project (tone, "write clean code", …). Not written outside the
     repo without approval. Unmarked = removed from the repo guide, shown in 0-recap.md for manual paste. -->
```markdown
[lines proposed for ~/.claude/CLAUDE.md]
```
> decision: [mark]  ← `relocate (show block in recap)` · `delete` · `keep in repo (why)`

## F. Docs map — OPTIONAL
Write `docs/docs-map.md` from the Documentation inventory? Worth it when conflicts or stale docs exist (`[N conflicts · N stale]`); skip for small, clean repos. Unmarked = `[recommended default]`.
> decision: [mark]  ← `write: yes` · `write: no`

## G. Questions — OPTIONAL
<!-- Only what genuinely cannot be inferred. Each carries the safer reading sweep 2 takes if unanswered. Omit the
     section body if nothing is unclear ("none"). -->
1. `[question]` — safer reading if blank: `[…]`
   > answer:

## H. Inferred-table corrections — OPTIONAL
<!-- Free text. Anything in 1-audit.md → Inferred that is wrong. -->
> corrections:

---

## Post-sweep
<!-- Appended by sweep 2 (orchestrator only) — ambiguities discovered while generating, each with the safer
     reading taken. Resolve each by editing the named AGENTS.md spot, then delete the entry. Empty at sweep 1. -->
