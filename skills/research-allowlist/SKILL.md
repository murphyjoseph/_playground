---
name: research-allowlist
description: >-
  Research a topic using ONLY a user-approved list of web domains, with no
  surprises. Use this whenever the user wants research, docs lookup, or "find
  out about X" but expects sources confined to specific trusted sites (e.g.
  "research TypeScript but only from the official docs and Matt Pocock", "look
  this up using just react.dev", "what's the recommended pattern — stick to
  sources I approve"). Trigger on any research/lookup request that names an
  allowlist, a profile, "approved domains", "only from", "don't branch out", or
  "no surprises". Enforces a hard domain boundary: web search is pinned to the
  allowlist and no off-list page is read without explicit permission.
---

# Research within an approved allowlist

Answer research questions while staying strictly inside a set of approved
domains. The contract with the user is **no surprises**: every source you read
and cite comes from the allowlist, and you never silently wander to a Stack
Overflow answer or a random blog because it ranked well.

Domains come from two places, which can combine:
- **Profiles** — named JSON files in `profiles/` (e.g. `typescript`, `react`).
- **Inline** — domains the user passes for this one task.

A deterministic checker, `scripts/allowlist.mjs`, decides whether any URL is
allowed. Use it; don't eyeball hostnames.

## Workflow

1. **Resolve the allowlist.**
   - If the user named a profile, confirm it exists: `node scripts/allowlist.mjs list`.
   - Show what's in scope so the user sees the boundary up front:
     `node scripts/allowlist.mjs show <profile>`.
   - If the user gave neither a profile nor inline domains, **ask which domains
     to use.** Do not guess an allowlist — guessing defeats the purpose.

2. **Search, pinned to the allowlist.** Call `WebSearch` with `allowed_domains`
   set to the resolved domain list (host part only — strip any `/path`). This
   keeps results on-list at the source.

   > `allowed_domains` filters by host only. For a path-scoped entry like
   > `github.com/microsoft/TypeScript`, pass `github.com` to search, then rely
   > on the checker (step 3) to reject off-path results before fetching.

3. **Check every URL before fetching.** Before any `WebFetch`, verify the URL:
   ```bash
   node scripts/allowlist.mjs check "<url>" --profile <name>
   # or: --domains a.com,b.com   (and you can combine --profile and --domains)
   ```
   Exit 0 = allowed, fetch it. Exit 1 = denied, do **not** fetch it.

4. **Off-list sources → ask first.** When search or an on-list page surfaces a
   clearly relevant source that the checker denies, pause and ask the user
   before reading it. Name the URL and why it's relevant. Only fetch if they say
   yes. If they want it permanently, offer to add it to the profile (step 6).

5. **Answer and cite.** Base the answer only on content from allowed domains
   (plus any off-list page the user explicitly approved). End with a `Sources:`
   list of the exact URLs you read. If you also used training knowledge, label
   that separately so the user can tell researched facts from recalled ones.

6. **Persist new domains only on request.** To add a domain to a profile, edit
   the relevant `profiles/<name>.json` `domains` array. Don't silently expand a
   profile — adding a source is a user decision.

## Creating a new profile

A profile is a small JSON file in `profiles/`:
```json
{
  "name": "posthog",
  "description": "PostHog product analytics: official docs only.",
  "domains": ["posthog.com", "github.com/PostHog/posthog"]
}
```
A `domains` entry is a bare host (`react.dev`) or a host with a path prefix
(`github.com/microsoft/TypeScript`). A URL matches when its host equals the
entry host or is a subdomain of it, and — if a path prefix is given — the URL
path starts with that prefix. `www.` is ignored on both sides.

## Guarantees to uphold

- **Never fetch a denied URL without explicit approval.** This is the whole point.
- **Never present off-list content as if it were on-list.** If the user approved
  an off-list page, mark it as off-list in the sources.
- **Don't auto-expand the allowlist.** New domains are added only when the user
  asks.

## Gotchas

- `WebSearch.allowed_domains` is host-level only — it cannot enforce a path
  prefix. Path scoping happens in the checker, so always run `check` before
  `WebFetch` even when results came from a pinned search.
- **Never put bare `github.com` on an allowlist** — it permits every repo,
  including malicious ones. Scope GitHub to trusted orgs or repos by path
  (`github.com/microsoft`, `github.com/getsentry`). Host and path matching are
  both case-insensitive, so `/PostHog` and `/posthog` are equivalent (matching
  GitHub's own behavior).
- `WebFetch` upgrades HTTP→HTTPS and returns cross-host redirects instead of
  following them. If a redirect points off-list, treat it as an off-list source
  (step 4) — re-check the redirect URL before fetching it.
