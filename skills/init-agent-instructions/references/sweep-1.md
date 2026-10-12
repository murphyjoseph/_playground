# Sweep 1 — Discover

Read in full when `SKILL.md`'s state table selects sweep 1. Phases run in order; nothing is written to the repo
except the preflight actions in 1.0, and nothing is written outside `_ins/` after that.

## 1.0 Preflight — AGENTS.md only

Runs before any other read or write. Scan the repo (excluding `node_modules`, build output, `.git`, and
`.claude/worktrees/`) for `CLAUDE.md`, `.claude/CLAUDE.md`, and `CLAUDE.local.md`. If any exist, post a notice in
chat **before touching them** — one table row per file: path · state · action — then proceed without waiting (the
files are git-tracked and the content is preserved; this step is meant to be automatic). Actions by state:

| State found | Action |
| --- | --- |
| `CLAUDE.md` is a symlink to `AGENTS.md` | delete the symlink |
| Real `CLAUDE.md`, no `AGENTS.md` beside it | `git mv CLAUDE.md AGENTS.md` (plain `mv` if untracked) |
| Both real, byte-identical (`cmp -s`) | delete `CLAUDE.md` |
| Both real, content differs | `diff`; append every line present only in `CLAUDE.md` to the end of `AGENTS.md` under a `## Merged from CLAUDE.md` heading, verbatim; then delete `CLAUDE.md`. Sweep 2 folds that section into the template sections and removes the heading. |
| `CLAUDE.md` containing only an `@AGENTS.md` import (plus blank lines) | delete |
| `.claude/CLAUDE.md` | same rules, against the `AGENTS.md` of the directory that contains `.claude/` |
| `CLAUDE.local.md` | **never delete** — personal, usually gitignored. Flag it with the settings fix below. |

Then walk from the repo root **upward** to `/` looking for the same three names. Anything found is outside the
repo: never touch it; record it as an ancestor flag. On this machine it suppresses every `AGENTS.md` in the repo
under the default setting; the fix is per engineer, in `~/.claude/settings.json` (project and local settings files
are ignored for this key):

```json
{ "pluginConfigs": { "cc-plugin-agents-md@builtin": { "options": { "instructionFiles": "claude-md-and-agents-md" } } } }
```

Log every row — actions taken and flags — in `1-audit.md` → Preflight; `0-recap.md` repeats the counts and the fix.

Not a JS/TS repo, or a single `package.json` with no workspace manifest → stop here (`SKILL.md` → Edge cases).

## 1.1 Detect scope & coverage

1. A workspace manifest at the root → **monorepo**. Any of: `pnpm-workspace.yaml`, a `workspaces` field in
   `package.json`, `nx.json`, `lerna.json`, `rush.json`. Enumerate the full target set: root + every workspace dir
   resolved from the manifest globs — not just `apps/` and `packages/` but any glob (`platform/`, `services/`,
   `tools/`, ...). Coverage is *all* of them, including config and types packages (they get a short but real file —
   see the package template note). "The root already covers it" is a **banned** reason to skip a workspace: the
   delta is the metadata carrier (posture, consumers, commands), and full coverage makes absence meaningful — a
   missing file means "not yet generated", never "intentionally empty". Scale depth, not existence: a thin
   workspace gets ~10-15 lines.
2. Single `package.json`, no workspaces → not this skill's lane. Say so and stop. If the user explicitly wants a
   root-only guide anyway, use the root template minus its monorepo-only sections (workspace reference, Package
   Design Invariants, Adding a New Workspace) — and do not invent monorepo structure.
3. A code subdirectory *inside* a workspace's source that owns a distinct authoring concern — e.g.
   `eventHandlers/`, `workflows/`, `controllers/`, `commands/`, `repositories/` → **domain** (a subtree contract).
   These have no `package.json`; they inherit from the enclosing package/app guide. Only create one where 1.3 says
   it's warranted — but at monorepo scope, don't wait to be asked: actively scan for candidates (signals: clusters
   of same-suffix conventional files — `*.handler.ts`, `*.controller.ts`, `*.command.ts`, `*.workflow.ts`,
   `*.repository.ts` — a registration/codegen step, a base class extended across many files, a matching
   developer-guide doc) and put **every** candidate in the coverage plan with a generate/skip recommendation and
   the evidence. Skipping is fine when 1.3 says so; skipping **silently** is not.
4. Ambiguous → it becomes a `2-decisions.md` §G question with a safer reading; never stop to ask in chat.

