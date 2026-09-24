# Bugdar signal rules: detect, fuse, gate

The spine, from the Google SRE Workbook and Ewaschuk: alert on user-facing symptoms, require persistence, correlate with what changed, dedupe into one incident, and post only when a human must act. Everything below is that spine in WellTheory terms.

## 1. Principles the judge enforces

- **One problem, one finding.** Sentry, Cloud Logging, PostHog, BigQuery, and the five alert channels are *witnesses* to a problem, never problems themselves. Three services barking about one deploy is one finding with three evidence bullets.
- **Symptoms over causes.** The problem line names what a Member, Provider, or the team experiences. Causes go in evidence.
- **What changed, first.** Before grading anything, know the active revision per service and when it was promoted. About 70% of outages follow a change (Google SRE, directional).
- **Persistence before posting.** Except for the SEV1 class, a problem must be seen in two consecutive passes. The state file holds `pending` candidates between passes.
- **Silence is the default output.** A pass that finds nothing prints "nothing to flag" locally and posts nothing. The one exception is the `--heartbeat` tick on looped runs, a thread reply that proves the pass ran (alert-format.md §Heartbeat).
- **Never manufacture.** Uncertain findings carry `possible` confidence and never post above SEV3.

## 2. Per-source detection (what each scanner returns)

Every scanner returns a JSON array of *signals*, each with: `source`, `kind`, `signature`, `service_or_surface`, `first_seen`, `last_seen`, `count_in_window`, `users_affected` (or null), `release_or_revision`, `link`, `raw_excerpt` (PHI-scrubbed, max 300 chars), `note`. Scanners do not grade severity. They may add `hint: strong|weak`.

