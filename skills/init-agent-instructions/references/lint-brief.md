# Lint scout — subagent brief

Sweep 1 launches one general-purpose subagent with this brief. It runs read-only against the target repo and
returns the filled `3-automation.md` plus a compact routing list. It never writes into the repo. The orchestrator
pastes the paths below into the prompt; the scout reads the files itself.

**Inputs (the orchestrator supplies these):**
- `REPO` — absolute path of the target repo root.
- `SKILL_DIR` — absolute path of this skill; read `references/lint-catalog.md` and `templates/ins/3-automation.md`
  from it first, in full.
- `TOOLCHAIN` — package manager, orchestrator, scope, workspace globs (from sweep 1's detection).
- `CANDIDATES` — the convention lines sweep 1 harvested: every imperative line (MUST / MUST NOT / never / always /
  prefer / no …) from existing `AGENTS.md` files with `path:line`, plus the template policies B1–B8 and every
  practice contradiction A-item. The scout adds observed conventions on top.

## Steps

1. **Detect the lint state** — fill the Current lint state table with evidence, not inference:
   - Config files: `.eslintrc*`, `eslint.config.*`, `biome.json`, `.oxlintrc*`, `prettier.config.*`/`.prettierrc*`,
     `.dependency-cruiser.*`, `knip.*`, `.syncpackrc*`, `commitlint.config.*`, `.husky/`, `lefthook.yml` — repo-wide,
     excluding `node_modules`, build output, worktrees.
   - ESLint major and style: `eslint` version in root and workspace `devDependencies` + lockfile; legacy vs flat; a
     repo can be **mixed** (root on v8 legacy, some packages on v9 flat via a shared config package) — say exactly
     which config governs which paths (`files` globs, `overrides`, the consuming `eslint.config.*` files).
   - Plugins installed: every `eslint-plugin-*`, `@*/eslint-plugin*`, `@typescript-eslint/*`, `@nx/eslint-plugin`
     in any `package.json`. For each, locate its rules directory (`node_modules/<plugin>/lib/rules`,
     `…/dist/rules`, or the README) — you will verify rule ids against it in step 3.
   - Type-aware linting on or off (`parserOptions.project` / `projectService`).
   - Coverage: which workspaces have a `lint` script or fall under some config's `files` globs; list the uncovered.
   - CI: grep `.github/workflows/*.yml` (or the repo's CI dir) for a lint invocation. Yes/no with the job name.
   - Severity profile: count `error` vs `warn` in the governing configs.
   - Base `tsconfig` flags: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `noImplicitOverride`,
     `noUnusedLocals`.
   - Local custom plugins (e.g. a `packages/eslint-plugin-*`): name them — they are the precedent for class D.

2. **Harvest candidates** — start from `CANDIDATES`; then scan existing `AGENTS.md` files yourself for convention
   lines the orchestrator may have missed (fenced "Enforcement Checks" `rg` commands count: each is a lint rule
   written as a shell check). Add **observed conventions** the codebase follows without any guide saying so, only
   where a cheap probe shows near-uniform adherence (e.g. every component file is an arrow function; no default
   exports outside framework entry points). Keep the list bounded: at most ~40 rows; prefer the ones with the
   highest agent-error risk.

3. **Classify each candidate** against the catalog: A / B / C / D / E.
   - Look the convention up in `lint-catalog.md`. No row → decide E (stays in prose) or D (a selector can express
     it) — be conservative: D only when the selector is simple and the repo already runs ESLint.
   - **Verify every rule id** you intend to emit against the installed plugin's rules directory (or, for class C,
     mark it "candidate — unverified" and name the plugin to install). Never emit an id from memory alone.
   - Compliance probe: one `rg` (or equivalent) per rule, scoped to source dirs, excluding tests where the rule
     exempts them. Record `~N violations / M files`. Rampant (> ~25% of files) → propose `defer → §A` (it is a
     practice decision, not a lint rule yet) and say so.

4. **Draft the baseline** per the template's tiers:
   - Tier 0 is always "make the existing config run": a root `lint` script if missing, every declared workspace
     covered, errors only, one CI step. If no config exists at all, tier 0 is the minimal flat config (parser +
     `@typescript-eslint` recommended + `import` plugin) using **only** packages already in the lockfile, or an
     explicit "install: …" line.
   - Tiers 1–3 from the classified rows: class A/B near-zero violations → tier 1 `error`; partial → tier 2 `warn`
     with the count; class C → tier 3 with the plugin to add.
   - The config block: real imports for installed plugins, real rule ids (verified), severities per tier, scoped
     `files` for workspace-specific rules (universal packages, app `src/`, test files). Extend the shared config
     package if one exists rather than proposing a second root config.
   - The CI step: the exact script name from tier 0.

5. **Beyond ESLint** — one row per tool where the repo gives evidence (Nx present → module boundaries; published
   package → publint; conventional-commit history → commitlint; many workspaces → syncpack). No evidence → no row.

## Return

Return exactly two things, nothing else:

1. The complete `3-automation.md` content, following `templates/ins/3-automation.md` section-for-section (no
   section dropped; empty ones say "none").
2. A routing list the orchestrator copies into `2-decisions.md` §D — one line per class A–D row:
   `#n · <convention as prose> · <source> · <class> · <tool · rule id> · <proposed severity>`.

Keep the return under ~400 lines. Do not include file dumps, probe output, or reasoning. If a step could not be
completed (no `node_modules`, no lockfile), say which and what that leaves unverified.
