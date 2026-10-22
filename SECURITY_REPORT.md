# Security Report — 2026-10-22
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | OK | 0 |
| trufflehog | OK | 0 |
| osv-scanner | OK | 6 (now 0) |
| trivy | OK | 0 |
| semgrep (owasp + secrets) | OK | 3 |
| skillspector (no LLM) | OK | 75 heuristic hits |
| config-audit | OK | heuristics only |
| mcp-exfil-scan | OK | 0 (clean) |
| bandit, CodeQL, mcps-audit, mcp-scan | Skipped | n/a |
## Findings
- CVE-2026-111943 (RUSTSEC-2026-0381/0382/0383), Medium: rustls-webpki 0.103.15, webpki-roots 1.0.9 (emSign distrust)
- CVE-2026-111767/111768/111769/111771, Low (dev-only): @modelcontextprotocol/sdk 1.31.0
- Low: wildcard postMessage origin in crates/wasm/tools test harnesses (3 sites)
- Low: untracked mcps-audit-report.pdf not gitignored
- Low: project hooks run repo-local binary (by design)
- Info: skillspector / config-audit heuristics on skill prose
## Fixes Applied
- rustls-webpki -> 0.103.16, webpki-roots -> 1.0.10
- @modelcontextprotocol/sdk -> 1.32.0 (devDependency + override)
- mcps-audit-report.pdf added to .gitignore
## Known Remaining Issues
- postMessage '*' in test-only harnesses left as is (changing origin risks breaking file:// fixtures)
- Hook trust model and heuristic hits are by design
