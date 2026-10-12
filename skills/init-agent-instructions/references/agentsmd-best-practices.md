# AGENTS.md best practices (operationalized)

Load this during the audit. Every rule below is checkable. A violation is a finding.

## File mechanics
- `AGENTS.md` is the only instruction file. Claude Code (v2.1.277+) reads it natively; Cursor, Codex and the rest
  read it by convention. Any `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` in the working directory **or
  any ancestor** switches Claude Code back to CLAUDE.md-only under its default setting and silently skips every
  `AGENTS.md` in the repo. So: a `CLAUDE.md`-family file inside the repo = finding (high if its content differs
  from the sibling `AGENTS.md`, medium otherwise); a `CLAUDE.local.md` = low (personal, flag the settings fix);
  an ancestor file above the repo = medium, machine-local — report it with the user-level fix
  (`~/.claude/settings.json` → `pluginConfigs` → `cc-plugin-agents-md@builtin` → `instructionFiles:
  "claude-md-and-agents-md"`); never touch files outside the repo.
- Nested `AGENTS.md` files in subdirectories load on demand when Claude reads files there; only root/ancestors
  load at startup. Push specifics down into per-workspace files and keep root lean — nested files are cheap.
- `@path` imports inside a file expand at load, max depth 4 hops. Use to pull shared content; don't chain deep.
  Imports inside fenced code blocks are NOT expanded (safe to show a literal `@path`).
- Cross-tool cap: Codex concatenates the AGENTS.md chain (global → root → cwd) and silently truncates past
  32 KiB by default. The deepest root→leaf chain (root + workspace + domain) approaching that = finding — trim or
  restructure before Codex users lose the tail.

