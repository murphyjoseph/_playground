# Doc review — uncommitted changes

Scope: unstaged diff (`git diff`) — `README.md`, `src/cache.ts`, `src/index.ts`.

## src/cache.ts

- **`src/cache.ts:4`** — **[critical]** Stale comment: says "retry up to 3 times" but the loop now runs `MAX_RETRIES = 5` times → delete the comment. `MAX_RETRIES` already says everything it said; a count in prose is drift bait (this diff proves it — the constant changed and the comment didn't).

## src/index.ts

- **`src/index.ts:9`** — **[important]** New exported `parseWindow` has no doc comment, and its contract is genuinely non-obvious → add TSDoc covering what the code can't say: input format (`"start-end"`), units (milliseconds), and that both ends are clamped to `[0, 86_400_000]` (24h). Suggested:

  ```ts
  /**
   * Parse a "start-end" window string into millisecond bounds.
   * Both ends are clamped to [0, 86_400_000] (24 hours).
   */
  ```

- **`src/index.ts:9`** — **[important]** Undocumented footgun: malformed input (`"abc"`, `"100"`, extra dashes) yields `NaN` for `start` and/or `end` — no throw, no validation. Callers get silently poisoned numbers. Either document the behavior in the TSDoc (`Returns NaN bounds for malformed input`) or validate; documenting is the minimum.

- **`src/index.ts:14`** — **[nit]** `86_400_000` is a magic number → name it (`const MAX_WINDOW_MS = 86_400_000; // 24h`) so the clamp explains itself and the TSDoc above has a single source for the limit.

## README.md

- **`README.md` "Parsing windows" section** — **[important]** Duplicates the `parseWindow` source verbatim into the README → delete the section. This fails the drift test (any edit to the function silently invalidates the snippet) and violates one-fact-one-home: the function's contract belongs in its TSDoc, the single home closest to the code. If the README must mention it, one line ("`parseWindow` — parse `"start-end"` window strings, see the TSDoc") is the ceiling. Side note: the section also shows *implementation*, not usage — a README snippet should show the caller's side, not the body.

## Not flagged (judgment calls)

- `createClient` TSDoc (`src/index.ts:1-4`) is fine: one-line caller contract, `@param` adds the non-obvious fact (prefix semantics).
- `TTL_MS` in `src/cache.ts:1` is declared but unused — a code issue, not a documentation issue; out of scope here.
- `clampMs` itself needs no doc comment: one-line private helper, name says what it does.

**Tally: 1 critical, 3 important, 1 nit**
