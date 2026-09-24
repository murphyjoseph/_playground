# Source Library

Persistent per-source records accumulated across research runs. The library answers two
questions before any source is used: is it allowed (gate), and how much prior trust does
it get (rating + COI facts). It stores source-level facts only — claim credibility (1–6)
is rated per-claim in the research output and never cached here. Caching credibility at
the source level is exactly the diagonal-collapse failure mode the two-axis rubric exists
to prevent: the next run would inherit a credibility judgment instead of making one.

## Storage and location resolution

Resolve the library location in this order:

1. **Explicit in-session path.** If the user names a library path this session ("my
   source library is at X"), use it without touching the pointer file.
2. **Pointer file** `~/.claude/adaptive-research.local.md` — read `library_path` from its
   YAML frontmatter.
3. **First run (no pointer):** ask the user where to store the library, offering
   `~/.claude/source-library/` as the default. If you cannot ask (non-interactive run),
   use the default and say so in the output. Then create `<library_path>/sources.md`
   (the index) and write the pointer file:

```markdown
---
library_path: /Users/<user>/.claude/source-library
---
```

Layout: `sources.md` (the index — one line per source, the only file loaded every run)
and `sources/<registrable-domain>.md` (one record per source, keyed by registrable
domain). Create the `sources/` directory lazily, on the first record — never scaffold
empty structure.

## Gate tiers

The tier is **derived** from the record via the cap rules below — it is a gate, not a
fourth score. Reliability, COI, and slop stay decomposed in the record; never collapse
them into a single number.

- **blocked** — never search-target, fetch, or cite. Criteria (any one): reliability E;
  `coi.severity: vendor_owned`; `aiSlop: confirmed`; Wikipedia RSP deprecated or
  blacklisted; documented fabrication history.
  **User override:** fetch only on explicit instruction this session. Label everything
  sourced from it as override material, append an `overrides` entry to the record, and
  leave the tier unchanged — an override is a one-time exception, not a re-rating.
- **caution** — fetchable, but every claim from it needs independent corroboration,
  including background framing. Criteria: reliability D; `coi.severity:
  undisclosed_affiliate`, or `disclosed_affiliate` with `reviewersActuallyTested:
  no_stock_only`; ownership change pending re-review; stale record (see Maintenance).
- **approved** — normal use under the domain profile rules. Reliability A–C with no
  unresolved COI or slop flags. Approved is a prior, not a pass: load-bearing claims
  still need the corroboration rules in SKILL.md.

Cap rules (the persistent form of the evaluation rubric's caps):

- 2+ negative expert-vs-grifter signals → reliability capped at D.
- ≥2 independent external assessments rate the source unreliable → capped at D.
- `coi.severity: vendor_owned` → blocked, regardless of every other field. A vendor
  owning or financing its own "independent" reviewer corrupts the ranking incentive in
  a way disclosure cannot cure.
- Ownership change + topical pivot → wipe `spotChecks`, drop to caution, log the event.
  This is the expired-domain-abuse pattern: a reputable domain's track record does not
  transfer to its new owner.

## Record format

`sources/<domain>.md` — YAML frontmatter for structured fields, prose body for
lateral-reading findings. Omit unknown fields rather than guessing; a sparse honest
record beats a complete invented one.

```yaml
---
domain: example-reviews.com
tier: blocked                    # derived; recompute whenever an input field changes
depth: full                      # stub | full
sourceReliability: E             # A–F per evaluation-tools.md
reliabilityJustification: >
  Vendor-owned since 2024 acquisition; review of owner's product flipped
  negative-to-positive post-acquisition.
  # Must describe the SOURCE (track record, incentives, access) —
  # never any specific claim's plausibility.
contextNote: ""                  # RSP lesson — "reliable for X, not for Y" when tier is context-dependent
coi:
  severity: vendor_owned         # none | disclosed_affiliate | undisclosed_affiliate | vendor_owned | unknown
  affiliateLinksPresent: true
  disclosureQuality: buried      # none | buried | adequate | unknown
  reviewersActuallyTested: no_stock_only   # yes_evidence | no_stock_only | mixed | unknown
  vendorRelationships:
    - vendor: AcmeCo
      relationship: owns         # owns | financed | pays_commission | paid_consulting | private_label
      evidence: https://example.com/press-release
identity:
  legalEntity: ""
  parentOrganization: AcmeCo Holdings
  domainCreated: "2014-03-02"    # deep pass, via rdap.org
  ownershipChangeEvents:
    - { date: "2024-07-01", note: "Acquired by AcmeCo-financed media group" }
  siblingSites: []               # assert only with ≥2 corroborating signals (shared GA/AdSense id, ads.txt entity, template, IP)
aiSlop: none                     # none | suspected | confirmed
wikipediaRSPStatus: not_listed   # generally_reliable | no_consensus | generally_unreliable | deprecated | blacklisted | not_listed | unchecked
externalAssessments: []          # [{ source, rating, url }] — store each separately, never merge into one score
spotChecks:
  - { date: "2026-08-27", claim: "battery 12h", result: refuted }   # verified_2plus_primary | single_source | refuted
overrides: []                    # [{ date, note }] — user-forced uses of a blocked source
provenance:
  assessedAt: "2026-08-27"
  method: deep_pass              # cheap_screen | deep_pass | user_directive
  confidence: very_likely        # estimative lexicon from SKILL.md
  evidenceUrls: []
lastReviewed: "2026-08-27"
schemaVersion: 1
---

## Lateral reading

What independent sources say about this source: press coverage, lawsuits, ownership
reporting, fact-checker mentions. Prose, with links.

## History

Dated notes on tier changes, re-reviews, and overrides.
```

Never store: per-claim credibility ratings; search ranking position; paid link-graph
metrics (Moz DA, Ahrefs DR, Majestic TF, Semrush AS) as fact — they are documented as
cheaply gameable. If the user supplies one, record it under `externalAssessments` with
the note "gameable metric, corroborate".

## Two-speed ingest

**Cheap screen** — for every *new* load-bearing source encountered during research. Costs
at most one extra search; everything else is judged from pages already fetched:

1. Lateral read: one search about the source itself (owner, funding, reputation).
2. COI scan of the fetched pages: affiliate URL patterns (`amzn.to`, `?tag=`, `/ref=`,
   ShareASale/CJ/Impact/Awin redirects), `rel="sponsored"`, "we may earn a commission"
   text, disclosure placement (inline vs buried footer), every "best-of" link pointing
   to one retailer.
3. Named human author with an external footprint? Evidence of actual testing (original
   photos, measured numbers, observed failures) vs spec-sheet rewrites?
4. AI-slop heuristics (below).
5. Assign A–F with justification, derive the tier, write a stub record (`depth: stub`)
   and an index line.

**Deep pass** — run only when a source is contested, a conclusion would otherwise rest on
this source alone, the user says "vet <domain>" or "review the source library", or a
stub/caution source is encountered for the third time. All steps are free via web fetch:

1. RDAP: `https://rdap.org/domain/<domain>` → creation date, registrar, last-updated
   events. Registrant is usually GDPR-redacted — treat RDAP alone as weak for ownership.
2. Fetch `https://<domain>/ads.txt`, `/sellers.json`, `/trust.txt` → monetization and
   ownership entities.
3. Wikipedia article on the source, and its status on
   `https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources/Perennial_sources`.
4. Targeted searches: "who owns <domain>", "<domain> lawsuit", "<domain> acquired".
5. If tracker IDs are visible in page source, sibling-site lookup (SpyOnWeb, DNSlytics);
   assert shared ownership only on ≥2 independent signals — a single shared analytics ID
   is not proof. Check the Wayback Machine if a live site has scrubbed its IDs.
6. Set `depth: full`, re-derive the tier, update the index line.

No paid APIs (Moz, Ahrefs, Majestic, Semrush, NewsGuard, Ad Fontes). Skip those fields
rather than approximating them.

## AI-slop heuristics

Two or more of these → `aiSlop: suspected` (tier caution). Confirmation — failed spot
checks on its specifics, or documented content-farm reporting — → `confirmed` (blocked).

- No named human author, or author bios with generated headshots and zero external
  footprint (no bylines elsewhere, no professional or social history).
- Publish cadence impossible for the visible staff (dozens of longform posts per day).
- Pure paraphrase of other coverage: no primary reporting, no original quotes, no
  original images or data.
- Uniform article scaffolding across the site — same headings, same hedging boilerplate,
  listicle coverage of everything far outside any coherent beat.
- Young domain (or recent ownership change) with a suspiciously large archive —
  cross-check `domainCreated` against archive depth on the deep pass.
- Specific-sounding numbers that fail spot checks; slop invents plausible detail.

## Maintenance

- `lastReviewed` more than 12 months old on an approved/caution record → treat as
  caution until a cheap re-screen. Blocked never auto-expires — fabrication history and
  vendor ownership don't heal with time.
- Any newly discovered ownership change → wipe spot checks, drop to caution, log the
  event.
- "review the source library" → list stale records and caution-tier sources; offer deep
  passes on the ones doing recurring work.
- Every user-directed tier change ("block X", "approve X") is honored immediately and
  gets a provenance entry with `method: user_directive` — the user's call outranks the
  derived tier in both directions.

## sources.md format (the index)

Grouped by tier, blocked first (the gate check reads top-down). One line per source,
hook ≤ 80 chars:

```markdown
# Source Library Index

## Blocked
- example-reviews.com — E — vendor_owned by AcmeCo; review flipped post-acquisition (2026-08)

## Caution
- gadget-blog.net — D — undisclosed affiliate, no testing evidence (2026-07)

## Approved
- rtings.com — B — independent lab testing, disclosed affiliate, methodology published (2026-06)
```
