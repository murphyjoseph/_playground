# Inference — what to read per scope, and how to turn it into facts

Loaded by sweep 1 (`sweep-1.md` → 1.4) for every workspace in the coverage plan. Read silently; never ask for
information you can find yourself. Everything derived here lands in `1-audit.md` → Inferred and → Change posture;
nothing here writes to the repo.

## Reading lists

**Every workspace**
- `package.json` — name, scripts, dependencies, devDependencies, peerDependencies, exports field, `packageManager`
- Lockfile + `packageManager` field — confirm the package manager (see `sweep-1.md` → 1.2)
- `tsconfig.json` — lib, target, paths aliases (infer runtime target from the lib array)
- Top-level directory structure of `src/` (or `app/` for Next.js App Router)
- `docs/` — list what exists: `docs/specs/`, `docs/architecture.md`, any other topic docs
- `.claude/skills/` and `.claude/commands/` — custom skills/commands (commands are now unified into skills; new
  ones live in `skills/`). Also note `.claude/rules/` (path-scoped rules) and `.claude/agents/` if present.
- **Existing `AGENTS.md`** — at this scope and in parent/sibling workspaces (including any `## Merged from
  CLAUDE.md` section preflight added). Read them in full, not just to "stay consistent": their hand-written
  content must be preserved through the merge (`sweep-2.md` → step 3), and every imperative convention line in them
  is a candidate for the lint scout.

**Root scope — also**
- The detected orchestrator config if present — `nx.json` (targets/plugins) · `turbo.json` (pipeline) ·
  `lerna.json` · `rush.json`. Skip whichever don't exist.
- The workspace manifest — `pnpm-workspace.yaml` or the `workspaces` field — for the actual globs
- `<workspace-glob>/*/package.json` for **every** workspace dir (not just `apps/` and `packages/`) — names, scope,
  framework deps
- The documentation census is a subagent job (`sweep-1.md` → 1.4); full-read in the main context only the docs it
  flags as conflicting or canonical.

**App scope — also**
- `src/main.ts` or `src/index.ts` or `app/layout.tsx` or the framework entry equivalent
- `.env.example` if present — surface env var names
- Framework config file if present: `next.config.ts`, `nest-cli.json`, `vite.config.ts`, `remix.config.js`, etc.

**Package scope — also**
- `src/index.ts` (or the `exports`/`main` entry) — what is actually exported
- From the monorepo root, find consumers using the **detected** scope, not a hardcoded one:
  `rg "from ['\"]<SCOPE>/<name>[/'\"]" -l` (e.g. `@acme/logger`). The pattern must match both quote styles and
  subpath imports (`@acme/core/system` is often the only form a package is consumed by). Do not restrict to a fixed
  `.ts/.tsx` extension list — repos mix `.ts`/`.tsx`/`.js`; let ripgrep search all source.

**Domain (subtree) scope — also**
- The target directory's structure + 1-2 representative source files — to ground the real base classes, file-name
  conventions, and registration steps. Cite real symbols; never invent them.
- The enclosing package/app `AGENTS.md` — to inherit its rules, not restate them.
- Any sibling subtree contract and the matching developer-guide doc — these are what the generated file will
  point at.

## Inference tables

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

If no framework is clearly identifiable, mark as `[UNKNOWN — fill in]` and list it under Gaps.

Package type: `react` in peerDeps → `ui-components` · only ESLint/TS/Vitest config exports → `config` · generates
or wraps a schema/spec → `api-contract` · wraps a logging library → `logger` · only type exports, zero runtime
deps → `types` · general-purpose helpers → `utility`.

Runtime target: DOM lib + no node-specific deps → `browser` · ES lib + node APIs (`fs`/`path`/`crypto`) → `node` ·
both, or cross-environment fetch clients → `universal` · `react` in peerDeps + no node deps → `browser`.

Blast radius (packages only), from the direct dependency graph — never a count: `repo-wide` · `several workspaces` ·
`one workspace (name)` · `build/CI only` · `leaf (no consumers)`.

Dependency footprint — detection vocabulary for the invariant table the root template ships (§4). A dep in a
forbidden category for the package's type is `⚠`:

| Category | Recognize by | Forbidden in |
|----------|--------------|--------------|
| UI framework | `react`, `react-dom`, `react-native`, `vue`, `@angular/*`, `svelte`, `solid-js`, `preact` | `utility`, `types`, `config`, `logger`, `api-contract`; allowed only as a **peer** dep of `ui-components` |
| Backend framework | `@nestjs/*`, `express`, `fastify`, `hono`, `koa`, `@trpc/server` | `utility`, `types`, `config`, `ui-components`, `logger`, `api-contract` |
| Node-only API | imports of `node:*`, `fs`, `path`, `crypto`, `child_process`, `os`; deps like `chokidar`, `glob` | `browser` and `universal` runtime targets; `ui-components` |
| Server data access | `@prisma/client`, `prisma`, `pg`, `mysql2`, `mongoose`, `knex`, `drizzle-orm`, `@google-cloud/firestore`, `@google-cloud/bigquery` | everything except a backend app or a package whose stated job is data access |
| Any runtime dep | non-empty `dependencies` | `types` and `config` packages (dev deps only) |

Sensitive-data flag (only when the repo adopts the row): derive by READING the source — does sensitive data flow
through at runtime as this code's job? — never from package category alone. Category-based guessing misclassified
4 of 34 packages in the first real run (error factories carrying user data in their details payloads, "generic"
helper libs formatting user addresses, a "type-only" port shipping a runtime class). Data-agnostic helpers and
type-only packages are `no`.

## Change posture derivation

Every generated guide carries a `Change posture` line: the contract for how much latitude agents and automation
get in that workspace. **Emit exactly one of four words — `locked | guarded | standard | open` — never a number,
never prose-only, never N/A.** Always append the derivation inputs in parentheses so the value is auditable, e.g.
`guarded (widely-consumed runtime surface, handles PHI)`. Inputs are QUALITATIVE — never put consumer counts or
other derivable numbers in them (they drift; scale lives in the CI-validated Blast radius row).

Derive it mechanically, then let the user confirm in `2-decisions.md` §C:

1. Start at `standard`.
2. Escalate to `guarded` if **any**: published externally · a public API contract others build against · handles
   auth, payments, or regulated data (PII/PHI) · widely consumed **and** breaking it breaks runtime behavior.
   Compile-time-only surfaces (types, config, test-only) stay `standard` regardless of consumer count.
3. `locked` if: status DEPRECATED / frozen · generated output that must never be hand-edited.
4. Relax to `open` only if: status EXPERIMENTAL, or internal tooling / spike — **and** nothing in rule 2 applies.
5. Torn between two tiers → pick the more restrictive and say so in the §C row's inputs.
6. Postures are **proposals** until a human confirms them in §C; sweep 2's recap re-surfaces the final set.

The legend defining what each tier permits lives **once, in the root guide** (the root template ships it), and
keeps its authority columns — the per-tier "agents may / must not" mapping is the PR-agent authority contract;
never condense it to one-liners. Child guides carry only their value + inputs — never restate the legend.
