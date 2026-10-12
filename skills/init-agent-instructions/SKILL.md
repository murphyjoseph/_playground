---
name: init-agent-instructions
description: >-
  Deterministic two-sweep command (run via /init-agent-instructions only) that audits, generates, and
  reconciles a repository's AGENTS.md files. AGENTS.md only: Claude Code reads it natively, so sweep 1 removes
  every CLAUDE.md in the repo after merging any unique content into its AGENTS.md. Sweep 1 detects the
  toolchain, audits existing guides for contradictions, staleness, over-length, generic and lint-enforceable
  content, runs a lint scout, and writes the review folder `_ins/` (recap · audit · decisions · automation).
  The user marks the required decisions; sweep 2 compiles them into `_ins/4-master.md` and generates one
  AGENTS.md per workspace (root + every app + every package, plus domain subtrees where warranted) from scoped
  templates.
disable-model-invocation: true
argument-hint: "[root|app|package|domain] [fresh] — scope optional; `fresh` discards _ins/ and reruns sweep 1"
allowed-tools: Read, Grep, Glob, Bash, Write, Edit, Agent
---

# Init Agent Instructions

Set up and maintain a repository's agent instruction files. The output is one `AGENTS.md` per workspace — the
vendor-neutral file every coding agent reads. Claude Code reads it natively (v2.1.277+); there is no `CLAUDE.md`,
no symlink, no import stub. Any `CLAUDE.md`-family file inside the repo is removed in sweep 1 (content preserved)
because under Claude Code's default setting a `CLAUDE.md` anywhere in the working directory or its ancestors
suppresses every `AGENTS.md` below it.

The work happens in **two sweeps** with a human review between them. They never run in the same session by
design, so each sweep's procedure lives in its own reference file and only the one that runs is loaded:

| Sweep | Procedure | Does | Writes | Ends with |
| --- | --- | --- | --- | --- |
| **1 — Discover** | `references/sweep-1.md` | preflight (CLAUDE.md removal) → detect → read → audit → lint scout | `_ins/0-recap.md` · `1-audit.md` · `2-decisions.md` · `3-automation.md` | "mark the REQUIRED decisions, then run me again" |
| **2 — Generate** | `references/sweep-2.md` | gate on decisions → compile master → generate every guide → recap | `_ins/4-master.md` · every `AGENTS.md` · `docs/docs-map.md` (if marked) · rewrites `0-recap.md` | "resolve post-sweep items, delete `_ins/` before merge" |

`_ins/` at the repo root is the run's review folder; it reads in order. Every file in it comes from a template in
this skill's `templates/ins/` — output never invents a section, drops one, or reorders them:

| File | Role | Written by | Template |
| --- | --- | --- | --- |
| `0-recap.md` | entry point: status + what to do next | sweeps 1 and 2 (rewritten each time) | `templates/ins/0-recap.md` |
| `1-audit.md` | facts + findings; asks nothing | sweep 1 | `templates/ins/1-audit.md` |
| `2-decisions.md` | everything a human must mark; sweep 2's gate | sweep 1 (user marks; sweep 2 appends Post-sweep) | `templates/ins/2-decisions.md` |
| `3-automation.md` | what tooling enforces or could; proposed lint baseline | sweep 1 (lint scout) | `templates/ins/3-automation.md` |
| `4-master.md` | the compiled spec generation reads — nothing else | sweep 2 | `templates/ins/4-master.md` |

Skill assets, all relative to this skill's directory:

| Asset | Used by |
| --- | --- |
| `templates/root.md` · `app.md` · `package.md` · `domain.md` | sweep 2 — the generated guides |
| `templates/ins/*.md` | both sweeps — the five `_ins/` files |
| `references/agentsmd-best-practices.md` | sweep 1 — the audit rubric (also read by the sibling `audit-agent-instructions`) |
| `references/inference.md` | sweep 1 — per-scope reading lists, inference tables, dep-footprint vocabulary, posture derivation |
| `references/profile-brief.md` | sweep 1 — the workspace-profiler subagent (code reading fanned out past ~8 workspaces) |
| `references/lint-catalog.md` · `lint-brief.md` | sweep 1 — the lint scout subagent; sweep 2's prose gate reads the catalog |

**Where this skill's files live:** every `templates/` and `references/` path is relative to **this skill's own
directory** (the folder containing this SKILL.md — e.g. `~/.claude/skills/init-agent-instructions/`), never the
target repo. Resolve them there. If a read fails, stop and say so — do not reconstruct a template or procedure from
memory; output generated without having read the actual files is invalid.

**Fresh repo vs. existing files:** same command. A fresh repo (no `AGENTS.md` anywhere) just has an empty audit
and few decisions. Existing files get audited against the rubric, surfaced in `_ins/`, and in sweep 2
**reconciled** into the template structure rather than overwritten — preserve correct repo-specific content, fix
what the audit flagged.

**The principle that decides what goes in a guide:** a guide carries only what tooling cannot check. Every
convention a linter, the compiler, a formatter, or a CI check can enforce is routed to `3-automation.md` and the
lint config, and the guide names the tool once. "Lint isn't in CI yet" is a reason to propose the baseline (sweep 1
does), never a reason to write the rule as prose.

---

## Which sweep runs

Decide from the repo's state, say in chat which sweep is starting, then read that sweep's reference file **in
full** and follow it:

| State | Run |
| --- | --- |
| `fresh` argument, or no `_ins/2-decisions.md` | **Sweep 1** → `references/sweep-1.md` (`fresh` deletes any existing `_ins/` first) |
| `_ins/2-decisions.md` exists and `_ins/4-master.md` does not | **Sweep 2** → `references/sweep-2.md` (its gate runs first) |
| `_ins/4-master.md` exists | Sweep 2 already ran. Report `0-recap.md`'s status; offer `fresh` to start over, or deletion of `_ins/` if the user is done. Do not regenerate. |

Same-session shortcut: if the user marks decisions in chat right after sweep 1, fold every answer into
`2-decisions.md` first (the file is the source of truth), then run sweep 2.

The scope argument (`root` | `app` | `package` | `domain`) narrows both sweeps to one workspace, resolved from the
current working directory (inside a workspace dir with no argument: under an app glob → **app**, otherwise
**package**). `_ins/` still lives at the repo root.

---

## Edge cases

- **Not a JS/TS repo / no `package.json`:** say so and stop. This skill is built around the JS/TS monorepo
  templates; don't force them onto an unrelated repo. Preflight (`sweep-1.md` → 1.0) still runs if asked —
  removing stray `CLAUDE.md` files is useful in any repo — but say that is all that happened.
- **Single `package.json`, no workspace manifest:** not this skill's lane; say so and stop. If the user explicitly
  wants a root-only guide anyway, `sweep-1.md` → 1.1 says how.
- **Existing files are already excellent and coverage is complete:** sweep 1 still writes `_ins/` (an honest
  audit says "none" a lot) and the recap says "in good shape — sweep 2 would change nothing; delete `_ins/`". If
  the files are excellent but workspaces lack coverage, sweep 2 generates the missing deltas and leaves the good
  files alone.
- **`_ins/` is committed on the branch from an earlier run:** treat it as the current run's state (the table
  above) — never silently start over; `fresh` is the explicit reset.
- **Claude Code session can't read `AGENTS.md`** (pre-2.1.277, plugin disabled): the output is still `AGENTS.md`
  only. Say so in the recap and point at the docs' `@AGENTS.md`-import fallback as something the engineer may add
  locally — never generate it.
