# Documentation craft — shared rules

Loaded by `doc-reviewer` and `readme-writer`. Operationalized from Ousterhout (*A Philosophy of Software Design*), Martin (*Clean Code* ch.4), the TSDoc spec, JSDoc conventions, Atwood ("Code Tells You How, Comments Tell You Why"), and Diátaxis.

## Comment philosophy (reviewer)

Core rule: **comments capture what the code cannot.** A comment that restates the code is noise; a comment that explains intent, constraints, or non-obvious WHY is essential.

Require a doc comment when:
- The symbol is **exported / public API** (function, class, type, interface, exported const). Callers read the doc, not the body.
- The code embeds a **non-obvious decision**: a workaround, a magic number, an ordering dependency, a perf hack, an env/browser quirk, a deliberate deviation from the obvious approach.

Do NOT require a comment when:
- The code is self-evident (a one-line private helper, a trivial getter).
- The comment would only restate the code.
- It's a type-only re-export or generated code.

## Bad-comment taxonomy (reviewer — flag these)

- **Wrong / stale / misleading** — describes behavior the code no longer has. `[critical]`. Includes `@param`/`@returns` names or types that no longer match the signature.
- **Commented-out code** — delete it; git is the history. `[critical]`.
- **Redundant** — restates the code (`// increment i` over `i++`). `[nit]`.
- **Noise / banner / divider / position-marker** comments. `[nit]`.
- **Journal / changelog / attribution** comments — git owns this. `[nit]`.
- **Uninformative TODO/FIXME** — no context, no ticket. `[important]`.

## TSDoc / JSDoc conventions (reviewer)

- First line is a one-sentence summary in the imperative or descriptive mood, consistent across the file.
- `@param name` for each parameter that isn't self-evident; must match the signature.
- `@returns` when the return is non-void and not obvious from the name.
- `@remarks` for design notes too long for the summary.
- `@example` for non-trivial public API.
- `@deprecated` must include the replacement / migration path.
- `@throws` when the function throws a caught-by-caller error.
Mismatches between tags and the actual signature are `[important]`; missing optional richness (no `@example`) is at most a `[nit]`.

## README rules (generator)

- **Lead with the reader's benefit.** "What is this?" is 1–2 jargon-free sentences describing what it does *for the caller*, not how it's built.
- **Quick Start must run.** Use real import paths and real exported symbols read from the source — never a plausible-looking invention.
- **When to use this** lists concrete scenarios; imply when *not* to where it sharpens the boundary.
- **Key Features**: bold term + terse description. No marketing adjectives.
- **Omit empty sections** rather than padding. A 5-line README for a 5-line package is correct.
- **One screen, bullets over prose**, skimmable in under a minute.
- **Mixed audience only where earned**: plain-language line, then an `Engineers:` gloss for the technical detail — not on every line.
- Internal monorepo: relative cross-package links, no badges/license/contributing.

## House voice (both)

Direct, concise, no buzzwords (`seamless`, `robust`, `leverage`, `it's worth noting`). No em dashes. Prefer concrete nouns and active voice. Cut filler openers.
