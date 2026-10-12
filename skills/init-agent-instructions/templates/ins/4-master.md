# Agent instructions — master spec

<!-- Compiled by sweep 2 from 1-audit.md + 2-decisions.md + 3-automation.md AFTER the gate passes. This is the ONLY
     input scaffolding reads (orchestrator and every fan-out subagent): if a fact is not in here, generation may not
     use it. Nothing in this file is a question. Decisions are final; unanswered OPTIONAL items appear under "Safer
     readings taken". Written once per run. -->

Repo: `[repo-name]` · Compiled: `[YYYY-MM-DD]` · From: `1-audit.md` · `2-decisions.md` (REQUIRED all marked) · `3-automation.md`

## Repo facts
- Shape: `[monorepo]` · orchestrator `[Nx | Turborepo | none]` · package manager `[pnpm]` · scope `[@detected/]` · workspace globs `[…]`
- Commands (real script names, root): `[install · dev · build · test · lint · typecheck — exact]` · per-workspace form: `[pnpm --filter <name> <script> | nx run <name>:<target>]`
- Frameworks / runtimes: `[apps/x: Next.js · browser+node … ]`
- Deploy target: `[… | PLACEHOLDER]`
- Docs: `docs/` `[found | create]` · `docs/specs/` `[found (pattern: YYYY-MM-DD-topic-design.md) | create]` · planning skills `[names | none]`
- Golden example: `[path | none]` — governs tone/formatting only

## Metadata contract
- Rows on every workspace file: `Change posture:` + `**Status:**` (all) · `**Blast radius:**` (packages only) · sensitive-data row `[**PHI:** | **PII:** | not adopted — omit everywhere]`
- Posture legend with authority columns: root only (`[in | skipped — §B9 decision]`)
- Domain files: `Status:` line only

## Coverage plan (final)
| Workspace | Type | Template | Action | Posture (final) | Blast radius | Status | `[PHI/PII]` | Budget | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | root | `templates/root.md` | `[create · reconcile · ok]` | `[tier] ([inputs])` | `repo-wide` | `supported` | `[yes · no · —]` | `[n]` | `[…]` |
| `[apps/x]` | app | `templates/app.md` | `[…]` | `[…]` | — | `[…]` | `[…]` | `[n]` | `[…]` |
| `[packages/y]` | package | `templates/package.md` | `[…]` | `[…]` | `[…]` | `[…]` | `[…]` | `[n]` | `[…]` |
| `[pkg/src/dir]` | domain | `templates/domain.md` | `[generate]` | inherits | inherits | `[…]` | — | `[30-50]` | `[dev-guide doc to point at]` |

Fan-out: `[inline (≤5 workspaces) | one subagent per workspace, root first inline]`

## Adopted policies (final)
| Policy | Decision | Where it lands |
| --- | --- | --- |
| Package Design Invariants | `[yes · no · yes, lint-backed]` | `[root §4 | omitted | root §4 table only + lint]` |
| Two-consumer rule | `[…]` | `[…]` |
| TSDoc exported symbols | `[…]` | `[…]` |
| Error-handling MUSTs | `[…]` | `[…]` |
| Env validation | `[…]` | `[…]` |
| Real-instance integration tests | `[…]` | `[…]` |
| Changesets | `[…]` | `[…]` |
| Sensitive-data row | `[PHI · PII · no]` | `[every workspace file | nowhere]` |
| Required root sections skipped | `[none | section — §B9]` | — |

## Practice decisions (final)
| # | Practice | Decision | Enforce via | Lands in |
| --- | --- | --- | --- | --- |
| A1 | `[…]` | `[codify variant N · adopt new: …]` | `[lint <rule> · prose · review]` | `[AGENTS.md path → section | 3-automation.md #n | nowhere (left undocumented)]` |

## Prose exclusion list
<!-- Every rule routed `lint` in §D. Generation MUST NOT write any of these as a convention line in any AGENTS.md. The
     only trace allowed is the single pointer line in the root CI/CD section naming the lint config. Rules routed
     `prose-interim` are written ONCE, at the workspace they apply to, with the exact marker shown. -->
| Rule | Tool · rule id | Route |
| --- | --- | --- |
| `[…]` | `[…]` | `lint` |
| `[…]` | `[…]` | `prose-interim` → written as: `[rule text] (interim — lint rule pending: <rule id>)` |

Lint pointer line for the root guide: `` - **Lint-enforced conventions:** `[config path]` — not restated here; run `[lint command]`. `` `[include | omit — no config exists yet, point at 3-automation.md in the PR instead]`

## Merge plan (per workspace with an existing file)
### `[path]`
- Keep verbatim: `[…]`
- Restructure: `[content → template section]`
- Drop: `[content — reason]`
- Remove (lint-bound): `[lines → exclusion list]`
- Fold `## Merged from CLAUDE.md`: `[N lines → sections | n/a]`

## Section accounting (per template)
- Root: `[section: in · merged · skipped — reason]`
- `[apps/x]`: `[…]`
- `[packages/y]`: `[…]`

## Documentation
- Preferred source per topic (every "read for depth" pointer must cite one of these): `[topic → path]`
- Known stale / duplicate (never cite): `[paths]`
- Conflicts pending (listed at the top of the docs map): `[…]`
- `docs/docs-map.md`: `[write · refresh · skip]`

## Expected placeholders
- `[workspace → field — why not inferable]`

## Generic content relocation
`[approved — block below goes in 0-recap.md | deleted | kept — why]`
```markdown
[block]
```

## Safer readings taken
<!-- Unanswered OPTIONAL items (§E–§H) and their defaults. -->
- `[item → reading]`
