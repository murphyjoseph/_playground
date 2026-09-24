# Domain Profile: Engineering / Best Practices

For questions about how practitioners actually build things: architecture choices, scaling, tooling, operational practices. Peer review barely exists here; the quality signals are *shipped work* and *implementation specificity*.

## Source tiers (strongest first)

1. **Org engineering blogs from teams operating at the relevant scale** (Netflix, Stripe, Cloudflare, Meta, GitHub, etc.) — implementation-level postmortems and design writeups that generalize beyond the company's stack
2. **Official documentation and source code** — ground truth for what a system does, though not for whether it's a good idea
3. **Recognized practitioners**: conference talks, books, and posts from people with verifiable shipped systems in the area
4. **Community experience reports** (issues, RFCs, high-signal forum threads) — noisy but useful for failure modes docs won't mention
5. **Individual "thought leader" content** — evaluate with the expert-vs-grifter signals in `evaluation-tools.md` before assigning any weight

## What genuine engineering authority looks like

- **Primary work you can inspect:** real code with error handling, real dashboards/metrics, actual schemas/DDL/API specs. Specific artifacts are the technical equivalent of citing sources.
- **Skin in the game:** the author operates the system they describe and eats the pages when it breaks. Prefer "here's what broke and why" over "here are 10 best practices."
- **Peer recognition among practitioners**, not follower counts.
- **Specificity about tradeoffs and failure cases.** Anyone recommending a technology without describing when *not* to use it is marketing, not engineering.

## Red flags

- Author's revenue is a course, tool, or consultancy tied directly to the recommendation → conflict of interest; corroborate independently before relying on it
- Confident, monocausal, universal claims ("X is dead," "always use Y") — hedgehog style is a negative accuracy signal
- Audience capture: content drifted toward what the audience rewards (hot takes, contrarianism)
- Advice with no artifacts — no code, no numbers, no incidents, just credentials

## Recency weighting

This field moves fast; recency matters far more here than in the scientific profile. Check publication dates on everything. A 2019 post about a fast-moving ecosystem is a historical document. When a claim depends on current tool behavior, verify against current official docs or a current release — never rely on memory or older secondary coverage of a tool's capabilities.

## Vendor content

Vendor engineering content is often technically excellent *and* structurally biased toward the vendor's product. Use it for how-the-product-works; do not use it alone for whether-to-choose-the-product or comparative claims. Flag vendor authorship when citing it for anything comparative.
