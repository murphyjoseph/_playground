---
name: audit-agent-instructions
description: >-
  Read-only health audit of CLAUDE.md / AGENTS.md files across every git repo under ~/Sites (or a single
  repo passed as an argument). Finds drift (commands that no longer match package.json), stale path
  references, missing or malformed Change posture lines, broken or reversed AGENTS.md↔CLAUDE.md symlinks,
  over-length or generic content, and workspaces with no coverage — then writes one report per repo to
  ~/Sites/reviews/agents-md/. Use whenever the user asks to audit, check, sweep, or find discrepancies in
  CLAUDE.md, AGENTS.md, or agent instruction files, asks "are my agent docs stale", or on a scheduled
  (e.g. monthly) sweep. Never edits or generates instruction files — fixes belong to
  /init-agent-instructions run in the affected repo.
argument-hint: "[repo-path] — optional; omit to sweep all of ~/Sites"
allowed-tools: Read, Grep, Glob, Bash, Write, Task
---

# Audit Agent Instructions

Audit the health of `CLAUDE.md` / `AGENTS.md` files and report findings. This skill is the read-only
companion to `/init-agent-instructions`: that skill scaffolds and fixes; this one only observes, so it is
safe to run unattended on a schedule. **Never create, edit, or delete any file inside a target repo.**
The only writes are reports under `~/Sites/reviews/agents-md/`.

## 1 — Load the rubric

The audit criteria live in the sibling skill's rubric:
`../init-agent-instructions/references/claudemd-best-practices.md`, resolved relative to **this skill's
directory** (both skills are installed side by side, so the sibling path resolves; if it doesn't, try
`~/.claude/skills/init-agent-instructions/references/claudemd-best-practices.md`). Read it in full — it
defines what counts as a finding. If it cannot be found, stop and say so; auditing from memory would
produce findings the fix-it skill doesn't recognize.

## 2 — Enumerate targets

- **With a repo-path argument:** audit just that repo.
- **Without:** every directory directly under `~/Sites` that contains a `.git`. Never descend into
  `node_modules`, build output, or `.git` itself.

For each repo, glob for `CLAUDE.md` / `AGENTS.md` anywhere inside (excluding `node_modules`). A repo with
neither file gets no audit — record it as **no coverage** in the summary instead. That absence is a
signal, not an error.

## 3 — Audit each repo (fan out)

When sweeping multiple repos, launch one read-only subagent per repo via the Task tool — up to 4 at a
time, in a single message per batch so they run in parallel. Each subagent gets: the repo path, the full
rubric text (paste it into the prompt — subagents can't be assumed to resolve this skill's directory),
and the checklist below. It returns compact findings only (path · severity · issue · suggested fix), not
file dumps. For a single-repo run, do the checks directly.

Per repo, in rough order of cheapness:

**Mechanical checks — run them, don't eyeball:**
- **Twin state.** For every instruction-file location: the healthy state is `AGENTS.md` as the real file
  and `CLAUDE.md` a symlink to it (`ls -la` / `readlink`). Findings: missing twin, broken symlink,
  reversed arrangement (real `CLAUDE.md`, symlinked `AGENTS.md`), or two real files — if two real files,
  also `diff` them; drift between them is a separate, higher-severity finding.
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
misleads an agent (drifted twins, wrong commands, contradictions); **medium** = missing contract
(posture line, coverage gap, broken symlink); **low** = hygiene (length, generic content).

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
