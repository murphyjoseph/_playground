# Agent instructions — audit

<!-- Sweep 1 output. FACTS and FINDINGS only — nothing here asks the user for anything; every item that
     needs a human mark lives in 2-decisions.md and is referenced from here by section letter. Written once
     per run; sweep 2 reads it but never edits it. Keep every section, in this order; a section with nothing
     to report says "none" rather than disappearing (absence must mean "not checked", never "clean"). -->

Repo: `[repo-name]` · Date: `[YYYY-MM-DD]` · Scope: `[repo-wide | root | app:<path> | package:<path> | domain:<path>]`

## Repo shape
`[monorepo | single package]` — `[reason: which manifest]`
Toolchain: `[orchestrator or "no orchestrator"]` · `[package manager]` · scope `[@detected/]` · workspace globs `[apps/*, packages/*, …]`
Lint tooling (presence only — the deep pass is `3-automation.md`): `[ESLint N via <config files> | Biome | oxlint | none]` · Prettier `[yes | no]` · lint in CI `[yes (<workflow>) | no]`

## Preflight — AGENTS.md only
<!-- Every CLAUDE.md-family file found inside the repo and what was done to it. Actions are taken in sweep 1
     BEFORE any other write, after posting the notice in chat. `CLAUDE.local.md` and ancestor files are
     never touched. -->
| Path | State found | Action taken | Note |
| --- | --- | --- | --- |
| `[dir/CLAUDE.md]` | `[symlink → AGENTS.md · real, no AGENTS.md · real, identical to AGENTS.md · real, differs · import-only (@AGENTS.md)]` | `[deleted · renamed → AGENTS.md · deleted (identical) · merged N lines → AGENTS.md "Merged from CLAUDE.md", deleted · deleted (import-only)]` | `[diff summary for merges]` |
| `[dir/CLAUDE.local.md]` | personal file | left in place — flagged | suppresses AGENTS.md loading on this machine |

Ancestor `CLAUDE.md`-family files above the repo root: `[none | /abs/path — not touched; settings fix in 0-recap.md]`

## Coverage plan
<!-- Every workspace resolved from the manifest globs — all of them, including config/types packages — plus every
     domain-subtree candidate with a generate/skip recommendation and its evidence. "Root already covers it" is
     a banned reason to skip. Line budget = the target for that file (root ~100-120, deltas as short as their
     real delta, domain routers 30-50). -->
| Workspace | Type / framework | Existing `AGENTS.md` | Action | Budget | Evidence (domain rows) |
| --- | --- | --- | --- | --- | --- |
| `/` (root) | — | `[yes (N lines) · no]` | `[create · reconcile · ok]` | `[n]` | — |
| `[apps/x]` | `[framework]` | `[yes · no]` | `[create · reconcile · ok]` | `[n]` | — |
| `[packages/y]` | `[pkg-type]` | `[yes · no]` | `[create · reconcile · ok]` | `[n]` | — |
| `[pkg/src/dir]` | domain | `[yes · no]` | `[generate · skip — why, per the domain-warrant rule]` | `[n]` | `[same-suffix clusters · base class · registration step · dev-guide doc]` |

Golden example: `[none | path — scores well on the rubric; governs tone and formatting of generated files (not the skeleton or metadata contract)]`

## Findings
<!-- Against references/agentsmd-best-practices.md. Severity: high = actively misleads an agent (wrong command,
     contradiction, stale path an agent will follow); medium = missing contract (posture line, coverage gap,
     lint-enforceable prose, wrong mechanism); low = hygiene (length, generic content). A clean repo says
     "none" — never manufacture findings. Mark uncertain ones "possibly — verify". -->
| # | Path | Severity | Rubric rule | Issue | Fix | Routed to |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | `[path:line]` | `[high · medium · low]` | `[e.g. Lint-enforceable prose · Command drift · Delta violation]` | `[what is wrong]` | `[what sweep 2 will do]` | `[sweep 2 · 2-decisions §A/§D · 3-automation #n · human]` |

Totals: `[N]` — `[N high · N medium · N low]`.

## Inferred
<!-- Facts derived from files. Corrections go in 2-decisions.md §H (optional). -->
| Field | Value | Source |
| --- | --- | --- |
| Orchestrator / package manager / scope | `[…]` | root configs |
| Framework(s) / package types | `[…]` | dependencies |
| Runtime targets | `[…]` | tsconfig lib + deps |
| Consumers (per package, qualitative — names, not counts) | `[…]` | `rg` across the monorepo with the detected scope |
| Dev / build / test / lint / typecheck commands (real script names) | `[…]` | `package.json` scripts, Makefile/justfile |
| Deploy target | `[… | unknown]` | config files / framework |
| Sensitive-data domain present | `[yes — <domain> | no]` | source reading, not package category |

### Change posture (derived — confirm in 2-decisions.md §C)
| Workspace | Derived | Inputs (qualitative) | Blast radius (packages) | Status |
| --- | --- | --- | --- | --- |
| `/` | `[locked · guarded · standard · open]` | `[…]` | `repo-wide` | `supported` |
| `[apps/x]` | `[…]` | `[…]` | — | `[…]` |
| `[packages/y]` | `[…]` | `[…]` | `[repo-wide · several workspaces · one workspace (name) · build/CI only · leaf (no consumers)]` | `[…]` |

