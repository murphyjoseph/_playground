# [PROJECT_NAME]

[One sentence — what this repo is and what it ships.]

Change posture: `[locked | guarded | standard | open]` ([inputs — why this default, e.g. "healthcare prod, PHI throughout"]) — repo-wide default; each workspace guide sets its own. Legend below.

> **Root guide.** Every workspace guide (apps, packages, and any other workspace dir) is a delta — it inherits everything here and only documents what differs. Never duplicate root rules in child guides.

- **Blast radius:** `repo-wide`
- **Status:** `supported`
- **[PHI | PII — the repo's sensitive-data label]:** `[yes | no]` ← only if adopted in the plan doc; repos with no sensitive-data domain omit this row everywhere

<!-- No toolchain-version rows (pnpm/Node/TS): they are derivable from package.json
     engines/packageManager and drift immediately. Name the package manager + orchestrator once in
     prose (Monorepo Structure) instead. -->

---

## Operating Rules

<!-- Agent behavior in this repo. Repo-operational rules only — general tone/style preferences belong in user-level config, not here. -->

- Read the code before changing it; cite `file:line`. Never assume — verify in the actual files.
- Match your latitude to the workspace's **change posture** (legend below): smallest sufficient diff in `guarded` code; opportunistic improvements only in `open` code.
- Hit a contradiction — between a workspace guide (`AGENTS.md`) and the code, between two guides, or an ambiguity you'd otherwise paper over with a guess? Surface it in your reply and in the PR description, and proceed on the safer reading. Never silently assume.
- If your change makes a statement in any workspace guide (`AGENTS.md`) false, update that file in the same PR. A doc that lies is worse than no doc.

## Metadata Legend

Every workspace guide opens with the same four metadata rows. Domain/subtree guides carry only `Status:` — the rest is inherited from their enclosing workspace guide. A file may add extra factual bullets beneath the four when load-bearing (e.g. a backend app's Port/Deploy); never invent a new named row without defining it here.

| Row | Values | Meaning |
| --- | --- | --- |
| `Change posture:` | `locked` · `guarded` · `standard` · `open` | Latitude for agents/automation — derived from the rows below plus auth/security/API-contract judgment; inputs in parentheses so the value stays auditable, authority table next |
| `Blast radius:` | `repo-wide` · `several workspaces` · `one workspace (name)` · `build/CI only` · `leaf (no consumers)` | Packages only (apps omit it — their blast is their users). What breaks if this breaks, from the direct dependency graph; no consumer counts (they drift) |
| `Status:` | `supported` · `experimental` · `deprecated` · `frozen` | Lifecycle. Always present, even when `supported` — a missing row means "not yet audited", never "default" |
| `[PHI \| PII]:` | `yes` · `no` | Only in repos with a sensitive-data domain (plan-doc adoption) — delete this legend row otherwise. NAMED for the repo's label (self-explanatory in leaf files). Whether sensitive user data flows through this code as its job; data-agnostic helpers and type-only packages are `no` |

| Posture    | Typical for                                                                       | Agents may                                                                    | Agents must not                                                                    |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `locked`   | Deprecated / frozen code, generated output                                         | Read; flag issues                                                              | Hand-edit, ever — change the source or generator instead                            |
| `guarded`  | High blast radius: widely-consumed packages, public API contracts, auth/payments/PHI paths | Minimal targeted diffs; approve PRs                                            | Merge without a human; refactor beyond the task; break public API without sign-off  |
| `standard` | Normal production code                                                             | Normal changes; approve; merge when CI is green and the diff stays in-workspace | Merge diffs that leave the workspace                                                 |
| `open`     | Prototypes, internal tooling, spikes                                               | Merge on green CI; refactor opportunistically                                  | —                                                                                    |

When one diff spans workspaces with different postures, the most restrictive posture governs the whole diff. Wherever the sensitive-data row is `yes`, automation never merges without human sign-off regardless of posture.

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
└── AGENTS.md             ← you are here
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

<!-- Generation: OMIT this table by default. Keep only rows that are (a) not linter-enforced (for enforced ones, name the tool in §8 instead) AND (b) verified against real files — sample the repo, don't assert the template default. Usually all that survives: env-var naming and any file-naming scheme a linter can't see. No surviving rows → no section. -->

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

<!-- Generation: OMIT this list by default — it restates common strict-TS practice any model already follows. Keep only unenforced, repo-verified decisions (check the base tsconfig + ESLint: don't write "strict, no exceptions" if the config disables noImplicitAny; don't write "no any" if ESLint already bans it — name the tool in §8 instead). No surviving lines → no section. -->

- Strict mode always on — `"strict": true` in every `tsconfig.json`
- No `any` — use `unknown` and narrow with type guards
- No non-null assertion (`!`) unless provably safe — prefer optional chain or early return
- Prefer `type` for data shapes; `interface` only when extending or declaration-merging
- Explicit return types on all exported functions
- Prefer `as const` objects over `enum`

### Imports

<!-- Generation: import order and aliases are usually ESLint-enforced — if so, name the tool in §8 and OMIT those lines. Keep only unenforced repo decisions verified by sampling (e.g. the barrel-file policy, the cross-workspace rule if no lint rule guards it). -->

- Never use relative imports across workspace boundaries — use package names (`@repo/[pkg]`)
- Internal alias: `@/` → `src/` within each workspace
- Import order: external → `@repo/*` → `@/*` → `./`
- No barrel files (`index.ts` re-exports) inside an app's `src/` — packages expose barrels, apps do not

### Comments & documentation

<!-- Generation: template-imposed POLICY, not a repo fact. Include only if adopted in the plan doc's "Template policies to adopt" — or if the repo demonstrably already works this way (cite the evidence). -->

The test for any comment or doc: **what forces it to update when it goes stale?** If the answer is "someone remembers", don't write it.

- **TSDoc every exported symbol** in `packages/` (and shared app modules): one-sentence summary; `@param` / `@returns` only where the name doesn't already say it; `@example` when usage is non-obvious; `@deprecated` with the replacement. It renders in IDE hover — the highest-value documentation — and it sits on the symbol, so editing the code puts it in front of you.
- Inline comments state **WHY, never WHAT**: constraints, workarounds (link the issue), invariants the code can't express. A comment that restates the code or its types gets deleted.
- **No notes-to-self**: no "TODO: revisit", no "remember to update X when Y", no narrative state ("we currently do this in three places"). Do it now or file a ticket.
- No history comments ("was previously X") — that's git's job.

### Git

<!-- Generation: verify each line against evidence (commitlint config, actual commit history, `.changeset/`, branch protection) and keep only what is real for this repo. Drop the changeset line if there is no `.changeset/`. -->

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- Branch naming: `[type]/[short-description]` — e.g., `feat/user-auth`
- No direct commits to `main` — always PR
- Run `pnpm changeset` for any consumer-visible change to a published package

---

## 4) Package Design Invariants

<!-- Generation: template-imposed POLICY — include only if adopted in the plan doc's "Template policies to adopt". Fresh repo: a good default to propose. Existing repo: if the code widely violates these, don't codify a lie — route it to Practice review instead. -->

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

<!-- Generation: include only if a shared logger package actually exists (name the real one). No logger package → OMIT; if console.log is rampant, that's a Practice review item, not a rule to assert. -->

- **MUST** use `@repo/[logger-package]` — never `console.log` in application code
- **MUST** include structured metadata in every log call: `{ userId, requestId, ... }`
- `console.*` is allowed only in: test files, local CLI scripts, one-off dev tooling

### Error handling

<!-- Generation: template-imposed POLICY — include only if adopted via the plan doc, or if a lint rule already enforces it (then name the tool in §8 instead and OMIT the prose). -->

- **MUST NOT** swallow errors silently — empty `catch` blocks are forbidden
- **MUST** log errors with full context before rethrowing or converting to a response
- Use typed error classes — never `throw "some string"`

### Auth / Authorization

<!-- Describe your auth mechanism here -->

- [e.g., JWT validated at the API layer — `apps/server` enforces it]
- **MUST NOT** add unauthenticated endpoints or routes without explicit approval

### Environment variables

<!-- Generation: keep the validation line only if the repo actually validates env at startup (find the schema) or the policy was adopted via the plan doc. Keep the prefix row only if the repo really uses prefixes. Universal hygiene ("don't commit .env") is inferable — OMIT it. -->

- **MUST** be validated at startup with a Zod schema — fail fast on misconfiguration
- **MUST** be documented in `.env.example` — keep it in sync with all required vars
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

<!-- Generation: the runner/location/E2E lines are FACTS — verify and keep them. The mocking/reset/network lines are template-imposed POLICY — include only if adopted via the plan doc or evidenced in the existing test setup. -->

- **Unit / integration:** `[Vitest | Jest]`, co-located as `[subject].[test|spec].ts` next to source — match the repo's real runner and suffix
- **E2E:** [Playwright / Cypress] at `[location]`
- **MUST NOT** mock the database, network, or filesystem in integration tests — use real instances
- **MUST** reset shared state between tests
- Tests must pass in CI with no live network access — seed data, don't fetch from real APIs

---

## 8) CI / CD

- **Pipeline:** [GitHub Actions] — `.github/workflows/`
- **Required checks before merge:** `build` · `test` · `lint` · `check-types`

<!-- Generation: the ONLY trace of lint-bound conventions in any guide. Include when the master spec's Prose
     exclusion list is non-empty and a lint config exists; omit when no config exists yet (the proposal lives in
     the PR's _ins/3-automation.md, not in the guide). -->

- **Lint-enforced conventions:** `[eslint config path]` — not restated in this guide; run `[lint command]`
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

- **Docs map:** [`docs/docs-map.md`](docs/docs-map.md) — the audited verdicts on this repo's documentation: the preferred source per topic, known-stale docs, and open conflicts. Check it before trusting any doc it doesn't mark as a preferred source. ← remove if no docs map exists yet
- When working in an area that has a reference doc (e.g., `docs/architecture.md`, `docs/api.md`), read it before making changes that touch that area. If the doc is out of date after your change, update it in the same PR.

---

## 10) Adding a New Workspace

1. Scaffold `apps/[name]/` or `packages/[name]/`: `package.json` (correct `name`, standard `dev`/`build`/`test`/`lint`/`check-types` scripts), `tsconfig.json`, `src/`
2. Confirm the workspace manifest glob picks it up; register with the orchestrator if one is used
3. Create its guide from the matching delta template — every workspace carries one (it's the posture/metadata carrier): write `AGENTS.md` (no `CLAUDE.md` — Claude Code reads `AGENTS.md` directly)
4. Add it to the workspace reference in Monorepo Structure
5. Packages only: verify the dep footprint against the Package Design Invariants **before** adding any dependency
