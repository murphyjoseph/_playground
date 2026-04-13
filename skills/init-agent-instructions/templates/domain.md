# [AREA_NAME] — [one-line: what this directory is for]

<!--
  DOMAIN / SUBTREE template. For a code subdirectory (not a workspace) that has its own
  authoring conventions and a matching developer-guide doc. Keep it SHORT (~30-50 lines)
  and pointer-heavy — it is a ROUTER, not a manual. Inline only the load-bearing local
  rules; send everything else to the dev-guide .mdx so context is pulled on demand.

  This is NOT the app/package template: no metadata block, no public-API table, no
  commands, no PR checklist — those are inherited from the enclosing package/app guide.
  Model the tone on 1-2 existing subtree contracts in this repo if any exist (find them:
  CLAUDE.md files below workspace src/ dirs) — do not assume specific paths.

  Title is the AREA name (e.g. "Event Handlers", "Workflows") — not "CLAUDE.md — …".
-->

> **Subtree contract.** Loads automatically when you work in `[path/from/repo/root]`. Inherits root conventions ([`<rel>/CLAUDE.md`](<rel>/CLAUDE.md)) and the enclosing package/app guide — read those first. This file adds only what is specific to authoring [X] here; it does not restate root/package rules.

## What lives here

<!-- 1-3 sentences: this directory's role in the architecture and how it's organized
     (grouping, the required file set, file roles). Name the REAL base classes / entry
     files / registration points — verify them in the code, don't invent. -->

## Conventions

<!-- The non-obvious, load-bearing rules for THIS directory: naming, registration,
     required files, execution/lifecycle model, the footguns. Cite real symbols and
     paths. Cut anything already covered by the root or package guide. -->

- [rule]
- [rule]

## Adding a new [X]

<!-- Ordered, concrete steps so two sessions produce the same structure. Reference the
     real file-name conventions and any codegen / registration step that must run.
     Happy path only. -->

1. [step]
2. [step]

## Read for depth

<!-- Pointers, NOT content. Link the matching dev-guide .mdx and any sibling subtree
     CLAUDE.md or custom agent. Say WHEN to reach for each, so the right doc is pulled
     on demand instead of loading the whole guide. -->

- [`apps/docs/content/docs/developer-guide/[area].mdx`](...) — [what it covers; read before doing X]
- [sibling CLAUDE.md / agent] — [when to use it]

## Don't

- [anti-pattern specific to this directory]
