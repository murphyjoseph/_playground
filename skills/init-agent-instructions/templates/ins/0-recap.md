# Agent instructions — recap

<!-- Entry point of `_ins/`. Rewritten at the end of every sweep (and when sweep 2 is blocked). Write
     exactly ONE of the three variants below and delete the other two. No prose outside the variant.
     Everything here must be derivable from the other `_ins/` files — this is the summary, not a source. -->

Repo: `[repo-name]` · Sweep: `[1 | 2 | 2 (blocked)]` · Date: `[YYYY-MM-DD]`
Skill assets loaded: [sweep-N ✓ · templates ✓ · ins templates ✓ · rubric ✓ · inference ✓ · lint-catalog ✓ · lint-brief ✓ · profile-brief ✓ (N batches) | inline — name any that failed]

---

<!-- ===================== VARIANT A — after sweep 1 ===================== -->

## Status: sweep 1 complete — decisions required before sweep 2

**Next step:** mark every `[mark]` in [`2-decisions.md`](2-decisions.md), then run `/init-agent-instructions` again.
Sweep 2 refuses to start while any REQUIRED item still reads `[mark]`.

### Preflight (AGENTS.md only)
- CLAUDE.md files removed from the repo: `[N]` — `[N deleted (symlink/identical/import-only) · N renamed → AGENTS.md · N merged then deleted]`. Merged content sits under `## Merged from CLAUDE.md` in the affected `AGENTS.md` files until sweep 2 folds it in. Detail: [`1-audit.md` → Preflight](1-audit.md).
- `CLAUDE.local.md` found: `[none | paths]` — left in place (personal file); suppresses AGENTS.md loading unless the settings fix below is applied.
- Ancestor `CLAUDE.md` above the repo: `[none | /path/CLAUDE.md]` — not touched (outside the repo). On this machine it suppresses every `AGENTS.md` in the repo under Claude Code's default setting. Fix (user-level, per engineer, `~/.claude/settings.json`):
  ```json
  { "pluginConfigs": { "cc-plugin-agents-md@builtin": { "options": { "instructionFiles": "claude-md-and-agents-md" } } } }
  ```
- Verify in a new session: the start-up line should read `no CLAUDE.md found; AGENTS.md loaded: …` (or list both files once the setting is applied).

### Coverage
`[N]` workspaces resolved from the manifest · `[N]` with an existing `AGENTS.md` · plan: `[N create · N reconcile · N ok]` · domain candidates: `[N (N recommended generate)]`.

### Findings
`[N]` findings — `[N high · N medium · N low]` · worst: `[severity]` · `[N]` are lint-enforceable prose routed to [`3-automation.md`](3-automation.md). Full list: [`1-audit.md` → Findings](1-audit.md).

### Decisions
REQUIRED `[N]` (`[N practice contradictions · N template policies · N posture confirmations · N automation routes]`) · OPTIONAL `[N]`. Unanswered OPTIONAL items take the safer reading in sweep 2 and are logged in `4-master.md`.

### Automation
Lint today: `[none | ESLint N (legacy | flat | mixed) · plugins: …]` · in CI: `[yes | no]` · workspaces uncovered by any config: `[N]`.
Rules routed away from prose: `[N]` (`[N enforced today · N one line away · N need a plugin · N custom]`) · not automatable (stay in prose): `[N]`. Baseline proposal: [`3-automation.md` → Proposed lint baseline](3-automation.md).

---

<!-- ===================== VARIANT B — sweep 2 blocked ===================== -->

## Status: sweep 2 blocked — `[N]` REQUIRED decisions unmarked

Mark these in [`2-decisions.md`](2-decisions.md), then run `/init-agent-instructions` again. Nothing was generated.

| Section | Item | Line |
| --- | --- | --- |
| `[A · B · C · D]` | `[item title]` | `2-decisions.md:[n]` |

---

<!-- ===================== VARIANT C — after sweep 2 ===================== -->

## Status: sweep 2 complete

Compiled spec: [`4-master.md`](4-master.md). Post-sweep items needing a decision: `[N — see 2-decisions.md → Post-sweep | none]`.

**Cleanup:** `_ins/` is this run's journal. Resolve the Post-sweep items, apply them, then delete `_ins/` before the PR merges — a committed run journal goes stale immediately and reads as current guidance to future agents. The PR preserves the record.

### Files written
| Workspace | File | Lines | Outcome | Placeholders left |
| --- | --- | --- | --- | --- |
| `/` | `AGENTS.md` | `[n]` | `[created · reconciled · ok · skipped — why]` | `[N]` |
| `[apps/x]` | `AGENTS.md` | `[n]` | … | … |
| `[pkg/src/dir]` | `AGENTS.md` (domain) | `[n]` | … | … |

Every coverage-plan row from `1-audit.md` appears above, so completeness is verifiable.

### Posture roll-call
<!-- The human-in-the-loop risk check. Call out any value that differs from the confirmed value in 2-decisions.md §C. -->
- `locked`: `[workspaces | none]`
- `guarded`: `[…]`
- `standard`: `[…]`
- `open`: `[…]`
- Differs from §C: `[none | workspace — was X, now Y, because …]`

### Stacked context budget
<!-- Per working directory: root + workspace delta (+ domain router). ~300 lines is the alarm. -->
| Working directory | Root | Delta | Domain | Total | Flag |
| --- | --- | --- | --- | --- | --- |
| `[apps/x]` | `[n]` | `[n]` | `[n or —]` | `[n]` | `[ok | over — offload proposed in 4-master.md]` |

Deepest AGENTS.md chain byte size (Codex 32 KiB cap): `[n KiB — ok | over]`.

### Merge result
`[none — fresh repo | per workspace: preserved / restructured / dropped (with reasons) — summary; detail in 4-master.md → Merge plan]`
`## Merged from CLAUDE.md` sections folded and removed: `[N | n/a]`.

### Still to do by a human
- Invariant concerns flagged: `[none | workspace — concern]`
- `docs/` or `docs/specs/` to create: `[no | yes — command]`
- `docs/docs-map.md`: `[written — N topics · N stale/duplicate · N conflicts pending | refreshed | skipped — write: no]`
- Generic content approved for relocation to `~/.claude/CLAUDE.md`: `[none | block below — not written outside the repo]`
- Lint baseline: `[3-automation.md → Proposed lint baseline — tier 0 first: make the existing config run in CI]`
- Post-sweep decisions: `[N — 2-decisions.md → Post-sweep]`

```markdown
[generic content block to paste into ~/.claude/CLAUDE.md — only if approved; otherwise delete this fence]
```
