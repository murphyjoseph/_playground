# CLAUDE.md — [APP_NAME]

> **App delta.** Inherits all root conventions from [`../../CLAUDE.md`](../../CLAUDE.md). This file documents only what differs or is additive for this app. Read the root guide first.

<!-- Scale to the app: every workspace gets a delta because existence is mandatory (the file carries the
     posture metadata). Depth is not: only the metadata block is required; skip any section below that
     would restate root or pad a thin app. A simple app may be ~15 lines. -->

[One sentence — what this app is: framework + role + primary responsibility.]

Change posture: `[locked | guarded | standard | open]` ([inputs — e.g. "member-facing, handles PHI" or "internal tool"])

<!-- REQUIRED above, in every workspace file: title · one-line purpose · a `Change posture:` line with
     exactly one of the four words + parenthesized inputs (fold consumer counts / data sensitivity into
     the inputs). Tooling and PR agents grep the exact phrase `Change posture:` — a golden in-repo example
     never waives these. OPTIONAL below: keep a row only when non-default or load-bearing; delete the
     rest — Path, "Status: SUPPORTED", and the repo-default runtime are noise. -->

- **Framework / role:** `[e.g., Next.js 15 · frontend | Express 5 · backend]`
- **Port:** `[PORT]` via `[ENV_VAR]` ← backend only
- **Deploy:** `[e.g., Vercel | Fly.io | Cloud Run service names]`
- **Status:** `[EXPERIMENTAL | DEPRECATED]` ← only if not SUPPORTED
- **Runtime:** `[browser | node | edge | browser+node]` ← only if it differs from the repo default

---

## 1) Scope

- **Responsible for:**
  - [Primary responsibility]
  - [Secondary responsibility]
- **Out of scope — do not add:**
  - [Explicit boundary, e.g., "shared utilities — belongs in packages/"]
  - [Explicit boundary, e.g., "frontend rendering — lives in apps/web"]
  - [Cross-reference where it DOES belong if relevant]

---

## 2) Entry Points & Structure

<!-- Frontend: document key routes/pages. Backend: document HTTP endpoints. Both: document the entry file. -->

- **Entry file:** `src/[main file]` — [what it does: bootstraps X, configures Y]

<!-- Do NOT enumerate routes/endpoints here — inventories drift, and a stale list is worse
     than none (agents trust it). Document where routes are declared and how to list them;
     name only routes with special behavior. -->

- **Route map:** declared in `[where — e.g., src/*/[name].controller.ts | app/**/page.tsx]`; list them with `[command — e.g., rg "@(Get|Post|Patch|Delete)\(" src/ | the framework's route-list command]`
- **Special routes:** `[only routes with non-obvious behavior — e.g., "/webhooks/* bypasses the auth guard, verified by signature instead"]`

<!-- BACKEND: describe how the app is organized at a high level — routing structure, service layers, middleware, DI if applicable. Use the framework's own terminology here, not generic terms. -->

- **App organization:**
  - [Top-level structure — e.g., how domains/features are grouped, how routing is registered]
  - [Key layers — e.g., route handlers, business logic, data access, middleware]

<!-- FRONTEND: document rendering model and data fetching strategy -->

- **Rendering:** `[SSR | SSG | CSR | hybrid (server + client split)]`
- **Data fetching:** `[describe the pattern used — e.g., loader functions, server-side fetch, client-side query library]`

---

## 3) File Placement

```
src/
├── [domain-a]/
│   ├── [domain-a].[framework-role].ts(x)   # e.g., route handler, page, component
│   ├── [domain-a].[logic-layer].ts          # e.g., service, hook, store
│   └── [subdirectory]/                      # e.g., types/, components/, __tests__/
├── [domain-b]/
│   └── ...
└── [shared-within-app]/                     # only if used by 3+ domains in this app
```

| What                                       | Where                                                  |
| ------------------------------------------ | ------------------------------------------------------ |
| [Feature domains / pages / routes]         | `src/[domain]/`                                        |
| [Input/output types or validation schemas] | `src/[domain]/[types\|schemas]/`                       |
| [App bootstrap / config]                   | `src/[config\|main]/`                                  |
| [Tests]                                    | `src/[domain]/__tests__/` or co-located as `*.test.ts` |
| [Static assets]                            | `[public/ or static/]` — frontend only                 |

**Forbidden in this app:**

- Do **not** import from `apps/[other-app]/`
- Do **not** add logic that belongs in `packages/` (shared by 2+ workspaces)
- Do **not** [any app-specific anti-pattern, e.g., "add raw SQL — use the ORM"]

---

## 4) Rules — Do / Don't

<!-- Group rules by concern. Use MUST / MUST NOT / SHOULD / SHOULD NOT. Include the reason when non-obvious. -->

### [Concern 1 — e.g., DTOs / Data validation]

- **MUST** [rule] — [reason if non-obvious]
- **MUST NOT** [rule]
- **SHOULD** [rule]

**Not like this:**

```ts
// [why this is wrong]
[bad example — keep to 3-5 lines]
```

**Like this:**

```ts
// [why this is correct]
[good example — keep to 3-5 lines]
```

### [Concern 2 — e.g., Components / Styling / State]

- **MUST** [rule]
- **MUST NOT** [rule]
- **SHOULD NOT** [rule] — [reason]

### [Concern 3 — e.g., Auth / Data fetching / Logging]

- **MUST** [rule]
- **MUST NOT** [rule]

