# JSDoc for src/geo.ts

## Edits

- `haversineDistance` — one-sentence caller contract (great-circle distance in meters) plus the facts the code can't say: coordinates are decimal degrees, spherical-Earth assumption (mean radius 6371 km), ~0.5% max error.
- `boundingBox` — contract (approximate box as a cheap pre-filter), the approximation's limits (equirectangular, degrades near poles, no antimeridian wrap), and `@param`/`@returns` tags because units (degrees vs meters) and the tuple order `[minLat, minLon, maxLat, maxLon]` are not recoverable from the types.

## Judgment calls

- Skipped `@param` tags on `haversineDistance`: names + the degree/units note in the summary already cover them; per-param tags would restate the signature.
- Documented the tuple order on `boundingBox` in `@returns` since `[number, number, number, number]` says nothing; the better fix would be a named type or object return, but that's a code change outside a docs task.
- Declined to document `toRad`: one-line private helper, self-evident.
- The PostToolUse ESLint hook errored on every edit ("couldn't find an eslint.config.js"); the fixture repo has no ESLint config, so this is environmental, not caused by the edits.
