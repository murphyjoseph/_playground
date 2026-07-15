---
name: babysit-prs
description: 'Watch welltheory GitHub PRs for the "help wanted" label and run /pr-review on new or updated ones. One cheap pass per invocation; designed for an interval loop (/loop 10m /babysit-prs). Reports land in ~/Sites/reviews/; never posts to GitHub.'
---

Run one watcher pass: find open PRs labeled "help wanted" across the welltheory org, review the ones not yet reviewed at their current head, save reports locally. When nothing is new, exit fast and cheap.

## 1. Find candidates

```
gh search prs --owner welltheory --state open --label "help wanted" \
  --json repository,number,title,url,author
```

No results → report "no open PRs labeled help wanted" and stop.

## 2. Dedupe against state

State file: `~/Sites/reviews/.babysit-state.json` — a map of `"<repo>#<number>"` to the head SHA last handled (create file and `~/Sites/reviews/` on first run).

For each candidate: `gh pr view <url> --json headRefOid`. A PR needs review only when its key is absent from state or the stored SHA differs (new pushes re-queue it). Nothing needs review → report "all labeled PRs already reviewed" and stop.

## 3. Review each hit

One at a time, never in parallel (each review already fans out six subagents). Cap at 3 reviews per pass; leftovers get picked up next pass.

- The repo must be checked out at `~/Sites/<repo-name>`. Missing checkout → skip it, record the SHA in state with `"skipped": true` (so it doesn't retry every pass), and flag it in the summary.
- Run the `/pr-review` flow on the PR URL with the checkout as the working directory for all git/gh commands.
- Write the full report to `~/Sites/reviews/<repo>/pr-<number>.md`, overwriting any previous report for that PR.
- Update state with the reviewed head SHA immediately after each report is written, not at the end of the pass.

## 4. Wrap up

- NEVER post to GitHub: no comments, no reviews, no labels, no `gh pr comment`/`gh api` writes. Reports are drafts for Murph to relay manually.
- Summarize the pass in a few lines: `<repo>#<n> → <verdict> → <report path>` per review, plus skips and "nothing new" when applicable.
- If any reviews happened, send a push notification: "<count> PR review(s) ready: <repo>#<n> <verdict>, ...".
