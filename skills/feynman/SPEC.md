# feynman — skill spec

Handoff spec for skill-creator. The craft rules live in `references/` and are final; the SKILL.md orchestrates them.

## What it does

`/feynman <topic or question>` teaches Murph a topic in plain language, escalating to a self-contained interactive HTML explainer when the topic has a flow, system, or process worth visualizing. He learns best from visualizations of data flow: where something starts, what it passes through, where it ends.

## Behavior

1. Classify the topic into a tier per `references/explanation-craft.md` (taco rule):
   - Tier 0: short plain answer in chat, no page.
   - Tier 1: plain chat explanation, then offer a page.
   - Tier 2 (flows, protocols, multi-actor systems, lifecycles): plain chat summary (a few sentences), then build the page without asking.
2. If the topic is unfamiliar or version-sensitive, verify facts with web search before teaching — never explain from shaky memory.
3. Build the page per `references/page-craft.md`: single offline-capable HTML file, SVG step-through flow with traveling token, cast-of-characters intro, hover dictionary + glossary panel, optional what-if toggles, recap.
4. Save to `~/Sites/feynman/<slug>.html`, append to `~/Sites/feynman/index.html` (create if missing), then `open` it.

## Invocation

- Deterministic: user types `/feynman SAML` (or a full question).
- Description should also catch natural asks like "explain SAML to me with a visual", "make me an explainer for X", "teach me how X works".
- Bare `/feynman` with no argument: ask what to explain.

## Hard rules (must survive into SKILL.md)

- Both reference files are read before writing any explanation or page.
- No jargon without a plain gloss at first use + dictionary entry.
- No page for tier-0 topics; never ask "want a page?" for tier-2 topics — just build.
- Page is one file, no CDN, no build, no external requests.
- Every control on the page must answer a "what if"; no decorative interactivity or imagery.

## Eval guidance (for skill-creator's harness)

- "what's SAML?" → tier 2: chat summary + page with SP/IdP/browser actors, token traveling the redirect flow, glossary covering SAML/IdP/SP/assertion.
- "what's a taco?" → tier 0: 2–3 plain sentences, NO page, no offer unless depth is implied.
- "what's a monad?" → tier 1 or 2 judgment call; must not produce a jargon-defined-by-jargon answer.
- Check on any page output: every dotted-underline term has a glossary entry; flow ≤8 steps or phased; page renders standalone from file://.

## Placement

- Source of truth: `~/Sites/_playground/skills/feynman/`, symlinked from `~/.claude/skills/feynman`.
