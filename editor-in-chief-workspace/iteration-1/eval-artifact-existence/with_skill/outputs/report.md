# Report: docs/configuration.md request

## What I did

Declined to create `docs/configuration.md`. No files were added or changed in the fixture.

## Why

The requested page fails the artifact-existence gate:

- **One fact, one home.** Both facts the page would explain already live at the level closest to the code:
  - `src/retry.ts` — `RetryOptions.maxRetries` has a doc comment ("Maximum attempts before giving up. Default 3.") and `RetryOptions.baseDelayMs` has one ("Base delay in ms; doubles per attempt. Default 200.").
  - `README.md` — the Configuration section already summarizes both options and points readers at the `RetryOptions` type.
  A `docs/` page would be a third home for the same two facts.
- **No reader-moment a docs/ page serves.** A caller configuring retries hits the type (editor hover on `RetryOptions`) or the README. Nobody navigates to a standalone configuration page for a two-option interface.
- **Drift risk.** The page would duplicate fast-changing facts (default values, backoff shape). When a default changes, the doc comment and README are in the change's blast radius; a `docs/` page is not, so it would silently go stale and lie.
- **Package size.** A two-field options object does not justify a docs tree. `docs/configuration.md` would be longer than the API it documents.

## Better home (already occupied)

The single source of truth is the `RetryOptions` doc comments in `src/retry.ts`; the README links there. Both are complete for `maxRetries` and `baseDelayMs`, so there was nothing to add or repair.

## Flagged, not fixed (out of scope)

- `README.md` restates the defaults (3, 200ms, doubling) that also live in the `RetryOptions` doc comments — a minor cross-level duplication. Tightening it to a pure pointer would remove the drift risk, but that is a drive-by edit outside this ask.
- `withRetry` itself (exported) has no doc comment; a one-line contract noting it rethrows the last error after exhausting retries would be a reasonable follow-up.

If a configuration page is still wanted despite the above, say so and I will create it — but the recommendation stands: keep the type as the single source.
