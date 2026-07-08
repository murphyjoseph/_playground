---
name: init-agent-instructions
description: >-
  Deterministic command (run via /init-agent-instructions only) that audits, generates, and fixes a
  repository's agent instruction files (CLAUDE.md / AGENTS.md). Audits existing files for contradictions,
  staleness, over-length, and generic content, then generates or reconciles one CLAUDE.md per workspace
  (root + every app + every package, plus domain subtrees where warranted) from scoped templates, with a
  per-workspace AGENTS.md symlink.
disable-model-invocation: true
argument-hint: "[root|app|package|domain] — optional; omit for repo-wide coverage"
allowed-tools: Read, Grep, Glob, Bash, Write, Edit
---

# Init Agent Instructions

Set up and maintain a repository's agent instruction files. The output is one `CLAUDE.md` per workspace,
each paired with an `AGENTS.md` so every coding agent (Claude Code, Cursor, Codex, ...) reads the same
guidance. Claude Code reads `CLAUDE.md`; other tools read `AGENTS.md`; a symlink keeps them identical.

The process is always: **detect → read → audit → plan document → confirm → one-sweep generate → sync →
summarize.** All questions are front-loaded into the plan document; once the user confirms it, the sweep
runs start-to-finish with no further questions. Never write instruction files before the user confirms —
the only pre-confirmation write is the plan document itself.

**Where this skill's files live:** every `templates/` and `references/` path in this file is relative to
**this skill's own directory** (the folder containing this SKILL.md — e.g.
`~/.claude/skills/init-agent-instructions/`), never the target repo. Resolve them there. If a read fails,
stop and say so — do not reconstruct a template from memory; output generated without having read the
actual template files is invalid.

**Fresh repo vs. existing files:** same command. A fresh repo (no CLAUDE.md anywhere) just has an empty
audit — go straight to generation. Existing files get audited against the rubric, surfaced in the plan
doc, and on confirm **reconciled** into the template structure rather than blindly overwritten — preserve
correct repo-specific content, fix what the audit flagged.

---

## Phase 1 — Detect scope & coverage

Determine what to document:

1. A workspace manifest at the root → **monorepo**. Any of: `pnpm-workspace.yaml`, a `workspaces` field
   in `package.json`, `nx.json`, `lerna.json`, `rush.json`. Enumerate the full target set: root + every
   workspace dir resolved from the manifest globs — not just `apps/` and `packages/` but any glob
   (`platform/`, `services/`, `tools/`, ...). Coverage is *all* of them, including config and types
   packages (they get a short but real file — see the package template note). "The root already covers it"
   is a **banned** reason to skip a workspace: the delta is the metadata carrier (posture, consumers,
   commands), and full coverage makes absence meaningful — a missing file means "not yet generated", never
   "intentionally empty". Scale depth, not existence: a thin workspace gets ~10-15 lines.
2. Single `package.json`, no workspaces → not this skill's lane. This skill specializes in **monorepo**
   scaffolding, updating, and auditing; say so and stop. If the user explicitly wants a root-only guide
   anyway, use the root template minus its monorepo-only sections (workspace reference, Package Design
   Invariants, Adding a New Workspace) — and do not invent monorepo structure.
3. Explicit scope argument (`root` | `app` | `package` | `domain`) → document just that scope, resolved
   from the current working directory. When inside a workspace dir with no argument, classify it: under an
   app glob → **app**, otherwise **package**.
4. A code subdirectory *inside* a workspace's source that owns a distinct authoring concern — e.g.
   `eventHandlers/`, `workflows/`, `controllers/`, `commands/`, `repositories/` → **domain** (a subtree
   contract). These have no `package.json`; they inherit from the enclosing package/app guide. Only create
   one where Phase 1c says it's warranted — but at monorepo scope, don't wait to be asked: actively scan
   for candidates (signals: clusters of same-suffix conventional files — `*.handler.ts`, `*.controller.ts`,
   `*.command.ts`, `*.workflow.ts`, `*.repository.ts` — a registration/codegen step, a base class extended
   across many files, a matching developer-guide doc) and put **every** candidate in the coverage plan with
   a generate/skip recommendation and the evidence. Skipping is fine when Phase 1c says so; skipping
   **silently** is not.
