# Security Report — 2026-11-05
## Tools Run
| Tool | Status | Finding count |
|------|--------|---------------|
| gitleaks (full history) | ran | 0 |
| trufflehog (git, verified only) | ran | 0 verified |
| semgrep (owasp-top-ten, typescript, secrets) | ran | 69 hits, 1 rule (wildcard postMessage) across 20 generated copies of live-browser.js |
| bandit | ran | 8 Low (B404/B603 subprocess in hermes plugin, 4 copies x2) |
| trivy fs | ran | 0 (Cargo.lock, bun.lock) |
| osv-scanner | ran | 0 |
| mcp-exfil-scan | ran | 0 (CLEAN, 0/100) |
| config-audit | ran | Low: hook configs present (informational) |
| mcp-scan / skillspector LLM / Jev | skipped | opt-ins off (unattended run) |
## Findings
- semgrep `wildcard-postmessage-configuration` (Low): `skill/scripts/live-browser.js` and its per-provider generated copies call `window.postMessage(..., '*')` for the same-window page/extension bridge (scan/remove commands). Payload holds only scan config, no secrets.
- bandit B404/B603 (Low): fixed-argv subprocess in hermes hook plugin.
- No CVEs, no secrets.
## Fixes Applied
- None. Findings are upstream design; edits to generated copies would be overwritten by upstream sync.
## Known Remaining Issues
- Carried: live-mode Apply runs codex/claude with sandbox/permission checks off (upstream, disclosed).
- Wildcard postMessage target origin in live-browser.js (Low).
