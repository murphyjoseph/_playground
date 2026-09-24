# Bugdar alert format

Read on a phone in one glance. Every field earns its line or gets cut. No PHI ever: cuids and counts only, no names, emails, dates of birth, or health data, and scrub them from quoted error text.

## Finding post (SEV1 or SEV2)

```
<emoji> <SEV> (provisional) · <env> · <HH:MM CDT> · <finding-id>
Call: <ACT NOW | INVESTIGATE | SIT TIGHT> · <worsening | steady since HH:MM | recovered HH:MM | blip HH:MM-HH:MM> · <fix: rollback <rev> | fix: <known remedy> | cause unclear | vendor-side (<name>)>
Problem: <one sentence, user-visible symptom, since when>
If we do nothing: <one sentence, concrete consequence>
Affected: <product surface> · <service> · <service>
Evidence:
• <source>: <fact with counts, ids, release> 
• <source>: <fact>
• <what changed>: <revision/release promoted at HH:MM> (correlates | unconfirmed | no deploy in window)
Confidence: <confirmed|likely|possible> (<n> sources agree). Also fired: <#channel alert-name HH:MM> | Not in any alert channel.
Reply in thread: >ticket · >more-context · >ack · >mute 24h · >false-positive
```

- Emoji: 🔴 SEV1, 🟠 SEV2. @mention `<@U0AN380HXFB>` on the first line when the Call is ACT NOW or INVESTIGATE; a SIT TIGHT post carries no mention, so a recovered blip informs without paging.
- Call vocabulary (rules in `signal-rules.md` §3a): **ACT NOW** = still happening and a concrete fix is in front of us (or any SEV1); **INVESTIGATE** = still happening, cause not yet clear; **SIT TIGHT** = stopped on its own, or a single burst; the line ends with what would flip it ("re-posts if it recurs within 24h"). One line, always.
- `finding-id`: `bugdar-YYMMDD-NN` with a two-digit year, e.g. `bugdar-260916-01` for the first finding on 2026-09-16; also the key into state.
- Evidence: 2 to 3 bullets, never more. The third is always "what changed".
- Links go in a **thread reply**, not the post: Sentry issue, Logs Explorer query, PostHog issue or replay, the channel alert permalink, the Cloud Run revision.
- Under 1,000 characters. If it does not fit, the evidence is too detailed, not the format too small.

A SIT TIGHT example of the same line: `Call: SIT TIGHT · blip 11:00-11:33, quiet 2h47m · cause unclear · re-posts as ACT NOW if it recurs within 24h`.

## Escalation update (existing finding got worse)

Post as a thread reply, and `reply_broadcast: true` only when severity rose:
```
⬆️ <finding-id> now <SEV> · Call: <new call>: <one line on what changed>. Count <old> → <new>, now also <service>.
```

## Daily digest (once per day, default 09:00 CDT, or `/bugdar digest`)

```
🗞️ bugdar digest · <env> · <date>
SEV3 held since yesterday (<n>):
• <finding-id> <one-line problem> · <count> · <confidence>
Resolved on their own (<n>): <finding-id>, <finding-id>
Suppressed as noise (<n>): <n> inactive-revision errors, <n> business exceptions, <n> single events
Sources: Sentry ✓ · Cloud Logging ✓ · BigQuery ✓ · PostHog ✗ (project unreachable since 14:00)
Reply in thread with a finding-id and a keyword, e.g. `>ticket bugdar-0916-03`.
```
Only problems already held (status `open` or `digest`, `passes_seen` ≥ 2) appear in the digest; first-pass `pending` items never do, because listing them would leak exactly the one-off noise the persistence rule exists to filter. Skip the digest entirely when there is nothing held, nothing auto-resolved, and no source was `unavailable` for the whole day. A disabled feature (PostHog error tracking off, no BigQuery log link) is standing configuration: mention it in the health line when a digest is posted anyway, never as the reason to post one.

## Heartbeat (`--heartbeat`, looped runs only)