5. Ambiguous → ask the user before proceeding.

---

## Phase 1b — Detect toolchain (never assume — read it)

The templates ship with defaults (Turborepo, pnpm, `@repo/` scope, `pnpm <script>` commands). **These are
placeholders, not facts.** Detect the real toolchain and substitute it everywhere in the output:

| Thing | How to detect | Examples |
|-------|---------------|----------|
| Monorepo orchestrator | root config file | `nx.json` → Nx · `turbo.json` → Turborepo · `lerna.json` → Lerna · `rush.json` → Rush · none present → "workspaces only, no orchestrator" |
| Package manager | `packageManager` field in root `package.json` + lockfile | `pnpm-lock.yaml` → pnpm · `yarn.lock` → yarn · `package-lock.json` → npm · `bun.lockb`/`bun.lock` → bun |
| Package-name scope | `name` field of existing `packages/*/package.json` | `@wt/…`, `@acme/…` — do **not** assume `@repo/` |
| Task commands | root `package.json` `scripts` + any `Makefile` / `justfile` / `Taskfile` | repo may drive tasks via `nx run …`, `make …`, or `pnpm <script>` — use the names that actually exist, not invented ones |
| Workspace dirs | manifest globs | `apps/*`, `packages/*`, `platform/*`, `tools/*`, `generated` |

**Rules:**
- If the orchestrator is Nx, do **not** mention `turbo.json` or Turborepo anywhere in the output. The
  reverse for Turborepo. If there is no orchestrator, describe tasks via the package manager + scripts only.
- Use the detected package-name scope (`@wt/`, etc.) in every import example, `--filter`, and enforcement
  grep. Never emit `@repo/` unless that is the actual scope.
- Use real script names. If the repo uses `typecheck:all` rather than `check-types`, or a `Makefile`
  target, document that — don't paste the template's default command names.

---

## Phase 1c — When a domain (subtree) CLAUDE.md is warranted

Domain files are path-scoped — they load automatically only when you work in their directory. Add one only
where it earns its place; don't spray them across every folder. A subtree CLAUDE.md is warranted when
**all** of these hold:

- The directory owns a distinct authoring concern with non-obvious local conventions (a base class to
  extend, a registration step, a required file set).
- There is matching depth elsewhere to point at — a developer-guide doc, a sibling subtree contract, or a
  custom agent — that a contributor should read on demand.
- It's a common work location, and the rules would otherwise sit in a parent guide that does **not**
  auto-load there (the auto-load gap).

If the rules already load via a parent/sibling contract, add a pointer there instead of a new file. The
goal is to pull the *right* context on demand, not to fragment it.

---

## Phase 2 — Read & infer (per workspace)

Read silently. Do not ask for information you can find yourself.

### Always read
- **This skill's own assets first** (from the skill directory, not the repo): all four `templates/*.md`
  and `references/claudemd-best-practices.md` (the audit rubric), in full. The report's "Skill assets
  loaded" line proves it.
- `package.json` — name, scripts, dependencies, devDependencies, peerDependencies, exports field,
  `packageManager`
- Lockfile + `packageManager` field — confirm the package manager (see Phase 1b)
- `tsconfig.json` — lib, target, paths aliases (infer runtime target from lib array)
- Top-level directory structure of `src/` (or `app/` for Next.js App Router)
- `docs/` — list what exists: check for `docs/specs/`, `docs/architecture.md`, any other topic docs
- `.claude/skills/` and `.claude/commands/` — list custom skills/commands (commands are now unified into
  skills; new ones live in `skills/`). Also note `.claude/rules/` (path-scoped rules) and `.claude/agents/`
  if present.
