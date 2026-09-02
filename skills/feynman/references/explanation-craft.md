# Explanation craft

Operationalized rules for deciding how much explanation a topic deserves and writing it jargon-free. Sources: Feynman technique; multimedia-learning meta-analyses (Noetel 2022 — contiguity, coherence, signaling, segmenting); the testing effect (retrieval with feedback); predict-observe-explain; analogical encoding (compare cases, map breakpoints); Nicky Case / Bret Victor explorable patterns.

## Tier the response first (the taco rule)

Decide the tier before writing anything.

- **Tier 0 — plain answer.** Everyday things, simple facts, definitions with no system underneath ("what's a taco", "what does idempotent mean"). 2–4 sentences in chat, zero jargon, no page. Offer a page only if the reader pushes deeper.
- **Tier 1 — chat explanation + offer.** Real concepts without a strong flow or multi-actor system ("what's a monad", "what's TCP slow start" for a casual ask). Plain explanation in chat, then one line: offer an interactive page if it would help.
- **Tier 2 — build the page.** Anything with a flow of data, multiple actors, a protocol handshake, a lifecycle, or a process over time ("what's SAML", "how does DNS resolution work", "what happens when I git push"). Build without asking.

Signal for tier 2: the explanation naturally wants a diagram — "then it goes to…" keeps appearing.

## Stage by prior knowledge (separate axis from tier)

Tier decides the format; the reader's prior knowledge decides the opening move.

- **Adjacent traction** (topic has a frontend analog he owns — caching, queues, CI/CD, rate limiting): pose a one-line predict-first prompt in chat before explaining, inline and non-blocking ("Guess first: where do you think the retry lives? Answer below."). Struggle-then-reveal beats telling when the reader can generate a real attempt.
- **True novice** (no usable schema — consensus internals, crypto math): worked explanation first, vocabulary before flow. Problem-first backfires without prior knowledge to attempt with.

## Writing rules

- Open with a one-sentence "what it is" anchored to something the reader already knows (an analogy from daily life, not from another technical domain).
- When the topic sits next to frontend ground he owns (event loop, HTTP caching, Redux, npm pipelines), add a second anchor mapping to that schema — and in the same breath name where the analogy breaks ("a message queue ≈ an event queue, BUT adds durability, ordering, backpressure"). An analogy without its breakpoints installs wrong intuitions.
- Answer "what problem does this solve" before "how it works". Nobody cares about the mechanism of a thing they don't know the point of.
- Concrete before abstract: run one worked example with named, specific actors — "you click 'Sign in with Google' on figma.com", never "the client contacts the identity provider".
- Jargon budget: prefer the plain word. Every unavoidable term gets a plain-language gloss at first use AND a dictionary entry. Never define jargon using other jargon.
- Feynman test: any sentence a smart teenager couldn't follow gets rewritten, not footnoted.
- Segment: numbered steps, one idea per step, at most 2 sentences each.
- Close with a recap of at most 3 bullets — "if you remember one thing" — plus one line stating the general pattern the concrete example instantiated ("the shape: client → broker → consumer, with acks"). Concrete first, but never concrete-only: the abstract close is what transfers.
- Audience calibration: senior engineer, zero assumed knowledge of THIS domain. Don't explain what a server is; do explain what an IdP is.

## Multimedia principles (Mayer, operationalized)

- **Coherence:** no decoration. Every visual element encodes meaning. No clip-art, no stock icons, no infographic filler.
- **Signaling:** at each step, highlight the active actor and edge; dim everything else.
- **Spatial contiguity:** the narration for a step sits directly beside the visual it describes — no eye travel to a separate column.
- **Segmenting:** the reader controls pace (prev/next). Never autoplay-only.
- **Dual channel:** every visual step is paired with 1–2 sentences of narration; neither stands alone.
- **Pre-training:** introduce the actors and vocabulary (the cast of characters) before animating the flow between them.

## Active learning (Case / Victor, plus the testing effect)

- **Place your bets:** before a key reveal, ask the reader to predict (click a choice, then show the answer). At least one per page, at the flow's pivotal step — a wrong bet plus the reveal is where encoding happens. Cap at ~3; betting on everything is noise.
- **Check yourself:** every page ends with 2–4 recall questions before the recap — think-then-reveal, not multiple choice — each reveal confirming or correcting in one sentence. Retrieval with feedback is the strongest lever in the learning literature; a passive recap alone is the weakest.
- **Contrast two cases:** prefer what-ifs that put two cases side by side (happy path vs failure path, polling vs push) and name the structural difference. Comparing contrasting cases beats studying one.
- **Meaningful interactivity:** every control must answer a "what if". If moving a slider doesn't change understanding, cut the slider.
- **Animate only change-over-time:** the flow earns animation because the sequence is the lesson. Static concepts get static diagrams the reader can dwell on — animation is transient and taxes working memory.
- **Ladder of interactivity:** step-through → parameter toggles → sandbox. Use the lowest rung that teaches the idea; add a sandbox only when free play reveals something guided steps can't (manytinythings earns its sandboxes; most protocol explainers don't need one).
- **Immediate feedback:** every interaction responds within 100ms.
