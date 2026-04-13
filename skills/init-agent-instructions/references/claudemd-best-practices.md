# CLAUDE.md / AGENTS.md best practices (operationalized)

Load this during the audit phase. Every rule below is checkable. A violation is a finding.

## File mechanics
- Claude Code reads `CLAUDE.md` only; `AGENTS.md` is for other agents (Cursor, Codex, etc.). Keep
  them identical via a per-workspace symlink: `AGENTS.md` is the real file (vendor-neutral standard),
  `CLAUDE.md` is a symlink to it (`ln -s AGENTS.md CLAUDE.md`). Same bytes, zero drift.
- Nested `CLAUDE.md` in subdirectories load on demand when Claude reads files in that directory; only
  root/ancestors load at startup. So push specifics down into per-workspace files and keep root lean —
  nested files are cheap.
- `@path` imports inside a file expand at load, max depth 4 hops. Use to pull shared content; don't
  chain deep. Imports inside fenced code blocks are NOT expanded (safe to show a literal `@path`).

## Length & density (hard rules)
- Cap each file at ~200 lines. Over that = finding: split into nested files or cut.
- App/package files are DELTAS. A rule already stated in root, repeated in a child = finding. Children
  document only what differs or is additive.
- Every line must be repo-specific. If a line is true of any TS/React/Node project, cut it.

## Include, highest-ROI first
1. Commands — exact, with flags (`pnpm --filter web test`, not "run tests"). Highest-ROI section.
2. Project structure — where things live, one line each. In a large monorepo, group workspaces by
   category and point at the manifest for the census — one row per workspace stops scaling past ~8.
3. Boundaries — what's in scope vs out of scope; what's forbidden and where it belongs instead.
4. Non-default code style — naming, import rules, the project's own conventions (not framework defaults).
5. Scaffolding — exact ordered steps for the most common operation, concrete enough that two separate
   sessions produce identical output.
6. Testing — runner, location, what not to mock.

## Exclude (each = finding)
- Generic engineering principles the model already knows: "write clean code", "be direct, no
  sycophancy", "challenge my reasoning", "always choose the correct fix over the quick fix". These
  belong in user-global `~/.claude/CLAUDE.md`, not per-repo. Flag them and offer to relocate.
- Restating framework defaults (e.g. "use React function components" in a React repo).
- Duplicating README content.
- One-time procedures / runbooks — those belong in a skill, not CLAUDE.md.
- Vague rules: "format properly", "handle errors well". Demand a concrete replacement
  ("2-space indent", "no empty catch blocks").
- Aspirational rules nothing enforces.

## Consistency checks (the audit's core)
- Commands in the file must match `package.json` scripts. Drift = finding.
- Every path / file / glob referenced must exist. Stale reference = finding.
- Naming conventions must be identical across root and all children. Contradiction = finding.
- Runtime / dependency claims must match `package.json` + `tsconfig.json`. Mismatch = finding (ties to
  the dep-footprint invariants in the root template's package-design section).
- Each workspace has `AGENTS.md` + `CLAUDE.md` symlinked and in sync. Missing or broken twin = finding.
- Every workspace file opens with title + one-line purpose + `Change posture: <word> (<inputs>)` (exact
  phrase, one of `locked|guarded|standard|open`, parenthesized inputs). Missing line, off-format value,
  or missing inputs = finding. Domain subtree files are exempt.
- The root posture legend must map each tier to agent authority ("may / must not"). A legend condensed to
  one-liners without the authority mapping = finding.

## Golden example
- If the repo already has a `CLAUDE.md` that scores well on everything above, name it as the in-repo
  template and match its shape, rather than imposing the generic template. A real in-repo example beats
  a generic one.

## Enforcement vs context
- `CLAUDE.md` is context, not enforced configuration. For a rule that MUST hold regardless of the
  model's judgment, recommend a PreToolUse hook or a CI check, not just a `CLAUDE.md` line.

---

Sources: Claude Code memory docs (code.claude.com/docs/en/memory.md); agents.md spec (agents.md);
GitHub blog "how to write a great agents.md" (analysis of 2,500+ repositories).