- **Existing `CLAUDE.md` and `AGENTS.md`** — at this scope and in parent/sibling workspaces. Read them in
  full, not just to "stay consistent": their hand-written content must be preserved through the merge
  (see Phase 5). Note whether `AGENTS.md` is a standalone file or a symlink to/from `CLAUDE.md`.

### Root scope — also read
- The detected orchestrator config if present — `nx.json` (targets/plugins) · `turbo.json` (pipeline) ·
  `lerna.json` · `rush.json`. Skip whichever don't exist.
- The workspace manifest — `pnpm-workspace.yaml` or the `workspaces` field — for the actual globs
- `<workspace-glob>/*/package.json` for **every** workspace dir (not just `apps/` and `packages/`) —
  names, scope, framework deps
- **Documentation census:** every `*.md`/`*.mdx` in the repo (excluding `node_modules`, build output,
  generated dirs, changelogs). Classify each from its title/frontmatter/head — full-read only suspected
  conflicts and canonical candidates. Note last-commit date (`git log -1 --format=%cs -- <path>`) as the
  staleness signal. Feeds the doc-conflict audit (Phase 3) and the docs-map artifact (Phase 5).

### App scope — also read
- `src/main.ts` or `src/index.ts` or `app/layout.tsx` or framework entry equivalent
- `.env.example` if present — surface env var names
- Framework config file if present: `next.config.ts`, `nest-cli.json`, `vite.config.ts`,
  `remix.config.js`, etc.

### Package scope — also read
- `src/index.ts` (or the `exports`/`main` entry) — what is actually exported
- From the monorepo root, find consumers using the **detected** scope, not a hardcoded one:
  `rg "from ['\"]<SCOPE>/<name>[/'\"]" -l` (e.g. `@wt/logger`). The pattern must match both quote styles
  and subpath imports (`@wt/core/system` is often the only form a package is consumed by). Do not restrict
  to a fixed `.ts/.tsx` extension list — repos mix `.ts`/`.tsx`/`.js`; let ripgrep search all source.

### Domain (subtree) scope — also read
- The target directory's structure + 1-2 representative source files — to ground the real base classes,
  file-name conventions, and registration steps. Cite real symbols; never invent them.
- The enclosing package/app `CLAUDE.md` — to inherit its rules, not restate them.
- Any sibling subtree contract and the matching developer-guide doc — these are what the generated file
  will point at.

### Inference tables

Framework (from `dependencies`/`devDependencies`):

| Dep present | Framework | Role | Runtime |
|-------------|-----------|------|---------|
| `next` | Next.js | frontend | browser+node |
| `react` (no next / remix / astro) | React SPA | frontend | browser |
| `@remix-run/react` | Remix | frontend | browser+node |
| `astro` | Astro | frontend | browser or browser+node |
| `@nestjs/core` | NestJS | backend | node |
| `express` | Express | backend | node |
| `hono` | Hono | backend | node or edge |
| `fastify` | Fastify | backend | node |
| `@trpc/server` | tRPC | backend layer | node |
| `vue` | Vue | frontend | browser or browser+node |

If no framework is clearly identifiable, mark as `[UNKNOWN — fill in]` and flag it in the report.

Package type: `react` in peerDeps → `ui-components` · only ESLint/TS/Vitest config exports → `config` ·
generates or wraps a schema/spec → `api-contract` · wraps a logging library → `logger` · only type
exports, zero runtime deps → `types` · general-purpose helpers → `utility`.

Runtime target: DOM lib + no node-specific deps → `browser` · ES lib + node APIs (`fs`/`path`/`crypto`)
→ `node` · both, or cross-environment fetch clients → `universal` · `react` in peerDeps + no node deps
→ `browser`.

### Change posture derivation

