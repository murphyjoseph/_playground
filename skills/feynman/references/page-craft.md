# Interactive page craft

Rules for the HTML explainer pages `/feynman` produces.

## File contract

- One self-contained `.html` file: inline CSS, vanilla JS, inline SVG. No CDN, no build step, no external requests. Must work offline via `file://`.
- Save to `~/Sites/feynman/<topic-slug>.html`.
- Maintain `~/Sites/feynman/index.html` (create on first run): a simple list of every explainer — title, one-line hook, date. Append the new page each run.
- Open the finished page with `open`.

## Page anatomy

Adapt to the topic; omit sections that don't apply rather than padding.

1. **Title + hook** — the one-sentence analogy.
2. **The problem it solves** — 2–3 sentences.
3. **Cast of characters** — actor boxes with names, one-line roles, and their colors, introduced BEFORE the flow animates (Mayer's pre-training).
4. **The flow** — the centerpiece. SVG actors + labeled arrows + a visible token traveling between them. Controls: prev/next buttons, step counter ("3 / 7"), left/right arrow keys, optional play button. A narration caption updates per step, fixed in one spot adjacent to the canvas.
5. **Play with it** — only when a parameter genuinely teaches: toggles or choices showing what-ifs ("what if the assertion is expired?" → watch the flow fail at step 5). Skip entirely if no what-if changes understanding.
6. **Dictionary** — jargon terms get a dotted underline with hover/tap tooltip; a collapsible glossary panel lists them all. Every glossed term in the prose MUST have a dictionary entry.
7. **Recap** — 3 bullets max.

## Flow visualization rules

- Actors are labeled boxes in stable positions; each keeps one color for the entire page.
- Data travels as a visible token/packet along the arrow; the arrow label says what is carried ("signed SAML assertion"), not just "sends".
- Current step at full opacity; inactive actors and edges dimmed (~0.3).
- Narration: step number + 1–2 sentences, same location every step.
- Max 8 steps per flow. More than 8 → chunk into named phases with their own mini-flows.
- The page must still teach if the reader only clicks Next through it — each step readable statically, no interaction-gated content.

## Visual design

- System font stack; 17–18px body; line-height 1.6; prose max-width ~65ch, centered.
- Whitespace over borders. One accent color family per actor; semantic colors stay consistent (secrets/failures red, success green).
- High contrast; pick light or dark deliberately (honoring `prefers-color-scheme` is a nice-to-have, not required).
- No decorative imagery. Every pixel encodes meaning (Mayer's coherence principle — the anti-infographic rule).

## Interaction quality bar

- All input responds <100ms; movement uses CSS transitions of 150–300ms.
- Keyboard: arrow keys step the flow; controls reachable by tab.
- Prediction prompts ("place your bets") before key reveals where natural — a two-button choice, then reveal.
- Everything works with a trackpad; nothing requires precise dragging.
