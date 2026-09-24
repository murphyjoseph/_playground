# Bugdar service map

Facts the scanners and judge need. Verified 2026-09-16 against app-node `cloud-run-forensics`, `data-deepdive`, repo config, and the live Slack channels. Update this file when the fleet changes; nothing here is discovered at runtime except where marked.

## Environments

| | staging (`--env staging`) | production (default) |
|---|---|---|
| GCP project | `staging-406517` | `main-372313` |
| Region | `us-central1` | `us-central1` |
| Sentry `environment` | `staging` (from `pipelinePhase`; native uses `nodeEnv`, may report `staging`) | `production` |
| PostHog project | `481421` "Local / Staging" (token `phc_xGAq…`, the one `apps/native/src/envs` uses for staging; US org `019ef048…`) | `481832` "Production" (token `phc_x7CQ…`, same org) |
| BigQuery datasets | `staging-406517.postgres_node_direct`, `.firestore_direct`, `.billing_export` | `main-372313.*` |
| Worker pools | `temporal-worker-pool` (single) | `-interactive`, `-events`, `-webhooks`, `-background` |

Deploy mechanics: prod services deploy `--no-traffic`, pools `--no-promote`, so the newest revision is often not serving. Always build the active-revision map first (`cloud-run-forensics` Phase 1). Staging follows the same pipeline shape; verify rather than assume.

## Cloud Run services → product surfaces

| Service | Role | Surfaces it serves |
|---|---|---|
| `app-api-external` | Public API (browser, mobile) | Member web app, Care Hub (Provider), Admin panel, native app |
| `app-api-internal` | Service-to-service API | Workflows, jobs, webhooks |
| `app-events` | Domain event processing | Everything downstream of DomainEvents (eligibility, enrollment sync, analytics) |
| `app-webhooks` | Inbound webhooks | Calendly, Healthie, Typeform, Auth0 log stream |
| `app-jobs` | Scheduled / batch jobs | Cloud Scheduler targets |
| `auth0-log-stream` | Auth0 event sink | Sign-in / sign-up forensics |
| Temporal worker pools | Workflows | Charting notes, care plans, actions extraction, syncs |
| `app-docs` | Static docs | Out of scope |

Product nouns to use in the "Affected" line: Member web app (sign-in, onboarding, booking, messaging, labs), Care Hub (Provider sessions, charting notes, care plans), Admin panel, Native app, Eligibility/Enrollment (partner flows), Workflows (Temporal), Webhooks (Calendly, Healthie, Typeform).

## Sentry

- Org `welltheory`. Projects seen in alerts: `api-welltheory-com` (id 4504572315959296), `app-welltheory-com` (id 4504883761709056). Discover others (native) with the Sentry tools on first run and add them here.
- Alert rules already posting to Slack: "API Error" (issue alert, api project), "Send Slack Notification" (app project).
- SDK v8; warn-level log lines become Sentry events via `module-logger/adapter-sentry` (`minEventLevel: warn`). Expect warnings dressed as errors; grade by impact, not level.

### Business-exception skip list (grade SEV4 unless volume triples vs baseline)
Signatures observed in #sentry-notifications that are eligibility outcomes, not bugs:
- `Subscriber/Insured Not Found; Reached maximum number of attempts.`
- `Invalid/Missing Subscriber/Insured ID; Reached maximum number of attempts.`
- `Invalid/Missing Subscriber/Insured Name; ...`
- `Invalid/Missing Patient ID; ...`
- `Member is not eligible; ...`
- `Group ID is not an eligible Group ID.`
- `Failed to load image: /assets/*.svg` (asset noise, SEV4)
Add to this list only via `/bugdar tune` or a `>false-positive` reply; never inline in a pass.

## PostHog

