---
name: bugdar
description: "Bugdar, WellTheory's bug radar. Runs one monitoring pass over staging or production telemetry: reads Sentry, Cloud Logging, BigQuery, and PostHog directly through the bugdar scanner subagents, fuses every signal about the same root cause into ONE triaged Slack alert in #bugdar-notifications (problem, consequence if ignored, affected services, evidence, provisional severity, reply legend), holds minor items for a daily digest, and processes >ticket / >more-context / >ack / >mute / >false-positive thread replies. Use for /bugdar, 'run bugdar', 'bug radar pass', 'scan staging for incidents', 'post the bugdar digest', 'process bugdar replies', 'investigate bugdar-0916-01', or 'tune bugdar'. On looped runs (--heartbeat) it also drops a one-line tick into a daily heartbeat thread so a quiet channel is provably a clean run and a failed preflight is never mistaken for one. Designed for /loop 1h /bugdar --heartbeat and /loop 10m /bugdar replies, which invoke it through the model on each tick, so model invocation stays enabled; run it only when the user asks or a loop tick fires, never spontaneously."
argument-hint: "[scan|replies|digest|investigate <finding-id>|tune] [--window 2h] [--env staging] [--heartbeat] [--dry-run] [--partial]"
model: sonnet
effort: medium
---

# Bugdar

One pass of the bug radar. The pass is mechanical: check connections, gather witnesses, hand them to the judge, act on its verdicts, record state. All judgment about severity and noise lives in the `bugdar-judge` subagent and the files under `references/`; this file only says what to do in which order and why. `model: sonnet` is pinned here because orchestration does not need the expensive model; the judge runs on opus.

Paths: skill root `~/.claude/skills/bugdar/` (config in `config.json`, rules in `references/`), runtime state `~/Sites/bugdar/` (`state.json`, `findings/`, `tuning.md`), created on first run.

## Arguments

| Arg | Meaning | Default |
|---|---|---|
| `scan` / `replies` / `digest` / `investigate <id>` / `tune` | which pass to run | `scan` then `replies` |
| `--window 2h` (also `90m`, `2d`) | how far back the scanners look | since `state.last_pass_at` plus `schedule.window_overlap_minutes`, so a Monday sweep after a quiet weekend covers the whole gap automatically; capped at `schedule.max_window_hours` (72) with a printed notice when the cap bites; first run uses `schedule.default_window_minutes` |
| `--env staging\|production` | which environment block in `config.json` | `config.env` |
| `--dry-run` | do everything except Slack sends, Linear writes, and state mutation; print what would have happened | off |
| `--partial` | when preflight fails for some sources, continue with the healthy ones and label the pass degraded | off (stop and prompt) |
| `--heartbeat` | after the pass, post a one-line tick into today's heartbeat thread in `slack.output_channel`: clean, degraded, or the preflight failure (step 9b). Set by the `/loop` cron prompt; manual runs leave it off so the thread reflects the loop's cadence and nothing else | off |

Under `/loop` the interval is the cadence; the window follows `last_pass_at`, so a missed tick is covered by the next one. For any window longer than 6 hours the long-window rules in `references/signal-rules.md` §6a apply (hourly buckets, in-window persistence), so a catch-up sweep can post a persistent SEV2 without waiting for a second pass. The loop prompt is `/loop 1h /bugdar --heartbeat`.

## Pass procedure (scan)

### 0. Resolve env and window
Read `config.json`. Pick the env block. Read `~/Sites/bugdar/state.json` if it exists (create `~/Sites/bugdar/` and an empty state per `references/signal-rules.md` §5 if not). Compute `WINDOW_START`/`WINDOW_END` in UTC and `now_local` in `schedule.timezone`. Print one line: `bugdar scan · <env> · window <start>→<end> (<n> min)`.

### 1. Preflight checklist, stop and prompt
Murph asked for this explicitly: a pass that silently runs blind is worse than no pass, because a quiet channel would then be trusted for the wrong reason. Check each connection with a real read call (a ✓ with no tool call behind it is a guess, and the table exists to replace guessing) and print it:

| Check | How | Remediation to print on ✗ |
|---|---|---|
| gcloud | `gcloud auth print-access-token >/dev/null` then `gcloud projects describe <gcp_project> --format='value(projectId)'` | `! gcloud auth login` |
| BigQuery | `bq ls <gcp_project>:firestore_direct` | usually fixed by the gcloud login above |
| Sentry | the Sentry connector exposes tools beyond `mcp__claude_ai_Sentry__authenticate` | `/mcp` → select "claude.ai Sentry" |
| PostHog | `exec: call projects-get {}` lists `environments.<env>.posthog_project_id` (null counts as ✗) | set `posthog_project_id` in `config.json`, or re-authenticate the PostHog plugin against the org/region that owns the project |
| Slack | `slack_read_channel` on `slack.output_channel`, limit 1 | reconnect the Slack connector via `/mcp` |
| Linear | `list_teams` with limit 1 returns the Product team (only required for `replies` and `>ticket`) | reconnect the Linear connector via `/mcp` |

