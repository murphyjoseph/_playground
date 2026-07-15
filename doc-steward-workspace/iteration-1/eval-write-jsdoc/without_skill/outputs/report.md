# JSDoc for src/geo.ts

## What was done

- `haversineDistance`: full JSDoc with `@param` for all four coordinates (decimal degrees) and `@returns` (meters). Noted the spherical-Earth assumption and the 6,371,000 m mean radius baked into the implementation.
- `boundingBox`: full JSDoc with `@param`/`@returns`. Documented the return tuple order as `[minLat, minLon, maxLat, maxLon]` (inferred from the `lat - latDelta, lon - lonDelta, ...` construction). Called out that it uses an equirectangular approximation (~111,320 m per degree, cos-scaled for longitude), degrades near the poles, and does not clamp output to valid coordinate ranges.
- `toRad`: single-line JSDoc only, since it is a private one-liner.

## Judgment calls

- Documented units explicitly (decimal degrees in, meters for distance/radius) because unit ambiguity is the main footgun in this file.
- Included the approximation caveats on `boundingBox` (pole behavior, no clamping) since callers can hit real bugs there; skipped edge cases that can't surprise anyone.
- Kept `toRad` minimal rather than giving it param/returns tags; it is not exported and the name says everything.
- Did not add `@example` blocks; the functions are simple enough that examples would be noise.

## Notes

- A PostToolUse ESLint hook fired on each edit but failed for environmental reasons (the fixture has no `eslint.config.js` and ESLint 10 requires flat config). Not related to the JSDoc changes.