## Observed conventions (probes)
<!-- The fixed probe set from references/profile-brief.md, per workspace, counts of files (or occurrences where the brief
     says so). Facts only. A probe whose winning variant differs across workspaces, or splits inside one, becomes a
     2-decisions.md §A item that cites this table. Uniform = no item. Inline-profiled repos fill the same table. -->
| Probe | `[ws-1]` | `[ws-2]` | `[…]` | Verdict |
| --- | --- | --- | --- | --- |
| P1 test suffix | `[.test. N · .spec. N]` | `[…]` | `[…]` | `[uniform · split → §A<n>]` |
| P2 test location | `[…]` | `[…]` | `[…]` | `[…]` |
| P3 export style | `[…]` | `[…]` | `[…]` | `[…]` |
| P4 component definition | `[… | n/a]` | `[…]` | `[…]` | `[…]` |
| P5 error construction | `[…]` | `[…]` | `[…]` | `[…]` |
| P6 import style | `[…]` | `[…]` | `[…]` | `[…]` |
| P7 barrels in source | `[…]` | `[…]` | `[…]` | `[…]` |
| P8 console in source | `[…]` | `[…]` | `[…]` | `[…]` |
| P9 env access | `[…]` | `[…]` | `[…]` | `[…]` |
| P10 explicit any | `[…]` | `[…]` | `[…]` | `[…]` |
| P11 type vs interface | `[…]` | `[…]` | `[…]` | `[…]` |
| P12 enums vs as const | `[…]` | `[…]` | `[…]` | `[…]` |
| P13 file naming | `[…]` | `[…]` | `[…]` | `[…]` |

Profiled via: `[inline (≤ 8 workspaces) | N profiler batches]` · unprofiled workspaces: `[none | paths — why]`

## Docs & planning tooling
- `docs/`: `[found | not found — sweep 2 keeps the "create it" callout]`
- `docs/specs/`: `[found (N specs; 3 most recent: …) | not found]`
- `docs/architecture.md`: `[found — covers … | not found]`
- `.claude/skills/` (or legacy `.claude/commands/`): `[names | none]` · `.claude/rules/`: `[names | none]` · `.claude/agents/`: `[names | none]`

## Documentation inventory
<!-- From the read-only census subagent. Judgments, not a census table — the full list is derivable. Feeds
     docs/docs-map.md if 2-decisions.md §F says write. -->
- Docs found: `[N files across docs/, apps/docs/, READMEs, …]`
- Conflicts: `[doc A vs doc B on <topic> — recommend <which wins> because … | none]`
- Dead / stale: `[path — evidence, e.g. "describes removed src/infra/; last touched 2024-06" | none]`
- Duplicates: `[path → duplicate of <canonical> | none]`
- Preferred source per topic: `[topic → path]` (this table becomes the docs map)

## Merge plan
<!-- Only when existing AGENTS.md files were found; otherwise "n/a — fresh repo". Existing content is the source
     of truth for any rule it states; the template provides structure. Every drop is listed. -->
- Keep verbatim: `[hand-written domain rules / decisions worth preserving]`
- Restructure into template sections: `[content → section]`
- Drop: `[stale or template-redundant content — reason]`
- Lint-enforceable prose to remove (→ `3-automation.md`): `[rule → #n]`
- `## Merged from CLAUDE.md` blocks to fold in sweep 2: `[paths | none]`

## Section accounting
<!-- Every template section lands somewhere: filled · merged · skipped-with-reason. Required root sections need a
     reason AND a user mark (2-decisions.md §B) to skip. -->
- Root required: Operating Rules `[in | skipped — reason → §B]` · Metadata Legend with authority columns `[in | skipped — reason → §B]` · Planning before building / docs & specs `[in | skipped — reason → §B]`
- Policy-gated root sections (outcome depends on §B): Package Design Invariants · Comments & documentation · Error handling · Testing MUSTs · Env validation — `[pre-marked recommendation per section]`
- Skipped elsewhere: `[workspace · section — reason, e.g. "apps/api: Accessibility — backend"]`
- Filled fresh (no counterpart in the existing file): `[sections — reconciling only]`

## Dependency footprint check
<!-- One row per package against actual `dependencies`. A package with no row = incomplete audit. -->
- `[✓ | ⚠]` `packages/[a]` (`[pkg-type]`): `["✓ clean" | "⚠ <dep> (<what it is>) in a <type> package — split or reclassify"]`

## Gaps — will stay `[PLACEHOLDER]`
- `[e.g. deploy target — not inferable from files]`
- `[e.g. out-of-scope declarations — need domain knowledge]`

## Routed to decisions
`[N]` REQUIRED and `[N]` OPTIONAL items written to [`2-decisions.md`](2-decisions.md): §A `[N]` · §B `[N]` · §C `[N]` · §D `[N]` · §E `[N]` · §F `[1]` · §G `[N]` · §H `[open]`.