Scope the checklist to what the pass actually needs, so a dead gcloud token never blocks answering a thread reply:

| Pass | Checks |
|---|---|
| `scan`, `digest` | all six |
| `replies` | Slack and Linear only; the scanners are checked lazily when a `>more-context` reply needs them, and if they fail the thread gets one line, `🔍 investigation blocked: <remediation>`, instead of a report |
| `investigate` | gcloud, BigQuery, Sentry, PostHog; Slack only with `--post` |
| `tune` | none (local files only) |

Any ✗ in scope without `--partial`: print the remediation lines and stop the pass here. With `--heartbeat`, first post the failure tick (step 9b, `reply_broadcast: true`) so the failure reaches the channel; a heartbeat exists precisely so a silent hour is never read as a clean one. Slack itself failing is the one check that can't be posted, so the terminal carries it. With `--partial`: continue, skip the scanners whose source failed, and carry `degraded: true` into the summary and the judge bundle so findings say how many sources were actually consulted.

### 2. Read the alert channels
For each channel in `slack.alert_channels`, `slack_read_channel` bounded by the window (`oldest`/`latest` as Slack ts). Normalize each bot message into a `channel_echo`: `channel`, `alert_name`, `service`, `status` (`open` when the text says alert open/incident_open or a Sentry issue is New/Escalating; `closed` when it says returned to normal/alert closed/resolved), `ts`, `permalink`. These are witnesses, never triggers: the judge attaches them to problems found by the direct sources and grades them, so the same deploy never produces one bugdar post per channel that barked.

### 3. Launch the scanners together
In a single message, launch `bugdar-gcp-scanner`, `bugdar-sentry-scanner`, and `bugdar-posthog-scanner` via the Agent tool, each with: `ENV`, `WINDOW_START`, `WINDOW_END`, `CONFIG_PATH=~/.claude/skills/bugdar/config.json`, `MODE=sweep`. Skip a scanner whose source failed preflight (only reachable with `--partial`). Each returns one fenced JSON block. A scanner that errors, times out, or returns no JSON is recorded as `source_status: unavailable` in the bundle; never write its signals yourself, because a fabricated empty result would look like a clean source. If the Agent tool answers `Agent type 'bugdar-…' not found`, the subagent files in `~/.claude/agents/` were added after this session started (agents register at launch): print `bugdar subagents not registered in this session; restart Claude Code and rerun` and stop, without printing a nothing-to-flag line, since nothing was actually checked.

### 4. Build the judge bundle
```
{ env, window, now_local, digest_due, degraded, state_summary, channel_echoes, scanners: { gcp, sentry, posthog } }
```
`state_summary` maps each fingerprint in state to `{status, severity, passes_seen, first_seen, muted_until, last_slack_ts, problem_key}`. `digest_due` is true when the local hour is at or past `schedule.digest_hour_local` and `state.last_digest_date` is before today, or when the pass is `digest`.

### 5. Launch the judge
Launch `bugdar-judge` with the bundle. It reads the references itself. Parse its single JSON block. If it is not valid JSON, print the raw output and stop; posting something you could not parse is how a trusted channel gets polluted.

### 6. Act on each finding
| `action` | Do |
|---|---|
| `post_now` | `slack_send_message` to `slack.output_channel` with `slack_post`; then a thread reply listing `thread_links`. Save the returned `ts` as `slack_ts`. |
| `escalate` | thread reply on the existing `slack_ts` with `reply_broadcast: true` (severity rose, or the Call moved from SIT TIGHT to ACT NOW / INVESTIGATE because the problem came back, so it belongs in the channel again). |
| `thread_update` | thread reply on `slack_ts`, only if the last update was more than 6h ago. |
| `hold_pending`, `digest`, `log_only` | state only. |

Compute each finding's `fingerprint` yourself as `sha1(problem_key)` (`printf '%s' "$key" | shasum`); the judge returns `problem_key` and leaves `fingerprint` null because it has no shell. Update state for every finding (new or existing): `status`, `severity`, `passes_seen`, `first_seen`, `last_seen`, `slack_ts`, and append `{ts, action, severity}` to `history`. Write the full finding JSON to `~/Sites/bugdar/findings/<finding-id>.json`. Set `state.last_pass_at = WINDOW_END`.

### 7. Digest
If the judge returned a non-null `digest`, post it to the output channel and set `state.last_digest_date` to today. The judge already decided whether there is anything worth a digest; do not post an empty one.

