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
- Cross-tool cap: Codex concatenates the AGENTS.md chain (global → root → cwd) and silently truncates
  past 32 KiB by default. The deepest root→leaf chain (root + workspace + domain) approaching that =
  finding — trim or restructure before Codex users lose the tail.

## Length & density (hard rules)
- ~200 lines is the CEILING, not the aim. The aim is the shortest file where every line is non-inferable:
  root around 100-120 lines, deltas as short as their real delta. Over the ceiling = finding: split into
  nested files or cut. (A finding to surface and weigh, not an automatic cut — a dense 220-line root can
  pass; a padded 150-line delta can't.)
- Context stacks per session: root + workspace delta (+ domain router) load together on top of user-level
  config. A working directory whose stacked total tops ~300 lines = finding — adherence degrades before
  any single file looks long. Root loads in every session; cut there first.
- App/package files are DELTAS. A rule already stated in root, repeated in a child = finding. Children
  document only what differs or is additive.
- Every line must be repo-specific. If a line is true of any TS/React/Node project, cut it. Template
  sections are proposals, not defaults: opinionated policies (design invariants, TSDoc rules, mock bans)
  enter a repo's guide only via the plan doc's "Template policies to adopt".

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
- Restating anything a canonical docs site owns. When the repo has one, guides POINT at its pages and
  carry only agent-behavior deltas; on contradiction the docs site wins and gets corrected in the same
  PR. Two sources for one rule guarantee a future contradiction.
- One-time procedures / runbooks — those belong in a skill, not CLAUDE.md.
- Vague rules: "format properly", "handle errors well". Demand a concrete replacement
  ("2-space indent", "no empty catch blocks").
- Export inventories in scope/"Provides" lines — a photocopy of the entry file that drifts, and
  symbol names are unverifiable by CI. State the ROLE; name a symbol only when it is itself the
  contract (a port interface) or carries a footgun. The test for any line: can an agent derive it
  from the code in under a minute? If yes, cut it.
- Aspirational rules nothing enforces.

## Consistency checks (the audit's core)
- Commands in the file must match `package.json` scripts. Drift = finding.
- Every path / file / glob referenced must exist. Stale reference = finding.
- Naming conventions must be identical across root and all children. Contradiction = finding.
- Runtime / dependency claims must match `package.json` + `tsconfig.json`. Mismatch = finding (ties to
  the dep-footprint invariants in the root template's package-design section).
- Each workspace has `AGENTS.md` + `CLAUDE.md` symlinked and in sync. Missing or broken twin = finding.
- Every workspace file opens with title + one-line purpose + `Change posture: <word> (<inputs>)` (exact
  phrase, one of `locked|guarded|standard|open`, parenthesized inputs) + bullet rows `**Status:**` (all
  workspaces), the sensitive-data flag named for the repo's label (`**PHI:**`/`**PII:**` with `yes|no` —
  only in repos that adopted it; its presence/absence must be uniform, mixed = finding), and
  `**Blast radius:**` (packages only — apps omit it), values per the root legend, no
  consumer counts anywhere (they drift). Missing or off-format row = finding; an unrecognized named row
  not defined in the root legend = finding. Domain subtree files carry only a `Status:` line.
- The root posture legend must map each tier to agent authority ("may / must not"). A legend condensed to
  one-liners without the authority mapping = finding.

## Self-maintenance (make drift fail CI, not reviews)
The audit above runs once; the durable defense is a conventions test written in **whatever test runner
the repo already uses** (per the Phase 1b toolchain detection — never introduce a new runner for this)
that re-validates on every run: metadata rows present with legal values, CLAUDE.md symlinks intact,
blast-radius tiers recomputed from the package-manifest dependency graph, no consumer counts anywhere
(they drift), every referenced repo path and script name actually exists (skip placeholder/glob tokens
and lines that intentionally negate a path). For a docs site with pre-existing rot, add the ratchet
variant: freeze current violations in a committed burn-down file, fail new violations immediately, and
fail fixed-but-still-listed entries so the debt can only shrink. Both tests must tolerate fresh
checkouts: skip gitignored codegen paths and worktree/nested-checkout dirs. What such a test cannot check — prose claims, symbol
names — is covered procedurally (root rule: a change that falsifies a guide updates it in the same PR)
and by re-running this skill's audit phase periodically.

## Golden example
- If the repo already has a `CLAUDE.md` that scores well on everything above, name it as the in-repo
  template and match its shape, rather than imposing the generic template. A real in-repo example beats
  a generic one.

## Right mechanism (wrong home for a rule = finding)
`CLAUDE.md` is context, not enforced configuration — Claude Code injects it with a "may or may not be
relevant" caveat, so prose is a suggestion the model can judge past. Route each rule to the mechanism
that fits; a rule in the wrong home is a finding (name the better home):

| If the rule... | Belongs in |
|---|---|
| Is a repo fact needed in every session | root `AGENTS.md`/`CLAUDE.md` |
| Applies only to files matching a path (Claude-only) | `.claude/rules/*.md` with `paths:` globs |
| Is a per-directory authoring contract all tools should see | nested workspace/domain `AGENTS.md` |
| Is a multi-step procedure or workflow | a skill (`.claude/skills/`) |
| MUST hold regardless of the model's judgment | a PreToolUse hook or a CI check |
| Is a hard permission boundary | `settings.json` permissions / deny rules |
| Is a personal preference or tone rule | user-global `~/.claude/CLAUDE.md` |

Typical findings: a deterministic must-happen ("always run the formatter after edits") written as prose
instead of a hook; a hard boundary ("never touch prod config") with no deny rule behind it; a path-scoped
convention sitting in the root file where it costs every session.

---

Sources: Claude Code memory docs (code.claude.com/docs/en/memory.md); agents.md spec (agents.md);
GitHub blog "how to write a great agents.md" (analysis of 2,500+ repositories).