Every generated guide carries a `Change posture` line: the contract for how much latitude agents and
automation get in that workspace. **Emit exactly one of four words — `locked | guarded | standard | open`
— never a number, never prose-only, never N/A.** Always append the derivation inputs in parentheses so the
value is auditable, e.g. `guarded (7 consumers, handles PHI)`.

Derive it mechanically, then confirm in the report:

1. Start at `standard`.
2. Escalate to `guarded` if **any**: published externally · a public API contract others build against ·
   handles auth, payments, or regulated data (PII/PHI) · widely consumed **and** breaking it breaks
   runtime behavior. Compile-time-only surfaces (types, config, test-only) stay `standard` regardless of
   consumer count.
3. `locked` if: status DEPRECATED / frozen · generated output that must never be hand-edited.
4. Relax to `open` only if: status EXPERIMENTAL, or internal tooling / spike — **and** nothing in rule 2
   applies.
5. Torn between two tiers → pick the more restrictive and add a `FLAGS.md` entry.
6. Postures are **proposals** until a human confirms them: they surface in the plan doc's Inferred table
   before the sweep, and the Phase 6 posture roll-call re-surfaces the final set for review.

The legend defining what each tier permits lives **once, in the root guide** (the root template ships it),
and keeps its authority columns — the per-tier "agents may / must not" mapping is the PR-agent authority
contract; never condense it to one-liners. Child guides carry only their value + inputs — never restate
the legend.

---

## Phase 3 — Audit (the mission layer)

For every existing `CLAUDE.md`/`AGENTS.md` and across the repo as a whole, produce findings against
`references/claudemd-best-practices.md`. This is where you surface problems the user may not know about.
Check, per the rubric:

- **Coverage gaps** — workspaces with no CLAUDE.md (target = all of them), and domain candidates
  (Phase 1 #4) absent from the coverage plan.
- **Length** — files over ~200 lines (see the output constraints in Phase 5 for what "over" means).
- **Generic content** — engineering platitudes / tone rules that belong in user-global `~/.claude/CLAUDE.md`.
- **Delta violations** — child files restating rules already in root.
- **Command drift** — commands that don't match `package.json` scripts.
- **Stale references** — paths / files / globs / commands that no longer exist.
- **Doc conflicts & dead docs** — two docs disagreeing on the same topic (name which should win and why),
  docs describing code that no longer exists, duplicates of a canonical source, orphans nothing links to.
  Every topic gets exactly one preferred source.
- **Naming contradictions** — conventions that differ between root and a child, or between two children.
- **Dep/runtime mismatches** — claims that contradict `package.json` / `tsconfig.json`, or violate the
  package-design invariants.
- **Missing or invalid change posture** — no `Change posture` line, or one that breaks the Phase 2 format
  (one of the four words, parenthesized inputs).
- **Procedures inlined** — multi-step workflows written into CLAUDE.md that belong in a skill
  (`.claude/skills/`), or rarely-needed reference detail that belongs in `.claude/rules/` or `docs/`.
- **Sync gaps** — workspaces missing the `AGENTS.md` ↔ `CLAUDE.md` symlink, or where the two files differ.
- **Golden example** — if an existing file scores well on the rubric, name it; match its shape instead of
  imposing the generic template.

Be honest. If a repo is clean, say so — do not manufacture findings to look thorough. Flag uncertain
findings as uncertain rather than asserting them.

---

## Phase 4 — Plan document (then stop)

Write the report **as a document** — `agent-instructions-plan.md` at the repo root — then stop. Do not
write any instruction files yet. The document is the review surface: the user reads it, answers the
Questions inline, and marks Practice review decisions directly in the file. In chat, post only a 3-5 line
pointer (where the doc is, the finding count, which questions need answers) plus the confirmation ask.
(Throughout this file, "the report" means this document.) The plan doc is per-run — overwrite any
`agent-instructions-plan.md` left over from a previous run.

`## Discovered during scaffolding` and `## Run summary` are created empty — Phase 5 and Phase 6 append to
them; nothing else in the document is touched after confirmation.

```
## Agent Instructions — Audit & Plan

### Repo shape
[monorepo | single package] — [reason]
Toolchain: [orchestrator or "no orchestrator"] · [package manager] · scope [@detected/] (per Phase 1b)
Skill assets loaded: [templates/root.md ✓ · app.md ✓ · package.md ✓ · domain.md ✓ · best-practices rubric ✓ — name any that failed to load, and stop if any did]

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
```

End the chat message with: **"Review and edit `agent-instructions-plan.md` (answer the Questions, mark the
Practice review decisions), then reply `yes` to run the sweep."** If corrections come back in chat instead
of the doc, fold them into the doc and re-confirm.