<!-- Add one section per major concern. Name concerns after what they govern in this specific app, not after a framework concept. Examples: "Input validation", "Route auth", "Data fetching", "Error responses", "Logging", "Styling", "State management". -->

---

## 5) Dependencies

- **Runtime deps:**
  - `[package]` — [what it does / why this app needs it]
- **Dev deps:**
  - `[package]` — [why]
- **Consumes from packages:**
  - `@repo/[pkg]` — [what it uses from there] → see `packages/[pkg]/CLAUDE.md`
- **Forbidden deps:**
  - [package or category] — [reason, e.g., "use the ORM instead of raw drivers"]
- **Integrates with:** ← remove if FE-only or BE-only
  - `apps/[other-app]` via [mechanism — e.g., OpenAPI spec, shared DB, message queue]

---

## 6) Commands

```bash
pnpm --filter [app-name] dev          # [what it starts, watch mode?]
pnpm --filter [app-name] build        # [what it produces, where — e.g., dist/]
pnpm --filter [app-name] start        # [production start — backend only typically]
pnpm --filter [app-name] test         # [test runner + config used]
pnpm --filter [app-name] lint
pnpm --filter [app-name] check-types
# App-specific scripts:
pnpm --filter [app-name] [script]     # [what it does]
```

**CI rule:** `build`, `test`, `lint`, `check-types` must all pass.

---

## 7) Security & Performance

<!-- Only include subsections that have real constraints. Remove empty ones. -->

### Security

- [How unknown/extra input fields are handled — e.g., stripped, rejected, or passed through]
- [Where and how auth is enforced — e.g., which routes are protected and by what mechanism]

### Performance

- [Data access patterns — e.g., only fetch the fields you need, avoid N+1 queries]
- [Any caching, pagination, or request-size constraints]

### Accessibility ← frontend only; delete for backend

- [A11y requirements or link to standard]

---

## 8) Scaffolding — Adding a New [Feature / Domain / Route]

<!--
  This is the most important section for AI consistency. Fill in the EXACT ordered steps
  for the most common operation in this app, using this framework's specific file names,
  patterns, and registration conventions.

  The steps here must be concrete enough that two different sessions produce identical output.
  Replace the numbered placeholders below with the real steps — then remove these comments.

  Things to cover depending on your framework:
  - Backend: where to create the route handler, the business logic layer, input/output type
    definitions, how routes are registered, how to add API docs if applicable, any code
    generation steps that must follow (e.g., regenerating a type schema)
  - Frontend: where to create the route/page file, where co-located components live, how
    data fetching is wired up, how to register in navigation/routing config if needed,
    how auth guards are applied
-->

When adding a new [feature / domain / route] (`[name]`):

1. [Create the route/entry file — specify the exact path pattern and file name convention]
2. [Create the request handler or page — what file, what it exports, what the framework expects]
3. [Create the business logic or data layer — service, hook, store, loader, etc.]
4. [Define input/output types or validation schemas — where they live, naming convention]
5. [Register with the framework if required — routing table, DI container, config file, etc.]
6. [Add API documentation / annotations if this app generates a spec — what's required]
7. [Any downstream code generation that must run — e.g., regenerating a client schema]
8. Write tests in `[test location]` — describe what to test and what the test setup looks like

**Target file tree for a complete `[name]` feature:**

```
src/[domain]/
├── [file-1].[ext]        # [role: e.g., route handler, page, controller]
├── [file-2].[ext]        # [role: e.g., business logic, service, hook]
├── [types-dir]/          # input/output types or validation schemas — if applicable
│   ├── [input-type].[ext]
│   └── [output-type].[ext]
└── __tests__/
    └── [domain].test.ts
```

---

## 9) Examples

<!-- Keep total code to ≤30 lines. Show the most non-obvious pattern in this app, not boilerplate. -->

### [Most important pattern — e.g., "Controller with full decorator set" or "Server component with data fetch"]

```ts
// src/[domain]/[file].ts
[concrete example — only what's non-obvious or app-specific]
```

### [Second most important pattern]

```ts
[concrete example]
```

---

## 10) Before You Change This App

- Does this touch **[the API contract / routing / auth]**? → [consequence + required action]
- Did you check that the change stays within `apps/[folder]/`? → no cross-app imports
- Does new shared logic have a second consumer? → if yes, move it to `packages/`
- [Any app-specific check — e.g., "Did you run pnpm generate:types after endpoint changes?"]

> If any are unclear, **stop and ask** — don't assume.

---

## 11) PR Checklist

- [ ] [Most important app-specific check]
- [ ] [Second most important check]
- [ ] Tests added / updated
- [ ] No `console.log` in application code (use the logger)
- [ ] No cross-app imports
- [ ] Changes scoped to `apps/[folder]/`

---

## 12) Enforcement Checks

```bash
# [What this verifies — describe the invariant being checked]
rg "[pattern]" apps/[folder]/src || echo "OK: [what passing means]"

# console.log in application code (should be empty)
rg "console\.(log|info|warn|error)" apps/[folder]/src || echo "OK: No console.log"

# Cross-app imports (should be empty) — [OTHER_APPS] = sibling app folder names joined with |, e.g. "server|admin"
# (a relative import of a sibling app looks like '../../[other-app]/…' and never contains the string "apps/")
rg "from ['\"](\.\./)+([OTHER_APPS])/" apps/[folder]/src || echo "OK: No cross-app imports"

# [App-specific check — e.g., missing required decorators, env vars not in .env.example]
[command] || echo "[message]"
```
