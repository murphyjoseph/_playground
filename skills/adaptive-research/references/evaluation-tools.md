# Evaluation Tools

Cross-domain instruments. Read this when a task has 3+ load-bearing sources, contested claims, or an expert whose trustworthiness is itself the question.

## Two-axis scoring (Admiralty-style)

Rate every load-bearing source item on both axes, justified *separately*. The whole point is representing combinations like A5 (trusted source, improbable claim) and E1 (untrusted source, confirmed claim) — both are common in real research.

### Axis 1 — Source reliability (who is saying it)

| | Rating | Meaning |
|---|---|---|
| A | Completely reliable | Long verified track record, no competing incentives, primary access |
| B | Usually reliable | Good track record, minor gaps or mild incentive concerns |
| C | Fairly reliable | Mixed track record, or reliable but secondhand/relaying |
| D | Not usually reliable | Poor track record or strong conflicting incentives |
| E | Unreliable | History of fabrication, or incentives fully aligned against accuracy |
| F | Cannot be judged | No track record available — new or anonymous source |

Reliability inputs: track record on checkable claims (run a spot check, below), primary vs. relaying, incentives (who pays them, what they sell), skin in the game (do they bear a cost for being wrong?), audience-capture drift (see expert signals below).

### Axis 2 — Claim credibility (what is being said)

| | Rating | Meaning |
|---|---|---|
| 1 | Confirmed | Independently corroborated by other origins or primary evidence |
| 2 | Probably true | Consistent with the broader evidence base, partial corroboration |
| 3 | Possibly true | Plausible, uncorroborated |
| 4 | Doubtful | Tension with better-established evidence |
| 5 | Improbable | Contradicted by strong evidence |
| 6 | Cannot be judged | No basis for assessment |

Credibility inputs: corroboration by *independent origins* (not republications of the same origin — Woozle effect), consistency with the strongest evidence in the domain, and diagnosticity.

### The diagonal trap

In practice ~87% of analyst ratings land on A1/B2/C3 — reliability bleeding into credibility. Guard against this: write the justification for each axis before assigning the other's score, and actively look for off-diagonal cases. If every rating you assign is on the diagonal, you are probably rating the source twice, not the source and the claim. A well-run assessment frequently lands at B2: valuable information from a trustworthy source, stated without overconfidence — a good default posture for your own outputs too.

## Epistemic spot check

For any source doing heavy lifting whose reliability you can't otherwise establish:

1. Pick 2–3 of its claims that are *checkable* (specific, factual, verifiable elsewhere).
2. Verify them against independent primary evidence.
3. Use the hit rate as the trust prior for the source's unverifiable claims: 3/3 → treat as B-range; 1/3 or worse → treat as D/E and stop relying on it.

Cheap, fast, and much more informative than reading more of the same source.

## Analysis of Competing Hypotheses (full procedure)

Use when hypotheses genuinely compete — contested causes, disputed events, "which explanation is right." The purpose is countering confirmation bias, so the discipline matters more than the matrix formatting.

1. Brainstorm a *complete* set of hypotheses — including ones you'd rather not consider.
2. List significant evidence and arguments for and against each.
3. Build a matrix: evidence items × hypotheses, marking consistent/inconsistent/neutral.
4. Assess each evidence item's **diagnosticity**. Evidence consistent with every hypothesis has zero decision value no matter how vivid it is; evidence that discriminates between hypotheses is what matters.
5. Refine: drop non-diagnostic evidence, split or merge hypotheses.
6. Draw conclusions by trying to **disprove** each hypothesis. The tentative winner is the one with the *least evidence against it* — not the most evidence for it.
7. Sensitivity check: identify the few evidence items your conclusion hinges on. If one of them were wrong or deceptive, would the conclusion flip? Flag those items and their verification status.
8. Report likelihoods for *all* surviving hypotheses, plus future indicators that would shift the assessment.

Caveat to encode in your own confidence: ACH is a disciplined thinking aid, not a debiasing guarantee — confirmation bias persists even in trained users. Its main value is steps 4 and 6.

## Genuine expert vs. grifter/promoter

Apply when a claim's weight rests on an individual's authority.

**Positive signals (genuine expertise):**
- Shipped, primary work: production systems, published primary research, verifiable artifacts (code, data, schemas, real dashboards) — the technical equivalent of citing sources
- Specific implementation detail rather than vibes; willingness to show failure cases
- Peer recognition from other practitioners (not audience size)
- Skin in the game: bears a real cost when wrong
- Fox-like style: probabilistic, hedged, eclectic, updates on evidence, asks "what would change my mind"

**Negative signals (grift/capture):**
- Primary revenue is a course/product/subscription directly tied to the claim
- Hedgehog style: one big idea, monocausal, supremely confident — forecasting research shows this style predicts *worse* accuracy, and fame correlates negatively with it
- Credentials-as-authority with no verifiable artifacts
- Audience capture: positions have drifted toward what their audience rewards; engagement rewards extremity
- Woozle pattern: their "evidence" traces back to one uncorroborated origin repeatedly re-cited
- Remember Gibson's Law: for every PhD there is an equal and opposite PhD — a credential alone never settles a contested question

None of these is deterministic alone; two or more negative signals should cap the source at D on the reliability axis.
