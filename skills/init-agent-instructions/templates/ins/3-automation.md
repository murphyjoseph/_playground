# Agent instructions — automation

<!-- Written by the lint scout (references/lint-brief.md) in sweep 1. Principle: AGENTS.md carries only what tooling
     cannot check. Every convention that a linter, the compiler, or a CI check can enforce is listed here with the
     tool and rule that enforces it, and is kept OUT of the generated guides (routing confirmed in 2-decisions.md §E).
     Rule ids come from references/lint-catalog.md or from the installed plugin's own rules directory — never from
     memory. A snippet that could not be verified against an installed plugin says so. -->

Repo: `[repo-name]` · Date: `[YYYY-MM-DD]`

## Current lint state
| Thing | Found |
| --- | --- |
| ESLint | `[none | v8 legacy (.eslintrc.*) | v9 flat (eslint.config.*) | mixed: <where each applies>]` |
| Config files | `[paths]` |
| Shared config package | `[@scope/config-eslint — consumed by: … | none]` |
| Plugins installed (root + workspaces) | `[@typescript-eslint · eslint-plugin-import · … | none]` |
| Type-aware linting (`parserOptions.project`) | `[yes — which configs | no]` |
| Workspaces covered by some config | `[N of M — uncovered: …]` |
| `lint` scripts | `[root: <script> · per-workspace: N of M have one]` |
| Lint in CI | `[yes — <workflow>:<job> | no]` |
| Severity profile today | `[N rules error · N warn]` |
| Formatter | `[Prettier (<config>) · Biome · none]` |
| Compiler guards (base tsconfig) | `[strict · noUncheckedIndexedAccess · verbatimModuleSyntax · … — which are on]` |
| Other enforcement present | `[commitlint · husky/lefthook · dependency-cruiser · knip · syncpack · Nx module-boundaries · custom plugin (<name>) | none]` |

## Rules kept out of AGENTS.md
<!-- One row per convention routed away from prose. Class: A enforced today · B one line away (plugin installed, rule
     not configured) · C needs a plugin/tool · D custom rule (no-restricted-syntax selector or a local plugin — name the
     precedent if one exists). Compliance = quick grep of the codebase; sets the proposed severity. -->
| # | Convention (as prose) | Source | Class | Tool · rule id | Config | Compliance today | Proposed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `[…]` | `[AGENTS.md path:line · policy Bn · practice An · observed]` | `[A · B · C · D]` | `[tool · rule]` | ```[snippet or "see baseline"]``` | `[~N violations / M files]` | `[error · warn · defer → §A]` |

Verified against installed plugins: `[rule ids checked in node_modules/<plugin>/…/rules — all | exceptions: …]`

## Not automatable — stays in prose
<!-- Class E. Say why in a few words so the next audit doesn't re-litigate it. -->
- `[rule]` — `[judgment call · ordering with semantics · cross-service · business boundary · reads data flow]`

## Proposed lint baseline
<!-- A rollout, not a wish list. Tier 0 is always "make what exists run in CI". Each later tier adds rules that the
     codebase already mostly follows (error) or follows partly (warn, with the count). Rampant violations are not
     lint rules yet — they are §A decisions. -->

### Tier 0 — run what exists
- `[make <config> run on every workspace it declares · add a root `lint` script · add a CI step (below) · errors only]`

### Tier 1 — installed plugins, rules the code already follows (error)
- `[rule id — #n above]`

### Tier 2 — installed plugins, partial compliance (warn → error after cleanup)
- `[rule id — #n — ~N violations]`

### Tier 3 — needs a new plugin or tool
- `[plugin → rule ids — #n]`

### Config
<!-- Flat config preferred. Only plugins that are installed OR named in Tier 3. Mark anything unverified. -->
```js
// [path — e.g. eslint.config.mjs | packages/config-eslint/index.js]
[config — real plugin imports, real rule ids, severities per tier]
```

### CI step
```yaml
# [.github/workflows/<name>.yml] — add alongside test/typecheck
- run: [pnpm lint]   # [exact script that exists or is added in Tier 0]
```

## Beyond ESLint
<!-- Only where the repo gives evidence (a published package, a Nx workspace, conventional-commit history, …). -->
| Need | Tool | Why here |
| --- | --- | --- |
| `[e.g. workspace boundaries at scale]` | `[@nx/enforce-module-boundaries · dependency-cruiser]` | `[Nx repo — tags already exist / no tags yet]` |
| `[dep versions consistent across workspaces]` | `[syncpack · manypkg]` | `[…]` |
| `[unused exports / files / deps]` | `[knip]` | `[…]` |
| `[conventional commit types]` | `[commitlint type-enum]` | `[…]` |
| `[import type forced by the compiler]` | `[tsconfig verbatimModuleSyntax]` | `[…]` |
