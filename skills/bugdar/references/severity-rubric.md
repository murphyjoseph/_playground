# Bugdar severity rubric (WellTheory nouns)

Severity is a label for **current member, provider, or business impact**, never for how hard the fix looks or how loud the telemetry is. Bugdar assigns a *provisional* severity, errs one level high when torn, and says so. Priority (when to act) is Murph's call; bugdar never claims it.

Compiled from: the-gut `library/incident-severity-levels-and-initial-alerts.md` (PagerDuty, Google SRE, Atlassian, incident.io, NIST/CISA), the-gut `library/logging-observability-sentry-posthog-bigquery.md`, and the user-supplied "Best Practices for Automated Bug Detection" synthesis (Google SRE Workbook burn-rate alerting, Ewaschuk). Override any line here in this file; the judge loads it every pass.

## The four levels

| Level | Name | Test (any one line qualifies) | Post? |
|---|---|---|---|
| SEV1 | Critical | Core path unusable for all or >10% of Members or Providers: sign-in/bootstrap, booking or rescheduling, messaging, Care Hub sessions, eligibility/enrollment, lab results. **Any** confirmed data loss or corruption (DomainEvent writes failing, mass Prisma constraint violations, migration half-applied). **Any** PHI exposure, wrong-organization assignment, auth bypass, or Cloud Armor attack traffic returning 2xx. Claims/payments pipeline failing entirely. | Immediately, @mention, skips the persistence wait |
| SEV2 | Major | Core path degraded or down for a segment (one partner org, one platform such as native, one region). A workflow class terminally failing on every new execution (e.g. every `charting-notes:draft-charting-note` fails, not one). 5xx on the active revision above threshold for the whole window. SLO fast burn (prod). Temporal sync match rate low and sustained. A Cloud Scheduler job that feeds member-facing data failing on consecutive runs. Sentry issue in `Escalating` state touching many users. No clean workaround. | Immediately, @mention, after persistence |
| SEV3 | Minor | Limited impact with a tolerable workaround. One workflow execution paused awaiting operator action. One scheduled-job failure that self-heals on the next run. New Sentry signature with a handful of events and users. Slow-burn error budget. Data mirror or event pipeline lag without loss. | Daily digest only |
| SEV4 | Cosmetic / informational | Asset load failures, console noise, warnings promoted to Sentry events, expected business exceptions surfacing as errors, errors on an inactive or staged-not-promoted revision, staging smoke-test failures, single user single event. | Never. Logged to state only |

## Dimensions that move the level

| Dimension | Pushes up when | Pushes down when |
|---|---|---|
| Blast radius | All users, a whole partner org, a whole platform | One user, one execution, one host |
| Core function | Sign-in, booking, messaging, Care Hub, eligibility, labs, claims | Admin tooling, docs, analytics views |
| Data integrity | Writes failing, constraint violations, half-applied migrations, events dropped | Read-only failures, retries succeeding |
| Security / PHI | PHI in logs or errors, org misassignment, auth anomalies, attack traffic accepted | Cloud Armor denying as designed |
| Workaround | None, or it causes its own harm | Cheap and known |
| Recoverability | Needs manual repair, replay, or vendor help | Self-heals on retry or next run |
| Trend across passes | Count rising, spreading to more services | Falling or flat since first seen |
| Change correlation | Started within 20 min of a promote or config change | No deploy nearby, long-running baseline |

Auto-escalate one level when: the signal spreads to a second service between passes, the count doubles between passes, or PHI/security is plausible but unconfirmed. Auto-de-escalate to SEV4 when: the failing revision is not serving traffic, or the signature is on the known business-exception list in `service-map.md`.

## Staging translation

Staging has no members. Judge impact as "what ships at the next promote" and "what blocks the team":

- Would be SEV1/SEV2 in prod → same level on staging, phrased as "ships to prod on next promote" in the consequence line.
- Blocks QA or a release candidate → SEV2.
- Everything else → SEV3 or SEV4. Staging traffic is too low for rates or burn rates; use counts, novelty, and repetition (see `signal-rules.md`).

## Should / should not be a finding (WellTheory nouns)

Should be a finding:
- Member sign-in, bootstrap, or onboarding failing or hanging on the active revision.
- Booking, rescheduling, or Calendly sync producing errors or silently producing nothing.
- Care Hub session create/remove, charting-note or care-plan draft workflows failing as a class.
- Eligibility or enrollment resolving to the wrong organization, or a partner flow falling into D2C.
- DomainEvent or events-store write failures, mirror datasets stalling with loss.
- Any PHI in an error message, log line, or Sentry event.
- Attack traffic that Cloud Armor did not deny.
- A Cloud Scheduler job failing on consecutive runs.

Should not be a finding on its own:
- Eligibility lookups returning "not eligible", "not found", "invalid ID" after exhausting retries. These are business outcomes wearing an exception costume.
- Errors only on a revision with 0% traffic.
- Rage clicks or dead clicks without a matching error or replay confirmation.
- Cloud Armor denials (the system working).
- A single Temporal step paused once; the operator playbook already covers it via #workflows-alerts.
- Anything already `false-positive` in state within the last 7 days.

## Calibration checks the judge runs before emitting

1. **Two-engineer test.** Would two engineers with this evidence pick the same level? If not, pick the higher and label confidence `possible`.
2. **Action test.** "If this posts, what does Murph do in the next hour?" No answer → drop one level; still none → SEV4.
3. **Symptom test.** Is the problem statement a user-visible symptom, not an internal cause? Rewrite until it is.
4. **Inflation check.** If more than 1 in 5 findings this week were SEV1/SEV2, tighten. Healthy distribution is roughly 5 / 15 / 40 / 40 percent across SEV1-4.
