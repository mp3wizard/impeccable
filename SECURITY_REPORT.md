# Security Report — 2026-09-06

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 | OK | 0 |
| Bandit | N/A (no `.py` files) | — |
| Semgrep (OWASP top-ten) | OK | 7 (fixed) |
| Semgrep (TypeScript) | OK (0 `.ts`/`.tsx` files) | 0 |
| Semgrep (secrets) | OK | 0 |
| Trivy 0.72.0 (fs) | OK | 0 |
| TruffleHog 3.95.9 (git) | OK | 20 unverified, 0 verified |
| OSV-Scanner 2.4.0 | OK | 38 (all fixed) |
| mcps-audit | SKIPPED (no MCP config files in repo) | — |
| config-audit.py | OK | 15 LOW (hooks-configuration presence, informational) |
| skill-audit.sh | OK | 2 canonical skill files scanned, both LOW RISK |
| mcp-exfil-scan.sh | OK | 0/100 CLEAN |

## Findings

- **OSV-Scanner — 38 transitive dependency CVEs** (0 Critical, 12 High, 23 Medium, 3 Low) across 7 npm packages pulled in via `bun.lock`: `@hono/node-server` (GHSA-frvp-7c67-39w9), `body-parser` (GHSA-v422-hmwv-36x6), `brace-expansion` (GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895), `fast-uri` (7 advisories, GHSA-4c8g-83qw-93j6 et al.), `hono` (18 advisories), `ip-address` (GHSA-mwp4-54f8-5fhr, GHSA-v2v4-37r5-5v8g), `qs` (GHSA-4mjr-xmp4-gh2g, GHSA-q8mj-m7cp-5q26, GHSA-x5fp-wj9c-mxmx). None are direct dependencies of this repo; all reach it through devDependencies' transitive tree.
- **Semgrep OWASP — `javascript.browser.security.wildcard-postmessage-configuration`** (7 call sites, `browser-bundle/50-scan.js`). The in-page extension bridge's `window.postMessage` calls used `'*'` as target origin, letting any same-window listener (including an unrelated script sharing the page) receive scan results/commands.
- **TruffleHog — 20 unverified "secrets"**: all are placeholder credential URLs (`http://:secret@host.com`, `https://user:pass@example.com`) quoted inside `SECURITY_REPORT.md`'s own findings write-ups from prior audit cycles — a self-referential false positive, not a live credential. 0 verified.
- **config-audit.py — 15 LOW findings**: hook-configuration presence in various plugin `hooks.json`/`plugin.json` files (SessionStart, PreToolUse, etc.). Informational; no injection or exfiltration pattern flagged.

## Fixes Applied

- Bumped `package.json` `overrides`: `fast-uri` 3.1.5 → 3.1.6, `qs` 6.15.2 → 6.16.0 (the two overrides that didn't yet cover the highest-numbered advisory in their chain).
- Ran `bun install` to regenerate `bun.lock` against the full override set (also picked up `@hono/node-server`, `body-parser`, `brace-expansion`, `hono`, `ip-address` fixes that were already declared in `overrides` but not yet applied to the lockfile). Re-ran OSV-Scanner: **0 issues found**.
- Patched `browser-bundle/50-scan.js`: replaced all 7 `window.postMessage(..., '*')` calls with `window.postMessage(..., window.location.origin)`. Sender and listener are the same window (`e.source !== window` is already checked on receipt), so scoping the target origin to the page's own origin closes the wildcard-broadcast without changing behavior. Re-ran Semgrep on the file: **0 findings**.

## Known Remaining Issues

- `browser-bundle/50-scan.js` is source for a generated in-page bundle (`crates/live/assets/detect-antipatterns-browser.js`, produced by `cargo xtask bundle`). This scan/fix cycle did not have a working Rust toolchain available in time to rebuild and verify the generated bundle picked up the source fix — flag for a follow-up `cargo xtask bundle` + `bun run test` pass before the next engine release.
- TruffleHog's 20 unverified hits are permanent noise from this report's own past write-ups quoting example credential URLs; no action needed unless TruffleHog starts reporting a verified hit.
