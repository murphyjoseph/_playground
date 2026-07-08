#!/usr/bin/env node
// Deterministic allowlist resolver + URL checker for the research-allowlist skill.
// No dependencies. Run with: node scripts/allowlist.mjs <command> ...
//
// Commands:
//   list                          List available profile names.
//   show <profile>                Print the resolved domain list for a profile.
//   check <url> --profile <name>  Exit 0 if url is allowed, 1 if denied. Prints reason.
//   check <url> --domains a,b,c   Same, but with an inline domain list.
//   check <url> --profile <name> --domains a,b   Merge profile + inline domains.
//
// A domain entry is either a bare host ("typescriptlang.org") or a
// host with a path prefix ("github.com/microsoft/TypeScript"). A URL
// matches an entry when its host equals the entry host OR is a subdomain
// of it, AND (if the entry has a path prefix) the URL path starts with it.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PROFILES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "profiles");

function loadProfile(name) {
  const path = join(PROFILES_DIR, `${name}.json`);
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    fail(`No profile named "${name}". Run \`list\` to see available profiles, or pass --domains.`);
  }
  const data = JSON.parse(raw);
  if (!Array.isArray(data.domains) || data.domains.length === 0) {
    fail(`Profile "${name}" has no domains array.`);
  }
  return data.domains;
}

function listProfiles() {
  let files;
  try {
    files = readdirSync(PROFILES_DIR);
  } catch {
    return [];
  }
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort();
}

// Split an entry into { host, pathPrefix }. Lowercase host, strip leading "www.".
function parseEntry(entry) {
  const cleaned = entry.trim().replace(/^https?:\/\//, "");
  const slash = cleaned.indexOf("/");
  let host = slash === -1 ? cleaned : cleaned.slice(0, slash);
  const pathPrefix = slash === -1 ? "" : cleaned.slice(slash);
  host = host.toLowerCase().replace(/^www\./, "");
  return { host, pathPrefix };
}

function hostMatches(urlHost, entryHost) {
  return urlHost === entryHost || urlHost.endsWith(`.${entryHost}`);
}

function checkUrl(url, domains) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: `"${url}" is not a valid URL.` };
  }
  const urlHost = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const urlPath = parsed.pathname.toLowerCase();
  for (const entry of domains) {
    const { host, pathPrefix } = parseEntry(entry);
    if (hostMatches(urlHost, host)) {
      if (pathPrefix && !urlPath.startsWith(pathPrefix.toLowerCase())) continue;
      return { allowed: true, reason: `matches allowlist entry "${entry}"` };
    }
  }
  return { allowed: false, reason: `host "${parsed.hostname}" is not on the allowlist` };
}

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--profile") out.profile = argv[++i];
    else if (a === "--domains") out.domains = argv[++i];
    else out._.push(a);
  }
  return out;
}

function resolveDomains(args) {
  const domains = [];
  if (args.profile) domains.push(...loadProfile(args.profile));
  if (args.domains) domains.push(...args.domains.split(",").map((d) => d.trim()).filter(Boolean));
  if (domains.length === 0) {
    fail("No domains. Pass --profile <name> and/or --domains a,b,c.");
  }
  return [...new Set(domains)];
}

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

switch (cmd) {
  case "list": {
    const profiles = listProfiles();
    if (profiles.length === 0) console.log("(no profiles yet)");
    else profiles.forEach((p) => console.log(p));
    break;
  }
  case "show": {
    const name = args._[0];
    if (!name) fail("usage: show <profile>");
    loadProfile(name).forEach((d) => console.log(d));
    break;
  }
  case "check": {
    const url = args._[0];
    if (!url) fail("usage: check <url> [--profile name] [--domains a,b,c]");
    const domains = resolveDomains(args);
    const { allowed, reason } = checkUrl(url, domains);
    console.log(`${allowed ? "ALLOW" : "DENY"}: ${reason}`);
    process.exit(allowed ? 0 : 1);
  }
  default:
    fail(`unknown command "${cmd ?? ""}". Commands: list, show, check.`);
}
