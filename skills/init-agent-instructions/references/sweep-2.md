# Sweep 2 — Generate

Read in full when `SKILL.md`'s state table selects sweep 2. Fan-out subagents read this file too — it is the
complete generation contract; nothing in `SKILL.md` or `sweep-1.md` is needed to generate a guide.

## 2.0 Gate

Re-read `_ins/2-decisions.md` in full — the user edited it. Grep the REQUIRED sections (§A, §B, §C, §D) for the
literal token `[mark]`. Any hit → rewrite `0-recap.md` as variant B listing each (section · item · line), post the
same list in chat, and stop. Nothing is generated. OPTIONAL blanks (§E–§H) never block: take the safer reading and
record it in the master's "Safer readings taken".

## 2.1 Compile `4-master.md`

From `1-audit.md` + `2-decisions.md` + `3-automation.md`, fill `templates/ins/4-master.md` section-for-section.
Decisions override inferences everywhere. The **Prose exclusion list** is every §D row routed `lint`; rows routed
`prose-interim` carry the exact marker form from the template. The master is the **only** input generation reads —
if a fact isn't in it, generation may not use it. Subagents receive the master path, not the three source files.

## 2.2 Generate / reconcile (one sweep, no questions)

- **Order:** root first, inline, in the main context — every other guide inherits from it, so it must be final
  before anything else starts. Then the workspaces: each app or package immediately followed by any domain
  subtrees inside it. Domains ride with their enclosing workspace, never as a trailing phase.
- **Fan out past ~5 workspaces.** At or below that, generate inline in the order above. Above it, launch one
  general-purpose subagent per workspace (Agent tool), all in a single message so they run in parallel. Each
  subagent's prompt carries: the absolute path to this skill's directory (it reads its own template and this
  `references/sweep-2.md` itself), the workspace path with its master coverage row, the path to `_ins/4-master.md`,
  and the path to the final root guide. Each subagent handles its workspace **and its domain subtrees**, writes the
  `AGENTS.md`, and returns in its summary: files written · line counts · remaining `[PLACEHOLDER]`s · invariant
  concerns · discovered-while-generating lines. **Subagents never write to `_ins/`** — the orchestrator appends
  their returned discoveries after collecting all results, so parallel runs never contend for one file.
- **Non-interactive:** never stop to ask mid-sweep. Ambiguity discovered mid-run → take the safer reading, append
  one entry to `2-decisions.md` → `## Post-sweep` (what, where, the assumption taken, the exact file + section where
  the real answer belongs — subagents report it in their summary instead), and keep moving.

For each workspace in the master's coverage plan:

1. **Select the template:** root → `templates/root.md` · app → `templates/app.md` · package →
   `templates/package.md` · domain → `templates/domain.md`. If the master names a golden in-repo example, match
   its shape instead. A golden example governs tone and formatting only — the section skeleton comes from the
   template, required sections drop only via the master's Section accounting, and nothing waives the required
   metadata contract (step 2) or the legend's authority columns.