---

## Phase 5 — Generate / reconcile (one sweep, no questions)

On `yes`: **re-read `agent-instructions-plan.md` first** — the user may have edited it, and its inline
answers and Practice review decisions override the original inferences. Then run the whole coverage plan
start-to-finish in one sweep:

- **Order:** root first → each app (immediately followed by any domain subtrees inside it) → each package
  (immediately followed by its domain subtrees). Domains ride with their enclosing workspace, never as a
  trailing phase — they inherit from a guide that must already be final.
- **Non-interactive:** never stop to ask mid-sweep. Ambiguity discovered mid-run → take the safer reading,
  append one line to the plan doc's `## Discovered during scaffolding` section (what, where, assumption
  taken), and keep moving.

For each workspace in the coverage plan:

1. **Select the template:** root → `templates/root.md` · app → `templates/app.md` · package →
   `templates/package.md` · domain → `templates/domain.md`. If the audit found a golden in-repo example,
   match its shape instead. A golden example governs tone and formatting only — the section skeleton comes
   from the template (you read it in Phase 2; if not, read it now before filling anything), required
   sections drop only via the plan doc's Section accounting, and nothing waives the required metadata
   contract (step 2) or the legend's authority columns.
2. **Fill it in:** replace every `[PLACEHOLDER]` with the inferred/confirmed value; replace
   `<!-- guidance -->` blocks with real content. Substitute the detected toolchain throughout per the
   Phase 1b rules (no orchestrator → remove orchestrator-specific lines rather than leaving Turborepo
   references).
   **Required metadata contract (every workspace file, no exceptions — root included):** the file opens
   with the title, a one-line purpose, and a `Change posture:` line in the Phase 2 format (fold consumer
   counts / data sensitivity into the inputs) — tooling and PR agents grep the exact phrase. All other
   metadata rows are optional: include only what is non-default or load-bearing (Status only if
   EXPERIMENTAL/DEPRECATED, runtime only if it differs from the repo norm, Published only if external,
   Port/Deploy for apps). Domain (subtree) files stay metadata-free.
3. **Merge, never clobber.** If a real file exists at this scope, it may contain hard-won domain knowledge
   the templates can't infer:
   - Treat the existing file as the source of truth for any rule it states. The template provides
     *structure*; the existing content provides *substance*.
   - Place each existing rule/decision under the matching template section, keeping its original wording
     unless it's stale.
   - Only drop existing content that is (a) demonstrably stale, or (b) pure restatement of a template
     default — and list every drop in the report's merge plan.
   - When existing and template guidance conflict, the existing file wins unless the user said otherwise.
     Flag the conflict; don't silently resolve it.
   - Accounting runs both directions: every **template** section lands in the plan doc's Section
     accounting as filled, merged, or skipped-with-reason. Sections with no counterpart in the existing
     file (e.g. Comments & documentation, Planning before building) are generated from inference — never
     silently dropped because the old file lacked them.
4. **Remove sections that don't apply** rather than leaving them empty (a11y for backends, Port for
   frontends, Data access for FE-only, peer-deps with no framework peers, generated-files notes when
   there's no codegen, Watch mode when there's no dev script). Do not leave empty sections. Keep all
   enforcement checks, updating paths to match the actual workspace.
