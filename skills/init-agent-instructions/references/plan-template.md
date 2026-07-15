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

### Merge plan  (only if existing files were found)
- Keep verbatim: [hand-written domain rules / decisions worth preserving — list them]
- Restructure into template: [content that maps onto template sections]
- Drop: [stale or template-redundant content — with reason]
- AGENTS.md handling: [keep symlink | convert to symlink | @AGENTS.md import | n/a]

### Section accounting  (every template section lands somewhere: filled · merged · skipped-with-reason)
- Root required — skipping any needs a reason here and your confirmation:
  - Operating Rules (FLAGS.md rule + update-docs-in-same-PR rule): [in | skipped — reason]
  - Metadata Legend with authority columns: [in | skipped — reason]
  - Package Design Invariants (dep footprint, two-consumer rule, no upward imports): [in | skipped — reason]
  - Comments & documentation: [in | skipped — reason]
  - Planning before building / docs & specs: [in | skipped — reason]
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
