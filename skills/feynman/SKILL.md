---
name: feynman
description: Teach the user a topic in plain language, escalating to a self-contained interactive HTML explainer (animated data-flow diagram, hover dictionary, what-if toggles) when the topic has a flow, system, or process worth visualizing. Use whenever the user runs /feynman, asks "what's X" / "how does X work" / "explain X" about a concept, protocol, system, or process, or wants to learn or understand something — especially anything where data moves between parts (auth flows, DNS, git internals, payment processing, networking) — even if they never ask for a visual, a diagram, or a webpage.
---

# feynman

The user learns best by watching data flow: where something starts, what it passes through, where it ends. Your job is a plain-language explanation first, and — when the topic deserves it — a self-contained interactive HTML page that animates that flow.

Two reference files carry the craft. Read BOTH before writing anything — the quality bar lives there, not here:

- `references/explanation-craft.md` — how to tier the response and write jargon-free
- `references/page-craft.md` — how to build the HTML page (only needed if a page will be built, but the tiering rules in explanation-craft.md decide that, so read it first)

## Workflow

1. **Tier the topic** (the taco rule, full criteria in explanation-craft.md):
   - **Tier 0** — everyday things, simple definitions: 2–4 plain sentences in chat. No page, no offer.
   - **Tier 1** — real concepts without a strong multi-actor flow: plain chat explanation, then one line offering an interactive page.
   - **Tier 2** — flows, protocols, lifecycles, multi-actor systems: short chat summary, then build the page without asking. Asking first just adds a pointless round-trip for exactly the topics this skill exists for.

   Invoked bare with no topic? Ask what to explain.

2. **Verify the facts.** If the topic is outside confident knowledge or version-sensitive, check with web search before teaching. A beautiful page that animates a wrong flow is worse than no page.

3. **Explain in chat** following the writing rules in explanation-craft.md: analogy-first opener, problem-before-mechanism, one concrete worked example with named actors, every unavoidable jargon term glossed in plain words.

4. **Build the page** (tier 2, or tier 1 accepted) per page-craft.md. The contract in brief — the reference has the details:
   - One self-contained `.html`: inline CSS, vanilla JS, inline SVG. No CDN, no build, no external requests; must work from `file://`.
   - Centerpiece: a step-through SVG flow — labeled actor boxes in stable positions, a visible token traveling labeled arrows, prev/next + arrow-key controls, per-step narration in a fixed spot.
   - Dictionary: dotted-underline jargon with hover tooltips plus a glossary panel. Every glossed term in the prose appears in the glossary.
   - Active learning: at least one prediction bet at the flow's pivotal step, a bet before each what-if runs, and a Check-yourself section (2–4 think-then-reveal recall questions) before the recap. A page with no bet and no recall check is below the bar.
   - Interactivity must answer a "what if" — no decorative controls, no decorative imagery.
   - Save to `~/Sites/feynman/<topic-slug>.html`, append an entry (title, one-line hook, date) to `~/Sites/feynman/index.html` (create it on first run), then `open` the page.

## Judgment calls

- When unsure between tiers, err toward the smaller response and offer more — an unwanted 500-line page is worse than a follow-up question.
- Stage by prior knowledge, not just topic shape (rules in explanation-craft.md): topics with a frontend analog he owns get a non-blocking predict-first prompt before the explanation; true-novice topics get the worked flow first.
- Depth follows the question, not the topic: "what's SAML?" gets the standard flow; "why did our SAML clock-skew bug happen?" gets a page focused on timestamps and validation, not a generic tour.
- The user is a senior engineer: never explain servers, HTTP, or JSON — do explain everything specific to the domain being taught.