### Sentry (filter `environment:<env>`)
- Emit: issues with `first_seen` in the window (New); issues that transitioned to `Regressed` or `Escalating` in the window; issues whose event count in the window exceeds 10 or user count exceeds 3.
- `Escalating` and `Regressed` are `strong` (Sentry's own week-over-week forecast already filtered noise).
- A New issue whose first event carries a release promoted in the last 60 minutes is `strong` (change-correlated).
- Skip: `Archived` unless Escalating; signatures on the business-exception list in `service-map.md`; issues from projects not in scope.
- Capture: short id, title, culprit/function, project, first/last seen, counts, release, replay link if any.

### Cloud Logging (gcloud, staging or prod project)
- **Step 0, always:** active revision map per service and worker pool (`cloud-run-forensics` Phase 1). Errors on a revision with 0% traffic or a staged-not-promoted pool revision are tagged `inactive_revision` and are SEV4 by rubric.
- Emit, on active revisions only, grouped by (service, message signature with ids and numbers stripped):
  - ≥ 5 identical `severity>=ERROR` lines in the window, or
  - any signature not seen in the previous 7 days (novelty; check with a second query over 7d, limit 1), or
  - ≥ 3 `httpRequest.status>=500` on one route.
- Temporal lifecycle: filter `jsonPayload.event=~"^temporal\."` (discover the exact field once by sampling; do not assume). Emit `workflow.failed` and non-retryable activity failures grouped by `workflowType`; emit step-paused only when the same `stepId` paused ≥ 3 times in 24h (single pauses are covered by #workflows-alerts' operator playbook).
- Cloud Scheduler: `resource.type="cloud_scheduler_job" AND severity>=ERROR`; emit a job when it failed on ≥ 2 consecutive runs, or once if the job name matches calendly, process-tasks, or onboarding sweeps.
- Cloud Armor: emit only accepted requests on attack-shaped paths (`enforcedSecurityPolicy.outcome=ACCEPT AND httpRequest.status>=400`, or accepted traffic from an IP that was also denied). Denials alone are not signals.
- Capture: service, revision, signature, counts, sample trace id, route, first/last seen.

### BigQuery (staging or prod datasets)
- Pipeline canary: for each `subscription_name` in `firestore_direct.events_store_events`, count events in the window vs the median of the same window across the previous 7 days. Emit `zero_when_baseline_positive` (stall) and `spike_x3` for error-shaped subscriptions. Always filter `publish_time` (partition) and `subscription_name` (cluster).
- Mirror freshness: `MAX(updatedAt)` on two or three high-churn `postgres_node_direct` tables (discover with `bq show`; never assume columns). Lag > 2h → `mirror_stale` (SEV3 by rubric; escalate only if loss is evidenced).
- Business canaries (prod only, off on staging): daily counts of enrollments, bookings, or completed onboardings vs 7-day baseline; emit on a drop > 50% during business hours.
- Run `--dry_run` first when a query is new; abort anything scanning over 5 GB.

### PostHog (project by id from config; call `switch-project` first, every pass)
- Exceptions: `query-error-tracking-issues-list` for issues first seen in the window, or with occurrences ≥ 10 / users ≥ 3 in the window (skip if error tracking is not enabled in the project; report `source_unavailable_feature`).
- Key-flow volume: discover event names via `read-data-schema` once and cache them in `service-map.md`; compare window counts for sign-in, onboarding completion, and booking events against the 7-day same-hour median; emit on a drop to zero or below 30% during hours where the baseline is non-zero.
- Rage and dead clicks: **hints only**. Emit at most one `ui_friction` signal per URL when ≥ 5 distinct sessions rage-clicked the same element in the window, and mark it `weak` until a replay or exception corroborates.
- Capture: issue id, title, counts, users, first/last seen, `$current_url`, replay link when one exists, distinct_id values only as cuids.

### Slack alert channels (read-only context, never a trigger)
- Read the last window from #sentry-notifications, #api-notifications, #workflows-alerts, #typeform-alerts, #proxy-notifications.
- Each alert becomes a `channel_echo` signal: alert name, service, open/closed, timestamp, permalink. The judge attaches these to the problem they witness as evidence ("Cloud Monitoring fired SLO fast burn at 11:35") and treats an already-closed alert as evidence of recovery.
- A channel alert with no corroboration from a direct source and no user-facing symptom is graded but does not post above SEV3.

## 3. Fusion: turning signals into problems

Group signals into one problem when they share **any** of:
1. Same release or revision **and** overlapping time window (±20 min).
2. Same service **and** same route, workflow type, or error signature.
3. A plausible causal chain: promote → 5xx in logs → Sentry issue → PostHog exceptions or event drop → channel alert.
4. Same affected cohort (same partner org, same platform).

For each problem, build:
- `problem_key`: `<env>:<primary service or surface>:<normalized signature or issue id>`; `fingerprint` = sha1 of it.
- `confidence`: `confirmed` when 2+ *independent* sources agree, or any source plus a change correlation within 20 min (a promote minutes before the first error is the strongest evidence there is); `likely` when 1 strong source; `possible` otherwise. Independence: Sentry and Cloud Logging usually witness the same exception (warn+ log lines become Sentry events), so together they count as one source unless they describe different symptoms; PostHog, BigQuery, and a channel echo from a Cloud Monitoring policy are independent of both.
- `severity`: from `severity-rubric.md`, after the four calibration checks.
- `what_changed`: revision promoted and when, or "no deploy in window".
- `also_fired`: channel echoes attached to it.

## 3a. The Call: act now, investigate, or sit tight

Severity says how bad; the Call says what Murph does in the next hour. It is computed from two measurable things, never from vibes.

**Trajectory**, from `count_last_15m`, `hourly_counts`, `last_seen`, state history across passes, and closed channel echoes:

| Trajectory | Test |
|---|---|
| `worsening` | count in the latest 15 min or hour exceeds the previous one by 50%+, or a new service or cohort joined since the last pass |
| `steady` | still occurring in the last 15 min of the window at roughly the same rate |
| `recovered` | no occurrences in the last 30 min of the window (or the matching channel alert closed) after a run longer than 15 min; note the recovery time |
| `blip` | a single burst under 15 min that ended more than 30 min before the window closed |

**Fix clarity**, from what changed and from memory:

| Fix | Test |
|---|---|
| `rollback <rev>` | a promote within 20 min of onset, and the prior revision did not show the signature |
| `fix: <known remedy>` | the signature or its class has a documented remedy (skip-list entry, `tuning.md`, a prior `>ticket` outcome, or a runbook line in an alert channel echo) |
| `vendor-side (<name>)` | the failing call is to Healthie, Calendly, Recall.ai, Stripe, Typeform, Auth0, or another third party and our side is only reporting their errors |
| `cause unclear` | none of the above |

**Call**:

| | fix in front of us | cause unclear | vendor-side |
|---|---|---|---|
| worsening / steady | **ACT NOW** | **INVESTIGATE** | **INVESTIGATE** (check vendor status, decide on retries) |
| recovered / blip | **SIT TIGHT** (fix still worth a ticket) | **SIT TIGHT** | **SIT TIGHT** |
| any SEV1 | **ACT NOW** | **ACT NOW** | **ACT NOW** |

SIT TIGHT always ends with its flip condition, normally "re-posts as ACT NOW if it recurs within 24h". A recurrence, or a trajectory that moves from recovered to steady or worsening, is an `escalate` action even when severity has not changed.

## 4. Routing table (the noise gate)

| Severity | Confidence | Persistence | Action |
|---|---|---|---|
| SEV1 | any | not required | Post now, @mention, thread the evidence |
| SEV2 | confirmed | not required | Post now, @mention |
| SEV2 | likely | 2 passes | Hold `pending` one pass, then post with @mention |
| SEV2 | possible | n/a | Downgrade to SEV3 |
| SEV3 | any | 2 passes | Queue for the daily digest |
| SEV4 | any | n/a | Write to state, never post |

Any problem whose evidence is only `channel_echo` signals caps at SEV3.

## 5. Dedupe and state

State lives in `~/Sites/bugdar/state.json` (created on first run):
```
{ "last_pass_at": ISO, "last_digest_date": "YYYY-MM-DD",
  "heartbeat": { "date": "YYYY-MM-DD", "parent_ts": "..." } | null,
  "problems": { "<fingerprint>": { "status": "pending|open|acked|muted|false_positive|resolved",
     "severity": "SEV2", "first_seen": ISO, "last_seen": ISO, "passes_seen": 2,
     "slack_ts": "...", "muted_until": ISO|null, "linear": "WT-1234"|null, "history": [...] } } }
```
- Re-post an `open` or `acked` problem only when severity rises or blast radius spreads; otherwise append to its Slack thread at most once per 6 hours with the new count.
- `muted`: suppress until `muted_until`; on expiry, treat as new.
- `false_positive`: suppress the fingerprint for 7 days and append a line to `~/Sites/bugdar/tuning.md` (signature, why, date) so the rules get tightened on review.
- `resolved`: set automatically when a problem's signals are absent for 3 consecutive passes; mention in the next digest, never as its own post.

## 6. Environment specifics

Production is the default. The §2 count thresholds were first set against staging volume; on production, treat them as a floor and rely on novelty, persistence, the business-exception skip list, and user-facing impact to keep the gate tight. Raise a threshold in `config.json` the first time a `>false-positive` reply cites volume alone.

### Staging (`--env staging`)

- Counts, not rates: at staging volume one failure is a 100% error rate. Thresholds above are absolute counts.
- Smoke tests and frequent promotes: always run the active-revision map; expect deploy-time blips and ignore anything that does not survive two passes.
- No members: impact is phrased as release risk or team blockage (see rubric).

## 6a. Long windows (catch-up sweeps over 6 hours, up to 72)

A Monday-morning sweep after a quiet weekend is one pass over 48+ hours, and two things break if it is treated like an hourly tick: absolute count thresholds inflate with window length, and the two-pass persistence rule would hold everything until the next pass even though the window already shows whether a problem persisted.

- **Thresholds apply per peak hour.** Scanners emit `hourly_counts` and `peak_hour_count`; the judge compares `peak_hour_count`, not the window total, against the §2 thresholds. A signal that never reached threshold in any single hour but totals high over two days is a slow burn: SEV3 at most.
- **Persistence can be satisfied inside the window.** A signal present in two or more separate hours of the window counts as seen on two passes. A signal confined to one hour is first-pass `pending` as usual.
- **Change correlation still uses ±20 minutes** around each promote in the window; list every promote in `what_changed` when there were several.
- **Recovery inside the window matters.** If a signal's last hour is more than 6 hours before `WINDOW_END` and the channel echo for it is closed, grade it `resolved_in_window`: digest material, never a post.

## 7. Learning loop

- Every `false-positive` reply and every finding Murph never acts on within 7 days is a tuning input.
- Weekly, `/bugdar tune` (manual) reads `tuning.md` and the last 7 days of state and proposes rule edits to this file and the rubric. Rules nobody acted on in 30 days get deleted, not softened.