5. **Keep generic content out** — route flagged tone/behavior lines into the relocate-to-user-global
   block, don't put them in the repo file.
6. **Invariant callout:** if any of these hold, add a `> ⚠ INVARIANT CONCERN:` note at the top of the
   file: a `utility`/`types` package with framework deps in `dependencies`; a `config` package with
   runtime deps; a `universal` package using `node:*`; a package importing from `apps/`; an app importing
   another app.
7. **Resolve docs & planning references** (the root Documentation & Specs section or the app/package
   equivalent):
   - `docs/` missing → keep the "create it" callout as an instruction to the human; note it in the summary.
   - `docs/specs/` has files → list up to 3 recent specs by name so the naming pattern is concrete.
   - Custom skills found → reference them by name in the planning process (e.g. "Use `/brainstorm` before
     writing the design spec. Use `/plan` for the implementation plan."). None found → generic language.
   - `docs/architecture.md` exists → add it to the reference-docs bullet with a note on what it covers.
8. **Write the docs map** (root sweep only): `docs/docs-map.md`, generated from the plan doc's
   Documentation inventory — the referenceable library of the repo's documentation. Contents: conflicts
   awaiting a decision at the top (mirrored in `FLAGS.md`); a preferred-source-per-topic table; then one
   line per doc: path · topic · status (`canonical | stale (evidence) | duplicate → [canonical] | orphan`)
   · last-commit date. Header notes it is maintained by this skill — regenerate, don't hand-groom. The
   root guide's documentation section points here, and every "read X for depth" pointer in generated
   files must cite a doc the map marks canonical — never one marked stale or duplicate.

### Output constraints (apply to every generated file)

- **Aim for around 200 lines per file** — a little over is fine if every line is load-bearing. An
  adherence heuristic, not a validator: the enemy isn't line 201, it's the 400+ line file where real rules
  drown in reference material. The budget **stacks** — root + workspace delta (+ domain router) load
  together, on top of user-level config — and root loads in *every* session, so it is the most expensive
  file; cut there first.
- **Offload, don't inline.** Path-specific or rarely-needed detail goes to `.claude/rules/` (loads only
  when matching files are touched) or `docs/`, with a pointer; reserve `CLAUDE.md` for facts needed in
  every session. When preserved hand-written content pushes a file past budget, propose specific offloads
  in the report/summary — never silently accept the growth, and never fix it by cutting load-bearing local
  footguns (ordering constraints like "middleware X stays last", registration steps, non-obvious wiring):
  those are the delta's reason to exist; cut style and reference material instead. A footgun with no home
  is a finding, not a cut.
- **Inventories don't scale — summarize, don't census.** Don't emit one row per workspace in the root file
  of a large monorepo: group packages by category, name only the load-bearing ones, and point at the
  workspace manifest or a docs map for the full list (it's derivable — e.g. `pnpm ls -r --depth -1` — so
  duplicating it is drift). A full per-workspace table is fine up to ~8 workspaces.
- **Don't duplicate what tooling enforces.** If ESLint, Prettier, `tsc`, or CI already enforce a rule,
  name the tool instead of restating the rule as prose.
- **Concrete over vague:** "run `pnpm test` before committing" beats "test your changes."
- **Don't put procedures in CLAUDE.md.** Multi-step workflows belong in a skill (`.claude/skills/`),
  lifecycle automation in hooks.
- **Domain (subtree) files are different:** target ~30-50 lines and act as a *router* — local conventions
  plus pointers to the matching developer-guide doc, sibling contract, or custom agent. No metadata block,
  no commands, no PR checklist (all inherited from the enclosing guide). Title is the area name (e.g.
  "Event Handlers"). Model the tone on existing subtree contracts; link depth, don't inline it.

### Writing the file + AGENTS.md twin

