# Report

## What I did

Created `docs/configuration.md` in the fixture repo documenting the retry configuration options for `withRetry`.

## Contents and why

- **Usage example first**: a code snippet passing `RetryOptions` as the second argument, since that is the only configuration surface.
- **Options table** for `maxRetries` (default 3) and `baseDelayMs` (default 200), matching the actual defaults destructured in `src/retry.ts`.
- **Per-option detail sections**: `maxRetries` is the total attempt count (last error rethrown when exhausted; `1` disables retries); `baseDelayMs` grows as `baseDelayMs * 2 ** attempt` per the implementation, with a concrete delay schedule table (200/400/800 ms).
- Noted a behavior quirk found while reading the source: the delay is applied after every failed attempt, including the final one, before the error is rethrown. Documented it since callers may be surprised by the extra wait.
- **Defaults section** showing the explicit-defaults equivalent call.

All values were verified against `src/retry.ts` rather than assumed; the README's Configuration section already summarizes the same defaults, so the new page is consistent with it. No other files were changed.