Proves the loop ran, so a quiet channel is never mistaken for a dead one. One top-level parent per local day; every tick is a reply in its thread. Findings never go in this thread.

Parent, posted on the first tick of the day:
```
✅ bugdar heartbeat · <env> · <Tue Sep 16>
Hourly ticks in this thread. Findings post to the channel as usual.
```

Tick, one line, as a thread reply (never broadcast when clean or degraded):
```
<HH:MM CDT> · clean · <n> pending · <n> open · sources <ok>/<total>
<HH:MM CDT> · degraded · <source> skipped (<reason>) · <n> pending · sources <ok>/<total>
<HH:MM CDT> · clean · posted <finding-id> · sources <ok>/<total>
```
Drop `<n> pending` / `<n> open` when zero. `clean` means the pass posted nothing new. `sources` counts the preflight checks in scope for the pass.

Failure, as a thread reply with `reply_broadcast: true` so it reaches the channel:
```
⚠️ <HH:MM CDT> · preflight failed: <check> ✗ · run: <remediation>
```
Slack itself being the failed check is the one case that can't be posted; the terminal summary carries it.

## Reply protocol (processed by `/bugdar replies`)

Keywords at the start of a thread reply (Slack renders a leading `>` as a blockquote; parse both `>ticket` and `&gt;ticket`). In the digest thread the keyword is followed by a finding-id.

| Reply | Bugdar does | Thread confirmation |
|---|---|---|
| `>ticket` | Creates a Linear issue in the configured project, assigned to the configured user, title = problem line, body = the post plus links, priority from severity (SEV1→Urgent, SEV2→High, SEV3→Medium). Stores the identifier in state. | `🎟️ WT-1234 created` |
| `>more-context` | Runs the three scanners in focus mode on this fingerprint (72h window, full drill-down) and the judge's investigation summary. | Threaded report: timeline, what changed, affected cohort, likely cause, suggested next check. Under 1,500 characters. |
| `>ack` | Status `acked`; stops count updates; still escalates if severity rises. | `👀 acked` |
| `>mute 24h` (or `7d`) | Status `muted` until then. | `🔕 muted until <time>` |
| `>false-positive` | Status `false_positive`; suppress 7 days; append to `tuning.md`. | `🧹 logged as false positive, will tune` |

Unknown keyword → one reply listing the legend, once per thread.

## Example (synthetic, staging-shaped)

```
🟠 SEV2 (provisional) · staging · 14:20 CDT · bugdar-0916-01 <@U0AN380HXFB>
Call: ACT NOW · steady since 13:05, 41 → 41/h · fix: roll back app-api-external to 00211 (3f2c1a9 promoted 3 min before onset)
Problem: Care Hub session removal fails with 400 "Session cannot be removed" on every attempt since 13:05.
If we do nothing: Providers can't end or clean up sessions, and this ships to prod on the next promote.
Affected: Care Hub (Provider) · app-api-external · care-hub web
Evidence:
• Sentry: BadRequestException in sessions.remove, 41 events / 6 users, new in release 3f2c1a9
• Cloud Logging: 41 × 400 on DELETE /care-hub/sessions/:id, all on active revision 00212, zero on the prior one
• What changed: 3f2c1a9 promoted 13:02 (correlates, unconfirmed)
Confidence: confirmed (2 sources + promote 3 min before first error). Also fired: #api-notifications Error Rate Warning 13:10.
Reply in thread: >ticket · >more-context · >ack · >mute 24h · >false-positive
```

## BAD example (why it fails: three posts for one deploy, causes instead of symptoms, PHI)

```
🟠 SEV2 · Sentry issue APP-STAGING-21E "Subscriber/Insured Not Found" 3 events
🟠 SEV2 · Cloud Logging: 3 ERROR lines in app-api-external
🟠 SEV2 · #api-notifications fired "Error Rate Warning"
Evidence: user jane.doe@example.com DOB 1984-03-02 hit /eligibility ...
```
One problem became three posts; the Sentry signature is a business exception on the skip list; the problem lines describe telemetry, not what a user sees; and it leaks PHI.