- Connected via the official plugin MCP (`mcp__plugin_posthog_posthog__exec`, hosted at mcp.posthog.com). The login reaches two orgs: a legacy EU org (`018bb99c…`: Production 11907, Local 13387, Docs 150365; tokens no longer shipped by the apps) and the live US org (`019ef048…`: Local / Staging 481421, Production 481832, backfill 590837; tokens match `apps/native/src/envs/index.ts` and the `_US` env vars). Bugdar targets the US org ids in `config.json`. Run `call projects-get {}` in preflight and require the configured id to be listed; `switch-project` to it before every query because the active project is session state, not per-call.
- Error tracking: verified 2026-09-16 via `switch-project 481421`: exception autocapture is **not enabled** in Local / Staging (session replay and heatmaps are), so PostHog exception signals are dark until it is turned on; rage-click and flow-volume signals still work. The scanner reports `error_tracking: disabled` and the digest health line carries it. Re-check with `project-get` each pass.
- Key-flow event names (discovered 2026-09-16 in project 481421 via `read-data-schema`): sign-in = `account_signed_in`, onboarding completed = `account_created`, booking = `appointment_scheduled`; `$rageclick` is present. Seven-day totals that day were in the tens, so staging baselines are sparse: a zero window against a zero same-hour baseline is normal, not a drop. `Custom / Onboarding Form Submissions / Completed` (named in `auth-forensics`) no longer appears in the schema. Re-discover if a query returns unknown-event errors.

## Slack

| Channel | ID | Carries | Bugdar use |
|---|---|---|---|
| #bugdar-notifications | `C0C38PZN072` | bugdar posts | output |
| #sentry-notifications | `C063XG8AQ5A` | Sentry issue alerts | echo evidence |
| #api-notifications | `C07CRE52KC4` | Cloud Monitoring: SLO burn, error rate, Cloud Armor, failed Cloud Scheduler jobs, uptime | echo evidence |
| #workflows-alerts | `C0B0V9CBP6H` | Temporal step-paused, workflow-failed, activity non-retryable, sync-match-rate | echo evidence |
| #typeform-alerts | `C0BP7RGF3B4` | Typeform request-failure bursts | echo evidence |
| #proxy-notifications | `C0BUS564M5L` | PostHog proxy alerts (new) | echo evidence |

Murph's Slack user id: `U0AN380HXFB`. Post with the Slack MCP `slack_send_message`; read threads with `slack_read_thread`.

## Linear (for `>ticket`)

- Team: Product (`WT`, id `28945d02-d323-4022-9135-121da3ad0fc2`)
- Project: Support (`70f6992d-afe3-4d91-987a-c03267ca4828`, https://linear.app/welltheory/project/support-d34fda397e61)
- Assignee: Joseph Murphy (`2386f713-2bfb-4e9f-90ec-7caa8fb27985`, or `"me"`)
- Priority map: SEV1 → 1 (Urgent), SEV2 → 2 (High), SEV3 → 3 (Medium)

## Existing Terraform alert policies (so bugdar knows what already pages)

Per Cloud Run service: availability SLO fast/slow burn, error rate warning/critical, P95 latency warning/critical, CPU/memory/instance-count warnings, uptime. Cloud SQL: CPU, memory, disk, connections, read/write ops, replica variants, DDL audit, config change. Prisma pool busy/wait. Cloud Armor denial warning (>15/5m) and critical (>75/5m). Temporal log-match policies (step paused, workflow failed, activity non-retryable, sync match rate). Failed Cloud Scheduler jobs. Typeform request failures. These fire into the channels above; bugdar grades them, it does not re-alert them.

## Investigation playbooks bugdar reuses (read, do not duplicate)

- `~/Sites/.claude/skills/cloud-run-forensics/SKILL.md` — active revision map, error log scan, drill-down
- `~/Sites/.claude/skills/data-deepdive/SKILL.md` — BigQuery discovery-first querying, events store schema
- `~/Sites/.claude/skills/auth-forensics/SKILL.md` — PostHog + Auth0 sign-up path forensics (focus mode only)
- `~/Sites/.claude/skills/gcp-metrics/SKILL.md` — Cloud Monitoring CLI (binary not on PATH as of 2026-09-16; skip if missing)
