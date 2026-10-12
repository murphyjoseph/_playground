# Lint catalog — convention → enforcing tool

Used by the lint scout (`lint-brief.md`) and by sweep 2's prose gate. Maps the convention lines that typically
end up in AGENTS.md files to the tool and rule that can enforce them instead. A convention with a row here is
**never written as prose** in a generated guide unless the user routed it `prose` / `prose-interim` in
`2-decisions.md`.

**Verification rule:** rule ids below are the catalog author's best knowledge, not a guarantee for the installed
version. Before a rule id lands in `3-automation.md`, confirm it exists in the installed plugin:
`ls node_modules/<plugin>/lib/rules` (most plugins), `ls node_modules/@typescript-eslint/eslint-plugin/dist/rules`
(typescript-eslint), or the plugin's README. Ids marked *(verify)* are less certain — check them first. A rule that
cannot be verified is reported as "candidate — unverified", never silently included in a config block.

Classes used in `3-automation.md`: **A** enforced today · **B** one line away (plugin installed, rule not configured) ·
**C** needs a plugin or tool not installed · **D** custom (a `no-restricted-syntax` selector or a small local plugin —
cite the repo's precedent if it has one) · **E** not automatable, stays in prose.

## ESLint core (no plugin)
| Convention as prose | Rule | Notes |
| --- | --- | --- |
| No `console.log` in application code | `no-console` | `allow: ['warn','error']` if the repo tolerates those; override off for CLI/scripts/tests |
| No empty `catch` blocks / never swallow errors | `no-empty` with `allowEmptyCatch: false` | Pair with `@typescript-eslint/no-floating-promises` for the async half |
| Never `throw` a string | `@typescript-eslint/only-throw-error` (typescript-eslint v8; earlier `no-throw-literal` core) | Type-aware |
| Prefer `as const` objects over `enum` | `no-restricted-syntax` selector `TSEnumDeclaration` | Message names the replacement |
| No notes-to-self (`TODO: revisit`, `FIXME`) | `no-warning-comments` with `terms: ['todo','fixme']` | Usually `warn`; pair with a ticket convention |
| Arrow functions, not function declarations | `func-style: ['error','expression']` + `prefer-arrow-callback` | For *components* see the React row instead |
| Class methods as arrow properties | `no-restricted-syntax` selector `MethodDefinition[kind="method"]` *(verify scope — also hits getters/constructors unless excluded)* | Class D; aggressive — confirm desired scope first |
| No inline object type literals in signatures (extract and export types) | `no-restricted-syntax` selector on `TSTypeLiteral` inside parameter annotations *(verify selector)* | Class D; start as `warn` |
| `===` always | `eqeqeq` | — |
| No `debugger` | `no-debugger` | In `eslint:recommended` already |
| Named imports / exports over default | `import/no-default-export` (plugin) or `no-restricted-syntax` selector `ExportDefaultDeclaration` | Framework pages/configs need overrides |
| No barrel files in app `src/` (`export * from`) | `no-restricted-syntax` selector `ExportAllDeclaration` scoped by `files: ['apps/**/src/**']` | Class D; `import/no-cycle` catches the worst symptom |
| Every `eslint-disable` needs a reason | `@eslint-community/eslint-comments/require-description` *(plugin `@eslint-community/eslint-plugin-eslint-comments`)* | Class C |

## typescript-eslint (`@typescript-eslint/eslint-plugin`)
| Convention as prose | Rule | Notes |
| --- | --- | --- |
| No `any`; use `unknown` and narrow | `@typescript-eslint/no-explicit-any` | Often already `warn` — proposal is `error` |
| No non-null assertion `!` | `@typescript-eslint/no-non-null-assertion` | — |
| `import type` for type-only imports | `@typescript-eslint/consistent-type-imports` | Or compiler: `verbatimModuleSyntax` (see tsc) |
| `export type` alongside values | `@typescript-eslint/consistent-type-exports` | Type-aware |
| Prefer `type` over `interface` (or the reverse) | `@typescript-eslint/consistent-type-definitions` | Value `'type'` or `'interface'` |
| Explicit return types on exported functions | `@typescript-eslint/explicit-module-boundary-types` | `explicit-function-return-type` if the repo wants every function |
| Naming: camelCase vars, PascalCase types, no `I` prefix, SCREAMING_SNAKE constants | `@typescript-eslint/naming-convention` | One rule, many selectors; replaces the whole Naming table except files/dirs/env vars |
| No floating promises / await-in-forEach bugs | `@typescript-eslint/no-floating-promises` · `@typescript-eslint/no-misused-promises` · `@typescript-eslint/await-thenable` | Type-aware; highest-value correctness trio |
| Unused vars/imports | `@typescript-eslint/no-unused-vars` (+ `unused-imports/no-unused-imports` for autofix) | — |
| Exhaustive `switch` on unions | `@typescript-eslint/switch-exhaustiveness-check` | Type-aware |
| No `require()` | `@typescript-eslint/no-require-imports` | — |
| No `@ts-ignore` without reason | `@typescript-eslint/ban-ts-comment` | Default allows `@ts-expect-error` with description |
| Prefer `??` / `?.` | `@typescript-eslint/prefer-nullish-coalescing` · `@typescript-eslint/prefer-optional-chain` | Type-aware |

## eslint-plugin-import
| Convention as prose | Rule | Notes |
| --- | --- | --- |
| Import order: external → aliased → relative | `import/order` with `groups` + `pathGroups` for the alias (`@/**`, `@scope/**`) + `alphabetize` | Alternative: `perfectionist/sort-imports` (plugin `eslint-plugin-perfectionist`) |
| Never relative imports across workspace boundaries | `import/no-relative-packages` | Nx repos: prefer `@nx/enforce-module-boundaries` |
| No upward imports (`packages/` → `apps/`), no cross-app imports | `import/no-restricted-paths` with `zones` | Nx: `@nx/enforce-module-boundaries` with tags; large repos: dependency-cruiser |
| No deep imports into another package (`@scope/x/src/…`) | `import/no-internal-modules` or `no-restricted-imports` `patterns: ['@scope/*/src/*']` | Choose one |
| Deps must be declared in the workspace's own `package.json` | `import/no-extraneous-dependencies` with `packageDir` | Nx: `@nx/dependency-checks` |
| Universal package must not use `node:*` | `import/no-nodejs-modules` scoped by `files` to the universal packages | Direct encoding of the runtime-target invariant |
| No circular imports | `import/no-cycle` | Expensive; `maxDepth` to bound it |
| No duplicate import lines | `import/no-duplicates` | Autofix |

## React (`eslint-plugin-react`, `eslint-plugin-react-hooks`)
| Convention as prose | Rule | Notes |
| --- | --- | --- |
| Function components as arrow functions | `react/function-component-definition` with `namedComponents: 'arrow-function'` | Direct encoding of "components are arrow functions" |
| No class components | `no-restricted-syntax` selector `ClassDeclaration[superClass.property.name=/^(Pure)?Component$/]` *(verify selector; also match bare `Component` identifiers)* | Class D; `react/prefer-stateless-function` only flags convertible ones |
| Hooks rules | `react-hooks/rules-of-hooks` · `react-hooks/exhaustive-deps` | Non-negotiable in any React repo |
| No array index as key | `react/no-array-index-key` | — |
| No `&&` leaking `0` into JSX | `react/jsx-no-leaked-render` | — |

## File and directory naming
| Convention as prose | Rule | Notes |
| --- | --- | --- |
| `kebab-case.ts` files, `PascalCase.tsx` components | `check-file/filename-naming-convention` (plugin `eslint-plugin-check-file`) *(verify)* or `unicorn/filename-case` (plugin `eslint-plugin-unicorn`) | Class C; per-glob patterns |
| `kebab-case/` directories | `check-file/folder-naming-convention` *(verify)* or the standalone `ls-lint` tool *(verify)* | Class C |
| Env var naming (`SCREAMING_SNAKE`, app prefix) | — | **E**: not lintable in a useful way; stays in prose |

## Node / env / tests
| Convention as prose | Rule | Notes |
| --- | --- | --- |
| Env read only through the validated schema module | `n/no-process-env` (plugin `eslint-plugin-n`) with an override allowing the schema file | Class C; direct encoding of "validate env at startup" |
| No focused / skipped tests committed | `jest/no-focused-tests` · `jest/no-disabled-tests` (plugin `eslint-plugin-jest`) · `vitest/no-focused-tests` (plugin `@vitest/eslint-plugin`) · `no-only-tests/no-only-tests` (plugin `eslint-plugin-no-only-tests`) | Pick the one matching the runner |
| TSDoc every exported symbol | `jsdoc/require-jsdoc` with `publicOnly: true` (plugin `eslint-plugin-jsdoc`) · syntax via `tsdoc/syntax` (plugin `eslint-plugin-tsdoc`) | Class C; scope with `files` to `packages/**` |

## Compiler (`tsconfig`) — stronger than lint where available
| Convention as prose | Flag | Notes |
| --- | --- | --- |
| Strict mode always | `strict: true` | In the base tsconfig; a guide line restating it is a finding |
| `import type` for type-only imports | `verbatimModuleSyntax: true` | Makes the lint rule redundant |
| Index access may be undefined | `noUncheckedIndexedAccess: true` | Behavioural; adopt via a decision, not silently |
| Unused locals/params | `noUnusedLocals` · `noUnusedParameters` | Overlaps lint; pick one home |
| `override` keyword required | `noImplicitOverride: true` | — |

## Other tools (non-ESLint)
| Convention as prose | Tool | Notes |
| --- | --- | --- |
| Any formatting rule (indent, quotes, semicolons, line width) | Prettier / Biome formatter | Always **A** if a formatter config exists — delete the prose, name the tool |
| Layer / boundary rules at architecture scale | `dependency-cruiser` (`.dependency-cruiser.cjs`) or `@nx/enforce-module-boundaries` | Nx repo → Nx rule with tags is the canonical home |
| Minimal export surface; export only what is consumed | `knip` | Reports unused exports, files, deps; also informs the two-consumer rule |
| Consistent dep versions across workspaces; `workspace:` protocol | `syncpack` or `@manypkg/cli` | — |
| Published package `exports` map correctness | `publint` · `@arethetypeswrong/cli` | Only for externally published packages |
| Conventional commit types (e.g. only `feat`/`fix`/`chore`) | `commitlint` with `type-enum` | Pair with a commit-msg hook |
| Run checks on commit | `lint-staged` + `husky` or `lefthook` | A hook, not a guide line |
| Never commit secrets | `gitleaks` / `trufflehog` in CI | The guide line "never commit .env" is inferable anyway |
| Metadata rows present, posture values legal, referenced paths exist | the repo's own conventions test (rubric → Self-maintenance) | Written in the repo's existing test runner |

## Stays in prose (class E) — examples
Ordering constraints with semantics ("middleware X stays last") · scaffolding steps and required file sets ·
"stop and ask" boundaries · business boundaries ("no unauthenticated routes without approval") · when to split a
package · which doc to read before touching an area · change posture / blast radius / status judgments · anything
that reads a data flow (PHI handling) rather than a syntax shape. Lint can sometimes approximate these with a custom
rule; propose that only when the repo already maintains a local plugin.
