# Plan document template

The exact structure for `agent-instructions-plan.md` (Phase 4). Follow it section-for-section.
Conditional sections (Merge plan, Generic content to relocate) appear only when applicable.
`## Discovered during scaffolding` and `## Run summary` are created empty — Phase 5 and Phase 6
append to them.

---

## Agent Instructions — Audit & Plan

### Repo shape
[monorepo | single package] — [reason]
Toolchain: [orchestrator or "no orchestrator"] · [package manager] · scope [@detected/] (per Phase 1b)
Skill assets loaded: [templates/root.md ✓ · app.md ✓ · package.md ✓ · domain.md ✓ · best-practices rubric ✓ · plan-template ✓ — name any that failed to load, and stop if any did]

### Coverage plan
| Workspace        | Type/Framework | Existing CLAUDE.md | Action               |
| ---------------- | -------------- | ------------------ | -------------------- |
| / (root)         | —              | yes / no           | create / reconcile / ok |
| apps/[x]         | [framework]    | yes / no           | create / reconcile / ok |
| packages/[y]     | [pkg-type]     | yes / no           | create / reconcile / ok |
| [pkg]/src/[dir]  | domain         | yes / no           | create / reconcile / ok — [why warranted, per 1c] |

### Findings  (empty = repo is in good shape)
- [path] · [severity] · [issue] → [fix] · concern? [real — affects agents/docs | cosmetic | informational]
- ...

### Practice review  (confusing or inconsistent practices — decide before scaffolding)
Findings above = defects in the instruction files themselves; Practice review = codebase practices the
docs would codify. For each: what the codebase does today, why it reads as confusing or inconsistent, and
a recommendation.
The generated docs describe what IS, so each item needs a decision: codify as-is, or change direction.
- [practice] · [evidence paths] · [recommendation]
  > decision: [document as-is | adopt new practice: …] ← mark before confirming

### Template policies to adopt  (opinionated template defaults — proposals, not facts)
The templates ship policies this repo may never have agreed to. Each is generated ONLY if its final mark
is adopt. Pre-mark every row with a recommendation derived from evidence — the user confirms or flips, they
don't author from scratch. If an existing guide already states a policy, that counts as prior adoption:
pre-mark it `adopt: yes (already in force — [path])`; flipping it to no is an explicit drop that must
appear in the Merge plan. For an existing repo, check what the code actually does first: codifying a rule
the codebase widely violates creates a lying doc — cite the violations and route it to Practice review
instead.
- Package Design Invariants (dep-footprint table, peer-deps rule, minimal exports, no upward imports)
  > adopt: [recommended: yes/no — evidence of current state] ← confirm or flip
- Two-consumer rule (code graduates to `packages/` only at 2+ consumers)
  > adopt: [recommended: yes/no — evidence] ← confirm or flip
- TSDoc every exported symbol in `packages/` (Comments & documentation)
  > adopt: [recommended: yes/no — evidence] ← confirm or flip
- Error-handling MUSTs (no empty catch, typed error classes)
  > adopt: [recommended: yes/no — lint rule? existing convention?] ← confirm or flip
- Env validation at startup (Zod)
  > adopt: [recommended: yes/no — cite the schema if one exists] ← confirm or flip
- Integration tests use real instances (never mock DB/network/fs)
  > adopt: [recommended: yes/no — evidence from the test setup] ← confirm or flip
- Changesets for consumer-visible package changes
  > adopt: [recommended: yes/no — does `.changeset/` exist?] ← confirm or flip
- Sensitive-data metadata row (`PHI:`/`PII:` `yes|no` on every workspace guide)
  > adopt: [recommended: yes if the repo handles regulated/sensitive user data — name the domain; no
  > otherwise — a uniform `no` everywhere is noise] ← confirm or flip

### Inferred (correct me if wrong)
| Field | Value | Source |
| ----- | ----- | ------ |
| Orchestrator / package manager / scope | ... | root configs (Phase 1b) |
| Framework(s) / pkg types | ... | deps |
| Runtime targets | ... | tsconfig / deps |
| Consumers (per package) | ... | grep across monorepo |
| Dev / build / test commands | ... | package.json scripts |
| Deploy target | ... or unknown | config files / framework |
| Change posture (per workspace) | locked/guarded/standard/open (inputs) | posture derivation rules |

### Docs & planning tooling
- `docs/` folder: [found | not found — will note it needs to be created]
- `docs/specs/`: [found (N specs) | not found]
- `docs/architecture.md`: [found | not found]
- Custom skills in `.claude/skills/` (or legacy `.claude/commands/`): [list | none found]

### Documentation inventory  (feeds docs/docs-map.md — see Phase 5)
- Docs found: [N files across docs/, apps/docs/, READMEs, …]
- Conflicts: [doc A vs doc B on [topic] — recommend [which wins] because …]
- Dead / stale: [path — evidence, e.g. "describes removed src/infra/; last touched 2024-06"]
- Duplicates: [path → duplicate of [canonical]]
- Preferred source per topic: [topic → path — this table becomes the docs map]
- Write `docs/docs-map.md` from this inventory? Worth it when conflicts or stale docs exist; skip for
  small, clean repos.
  > write: yes / no

### Merge plan  (only if existing files were found)
- Keep verbatim: [hand-written domain rules / decisions worth preserving — list them]
- Restructure into template: [content that maps onto template sections]
- Drop: [stale or template-redundant content — with reason]
- AGENTS.md handling: [keep symlink | convert to symlink | @AGENTS.md import | n/a]

### Section accounting  (every template section lands somewhere: filled · merged · skipped-with-reason)
- Root required — skipping any needs a reason here and your confirmation:
  - Operating Rules (COME-BACK-TO.md rule + update-docs-in-same-PR rule): [in | skipped — reason]
  - Metadata Legend with authority columns: [in | skipped — reason]
  - Planning before building / docs & specs: [in | skipped — reason]
- Policy-gated root sections (Package Design Invariants · Comments & documentation · Error handling ·
  Testing MUSTs · env validation): in only if adopted under Template policies above — list the outcome
  per section here.
- Skipped elsewhere: [workspace · section — reason, e.g. "apps/api: Accessibility — backend"]
- Filled fresh (no counterpart in the existing file): [sections — only when reconciling]

### Dependency footprint check  (one row per package — run it against actual `dependencies`; a package with no row = incomplete report)
- [✓ | ⚠] packages/[a] ([pkg-type]): [e.g., "✓ clean" | "⚠ `multer` (Express middleware) in a utility package — split or reclassify"]
- [✓ | ⚠] packages/[b] ([pkg-type]): ...

### Gaps — will leave as [PLACEHOLDER]
- [ ] [e.g., deploy target — not inferable from files]
- [ ] [e.g., out-of-scope declarations — need domain knowledge]

### Generic content to relocate (if any)
[lines that should move to ~/.claude/CLAUDE.md — shown for approval; not written outside the repo without OK]

### Sync method
AGENTS.md = real file, CLAUDE.md → symlink to it, per workspace. [Note if any existing setup differs.]

### Questions  (answer inline, right under each question)
[Only what genuinely cannot be inferred. Omit if nothing is unclear. Anything unanswered at confirm time
gets the safer reading, logged under Discovered — the sweep never stops to ask.]
1. [question]
   > answer:

## Discovered during scaffolding
<!-- Appended live during Phase 5: one line per item — what was found, where, the assumption taken.
     Empty at plan time. -->

## Run summary
<!-- Written by Phase 6 when the sweep completes. Empty at plan time. -->
