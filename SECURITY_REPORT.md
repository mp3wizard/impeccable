# Security Report — 2026-11-10
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | ok | 0 |
| osv-scanner | ok | 78 pre-fix → 0 post-fix |
| semgrep (owasp-top-ten, typescript, secrets) | ok | 3 unique (wildcard-postmessage) × provider copies |
| trivy (vuln, secret, misconfig; HIGH/CRIT) | ok | 0 |
| bandit | ok | 8 low |
| mcp-scan / skillspector LLM / Jev / deep-audit | skipped (opt-in off, unattended run) | n/a |
## Findings
- bun.lock transitive CVEs (GHSA): hono, @hono/node-server, @modelcontextprotocol/sdk, body-parser, brace-expansion, fast-uri, ip-address, minimatch, proxy-addr, qs.
- Cargo.lock: RUSTSEC-2026-0382 (rustls-webpki 0.103.15), RUSTSEC-2026-0381 (webpki-roots 1.0.9).
- semgrep: wildcard-postmessage-configuration in live-browser.js (upstream generated code, copied into each provider dir).
- bandit: 8 low.
## Fixes Applied
- package.json "overrides" for the packages above + bun install; osv-scanner clean afterwards.
- cargo update: rustls-webpki 0.103.16, webpki-roots 1.0.11.
## Known Remaining Issues
- wildcard postMessage targetOrigin in upstream live-browser.js (generated, not patched; fix belongs upstream).
- bandit low-severity items (not triaged).
