# Doc review — current changes (unstaged diff, `src/rates.ts`)

Nothing to flag — documentation is adequate.

The only change is the new exported `totalRepayment` in `src/rates.ts`. Its TSDoc holds up:

- First line is a caller-facing contract ("Total repayment for a fixed-rate loan"), not a restatement of the body.
- The zero-rate early return is documented as WHY (the formula divides by rate), which is exactly the non-obvious branch a reader would question.
- `@param` tags carry what the types can't: units (`principal` in cents, `apr` as a percentage) rather than restating `number`.
- Tags match the signature; no stale, redundant, or commented-out content anywhere in the diff.

0 critical, 0 important, 0 nit
