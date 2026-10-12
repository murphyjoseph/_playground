# [APP_NAME]

[One sentence — what this app is: framework + role + primary responsibility.]

Change posture: `[locked | guarded | standard | open]` ([qualitative inputs — e.g. "user-facing, handles sensitive data" or "internal tool"; never consumer counts])

> **App delta.** Inherits all root conventions from [`../../AGENTS.md`](../../AGENTS.md). This file documents only what differs or is additive for this app. Read the root guide first.

<!-- Scale to the app: every workspace gets a delta because existence is mandatory (the file carries the
     posture metadata). Depth is not: only the metadata block is required; skip any section below that
     would restate root or pad a thin app. A simple app may be ~15 lines. -->

<!-- REQUIRED in every workspace file: title · one-line purpose (name the framework + role in it — no
     separate Framework row) · a `Change posture:` line · then exactly the two bullets below (apps carry
     no Blast radius row — an app's blast is its users). Tooling
     and PR agents grep these exact phrases — a golden in-repo example never waives them. Extra factual
     bullets (Port/Deploy for a backend app) may follow when load-bearing and verified — never invent a
     new named row without adding it to the root legend. No Framework/Runtime/Published/version rows:
     derivable, drift-prone, or noise. -->

- **Status:** `[supported | experimental | deprecated | frozen]`
- **[PHI | PII]:** `[yes | no]` ← only if the repo adopted the sensitive-data row
- **Port:** `[PORT]` via `[ENV_VAR]` ← extra factual bullet, backend only
- **Deploy:** `[service names / platform]` ← extra factual bullet, only when verified

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
  - `@repo/[pkg]` — [what it uses from there] → see `packages/[pkg]/AGENTS.md`
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

<!-- Generation: keep only checks tied to rules that actually made it into this guide or root — drop any checklist line whose rule was omitted (e.g. the logger line if no logger package exists) or routed to lint in the master spec's Prose exclusion list; "lint passes" is the check for those. -->

- [ ] [Most important app-specific check]
- [ ] [Second most important check]
- [ ] Tests added / updated
- [ ] `[lint command]` passes — covers every lint-routed convention
- [ ] Changes scoped to `apps/[folder]/`

---

## 12) Enforcement Checks

<!-- Generation: only invariants lint cannot express (generated files in sync, every env var documented in
     .env.example, a registration list matching the files on disk). Anything in the master spec's Prose exclusion
     list — console.log, cross-app imports, deep imports — is checked by the lint command, not by an rg snippet here;
     a shell re-implementation of a lint rule is a finding. No surviving checks → no section. -->

```bash
# [What this verifies — describe the invariant being checked]
rg "[pattern]" apps/[folder]/src || echo "OK: [what passing means]"

# [App-specific check — e.g., env vars read in code but missing from .env.example]
[command] || echo "[message]"
```