2. **Fill it in:** replace every `[PLACEHOLDER]` with the master's value; replace `<!-- guidance -->` blocks with
   real content. Substitute the master's toolchain throughout: if the orchestrator is Nx, do **not** mention
   `turbo.json` or Turborepo anywhere (the reverse for Turborepo; no orchestrator → remove orchestrator-specific
   lines rather than leaving them); use the detected package-name scope in every import example, `--filter`, and
   enforcement grep — never `@repo/` unless that is the actual scope; use the real script names from the master
   (`typecheck:all`, a `Makefile` target), never the template's defaults. Sections whose template comment marks
   them policy-gated are included only when the master's Adopted policies says so — otherwise omit them entirely.
   **Required metadata contract (every workspace file, no exceptions — root included):** the file opens with the
   title, a one-line purpose (name the framework/role/package-kind here — no separate row for them), a
   `Change posture:` line (`locked | guarded | standard | open` + parenthesized qualitative inputs, exactly as the
   master states it), then exactly these bullet rows: `- **Blast radius:**` (packages only — apps omit it, their
   blast is their users; values `repo-wide · several workspaces · one workspace (name) · build/CI only · leaf (no
   consumers)`, no consumer counts — counts drift), `- **Status:**` (`supported | experimental | deprecated |
   frozen` — always present, even when supported: a missing row means "not yet audited", never "default"), and —
   **only when the master adopted the sensitive-data row** (repos with no such domain skip it everywhere rather
   than stamping a meaningless `no`) — the flag named for the repo's own label: `- **PHI:** yes | no` for
   healthcare, `- **PII:**` elsewhere, with the value the master derived from reading the source. Tooling and PR
   agents grep these exact phrases. Extra factual bullets may follow when load-bearing (a backend app's
   Port/Deploy, a package's non-obvious Entry) — but never invent a new named row without adding it to the root
   legend. There are no other reserved rows: Framework/Runtime/Published/toolchain-version rows are banned as
   derivable, drift-prone, or noise. Domain (subtree) files carry only a `Status:` line.
3. **Merge, never clobber.** If a real file exists at this scope, it may contain hard-won domain knowledge the
   templates can't infer:
   - Treat the existing file as the source of truth for any rule it states. The template provides *structure*; the
     existing content provides *substance*.
   - Place each existing rule/decision under the matching template section, keeping its original wording unless
     it's stale. A `## Merged from CLAUDE.md` section is existing content too: fold each of its lines into the
     matching section and remove the heading — none may survive into the committed file.
   - Only drop existing content that is (a) demonstrably stale, (b) pure restatement of a template default, or
     (c) on the master's Prose exclusion list — every drop is already listed in the master's Merge plan.
   - When existing and template guidance conflict, the existing file wins unless the master says otherwise (a §A
     decision or a flipped §B policy beats existing content).
   - Accounting runs both directions: every **template** section is in the master's Section accounting as filled,
     merged, or skipped-with-reason. Sections with no counterpart in the existing file (e.g. Comments &
     documentation, Planning before building) are generated from inference — never silently dropped because the old
     file lacked them.
4. **Prose gate.** Before writing any convention line (a MUST / MUST NOT / never / always / prefer, a naming row,
   an import rule, an enforcement `rg` snippet), check it against the master's Prose exclusion list and
   `references/lint-catalog.md`. On the exclusion list as `lint` → do not write it; the only trace anywhere is the
   root CI/CD section's single "Lint-enforced conventions" pointer (included only when the master says a config
   exists). Routed `prose-interim` → write it once, at the workspace it applies to, with the exact marker
   `(interim — lint rule pending: <rule id>)`. In the catalog but not on the list (the scout missed it) → treat it
   as `lint`, omit it, and add a Post-sweep entry so §D can be completed. Not in the catalog and not expressible as
   a simple selector → prose is the right home; write it.
5. **Remove sections that don't apply** rather than leaving them empty (a11y for backends, Port for frontends, Data
   access for FE-only, peer-deps with no framework peers, generated-files notes when there's no codegen, Watch mode
   when there's no dev script, Enforcement Checks when every check went to lint). Do not leave empty sections.
6. **Keep generic content out** — lines the master marked for relocation go to the recap's paste block, not the
   repo file.
7. **Invariant callout:** if any of these hold, add a `> ⚠ INVARIANT CONCERN:` note at the top of the file: a
   `utility`/`types` package with framework deps in `dependencies`; a `config` package with runtime deps; a
   `universal` package using `node:*`; a package importing from `apps/`; an app importing another app.
