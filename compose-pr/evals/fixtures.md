# Fixture specs

Fixtures are git repos materialized at eval time (skill-creator builds them into its workspace, mirroring `editor-in-chief-workspace/fixtures/`). Each needs a `main` base branch and a checked-out feature branch:

- **trivial-one-liner** — feature branch with one commit: a 2-line typo fix in a README plus a version bump in a config file. No tests.
- **risky-small-diff** — feature branch with one commit: ~15 lines changing session-cookie handling in `src/auth/session.ts` (path must match the Tier 1 defaults). A tiny vitest suite exists and passes.
- **oversized-mixed-concerns** — feature branch with commits totalling >400 changed source lines: a mechanical rename across ~10 files interleaved with a real behavior change in 2 of them.
- **update-preserves-human-content** — any small branch; the point is the `gh` shim: a fake `gh` on PATH whose `pr view --json` returns a body containing a ticked markdown checklist and an `![before](...)` image, and whose `pr edit` logs its invocation to a file the grader checks (must be empty unless approval was given).
- **ui-change-screenshots** — feature branch changing a React component's rendered output and an onClick behavior (~30 lines, Tier 3 paths).
- **no-commits-ahead** — feature branch pointing at the same commit as `main`.
