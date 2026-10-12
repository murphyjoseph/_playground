# Workspace profiler — subagent brief

Sweep 1 (`sweep-1.md` → 1.4) launches one general-purpose subagent per batch of ~6 workspaces when the coverage
plan has more than ~8. Each profiler reads the **code and manifests** of its batch and returns compact facts; it
never reads other batches, never writes anything, and makes no rubric judgments (those stay with the orchestrator,
which still reads every existing `AGENTS.md` in full). Its output fills `1-audit.md` → Coverage plan, Inferred,
Change posture, Dependency footprint, and Observed conventions.

**Inputs (the orchestrator supplies these):**
- `REPO` — absolute path of the target repo root.
- `SKILL_DIR` — absolute path of this skill; read `references/inference.md` from it first, in full.
- `TOOLCHAIN` — package manager, orchestrator, package-name scope, workspace globs (from 1.2).
- `WORKSPACES` — the batch: one line per workspace, `path · class (app | package | other) · existing AGENTS.md path or none`.
- `SENSITIVE_DATA` — `none | PHI | PII`, plus `DOMAIN_TERMS` (e.g. `member, patient, dob, ssn, diagnosis`) when not
  `none`. Governs whether step 6 runs.

## Steps (per workspace, in order)

1. **Manifests & structure.** Read `package.json`, `tsconfig.json`, the entry file, and the top-level `src/`
   structure per the reading list for the workspace's scope in `inference.md`. Note the existing `AGENTS.md`: line
   count, whether it contains a `## Merged from CLAUDE.md` heading, whether its first lines carry
   `Change posture:` / `**Status:**`.
2. **Infer** framework · role · runtime target · package type with the `inference.md` tables. Unidentifiable →
   `UNKNOWN`, never a guess.
3. **Consumers (packages only).** From `REPO`, `rg "from ['\"]<SCOPE>/<name>[/'\"]" -l` across all source (both
   quote styles, subpath imports, no extension filter). Return consumer workspace names and the count, then the
   blast-radius tier from the direct graph.
4. **Dependency footprint.** Compare `dependencies` against the detection vocabulary in `inference.md` →
   `✓ clean` or `⚠ <dep> (<category>) in a <type> package`. One line per offending dep.
5. **Status & posture.** Status: `deprecated` on a `"deprecated"` field, a DEPRECATED/FROZEN marker in the
   existing guide or README, or a `legacy`/`old-` name with no consumers; `experimental` on an `experimental`/`spike`/
   `poc` marker; else `supported` — cite the evidence. Posture: run the derivation in `inference.md`; return the
   tier and the qualitative inputs (never counts).
6. **Sensitive data** (only when `SENSITIVE_DATA ≠ none`). `rg -il` the `DOMAIN_TERMS` in `src/` (excluding tests);
   open at most 3 hits and judge whether sensitive data flows through at runtime **as this code's job** (not: a
   type name mentions it; not: a generic helper could be handed it). Return `yes | no` + the one file that decided
   it. Type-only and data-agnostic helpers are `no`.
7. **Domain-subtree candidates.** Inside `src/`, look for: ≥ 5 files sharing a conventional suffix
   (`*.handler.ts`, `*.controller.ts`, `*.workflow.ts`, `*.repository.ts`, `*.command.ts`, …); a base class extended
   across many files; a registration or codegen step; a matching developer-guide doc. For each candidate return the
   directory, the evidence, and a `generate | skip` recommendation against the three criteria in
   `sweep-1.md` → 1.3 (say which criterion fails on `skip`). None → `none`.
8. **Scripts.** Real names for dev · build · test · lint · typecheck, or `—`. Never normalize them to the template's
   defaults.
9. **Convention probes.** Run every probe below, scoped to `src/` (or the workspace's source dir), excluding tests,
   `dist/`, generated dirs, and `node_modules`. Return variant counts (files, unless stated). Skip a probe only when
   it cannot apply (React probe on a backend) and say `n/a`.

   | # | Probe | Variants (count files) |
   | --- | --- | --- |
   | P1 | Test file suffix | `.test.` · `.spec.` |
   | P2 | Test location | co-located · `__tests__/` · top-level `test(s)/` |
   | P3 | Export style | files with `export default` · files with named exports only |
   | P4 | React component definition (React workspaces) | arrow (`const X = (` / `: FC`) · `function X(` declaration |
   | P5 | Error construction | `throw new Error(` · `throw new <Custom>Error(` (also: classes `extends Error` present? y/n) · `throw '`/`` throw ` `` |
   | P6 | Import style | alias (`@/`, `@scope/`, `#`) · relative `../../` (depth ≥ 2) |
   | P7 | Barrels in source | `index.ts` files that only re-export (`export *` / `export {`) |
   | P8 | Console in source | files with `console.(log|info|warn|error)` |
   | P9 | Env access | files with `process.env.` outside a config/env module (name the module if one exists) |
   | P10 | Explicit `any` | files with `: any` or `as any` |
   | P11 | Type declarations | `export type` · `export interface` (occurrences) |
   | P12 | Enums | `enum ` declarations · `as const` objects (occurrences) |
   | P13 | File naming in source (non-component files) | kebab-case · camelCase · PascalCase |

10. **Harvest** every imperative convention line from the workspace's existing `AGENTS.md` (MUST / MUST NOT /
    never / always / prefer / no …) with `path:line`, up to 15; more → `+N more`. These feed the lint scout.

## Return

Return exactly this, nothing else — one block per workspace, then one probe table for the batch:

```
### <workspace path>
- name: <@scope/name> · class: <app | package | other> · existing AGENTS.md: <yes (N lines[, Merged from CLAUDE.md][, metadata rows missing]) | no>
- framework/type: <…> · role: <…> · runtime: <…>
- entry: <file> · src top-level: <dir/, dir/, … (N dirs)>
- scripts: dev=<…> build=<…> test=<…> lint=<…> typecheck=<…>
- consumers: <@scope/a, @scope/b (N) | n/a (app)> → blast radius: <tier>
- dep footprint: <✓ clean | ⚠ <dep> (<category>) in a <type> package[; …]>
- status: <tier> — <evidence>
- sensitive data: <yes | no | n/a> — <deciding file | —>
- posture: <tier> (<qualitative inputs>)
- domain candidates: <dir — evidence → generate | skip (<failing criterion>)[; …] | none>
- harvested: <path:line "…"; …; +N more | none>
- notes: <invariant concern · missing tsconfig · unusual layout | none>
```

```
### Observed conventions — batch <n>
| Probe | <ws-1> | <ws-2> | … |
| --- | --- | --- | --- |
| P1 test suffix | .test. 12 · .spec. 0 | … | … |
| … | … | … | … |
```

Keep each workspace block under ~20 lines and the whole return under ~250 lines. No file dumps, no probe commands,
no reasoning. If a workspace could not be profiled (missing `package.json`, unreadable), return its block with
`notes: unprofiled — <why>` and every other field `—`.
