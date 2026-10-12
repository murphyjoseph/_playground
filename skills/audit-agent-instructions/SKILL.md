---
name: audit-agent-instructions
description: >-
  Read-only health audit of AGENTS.md files across every git repo under ~/Sites (or a single repo passed
  as an argument). Finds drift (commands that no longer match package.json), stale path references,
  missing or malformed Change posture lines, stray CLAUDE.md files (Claude Code reads AGENTS.md natively;
  a CLAUDE.md in the repo or an ancestor directory suppresses it), lint-enforceable prose, over-length or
  generic content, and workspaces with no coverage — then writes one report per repo to
  ~/Sites/reviews/agents-md/. Use whenever the user asks to audit, check, sweep, or find discrepancies in
  AGENTS.md or agent instruction files, asks "are my agent docs stale", or on a scheduled (e.g. monthly)
  sweep. Never edits or generates instruction files — fixes belong to /init-agent-instructions run in the
  affected repo.
argument-hint: "[repo-path] — optional; omit to sweep all of ~/Sites"
allowed-tools: Read, Grep, Glob, Bash, Write, Task
---

# Audit Agent Instructions

Audit the health of `AGENTS.md` files and report findings. This skill is the read-only companion to
`/init-agent-instructions`: that skill scaffolds and fixes; this one only observes, so it is safe to run
unattended on a schedule. **Never create, edit, or delete any file inside a target repo.** The only writes
are reports under `~/Sites/reviews/agents-md/`.

## 1 — Load the rubric

The audit criteria live in the sibling skill's rubric:
`../init-agent-instructions/references/agentsmd-best-practices.md`, resolved relative to **this skill's
directory** (both skills are installed side by side, so the sibling path resolves; if it doesn't, try
`~/.claude/skills/init-agent-instructions/references/agentsmd-best-practices.md`). Read it in full — it
defines what counts as a finding. Also read `../init-agent-instructions/references/lint-catalog.md` — the
lint-enforceable-prose check below depends on it. If either cannot be found, stop and say so; auditing from
memory would produce findings the fix-it skill doesn't recognize.

## 2 — Enumerate targets

- **With a repo-path argument:** audit just that repo.
- **Without:** every directory directly under `~/Sites` that contains a `.git`. Never descend into
  `node_modules`, build output, or `.git` itself.

For each repo, glob for `AGENTS.md` and every `CLAUDE.md`-family file (`CLAUDE.md`, `.claude/CLAUDE.md`,
`CLAUDE.local.md`) anywhere inside (excluding `node_modules` and `.claude/worktrees/`). A repo with none of
them gets no audit — record it as **no coverage** in the summary instead. That absence is a signal, not an
error.

## 3 — Audit each repo (fan out)

When sweeping multiple repos, launch one read-only subagent per repo via the Task tool — up to 4 at a
time, in a single message per batch so they run in parallel. Each subagent gets: the repo path, the full
rubric text (paste it into the prompt — subagents can't be assumed to resolve this skill's directory),
and the checklist below. It returns compact findings only (path · severity · issue · suggested fix), not
file dumps. For a single-repo run, do the checks directly.

Per repo, in rough order of cheapness:

**Mechanical checks — run them, don't eyeball:**
- **Stray `CLAUDE.md`.** The healthy state is `AGENTS.md` alone — Claude Code reads it natively, and any
  `CLAUDE.md`-family file in the repo or an ancestor directory suppresses every `AGENTS.md` below it under
  the default setting. Findings: a `CLAUDE.md` or `.claude/CLAUDE.md` inside the repo (**high** if its
  content differs from the sibling `AGENTS.md` — `diff` them; **medium** if it is a symlink, byte-identical,
  or an `@AGENTS.md` import stub); a `CLAUDE.local.md` (**low** — personal file, note the settings fix); a
  `CLAUDE.md`-family file in a directory above the repo root (**medium**, machine-local — report the
  user-level fix: `~/.claude/settings.json` → `pluginConfigs` → `cc-plugin-agents-md@builtin` →
  `instructionFiles: "claude-md-and-agents-md"`). A leftover `## Merged from CLAUDE.md` heading in a
  committed `AGENTS.md` is **medium** (an unfinished `/init-agent-instructions` run).
