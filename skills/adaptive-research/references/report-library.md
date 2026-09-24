# Report Library

Substantive research reports persist as files so they can be recalled instead of
re-researched, audited claim by claim, and refreshed without starting from zero. The
manifest is the generation graph: which sources fed which claims, and what would
invalidate them.

Reports live in `<library_path>/<topic-slug>.md` — the same `library_path` the source
library uses (see `references/source-library.md`), sibling to `sources.md`. Kebab-case
slug, one file per topic: a re-run of the same topic updates that file, it never creates
a near-duplicate.

## When to save

Save when the run produced a real report — an explicit research request, or 3+
load-bearing sources synthesized. Don't save quick answers, and don't save when the user
says not to. Tell the user the path when you save.

## Report file format

Gut/library convention: title, `As of:` date, `Source:` provenance, content stored as
delivered. The manifest rides in YAML frontmatter above it.

```markdown
---
query: "best CI caching strategy for pnpm monorepos"
generated: 2026-09-02
profiles: [engineering]
sources:
  - { domain: pnpm.io, tier: approved, reliability: A, role: primary-docs }
  - { domain: depot.dev, tier: caution, reliability: C, role: vendor-benchmark }
claims:
  - claim: "content-addressed store cuts install time ~60% on warm cache"
    status: verified_2plus_primary        # matches the verification ledger labels
    from: [pnpm.io, bencooper.dev]
refresh_triggers:
  - "pnpm v10 release changes store format"
staleness_horizon: 6 months
schemaVersion: 1
---

# Best CI caching strategy for pnpm monorepos

As of: 2026-09-02
Source: adaptive-research run

[The report as delivered: TL;DR, findings, source assessment, verification ledger,
what-would-change-this.]

## Changelog

- 2026-09-02 — initial report.
```

Manifest rules:

- `sources` records the tier and reliability **at generation time** — that's what makes
  later drift detectable when the source library has since demoted a source.
- `claims` lists load-bearing claims only, each mapped to the domains it rests on, with
  its verification-ledger status. This is the audit surface: a reader (or a refresh) can
  check any claim without re-deriving the whole report.
- `refresh_triggers` come straight from the report's "what would change this conclusion"
  section — they are the cheapest possible refresh check.
- `staleness_horizon` is your judgment of the domain's drift speed (engineering tooling
  moves in months; settled science in years).

## Recall (Step 0)

After loading `sources.md`, check for prior work: grep the `query:` lines and filenames
of `<library_path>/*.md` for topical overlap with the current question. On a hit, read
that file's frontmatter only — not the body — and tell the user what exists and how old
it is before searching the web:

- Within its staleness horizon and no triggered refresh conditions → offer to reuse it
  (load the body) or go fresh.
- Past its horizon, or the question extends the topic → offer a refresh.

Never silently re-research a topic the library already covers; never silently reuse a
stale report. The user picks, you default to the cheaper honest option.

## Refresh procedure ("refresh <topic>")

1. Read the manifest. Check each `refresh_trigger` with a targeted search — if none
   fired and the horizon hasn't passed, say so and stop; a no-op refresh is a valid
   result.
2. Cross-check `sources` against the current source library: any source since demoted
   or blocked invalidates the claims that rest on it — those claims need re-sourcing,
   not just re-checking.
3. Re-verify each load-bearing claim in `claims` against fresh fetches (extraction
   discipline from `references/tool-discipline.md` applies).
4. Rewrite the body with the new findings, update `generated` and the `As of:` line,
   update the manifest's sources/claims to match, and append a changelog entry stating
   what changed and what held. The changelog is append-only history; the body is always
   the current state.