### 8. Replies
Runs after scan by default, or alone as `/bugdar replies` so it can loop on its own cadence. For every state problem with a `slack_ts` and a status other than `resolved` whose `last_seen` is within 7 days, `slack_read_thread` and take replies newer than the problem's `last_reply_ts_processed` whose text starts with `>` or `&gt;` (Slack renders a leading `>` as a blockquote, so both forms arrive). Digest-thread replies name a finding-id after the keyword. Act per the reply protocol table in `references/alert-format.md`:

- `>ticket` → Linear `save_issue` with team `linear.team`, project `linear.project`, assignee `linear.assignee`, priority SEV1→1, SEV2→2, SEV3→3, title = the problem line, description = the post text, the thread links, and the finding id. Reply `🎟️ <identifier> created` and store the identifier in state.
- `>more-context` → launch the three scanners with `MODE=focus`, `FOCUS` = the finding, 72h window, then the judge with the focus outputs; post its investigation summary (timeline, what changed, affected cohort, likely cause, suggested next check; under 1,500 characters) in the thread.
- `>ack` → `status: acked`. `>mute 24h` or `>mute 7d` → `muted_until`. `>false-positive` → `status: false_positive`, append `date · problem_key · signature · "murph: false positive"` to `~/Sites/bugdar/tuning.md`.
- Anything else starting with `>` → post the legend once per thread, then ignore.

Advance `last_reply_ts_processed` after each thread. With `--dry-run`, print the actions instead.

### 9. Pass summary
Print a compact block: signals per source, problems found, posted / held / suppressed counts, source health, `degraded` if set, and the next expected window. When the judge says `nothing_to_flag`, print exactly one line: `bugdar: nothing to flag (<env>, <window>)`. Nothing goes to Slack in that case beyond the heartbeat tick below; silence in the channel is the product working.

### 9b. Heartbeat (`--heartbeat` only)
Skip entirely without the flag. Otherwise, after the summary, using the formats in `references/alert-format.md` §Heartbeat:
1. Read `state.heartbeat`. If `heartbeat.date` is not today in `schedule.timezone`, post the daily parent top-level to `slack.output_channel` and store `{date, parent_ts}` in state. One parent per day keeps the channel readable; the thread under it is the run log.
2. Post the tick as a thread reply on `parent_ts`: `clean` when the pass posted nothing and every check in scope was ✓; `degraded` when `--partial` skipped a source; the failure line when preflight stopped the pass. A pass that did post a finding still gets a tick ending in `posted <finding-id>`, so the thread answers "did 21:07 run?" without ambiguity.
3. Broadcast only the failure line. Clean and degraded ticks stay in the thread; the channel is for things that need a human.

`--dry-run` prints the heartbeat instead of sending it.

## Other passes

- `digest` → steps 0, 1, 4, 5, 7 with `digest_due` forced true. Use it when the morning pass did not run.
- `investigate <finding-id>` → the `>more-context` path for that finding, printed to the terminal instead of Slack (add `--post` to also thread it).
- `tune` → read `~/Sites/bugdar/tuning.md` and the last 7 days of `state.json`; propose concrete edits to `references/signal-rules.md` and `references/severity-rubric.md` (new skip-list lines, threshold changes, rules nobody acted on in 30 days to delete). Show the diff; apply only if Murph says so.

## Safety rules and why

- Post only to `slack.output_channel`, and only what the judge rendered or the heartbeat tick under `--heartbeat`. The channel's value is that everything top-level in it deserved attention; heartbeat ticks live in their daily thread and only a failed preflight breaks out of it.
- Never create a Linear ticket without an explicit `>ticket` reply. Tickets are Murph's decision, bugdar only drafts.
- Never mutate GCP, Sentry, or PostHog. Scanners are read-only by construction; if a step would need a write, it is out of scope.
- No PHI anywhere in a post or a state file: cuids and counts only. The scanners scrub; the judge scrubs again; if an excerpt still carries an email or DOB, that is itself a SEV1 finding.
- `--dry-run` must be honored by every step above; the eval harness and Murph's tuning sessions both depend on it.

## Files

- `config.json` — environments, services, channels, Linear target, thresholds, schedule.
- `references/signal-rules.md` — detection per source, fusion, routing table, state schema.
- `references/severity-rubric.md` — SEV1-4 in WellTheory nouns, calibration checks.
- `references/alert-format.md` — post, digest, escalation, and reply-protocol formats.
- `references/service-map.md` — services, surfaces, Sentry/PostHog/Slack/Linear ids, skip list, playbook paths.
- `evals/` — judge fixtures and expected outcomes; rerun after editing any reference.
