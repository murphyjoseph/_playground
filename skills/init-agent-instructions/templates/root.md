# CLAUDE.md — [PROJECT_NAME]

> **Root guide.** All `apps/` and `packages/` CLAUDE.md files are deltas — they inherit everything here and only document what differs. Never duplicate root rules in child guides.

- **Project:** `[PROJECT_NAME]`
- **Monorepo type:** `[FE-only | BE-only | FE+BE]`
- **Runtimes in use:** `[browser · node · edge]` ← list only what applies
- **Language:** TypeScript `[VERSION]` — strict mode, no exceptions
- **Package manager:** pnpm `[VERSION]`
- **Node version:** `[VERSION]` (see `.nvmrc` / `.node-version`)
- **Build orchestration:** `[ORCHESTRATOR — Nx · Turborepo · Lerna · Rush · none (workspaces only)]`
- **Deploy target(s):** `[e.g., Vercel (web) · Fly.io (server) · npm (packages)]`
- **Change posture:** `[locked | guarded | standard | open]` (`[inputs — why this default, e.g. "healthcare prod, PHI throughout"]`) — repo-wide default; each workspace guide sets its own. Legend below.

---

## Operating Rules

<!-- Agent behavior in this repo. Repo-operational rules only — general tone/style preferences belong in user-level config, not here. -->

- Read the code before changing it; cite `file:line`. Never assume — verify in the actual files.
- Match your latitude to the workspace's **change posture** (legend below): smallest sufficient diff in `guarded` code; opportunistic improvements only in `open` code.
- Hit a contradiction — between a CLAUDE.md and the code, between two guides, or an ambiguity you'd otherwise paper over with a guess? Record it in `FLAGS.md` at the repo root, surface it in your reply, and proceed on the safer reading. Never silently assume.
- If your change makes a statement in any CLAUDE.md false, update that file in the same PR. A doc that lies is worse than no doc.

## Metadata Legend

Every workspace guide carries a `Change posture` value: the contract for how much latitude agents and automation (PR review bots, refactor agents) have there. Words, not numbers — `locked` is most restrictive, `open` is least. The derivation inputs appear in parentheses next to each value so it stays auditable.

| Posture    | Typical for                                                                       | Agents may                                                                    | Agents must not                                                                    |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `locked`   | Deprecated / frozen code, generated output                                         | Read; flag issues                                                              | Hand-edit, ever — change the source or generator instead                            |
| `guarded`  | High blast radius: widely-consumed packages, public API contracts, auth/payments/PHI paths | Minimal targeted diffs; approve PRs                                            | Merge without a human; refactor beyond the task; break public API without sign-off  |
| `standard` | Normal production code                                                             | Normal changes; approve; merge when CI is green and the diff stays in-workspace | Merge diffs that leave the workspace                                                 |
| `open`     | Prototypes, internal tooling, spikes                                               | Merge on green CI; refactor opportunistically                                  | —                                                                                    |

When one diff spans workspaces with different postures, the most restrictive posture governs the whole diff.

---

## 1) Monorepo Structure

```
[PROJECT_NAME]/
├── apps/
│   ├── [app-1]/          # [one-line description] · [framework] · [role]
│   └── [app-2]/          # [one-line description] · [framework] · [role]
├── packages/
│   ├── [pkg-1]/          # [one-line description] · [package-type] · [runtime-target]
│   └── [pkg-2]/          # [one-line description] · [package-type] · [runtime-target]
├── docs/
│   ├── specs/            # Feature design specs and implementation plans
│   └── [topic].md        # Architecture, API, deployment, etc.
├── [orchestrator config]   # nx.json / turbo.json / … — omit if none
├── pnpm-workspace.yaml
└── CLAUDE.md             ← you are here
```

**Workspace reference:**

<!-- Scale-aware: a full per-workspace table is fine up to ~8 workspaces. Beyond that, group by category in the tree above, name only the load-bearing ones, and point at the manifest or a docs map — the census is derivable; don't duplicate it. -->

| Path               | Workspace name  | Framework / Type   | Role     | Runtime      |
| ------------------ | --------------- | ------------------ | -------- | ------------ |
| `apps/[app-1]`     | `[app-1]`       | [e.g., Next.js 15] | frontend | browser+node |
| `apps/[app-2]`     | `[app-2]`       | [e.g., NestJS 11]  | backend  | node         |
| `packages/[pkg-1]` | `@repo/[pkg-1]` | utility            | —        | universal    |
| `packages/[pkg-2]` | `@repo/[pkg-2]` | ui-components      | —        | browser      |

---

## 2) Commands

```bash
pnpm install                            # Install all dependencies
pnpm dev                                # Start all apps
pnpm build                              # Build all workspaces
pnpm test                               # Run all tests
pnpm check-types                        # Typecheck all workspaces
pnpm lint                               # Lint all workspaces

# Single workspace (prefer this for focused work)
pnpm --filter [workspace-name] dev
pnpm --filter [workspace-name] build
pnpm --filter [workspace-name] test
pnpm --filter [workspace-name] check-types
pnpm --filter [workspace-name] lint

# Add dependencies
pnpm add [pkg] --filter [workspace]     # Runtime dep to a workspace
pnpm add -D [pkg] --filter [workspace]  # Dev dep to a workspace
pnpm add [pkg] -w                       # Root dep (shared tooling only — rare)
```

