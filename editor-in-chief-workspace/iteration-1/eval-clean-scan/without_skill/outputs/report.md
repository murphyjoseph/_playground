# Doc/comment review: uncommitted changes in `fixture`

**Scope:** one modified file, `src/rates.ts` (+15 lines: new exported `totalRepayment` function with JSDoc).

**Verdict: clean.** The new documentation is accurate, carries real information, and nothing should be deleted. No changes required.

## What's good (why this passes)

- `totalRepayment` has a JSDoc block on a new exported function, matching the existing pattern set by `periodicRate`.
- The zero-rate line is a genuine WHY comment: it documents a non-obvious guard (`if (r === 0) return principal;`) that would otherwise look like dead defensive code. Without it, the formula produces `0/0 = NaN` at zero rate.
- `@param principal` documents units ("in cents"), which is exactly the kind of footgun-preventing detail param docs exist for.
- No noise: no restating-the-code comments, no commented-out code, no stale claims. The doc's claims match the implementation (standard amortization formula, principal returned unchanged at zero rate).

## Optional nits (not blocking, fine to skip)

- **No `@returns` tag.** The summary line covers what is returned, but the return units and rounding are only implied: the result is in cents (same as `principal`) and is rounded to a whole number. A one-line `@returns total repayment in cents, rounded` would remove the only ambiguity in the API.
- **Slight imprecision in the WHY:** "the formula divides by rate otherwise" — strictly, it divides by `1 - (1+r)^-months`, which goes to 0 as the rate goes to 0 (yielding `0/0`, i.e. `NaN`). The gist (formula breaks at zero rate) is correct, so this is a wording nit, not a wrong comment.
- `@param months` says just "loan term"; units are self-evident from the parameter name, so adding "in months" would be redundant. Leave as is.

## What's missing

Nothing material. The only other symbol in the diff's blast radius, `periodicRate`, is unchanged and already documented.

## What should be deleted

Nothing. Every comment in the diff earns its place.
