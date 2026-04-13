---
description: Review documentation and comment quality on the current changes via the doc-reviewer subagent
argument-hint: "[optional: path or PR context]"
---

Use the doc-reviewer subagent to review documentation and comment quality.

Scope: $ARGUMENTS

If no scope is given above, review the current git changes (the subagent will check unstaged, then staged, then the last commit). Return the subagent's findings verbatim — do not summarize or soften them.
