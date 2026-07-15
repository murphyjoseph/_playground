# Documentation craft — operationalized rules

Operationalized from Ousterhout (*A Philosophy of Software Design*, ch. 12–16), Martin (*Clean Code* ch. 4), antirez ("Writing system software: code comments"), the TSDoc spec, JSDoc conventions, Google's TS/JS and Python style guides, PEP 257, Atwood ("Code Tells You How, Comments Tell You Why"), Diátaxis, and docs-as-code drift principles.

> Temporary duplication note: `~/.claude/agents/references/documentation-craft.md` is loaded by the personal `doc-reviewer` and `readme-writer` subagents and overlaps with this file. At promotion into agent-native, all three graduate together sharing ONE bundled reference.

## Comment philosophy

Core rule: **comments capture what the code cannot.** A comment that restates the code is noise; a comment that explains intent, constraints, or non-obvious WHY is essential.

Require a doc comment when:
- The symbol is **exported / public API** (function, class, type, interface, exported const). Callers read the doc, not the body.
- The code embeds a **non-obvious decision**: a workaround, a magic number, an ordering dependency, a perf hack, an env/browser quirk, a deliberate deviation from the obvious approach.

Do NOT require a comment when:
- The code is self-evident (a one-line private helper, a trivial getter).
- The comment would only restate the code.
- It's a type-only re-export or generated code.

## Bad-comment taxonomy (flag these)

- **Wrong / stale / misleading** — describes behavior the code no longer has. `[critical]`. Includes `@param`/`@returns` names or types that no longer match the signature.
- **Commented-out code** — delete it; git is the history. `[critical]`.
- **Redundant** — restates the code (`// increment i` over `i++`). `[nit]`.
- **Noise / banner / divider / position-marker** comments. `[nit]`.
- **Journal / changelog / attribution** comments — git owns this. `[nit]`.
- **Uninformative TODO/FIXME** — no context, no ticket. `[important]`.

antirez's shorthand for the good kinds: **design** comments (why this approach), **why** comments (why this line is the way it is), **teacher** comments (domain knowledge the reader can't infer), **guide/checklist** comments (orientation in unavoidable complexity). The bad kinds: **trivial** (restates code), **debt** (vague TODO), **backup** (commented-out code).

## Artifact existence and drift resistance

The gate every doc — comment, README, docs page, ADR — must pass before it's created or kept:

- **Name the reader and the moment.** Who reads this, and when? No concrete reader-moment → don't create it; recommend deleting it if it exists.
- **One fact, one home.** Information lives at exactly ONE level, the closest to code that can hold it: type signature > doc comment > colocated README > docs/ page. Never duplicate a fact across levels; link to the single source instead.
- **Drift test, per sentence:** "would this be wrong after a routine refactor?" Fast-changing facts fail (file lists, step counts, versions, directory trees, code snippets duplicating real code). Slow-changing facts pass (intent, invariants, contracts, WHY). Cut or generalize failures.
- **Update trigger.** Every artifact needs a natural force keeping it current: a regeneration script, a CI check, or colocation with the code it describes. No trigger → the artifact may hold slow-changing content only.
- **Deletion is a first-class fix.** An absent doc confuses no one; a stale one lies.
- **Temporal language is a time bomb.** "Currently", "for now", "temporary", "new", "recently", "soon", "legacy", "the old way" guarantee future staleness — the sentence is wrong the moment the situation changes and nothing forces an update. Anchor them to a ticket, date, or version, or cut them.
- **Staleness propagates.** When a fact changes (a default, a config key, a signature), every other home of that fact goes stale silently — hunt them down rather than trusting the diff's boundaries.
- **Blame is a staleness detector.** A comment untouched by git blame while the code around it changed is suspect until re-verified.
- **Agent context files (AGENTS.md / CLAUDE.md) are doc artifacts under all these rules, at the highest stakes.** Every line loads on every agent turn, so a stale line doesn't just confuse a reader — it actively steers agents wrong, repeatedly. Hold them to the drift test hardest, and keep them lean.

## Write-side procedure

- JSDoc/TSDoc first line: a one-sentence contract for the CALLER — what it does, not how. Imperative or descriptive mood, consistent across the file.
- Skip `@param` when the name + type already say it. Document what they can't: units, ranges, edge cases, side effects, non-obvious defaults.
- `@returns` when the return is non-void and not obvious from the name. `@throws` when the function throws an error the caller is expected to catch. `@deprecated` must include the migration path. `@example` for non-trivial public API.
- **Types are documentation — never restate them.** A doc line that repeats the signature's types is drift waiting to happen.
- Inline comments are WHY-only. Before writing one, try to make the code say it: rename, extract a function, name a constant. The comment is the fallback, and it states the constraint, not the code.
- When repairing existing docs, prefer **delete > shorten > rewrite**, in that order.
- Tag/signature mismatches are `[important]`; missing optional richness (no `@example`) is at most a `[nit]`.

## Python

- PEP 257 mechanics: triple-quoted docstrings; one-line imperative summary ("Return the user's balance.", not "Returns..."/"This function..."); blank line before further detail.
- Google-style sections (`Args:` / `Returns:` / `Raises:`) only for entries that aren't self-evident.
- **Type hints replace type prose** — never restate a hint in the docstring.
- Public module/class/function gets a docstring; private helpers only when non-obvious.

## README rules

- **Lead with the reader's benefit.** "What is this?" is 1–2 jargon-free sentences describing what it does *for the caller*, not how it's built.
- **Quick Start must run.** Real import paths and real exported symbols read from the source — never a plausible-looking invention. Prefer pointing at a runnable example over duplicating code into the README (duplicated snippets fail the drift test).
- **When to use this** lists concrete scenarios; imply when *not* to where it sharpens the boundary.
- **Key Features**: bold term + terse description. No marketing adjectives.
- **Omit empty sections** rather than padding. A 5-line README for a 5-line package is correct.
- **One screen, bullets over prose**, skimmable in under a minute.
- Internal monorepo: relative cross-package links, no badges/license/contributing.
- Whole-README generation belongs to `readme-writer`; this skill judges existence and drift.

## Standalone docs pages and ADRs

- A docs/ page must justify not being a README section or a doc comment (the one-fact-one-home ladder). Most can't.
- Diátaxis lens for what a page is *for*: tutorial (learning), how-to (task), reference (lookup), explanation (understanding). A page mixing all four is a page nobody can maintain.
- ADRs record decisions — slow-changing by nature, so they age well. But an ADR that describes current file layout or API shape has smuggled in fast-changing facts; cut them.

## Models to emulate

- **Stripe API reference** — contract-first, caller-centric: every entry says what the caller gets, sends, and must handle.
- **SQLite and Redis source comments** — design/why/teacher comments that carry knowledge the code can't.
- **React docs** — explanation prose that teaches the model, not the API surface.

## House voice

Direct, concise, no buzzwords (`seamless`, `robust`, `leverage`, `it's worth noting`). No em dashes. Prefer concrete nouns and active voice. Cut filler openers.
