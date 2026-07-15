# Doc & comment review — uncommitted changes

Scope: `git diff` in the fixture repo (README.md, src/cache.ts, src/index.ts). Three real issues: one stale comment, one missing JSDoc on new public API, one README section that should be rewritten or deleted.

## 1. Stale comment — `src/cache.ts:4` (fix or delete)

```ts
const MAX_RETRIES = 5;

// retry up to 3 times before giving up
export async function fetchWithRetry(url: string): Promise<Response> {
```

The diff bumped the retry count from a hardcoded `3` to `MAX_RETRIES = 5` but left the old comment saying "up to 3 times". It is now actively wrong.

Recommendation: delete the comment rather than updating it. `MAX_RETRIES` in the loop condition already says everything the comment said; a count-restating comment will just drift again the next time the constant changes.

```diff
-// retry up to 3 times before giving up
 export async function fetchWithRetry(url: string): Promise<Response> {
```

## 2. Missing JSDoc on new public API — `src/index.ts:9` (`parseWindow`)

`parseWindow` is a new export with no doc comment, while its sibling export `createClient` in the same file has JSDoc. Beyond consistency, this function has real contract details a caller cannot get from the signature:

- Input format: a `"start-end"` string, values in milliseconds (e.g. `"1000-5000"`).
- Both ends are clamped to `[0, 86_400_000]` (24h) — silent behavior change on out-of-range input.
- Malformed input is not validated: `"abc"`, `""`, or a missing `-` produce `NaN` in the result (and `NaN` survives the clamp). A negative start like `"-5-10"` also misparses because it splits on the leading `-`.

Suggested doc:

```ts
/**
 * Parse a "start-end" window string (milliseconds) into its endpoints.
 * Both ends are clamped to [0, 86_400_000] (24 hours).
 * @param input e.g. "1000-5000"; malformed input yields NaN endpoints
 */
export function parseWindow(input: string): { start: number; end: number } {
```

If NaN passthrough is not intended behavior, that is a code fix rather than a doc fix — but as written it must be documented.

## 3. README "Parsing windows" section — delete the source dump (`README.md:9-18`)

The new section pastes the full implementation of `parseWindow` into the README. Problems:

- **It will drift.** A copy of the source in docs goes stale the moment the implementation changes (the `fetchWithRetry` comment in this same diff is a live demonstration of this failure mode).
- **The snippet is broken as shown.** It references `clampMs`, which is a private, non-exported helper that does not appear in the snippet — so it neither compiles standalone nor tells the reader what the clamp bounds are.
- **It documents the wrong thing.** READMEs should show usage (how to call it, input format, output), not implementation.

Recommended replacement:

````markdown
## Parsing windows

`parseWindow` parses a `"start-end"` millisecond string; both ends are clamped to `[0, 86_400_000]` (24 hours).

```ts
import { parseWindow } from "tiny-cache";

parseWindow("1000-5000"); // { start: 1000, end: 5000 }
```
````

## Minor

- `src/index.ts:14` — `86_400_000` is a magic number. Either name it (`const DAY_MS = 86_400_000`) or add a trailing `// 24h in ms`. Low priority, but the clamp bound is the one fact every caller of `parseWindow` needs.
- `src/cache.ts:1` — `TTL_MS` is unused in this file. Pre-existing, not part of this diff; flagging only in case it is dead code.

## Summary

| File | Issue | Action |
|---|---|---|
| `src/cache.ts:4` | Comment says 3 retries, code does 5 | Delete the comment |
| `src/index.ts:9` | New export `parseWindow` undocumented (format, clamping, NaN behavior) | Add JSDoc |
| `README.md:9-18` | Implementation source pasted into docs; references private `clampMs`; will drift | Replace with a usage example |
| `src/index.ts:14` | Magic number `86_400_000` | Name it or comment it (minor) |