> Never `npm install` or `yarn`. Lockfile is `pnpm-lock.yaml` — commit it.

---

## 3) Global Conventions

### Naming

<!-- Generation: keep only rows the repo's linter does NOT already enforce; for enforced ones, name the tool in §8 instead. The usually-load-bearing rows are env vars and any file-naming scheme a linter can't see. -->

| Thing                 | Convention                  | Example           |
| --------------------- | --------------------------- | ----------------- |
| Source files          | `kebab-case.ts`             | `user-service.ts` |
| React components      | `PascalCase.tsx`            | `UserCard.tsx`    |
| Directories           | `kebab-case/`               | `user-settings/`  |
| Variables / functions | `camelCase`                 | `getUserById`     |
| Constants             | `SCREAMING_SNAKE_CASE`      | `MAX_RETRY_COUNT` |
| Types / Interfaces    | `PascalCase`, no `I` prefix | `UserProfile`     |
| Env vars              | `SCREAMING_SNAKE_CASE`      | `DATABASE_URL`    |

### TypeScript

<!-- Generation: drop any line tsconfig/ESLint already enforces in this repo (check them) — keep only unenforced decisions. Verify claims against the actual base tsconfig: don't write "strict, no exceptions" if the config disables noImplicitAny. -->

- Strict mode always on — `"strict": true` in every `tsconfig.json`
- No `any` — use `unknown` and narrow with type guards
- No non-null assertion (`!`) unless provably safe — prefer optional chain or early return
- Prefer `type` for data shapes; `interface` only when extending or declaration-merging
- Explicit return types on all exported functions
- Prefer `as const` objects over `enum`

### Imports

- Never use relative imports across workspace boundaries — use package names (`@repo/[pkg]`)
- Internal alias: `@/` → `src/` within each workspace
- Import order: external → `@repo/*` → `@/*` → `./`
- No barrel files (`index.ts` re-exports) inside an app's `src/` — packages expose barrels, apps do not

### Comments & documentation

The test for any comment or doc: **what forces it to update when it goes stale?** If the answer is "someone remembers", don't write it.

- **TSDoc every exported symbol** in `packages/` (and shared app modules): one-sentence summary; `@param` / `@returns` only where the name doesn't already say it; `@example` when usage is non-obvious; `@deprecated` with the replacement. It renders in IDE hover — the highest-value documentation — and it sits on the symbol, so editing the code puts it in front of you.
- Inline comments state **WHY, never WHAT**: constraints, workarounds (link the issue), invariants the code can't express. A comment that restates the code or its types gets deleted.
- **No notes-to-self**: no "TODO: revisit", no "remember to update X when Y", no narrative state ("we currently do this in three places"). Do it now, file a ticket, or add a `FLAGS.md` entry.
- No history comments ("was previously X") — that's git's job.

### Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- Branch naming: `[type]/[short-description]` — e.g., `feat/user-auth`
- No direct commits to `main` — always PR
- Run `pnpm changeset` for any consumer-visible change to a published package

---

## 4) Package Design Invariants

> These apply to everything in `packages/`. No exceptions.

### Dependency footprint rule

A package's dependency tree must be a strict subset of its stated runtime target and purpose. If it isn't, either the deps are wrong or the package needs to be split.

| Package type    | Allowed deps                                 | Forbidden deps                                                          |
| --------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| `utility`       | Universal JS only                            | UI framework deps, backend framework deps, Node.js-only APIs            |
| `types`         | Zero runtime deps                            | Anything                                                                |
| `config`        | Zero runtime deps (dev only)                 | Anything runtime                                                        |
| `ui-components` | [UI framework] (as peerDep), styling tooling | Backend framework deps, server-only data access libs, Node.js-only APIs |
| `logger`        | Logging lib only                             | UI framework deps, rendering framework deps                             |
| `api-contract`  | Schema/fetch libs                            | Framework-specific anything                                             |

**The split signal:** if you're adding an `if (typeof window !== 'undefined')` guard, or conditionally importing a framework dep, the package is telling you it needs to be two packages.

```
# Wrong: one package with mixed concerns
@repo/utils → pulls in a UI framework dep AND is imported by backend services

# Right: split by dep footprint
@repo/utils            → universal, zero framework deps
@repo/utils-[framework] → framework-specific adapter, peerDep on the framework
```

### Two-consumer rule

Code graduates from an app into a package when **two or more workspaces** need it — not before. A package used by exactly one app is a signal it should still live in that app's `src/`.

### No upward imports

Packages **never** import from `apps/`. The dependency graph is strictly one-directional: `apps/` → `packages/`, never `packages/` → `apps/`.

### Peer deps for framework packages

If your package requires a UI framework, backend framework, or any other major shared dependency, it goes in `peerDependencies`, not `dependencies`. Consumers bring their own copy.

### Minimal export surface

Don't export what only one consumer uses. Keep single-consumer code in the app until a second consumer needs it.

---

