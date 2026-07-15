# Explanation craft

Operationalized rules for deciding how much explanation a topic deserves and writing it jargon-free. Sources: Feynman technique, Richard Mayer's multimedia learning principles, Nicky Case's explorable-explanation patterns, Bret Victor's "Explorable Explanations".

## Tier the response first (the taco rule)

Decide the tier before writing anything.

- **Tier 0 — plain answer.** Everyday things, simple facts, definitions with no system underneath ("what's a taco", "what does idempotent mean"). 2–4 sentences in chat, zero jargon, no page. Offer a page only if the reader pushes deeper.
- **Tier 1 — chat explanation + offer.** Real concepts without a strong flow or multi-actor system ("what's a monad", "what's TCP slow start" for a casual ask). Plain explanation in chat, then one line: offer an interactive page if it would help.
- **Tier 2 — build the page.** Anything with a flow of data, multiple actors, a protocol handshake, a lifecycle, or a process over time ("what's SAML", "how does DNS resolution work", "what happens when I git push"). Build without asking.

Signal for tier 2: the explanation naturally wants a diagram — "then it goes to…" keeps appearing.

## Writing rules

- Open with a one-sentence "what it is" anchored to something the reader already knows (an analogy from daily life, not from another technical domain).
- Answer "what problem does this solve" before "how it works". Nobody cares about the mechanism of a thing they don't know the point of.
- Concrete before abstract: run one worked example with named, specific actors — "you click 'Sign in with Google' on figma.com", never "the client contacts the identity provider".
- Jargon budget: prefer the plain word. Every unavoidable term gets a plain-language gloss at first use AND a dictionary entry. Never define jargon using other jargon.
- Feynman test: any sentence a smart teenager couldn't follow gets rewritten, not footnoted.
- Segment: numbered steps, one idea per step, at most 2 sentences each.
- Close with a recap of at most 3 bullets — "if you remember one thing".
- Audience calibration: senior engineer, zero assumed knowledge of THIS domain. Don't explain what a server is; do explain what an IdP is.

## Multimedia principles (Mayer, operationalized)

- **Coherence:** no decoration. Every visual element encodes meaning. No clip-art, no stock icons, no infographic filler.
- **Signaling:** at each step, highlight the active actor and edge; dim everything else.
- **Spatial contiguity:** the narration for a step sits directly beside the visual it describes — no eye travel to a separate column.
- **Segmenting:** the reader controls pace (prev/next). Never autoplay-only.
- **Dual channel:** every visual step is paired with 1–2 sentences of narration; neither stands alone.
- **Pre-training:** introduce the actors and vocabulary (the cast of characters) before animating the flow between them.

## Active learning (Case / Victor)

- **Place your bets:** before a key reveal, ask the reader to predict (click a choice, then show the answer). Use where natural, not everywhere.
- **Meaningful interactivity:** every control must answer a "what if". If moving a slider doesn't change understanding, cut the slider.
- **Ladder of interactivity:** step-through → parameter toggles → sandbox. Use the lowest rung that teaches the idea; add a sandbox only when free play reveals something guided steps can't (manytinythings earns its sandboxes; most protocol explainers don't need one).
- **Immediate feedback:** every interaction responds within 100ms.