## Length & density (hard rules)
- ~200 lines is the CEILING, not the aim. The aim is the shortest file where every line is non-inferable: root
  around 100-120 lines, deltas as short as their real delta. Over the ceiling = finding: split into nested files or
  cut. (A finding to surface and weigh, not an automatic cut — a dense 220-line root can pass; a padded 150-line
  delta can't.)
- Context stacks per session: root + workspace delta (+ domain router) load together on top of user-level config.
  A working directory whose stacked total tops ~300 lines = finding — adherence degrades before any single file
  looks long. Root loads in every session; cut there first.
- App/package files are DELTAS. A rule already stated in root, repeated in a child = finding. Children document
  only what differs or is additive.
- Every line must be repo-specific. If a line is true of any TS/React/Node project, cut it. Template sections are
  proposals, not defaults: opinionated policies (design invariants, TSDoc rules, mock bans) enter a repo's guide
  only via `2-decisions.md` §B.

## Include, highest-ROI first
1. Commands — exact, with flags (`pnpm --filter web test`, not "run tests"). Highest-ROI section.
2. Project structure — where things live, one line each. In a large monorepo, group workspaces by category and
   point at the manifest for the census — one row per workspace stops scaling past ~8.
3. Boundaries — what's in scope vs out of scope; what's forbidden and where it belongs instead.
4. Non-default code style that **no tool can check** — see "Lint-enforceable prose" below; most style rules fail
   this test and belong in the lint config.
5. Scaffolding — exact ordered steps for the most common operation, concrete enough that two separate sessions
   produce identical output.
6. Testing — runner, location, what not to mock.

## Exclude (each = finding)
- **Lint-enforceable prose.** A convention that a linter, the compiler, a formatter, or a CI check can enforce
  (`references/lint-catalog.md` has a row for it, or the repo's installed plugins do) does not belong in a guide —
  it belongs in the config, and the guide names the tool once. Severity: medium when the rule is enforced today or
  one line away (classes A/B — the prose is pure duplication); low when a plugin is still needed (class C/D).
  Exception: a line the user routed `prose-interim` in `2-decisions.md` §D, carrying the exact marker
  `(interim — lint rule pending: <rule id>)`. An interim line without the marker = finding. Typical offenders:
  "no `any`", "no `console.log`", import order, naming tables, "use `import type`", "no empty catch", "arrow
  function components", "no cross-app imports" (when `import/no-restricted-paths` or Nx boundaries can carry it).
- Generic engineering principles the model already knows: "write clean code", "be direct, no sycophancy",
  "challenge my reasoning", "always choose the correct fix over the quick fix". These belong in user-global
  `~/.claude/CLAUDE.md`, not per-repo. Flag them and offer to relocate.
- Restating framework defaults (e.g. "use React function components" in a React repo).
- Duplicating README content.
- Restating anything a canonical docs site owns. When the repo has one, guides POINT at its pages and carry only
  agent-behavior deltas; on contradiction the docs site wins and gets corrected in the same PR. Two sources for one
  rule guarantee a future contradiction.
- One-time procedures / runbooks — those belong in a skill, not a guide.
- Vague rules: "format properly", "handle errors well". Demand a concrete replacement ("no empty catch blocks") —
  and then check whether the concrete form is lint-enforceable (it usually is).
- Export inventories in scope/"Provides" lines — a photocopy of the entry file that drifts, and symbol names are
  unverifiable by CI. State the ROLE; name a symbol only when it is itself the contract (a port interface) or
  carries a footgun. The test for any line: can an agent derive it from the code in under a minute? If yes, cut it.
- Aspirational rules nothing enforces.
- Shell "enforcement check" snippets (`rg "console\." src || echo OK`) that re-implement a lint rule — the check
  is `pnpm lint`; keep only checks lint cannot express (generated files in sync, `dist/` untracked).

## Consistency checks (the audit's core)
- Commands in the file must match `package.json` scripts. Drift = finding.
- Every path / file / glob referenced must exist. Stale reference = finding.
- Naming conventions must be identical across root and all children. Contradiction = finding — and if the
  codebase itself is split, it is a `2-decisions.md` §A item, not something to codify either way.
- Runtime / dependency claims must match `package.json` + `tsconfig.json`. Mismatch = finding (ties to the
  dep-footprint invariants in the root template's package-design section).
- Every workspace file opens with title + one-line purpose + `Change posture: <word> (<inputs>)` (exact phrase,
  one of `locked|guarded|standard|open`, parenthesized inputs) + bullet rows `**Status:**` (all workspaces), the
  sensitive-data flag named for the repo's label (`**PHI:**`/`**PII:**` with `yes|no` — only in repos that
  adopted it; its presence/absence must be uniform, mixed = finding), and `**Blast radius:**` (packages only —
  apps omit it), values per the root legend, no consumer counts anywhere (they drift). Missing or off-format row
  = finding; an unrecognized named row not defined in the root legend = finding. Domain subtree files carry only a
  `Status:` line.
- The root posture legend must map each tier to agent authority ("may / must not"). A legend condensed to
  one-liners without the authority mapping = finding.
- A leftover `## Merged from CLAUDE.md` section (sweep 1's holding area) in a committed guide = finding — sweep 2
  folds it into the template sections and removes the heading.

## Coverage, practices & documentation
- **Coverage gap.** Every workspace resolved from the manifest globs — including config and types packages —
  carries an `AGENTS.md`; a missing one = finding ("the root covers it" is not a reason). Every domain-subtree
  candidate (same-suffix file clusters, a base class extended across many files, a registration/codegen step, a
  matching dev-guide doc) appears in the coverage plan with generate/skip and the evidence; a candidate skipped
  silently = finding.
- **Practice contradiction.** The codebase does one thing two ways, or a guide claims a convention the code does
  not follow. Neither variant may be codified until a human picks one: it is a `2-decisions.md` §A item with the
  variant table (paths and counts allowed there), one item per topic however many instances exist. A guide that
  already codifies one side of a live split = finding (high — it misleads agents in half the files).
- **Documentation conflicts and rot.** Two docs disagreeing on one topic (name which should win and why), a doc
  describing code that no longer exists, a duplicate of a canonical source, an orphan nothing links to = findings.
  Every topic ends with exactly one preferred source; "read X for depth" pointers in guides may cite only preferred
  sources.

## Self-maintenance (make drift fail CI, not reviews)
The audit above runs once; the durable defense is a conventions test written in **whatever test runner the repo
already uses** (per the toolchain detection — never introduce a new runner for this) that re-validates on every
run: metadata rows present with legal values, no `CLAUDE.md`-family files in the repo, blast-radius tiers
recomputed from the package-manifest dependency graph, no consumer counts anywhere (they drift), every referenced
repo path and script name actually exists (skip placeholder/glob tokens and lines that intentionally negate a
path), no `(interim — lint rule pending: X)` line whose rule `X` is now configured. For a docs site with
pre-existing rot, add the ratchet variant: freeze current violations in a committed burn-down file, fail new
violations immediately, and fail fixed-but-still-listed entries so the debt can only shrink. Both tests must
tolerate fresh checkouts: skip gitignored codegen paths and worktree/nested-checkout dirs. What such a test cannot
check — prose claims, symbol names — is covered procedurally (root rule: a change that falsifies a guide updates it
in the same PR) and by re-running this skill's sweep 1 periodically.

## Golden example
- If the repo already has an `AGENTS.md` that scores well on everything above, name it as the in-repo template
  and match its shape, rather than imposing the generic template. A real in-repo example beats a generic one.

## Right mechanism (wrong home for a rule = finding)
A guide is context, not enforced configuration — Claude Code injects it with a "may or may not be relevant"
caveat, so prose is a suggestion the model can judge past. Route each rule to the mechanism that fits; a rule in
the wrong home is a finding (name the better home):

| If the rule... | Belongs in |
|---|---|
| Is a syntax or import shape a tool can check | the lint config / tsconfig / formatter (`lint-catalog.md`) |
| Is a repo fact needed in every session | root `AGENTS.md` |
| Applies only to files matching a path (Claude-only) | `.claude/rules/*.md` with `paths:` globs |
| Is a per-directory authoring contract all tools should see | nested workspace/domain `AGENTS.md` |
| Is a multi-step procedure or workflow | a skill (`.claude/skills/`) |
| MUST hold regardless of the model's judgment | a PreToolUse hook or a CI check |
| Is a hard permission boundary | `settings.json` permissions / deny rules |
| Is a personal preference or tone rule | user-global `~/.claude/CLAUDE.md` |

Typical findings: a deterministic must-happen ("always run the formatter after edits") written as prose instead of
a hook; a hard boundary ("never touch prod config") with no deny rule behind it; a path-scoped convention sitting
in the root file where it costs every session; a lint rule written as a MUST.

---

Sources: Claude Code memory docs (code.claude.com/docs/en/memory.md — AGENTS.md section); agents.md spec
(agents.md); GitHub blog "how to write a great agents.md" (analysis of 2,500+ repositories).