## 5) Cross-Cutting Concerns

### Logging

- **MUST** use `@repo/[logger-package]` — never `console.log` in application code
- **MUST** include structured metadata in every log call: `{ userId, requestId, ... }`
- `console.*` is allowed only in: test files, local CLI scripts, one-off dev tooling

### Error handling

- **MUST NOT** swallow errors silently — empty `catch` blocks are forbidden
- **MUST** log errors with full context before rethrowing or converting to a response
- Use typed error classes — never `throw "some string"`

### Auth / Authorization

<!-- Describe your auth mechanism here -->

- [e.g., JWT validated at the API layer — `apps/server` enforces it]
- **MUST NOT** add unauthenticated endpoints or routes without explicit approval

### Environment variables

- **MUST** be validated at startup with a Zod schema — fail fast on misconfiguration
- **MUST** be documented in `.env.example` — keep it in sync with all required vars
- **MUST NOT** commit `.env` or any secrets to git
- Naming: `[APP]_[VAR]` prefix for app-scoped vars (e.g., `SERVER_PORT`, `WEB_API_URL`)

### Data access

<!-- Fill in only if this monorepo has a backend that touches a database. Remove entire section for FE-only monorepos. -->

- **Data access layer:** `[ORM | query builder | raw SQL | SDK — name the tool and where its schema/config lives]`
- **Migrations:** `[command to run migrations]`
- **MUST NOT** access the database from apps that shouldn't own data access — always route through the appropriate service layer

---

## 6) File Placement (Global)

| What                               | Where                  |
| ---------------------------------- | ---------------------- |
| Shared utilities (2+ consumers)    | `packages/[utils]/`    |
| Shared types / Zod schemas         | `packages/[types]/`    |
| Shared UI components               | `packages/[ui]/`       |
| App-specific logic                 | `apps/[app]/src/`      |
| E2E tests                          | `[location — specify]` |
| Shared ESLint / TS / Vitest config | `packages/config-*/`   |
| One-off scripts                    | `scripts/` at root     |

**Forbidden globally:**

- Cross-app imports (`apps/web` → `apps/server` or vice versa)
- Shared logic in `apps/` when 2+ workspaces need it (belongs in `packages/`)
- Committing `dist/`, `node_modules/`, `.env`, database files

---

## 7) Testing

- **Unit / integration:** Vitest, co-located as `[subject].test.ts` next to source
- **E2E:** [Playwright / Cypress] at `[location]`
- **MUST NOT** mock the database, network, or filesystem in integration tests — use real instances
- **MUST** reset shared state between tests
- Tests must pass in CI with no live network access — seed data, don't fetch from real APIs

---

## 8) CI / CD

- **Pipeline:** [GitHub Actions] — `.github/workflows/`
- **Required checks before merge:** `build` · `test` · `lint` · `check-types`
- **Deploy:** [describe per-app deploy — e.g., Vercel auto-deploys `apps/web` on merge to `main`]
- **Secrets:** managed in [GitHub Actions secrets] — never in source

---

## 9) Documentation & Specs

All persistent project knowledge lives in `docs/`. When context is lost between sessions, this is where it gets rebuilt from.

```
docs/
├── specs/                    # Feature design specs and implementation plans
│   ├── YYYY-MM-DD-[topic]-design.md
│   └── YYYY-MM-DD-[topic]-plan.md
├── architecture.md           # Monorepo structure, data flow, key decisions
└── [topic].md                # Per-topic reference (API, deployment, onboarding, etc.)
```

> If `docs/` doesn't exist yet: create it with `mkdir -p docs/specs` and add `docs/architecture.md` describing the current monorepo before doing any other work.

### Planning before building

Significant work gets a written spec in `docs/specs/` before code. Significant = new domain or user-facing flow · touches 2+ workspaces · changes a package's public API · auth/security/data-model changes · requirements unclear from the task alone.

Spec (`YYYY-MM-DD-[topic]-design.md`) = problem & why now, approach & key decisions, explicit non-goals, open questions. Align on it before building. Non-trivial implementations also get a plan (`YYYY-MM-DD-[topic]-plan.md`) with ordered, file-level steps.

<!-- Generation: if planning skills exist in .claude/skills/ (e.g. /brainstorm, /plan), name them here as THE way specs get produced. Multi-step process detail belongs in those skills, not in this file. -->

### Reference docs

When working in an area that has a reference doc (e.g., `docs/architecture.md`, `docs/api.md`), read it before making changes that touch that area. If the doc is out of date after your change, update it in the same PR.

---

## 10) Adding a New Workspace

1. Scaffold `apps/[name]/` or `packages/[name]/`: `package.json` (correct `name`, standard `dev`/`build`/`test`/`lint`/`check-types` scripts), `tsconfig.json`, `src/`
2. Confirm the workspace manifest glob picks it up; register with the orchestrator if one is used
3. Create its guide from the matching delta template — every workspace carries one (it's the posture/metadata carrier): write `AGENTS.md`, then `ln -s AGENTS.md CLAUDE.md` beside it
4. Add it to the §1 workspace table
5. Packages only: verify the dep footprint against §4 **before** adding any dependency