## 1.2 Detect toolchain (never assume — read it)

The templates ship with defaults (Turborepo, pnpm, `@repo/` scope, `pnpm <script>` commands). **These are
placeholders, not facts.** Detect the real toolchain here; sweep 2 substitutes it everywhere in the output:

| Thing | How to detect | Examples |
|-------|---------------|----------|
| Monorepo orchestrator | root config file | `nx.json` → Nx · `turbo.json` → Turborepo · `lerna.json` → Lerna · `rush.json` → Rush · none present → "workspaces only, no orchestrator" |
| Package manager | `packageManager` field in root `package.json` + lockfile | `pnpm-lock.yaml` → pnpm · `yarn.lock` → yarn · `package-lock.json` → npm · `bun.lockb`/`bun.lock` → bun |
| Package-name scope | `name` field of existing `packages/*/package.json` | `@acme/…`, `@corp/…` — do **not** assume `@repo/` |
| Task commands | root `package.json` `scripts` + any `Makefile` / `justfile` / `Taskfile` | repo may drive tasks via `nx run …`, `make …`, or `pnpm <script>` — record the names that actually exist |
| Workspace dirs | manifest globs | `apps/*`, `packages/*`, `platform/*`, `tools/*`, `generated` |
| Lint tooling (presence only — the scout does the deep pass) | `.eslintrc*`, `eslint.config.*`, `biome.json`, Prettier config; `lint` scripts; a lint step in CI workflows | "ESLint 8 legacy at root + ESLint 9 flat in `packages/module-*` via `@acme/config-eslint`; Prettier; no CI lint step" |

## 1.3 When a domain (subtree) guide is warranted

Domain files are path-scoped — they load automatically only when you work in their directory. Add one only where
it earns its place; don't spray them across every folder. A subtree `AGENTS.md` is warranted when **all** of these
hold:

- The directory owns a distinct authoring concern with non-obvious local conventions (a base class to extend, a
  registration step, a required file set).
- There is matching depth elsewhere to point at — a developer-guide doc, a sibling subtree contract, or a custom
  agent — that a contributor should read on demand.
- It's a common work location, and the rules would otherwise sit in a parent guide that does **not** auto-load
  there (the auto-load gap).