- **Change posture line.** Every workspace-level file must open with the exact phrase
  `Change posture:` followed by one of `locked | guarded | standard | open` plus parenthesized inputs.
  Grep for it; missing line or off-format value is a finding. Domain/subtree files (below a workspace's
  `src/`) are exempt.
- **Command drift.** Extract commands the files tell agents to run (fenced ```bash blocks and backticked
  `pnpm|npm|yarn|bun|make|nx|turbo …` invocations); check script names against the actual `package.json`
  `scripts` at the matching level. A documented command that doesn't exist is a finding.
- **Stale references.** Every relative path, file, or glob the files mention must exist. Check with
  `ls`/`glob`, not judgment.
- **Length.** Files over ~200 lines are findings to weigh (a dense 220 can pass; a padded 150 can't —
  say which it is).

**Judgment checks — apply the rubric:**
- Lint-enforceable prose (a convention line the lint catalog or an installed ESLint plugin can carry —
  "no `any`", "no `console.log`", import order, naming tables, "use `import type`" — written as a rule
  instead of living in the lint config; **medium** when the rule is already configured or the plugin is
  installed, **low** when a plugin is still needed; a line carrying the marker
  `(interim — lint rule pending: <id>)` is exempt).
- Generic content (true of any TS/Node project → belongs in user-global config, not the repo).
- Delta violations (child file restating a rule already in root).
- Vague or aspirational rules with nothing enforcing them.
- Contradictions between files (root vs child, or two children).

**Coverage gaps (JS/TS monorepos only):** resolve the workspace manifest globs (`pnpm-workspace.yaml`,
`workspaces` field, etc.) and list workspaces with no instruction file. Skip this and command drift in
non-JS repos — file mechanics and rubric checks still apply everywhere.

**Calibration:** a clean repo is a valid result — report it as clean rather than manufacturing findings
to look thorough. Mark uncertain findings as uncertain (e.g. "possibly stale — verify") instead of
asserting them.

## 4 — Write reports

One file per repo: `~/Sites/reviews/agents-md/<repo>.md`, overwritten each run (create the directory if
needed). Structure:

```markdown
# <repo> — agent instructions audit (<YYYY-MM-DD>)

Verdict: <N findings (worst: <severity>) | clean | no coverage>

## Findings
- **[high|medium|low]** `<path>` — <issue>. Fix: <suggested fix>.

## Coverage
<workspaces missing files, or "full">
```

A clean repo's report is the header plus "Verdict: clean" — nothing else. Severity: **high** = actively
misleads an agent (a `CLAUDE.md` whose content differs from `AGENTS.md`, wrong commands, contradictions);
**medium** = missing contract (posture line, coverage gap, stray `CLAUDE.md`, lint-enforceable prose with the
tool already present); **low** = hygiene (length, generic content, `CLAUDE.local.md`).

## 5 — Summarize in chat

End with one table — repo · findings · worst severity · verdict (clean / no coverage / N findings) — and
the fix line: run `/init-agent-instructions` inside any repo with findings. If every repo is clean, say
exactly that.

## Edge cases

- Dirty worktree or mid-rebase repo: audit anyway — everything here is read-only.
- A repo that is itself a skills/plugins repo (instruction files are *content*, e.g. templates with
  `[PLACEHOLDER]`s): audit only the repo's own top-level context files, not template assets under
  `templates/`, `skills/`, `stable/`, or `beta/`.
- Asked to fix something: decline and point at `/init-agent-instructions` — keeping this skill write-free
  is what makes it safe to schedule.
