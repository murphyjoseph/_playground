---
description: "Full PR review: visual change map plus parallel domain reviewers (security, perf/scale, correctness, architecture, readability) with prioritized, confidence-calibrated findings, readability wins, and paste-ready comment drafts"
argument-hint: "[pr-number | pr-url | branch]  (empty = current branch vs default)"
---

Orchestrate a multi-domain PR review. Follow these steps exactly.

## 1. Resolve the target

Input: `$ARGUMENTS`
- PR number or GitHub PR URL → PR mode: `gh pr view <n> --json number,title,author,baseRefName,headRefName,body,additions,deletions,changedFiles`
- Branch name → branch mode against that branch.
- Empty → branch mode on the current branch.

Base branch: PR mode uses baseRefName; otherwise `gh repo view --json defaultBranchRef -q .defaultBranchRef.name` (fallback: `git symbolic-ref refs/remotes/origin/HEAD`). Run `git fetch origin <base>` so the merge-base is current.

Fail fast with the exact remedy command if: not a git repo, PR mode and `gh auth status` fails, PR not found, or the diff is empty ("nothing to review on <branch> vs <base>").

## 2. Materialize the code and diff

PR mode, when the PR head is not the current checkout:
```
git fetch origin pull/<n>/head
git worktree add --detach /tmp/pr-review-<n> FETCH_HEAD
```
REPO_ROOT = that worktree. Never switch the user's checkout. Otherwise REPO_ROOT = current directory.

With BASE = `git merge-base origin/<base> <review-head>`:
```
mkdir -p /tmp/pr-review-<id>
git diff <BASE> [<head>]            > /tmp/pr-review-<id>/full.diff
git diff <BASE> [<head>] --stat     > /tmp/pr-review-<id>/stat.txt
git diff <BASE> [<head>] --name-status > /tmp/pr-review-<id>/files.txt
```
Branch mode on the current branch omits `<head>` so uncommitted changes are included; note that in the report header. Triage mode = more than 4000 changed lines or more than 60 files.

## 3. Fan out: six agents, one message, in parallel

Launch ALL SIX Agent calls in a single message so they run concurrently. subagent_type values: pr-cartographer, pr-security-reviewer, pr-perf-reviewer, pr-correctness-reviewer, pr-architecture-reviewer, pr-readability-reviewer.

Every prompt contains the same context block:
- REPO_ROOT, the three artifact paths, BASE and head refs
- PR title, author, description (or branch name and commit subjects)
- "Triage mode: yes|no"
- "Follow the output contract in your agent instructions."

Do not review anything yourself while they run; your job is orchestration and assembly.

## 4. Assemble the report

Merge the four defect reviewers' findings:
- Dedupe: same file:line and same root cause reported by two domains becomes ONE finding tagged with both domains; keep the richer evidence.
- Sort: BLOCKER > HIGH > MEDIUM > NIT, then confidence descending. Number F1, F2, ...
- Keep each reviewer's confidence numbers and confidence notes verbatim; do not smooth them.

Readability wins stay in their own section: they are opportunities to relay to the author, not defects. Number W1, W2, ... with the same sort. If readability and architecture hit the same spot, keep the stronger framing and drop the other.

Suggested comments: for findings and wins worth relaying to the author, draft a paste-ready comment in Conventional Comments format (conventionalcomments.org): `<label> [(decoration)]: <subject>` plus at most two more sentences.
- When: always for Blockers and Highs; Mediums when clearly actionable; Nits only when trivial to accept, as `nitpick (if-minor):`. Wins are inherently relay-worthy.
- Labels: praise, nitpick, suggestion, issue, todo, question, thought, chore, note. Decorations: (blocking), (non-blocking), (if-minor).
- Mapping: verdict-gating finding → `issue (blocking):`. Other defects → `issue:` or `suggestion (non-blocking):`. Confidence 65 or below → phrase as `question:`, never as an assertion. Wins → `suggestion (non-blocking):`, `thought:`, or `nitpick:` by weight.
- Self-contained: the author sees only the comment, never this report, so the comment carries its own why and a concrete direction.
- Voice: written as the user would post it: direct, kind, specific. No hedging boilerplate, no AI tells.
- Example: `issue (blocking): userId comes from the query string, so any signed-in user can read anyone's orders. Could we scope by req.session.userId the way getInvoices does?`

NEVER post comments anywhere: no `gh pr comment`, no `gh api`, no review submission. Drafts live in the report only; posting is the user's call, done manually.

Emit exactly this shape (omit empty sections; never pad a clean report):

```
# PR Review: <title> (#<n>)
<head> → <base> · <files> files · +<add>/−<del> · <author>[ · includes uncommitted changes]

## What this PR does
<cartographer, ≤3 lines>

## Change map
<cartographer map + flow, verbatim>

## Blast radius
<cartographer>

## Read in this order
<cartographer>

## Risk hotspots
<cartographer>

## Findings (<count>)
[F1 · BLOCKER · security · 90%] src/api/orders.ts:41
  <issue>
  evidence: <...>
  fix: <...>
  confidence: <...>
  comment: <paste-ready conventional comment; omit when not worth relaying>
<...>

## Readability wins (<count>)
[W1 · HIGH · 85%] src/components/Dashboard.tsx:38
  <win: what becomes easier to follow>
  now: <why it reads hard today>
  reshape: <before/after sketch or named seams>
  confidence: <...>
  comment: <paste-ready conventional comment>
<...>

## Cleared
security: <checked-and-clean bullets, including sub-50 maybes with their %>
perf/scale: <...>
correctness: <...>
architecture: <...>
readability: <...>

## Coverage
<only in triage mode, or when files were skipped, or when an agent failed;
 a failed agent gets: "<domain> incomplete (<reason>). Re-run: use the <agent-name> subagent on /tmp/pr-review-<id>/full.diff">

## Verdict
<Ship | Ship with fixes | Hold> · <one line why>
```

Verdict guidance (judgment allowed, justify in the one line): Hold when any Blocker stands, or a High is at 80%+ confidence. Ship with fixes for remaining Highs and worthwhile Mediums. Ship when clean or nits only. Readability wins never gate the verdict.

Close with: "Deep dive on any finding or win, or a comment draft for anything lacking one: ask by number."

Do not editorialize beyond the template, do not soften findings, and do not add findings of your own: reviewers own findings.

## 5. Clean up

If a temp worktree was created: `git worktree remove /tmp/pr-review-<n>`. Keep the /tmp/pr-review-<id> diff artifacts; deep dives reuse them.