If the rules already load via a parent/sibling contract, add a pointer there instead of a new file. And if the
concern is Claude-only and should fire on file-path match regardless of working directory (e.g. "any edit to
`*.prisma` files requires the migration check"), a `.claude/rules/*.md` with `paths:` globs beats a subtree file —
reserve domain `AGENTS.md` files for authoring contracts every tool should see. The goal is to pull the *right*
context on demand, not to fragment it.

## 1.4 Read & infer (per workspace)

**This skill's own assets first** (from the skill directory, not the repo), in full: the four `templates/*.md`,
the five `templates/ins/*.md`, `references/agentsmd-best-practices.md` (the audit rubric),
`references/inference.md`, `references/lint-catalog.md`, and `references/lint-brief.md`. The recap's "Skill assets
loaded" line proves it.

Then profile every workspace in the coverage plan with `references/inference.md`: its reading lists say what to
open at each scope, its tables turn dependencies into framework / package type / runtime target / blast radius /
dep footprint, and its derivation produces the posture row. Results go to `1-audit.md` → Coverage plan, Inferred,
Change posture, Dependency footprint, and Observed conventions.

**Fan out past ~8 workspaces.** At or below that, profile inline. Above it, the code reading is the main-context
hog, so delegate it: group the workspaces into batches of ~6 and launch one general-purpose subagent per batch on
`references/profile-brief.md`, all in a single message together with the documentation census (below) and the
lint scout (1.6). Each profiler's prompt carries exactly the brief's inputs: `REPO`, `SKILL_DIR`, `TOOLCHAIN`
(from 1.2), its `WORKSPACES` batch, and `SENSITIVE_DATA` + `DOMAIN_TERMS` (from the repo's domain — `none` when
the repo handles no regulated data). Each returns one fixed block per workspace plus a probe table; merge them
into `1-audit.md` verbatim-by-field — never re-derive a field a profiler returned, and never let a profiler's
`notes` become a finding without checking it against the rubric yourself. The existing `AGENTS.md` files are
still read in full in the main context: they are the audit's subject, and profilers only harvest their imperative
lines. If the Agent tool is unavailable, profile inline, tightest workspaces first.

**Documentation census (root scope):** every `*.md`/`*.mdx` in the repo (excluding `node_modules`, build output,
generated dirs, changelogs). Delegate this to a read-only subagent (an Explore-type agent via the Agent tool) that
classifies each doc from its title/frontmatter/head, notes last-commit date (`git log -1 --format=%cs -- <path>`)
as the staleness signal, and returns just the inventory — path · topic · classification · date — plus suspected
conflicts and canonical candidates. Full-read in the main context only those flagged files. Feeds the doc-conflict
audit (1.5) and the docs map (`sweep-2.md` → step 9). Launch it in the same message as the profilers and the lint
scout (1.6). If subagents aren't available, run the census directly but keep only the inventory table.

## 1.5 Audit

Apply **every section** of `references/agentsmd-best-practices.md` to every existing `AGENTS.md` and to the repo as
a whole — the rubric is the checklist; do not keep a second one here. This is where you surface problems the user
may not know about. Each finding carries the rubric rule it violates and is routed by class:

| Finding class (rubric) | Goes to |
| --- | --- |
| Coverage gap (workspace or domain candidate) | `1-audit.md` → Coverage plan (sweep 2 creates it) |
| Lint-enforceable prose, shell re-implementation of a lint rule | `3-automation.md` row + `2-decisions.md` §D |
| Practice contradiction, naming contradiction where the code itself is split | `2-decisions.md` §A — one item per topic with the variant table; dozens of instances are **one** item. Source: the Observed conventions probe table in `1-audit.md` (a probe whose winning variant differs across workspaces, or splits inside one) plus any guide that claims a convention the probes contradict |
| Missing / invalid change posture | `2-decisions.md` §C |
| Generic content | `2-decisions.md` §E |
| Doc conflict, dead / duplicate / orphan doc | `1-audit.md` → Documentation inventory (docs map per §F) |
| Command drift, stale reference, delta violation, wrong mechanism, length / stacked budget / byte cap, metadata-row defects, leftover `## Merged from CLAUDE.md` | `1-audit.md` → Findings; sweep 2 fixes, drops, folds, or offloads (Merge plan) |
| Dep / runtime mismatch | `1-audit.md` → Dependency footprint check (sweep 2 adds the invariant callout) |
| Golden example | `1-audit.md` → Coverage plan note (sweep 2 matches its shape) |

Be honest. If a repo is clean, say so — do not manufacture findings to look thorough. Flag uncertain findings as
uncertain rather than asserting them.

## 1.6 Lint scout (subagent)

Launch one general-purpose subagent (Agent tool) on `references/lint-brief.md`, in the same message as the
documentation-census subagent and the profilers so they all run in parallel — every one of them is read-only. Its
prompt carries exactly the brief's inputs: `REPO`, `SKILL_DIR`, `TOOLCHAIN` (from 1.2), and `CANDIDATES` — every
imperative convention line in the existing `AGENTS.md` files with `path:line` (you read them in full in 1.4; the
scout re-scans them anyway) plus the template policies B1–B8. It returns the filled `3-automation.md` and a
routing list for §D. Do not re-derive its
work in the main context; do check that every rule id it marked "verified" cites a rules directory, and demote any
that doesn't to "candidate — unverified". If the Agent tool is unavailable, run the brief inline, bounded to its
step list.

## 1.7 Write `_ins/` and stop

Create `_ins/` (on `fresh`, after deleting the old one). Fill, from `templates/ins/`, in this order:
`1-audit.md` → `2-decisions.md` → `3-automation.md` (the scout's return, checked) → `0-recap.md` (variant A).

- Every template section appears, in template order; an empty one says "none". Absence must mean "not checked",
  never "clean".
- `2-decisions.md`: every REQUIRED item (§A–§D) is pre-marked with an evidence-backed recommendation and ends with
  `> decision: [mark]`. §A: one item per contested topic, with the variant table. §B: policies an existing guide
  already states are pre-marked `adopt: yes (already in force — path)`; a policy the code widely violates is
  routed to §A instead, and the §B row says so. §C: one row per workspace. §D: the scout's routing list, classes
  A–D only (class E never asks). OPTIONAL §E–§H carry their safer reading.
- Evidence in `_ins/` may include counts and paths; generated guides may not.
- No instruction file is written in sweep 1 except the preflight merges.

In chat, post 3-5 lines: where `_ins/` is, the finding count, the REQUIRED decision count, and the line **"Mark
every `[mark]` in `_ins/2-decisions.md`, then run `/init-agent-instructions` again."** Then stop.