8. **Resolve docs & planning references** (the root Documentation & Specs section or the app/package equivalent):
   - `docs/` missing → keep the "create it" callout as an instruction to the human; note it in the recap.
   - `docs/specs/` has files → list up to 3 recent specs by name so the naming pattern is concrete.
   - Custom skills found → reference them by name in the planning process (e.g. "Use `/brainstorm` before writing
     the design spec. Use `/plan` for the implementation plan."). None found → generic language.
   - `docs/architecture.md` exists → add it to the reference-docs bullet with a note on what it covers.
   - Every "read X for depth" pointer cites a doc the master's Documentation section marks as a preferred source —
     never one marked stale or duplicate.
9. **Write the docs map** (root sweep only, and only if the master says `write` or `refresh`): `docs/docs-map.md`,
   generated from the master's Documentation section — the *judgments* about the repo's documentation, not a census.
   Contents: conflicts awaiting a decision at the top; the preferred-source-per-topic table; a short list of
   known-stale, duplicate, or orphaned docs with the evidence. No per-doc inventory rows and no dates — the full
   list is derivable (`git ls-files '*.md'`) and dates go stale immediately; anything derivable in the map is drift.
   Header notes it is maintained by this skill — regenerate, don't hand-groom. The root guide's documentation
   section points here.

### Output constraints (apply to every generated file)

- **~200 lines is the ceiling, not the aim.** Aim for the shortest file where every line is non-inferable — root
  lands around 100-120 lines, deltas as short as their real delta. A little over the ceiling is fine only when
  every line is load-bearing: the enemy isn't line 201, it's the file where real rules drown in reference material.
  The budget **stacks** — root + workspace delta (+ domain router) load together, on top of user-level config — so
  audit the stacked total per working directory (~300 lines is the alarm), not just each file. Root loads in
  *every* session; it is the most expensive file — cut there first.
- **Offload, don't inline.** Path-specific or rarely-needed detail goes to `.claude/rules/` (loads only when
  matching files are touched) or `docs/`, with a pointer; reserve the root guide for facts needed in every session.
  `.claude/rules/` is Claude-only — offload there only what other tools can afford to miss; anything cross-tool goes
  to `docs/` or a domain `AGENTS.md`. When preserved hand-written content pushes a file past budget, propose
  specific offloads in the recap — never silently accept the growth, and never fix it by cutting load-bearing local
  footguns (ordering constraints like "middleware X stays last", registration steps, non-obvious wiring): those are
  the delta's reason to exist; cut style and reference material instead (most of which the prose gate already
  removed). A footgun with no home is a Post-sweep entry, not a cut.
- **Inventories don't scale — summarize, don't census.** Don't emit one row per workspace in the root file of a
  large monorepo: group packages by category, name only the load-bearing ones, and point at the workspace manifest
  or a docs map for the full list (it's derivable — e.g. `pnpm ls -r --depth -1` — so duplicating it is drift). A
  full per-workspace table is fine up to ~8 workspaces.
- **Concrete over vague:** "run `pnpm test` before committing" beats "test your changes."
- **Don't put procedures in a guide.** Multi-step workflows belong in a skill (`.claude/skills/`), lifecycle
  automation in hooks.
- **Domain (subtree) files are different:** target ~30-50 lines and act as a *router* — local conventions plus
  pointers to the matching developer-guide doc, sibling contract, or custom agent. No metadata block, no commands,
  no PR checklist (all inherited from the enclosing guide). Title is the area name (e.g. "Event Handlers"). Model
  the tone on existing subtree contracts; link depth, don't inline it.

### Writing the file

Write `AGENTS.md` in the workspace directory. Nothing else: no `CLAUDE.md`, no symlink, no import stub. If a
`CLAUDE.md`-family file has reappeared since preflight (another branch, a tool), apply the `sweep-1.md` → 1.0
table to it and log a Post-sweep entry. Only write files the master marked create/reconcile.

## 2.3 Recap

Rewrite `_ins/0-recap.md` as variant C — every master coverage row with its outcome, the posture roll-call (call
out any value that differs from §C), stacked budgets per working directory and the deepest chain's byte size, the
merge result, and the human to-dos — then post a 3-5 line pointer in chat with the Post-sweep count. `_ins/` is
per-run: the user resolves the Post-sweep entries, applies them, and deletes the folder before the PR merges — a
committed run journal goes stale immediately and reads as current guidance to future agents. Never add `_ins/` to
`.gitignore` on the user's behalf, and never delete it yourself unless asked.
