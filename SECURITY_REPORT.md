# Security Report — 2026-10-15
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (full history, 3239 commits) | ok | 0 |
| trufflehog (git history) | ok | 0 verified, 41 unverified (test-fixture URIs such as `https://user:pass@example.com`) |
| osv-scanner (bun.lock, Cargo.lock) | ok | 66 before fix, 0 after |
| trivy fs | ok | 0 vulns, 0 secrets |
| semgrep p/owasp-top-ten | ok | 3 (test-only, accepted) |
| semgrep p/secrets | ok | 0 |
| mcp-exfil-scan | ok | 0 (score 0/100, CLEAN) |
| config-audit | ok | findings only in global `~/.claude` config and plugin caches, outside this repo |
| skillspector (`--no-llm`) | partial | skill discovery incomplete; bounded scan, no repo-level report emitted |
## Findings
- OSV: 66 advisories (1 critical, 18 high, 38 medium, 9 low) from stale lockfiles after the upstream merge: `hono` 4.12.14, `undici` 7.29.0, `fast-uri` 3.1.0, `brace-expansion` 5.0.6, `ip-address` 10.1.0, `qs` 6.15.1, `body-parser` 2.2.2, `proxy-addr` 2.0.7, `@hono/node-server` 1.19.14, `@modelcontextprotocol/sdk` 1.29.0 (all GHSA), and `rustls` 0.23.45 (RUSTSEC-2026-0346..0349).
- Semgrep: wildcard `postMessage` target origin in `crates/wasm/tools/disabled-values-check.mjs:89` and `crates/wasm/tools/skip-scan-check.mjs:80,104`. Dev test harnesses posting to their own window, no sensitive data.
## Fixes Applied
- `bun install` regenerated `bun.lock` to honour the existing `package.json` overrides and pins (hono 4.13.7, undici 7.29.1, fast-uri 3.1.8, etc.).
- `cargo update -p rustls --precise 0.23.46`.
- osv-scanner re-run: no issues found.
## Known Remaining Issues
- 3 test-only wildcard `postMessage` warnings (accepted).
- config-audit findings in `~/.claude` hooks and third-party plugin caches are outside this repository.
- skillspector coverage partial.