`AGENTS.md` is the real, vendor-neutral file; `CLAUDE.md` is a symlink to it. For each workspace, write
the content to `AGENTS.md`, then create the link — handle by prior state:

- **Fresh (neither exists) or `AGENTS.md` already the real file:** write `AGENTS.md`, then
  `ln -sf AGENTS.md CLAUDE.md` (from inside the workspace directory).
- **Real `CLAUDE.md`, no symlink:** write the reconciled content to `AGENTS.md`, then
  `rm CLAUDE.md && ln -s AGENTS.md CLAUDE.md`.
- **Opposite arrangement (`AGENTS.md` is a symlink → real `CLAUDE.md`):** `rm AGENTS.md` **first**, then
  write the real `AGENTS.md`, then convert `CLAUDE.md` as above. Never write "into" a still-symlinked
  `AGENTS.md` — the write goes through it into `CLAUDE.md`, and the later `rm CLAUDE.md` destroys the
  only real copy.

Only convert files the plan marked create/reconcile, and only after Phase 4 confirmation. Windows:
symlinks need Developer Mode or admin — fall back to a thin `CLAUDE.md` containing `@AGENTS.md` (import)
and tell the user why.

### Write flags instead of assuming

Mid-sweep discoveries go to the plan doc's `## Discovered during scaffolding` section as they happen. When
the sweep ends, copy everything still unresolved — plan-doc discoveries, Gaps the user didn't answer,
contradictions between existing docs and code, invariant concerns, a posture you weren't sure of — into
`FLAGS.md` at the repo root (create it if absent; append, never clobber) and mark those plan-doc entries
"→ FLAGS.md". The plan doc is this run's log; `FLAGS.md` is the durable burn-down. Never resolve an
ambiguity by silently guessing.

Format: a dated `## From [what] (YYYY-MM-DD)` section; one `- [ ]` entry per item stating the
inconsistency, the paths involved, and what was assumed in the meantime. `FLAGS.md` is a burn-down list,
not documentation: resolving an entry means moving the truth into CLAUDE.md or the code and deleting the
entry; delete the file when it's empty.

---

## Phase 6 — Summarize

Write the same summary into the plan doc's `## Run summary` section — the doc is now a complete record of
the run (fine to commit with the PR for provenance, or delete after review; the user's call). Then report
in chat:

- Paths written (and which `CLAUDE.md` → `AGENTS.md` symlinks were created).
- The coverage plan with each row's outcome (created / reconciled / ok / skipped — and why), so
  completeness is verifiable against Phase 1.
- `FLAGS.md`: how many entries were added, or "none needed".
- **Posture roll-call:** every workspace grouped by final tier (locked / guarded / standard / open) — the
  human-in-the-loop check on risk; call out any posture that differs from the plan doc.
- `docs/docs-map.md`: written/refreshed — N canonical · N stale · N duplicates · N conflicts pending.
- Final line count per file (aim ~200; flag only if well over and bloated); if anything was offloaded to
  `.claude/rules/` or `docs/`, note what and where.
- Merge result if an existing file was found: what was preserved, restructured, or dropped.
- Whether `docs/` or `docs/specs/` still needs creating (action item).
- Remaining `[PLACEHOLDER]` tokens per file that need manual attention.
- Any invariant concerns flagged.
- The generic-content block to paste into `~/.claude/CLAUDE.md`, if the user approved relocating it.

---

## Edge cases

- **Not a JS/TS repo / no package.json:** say so and stop. This skill is built around the JS/TS monorepo
  templates; don't force them onto an unrelated repo.
- **Existing files are already excellent and coverage is complete:** report "in good shape, nothing to
  change" and stop. Don't rewrite good files to match the template for its own sake. If the files are
  excellent but workspaces lack coverage, generate the missing deltas and leave the good files alone.
- **User declines the symlink approach:** offer the `@AGENTS.md` import alternative; never silently produce
  two drifting real files.
