# Security Report — 2026-10-27
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | OK | 0 |
| trufflehog (git history) | OK | 34 unverified (0 verified) — example URLs/test fixtures |
| semgrep owasp-top-ten (JS/TS) | OK | 3 (wildcard postMessage) → fixed |
| semgrep secrets | OK | 0 |
| trivy fs | OK | 0 |
| osv-scanner | OK | 1 (Medium) |
| mcp-exfil-scan | OK | 0 (score 0/100) |
| skill-audit (SKILL.md) | OK | scores 0–15/100 |
| skillspector (--no-llm) | OK | pattern noise: 100/100 over 8951 components incl. fixtures/goldens — treated as false positive (design-linter test corpus) |
| config-audit | OK | scans global ~/.claude, not this repo — out of scope |
| bandit | N/A | no .py files |
| mcp-scan, CodeQL, mcps-audit | SKIPPED | opt-in/network, unattended run |
## Findings
- GHSA-qwgh-2vcv-g2f7 (Medium, 6.3) — crates.io block-buffer 0.10.4 (transitive via digest/sha1). No fixed version available.
- Semgrep wildcard-postmessage-configuration x3 — crates/wasm/tools/{disabled-values-check,skip-scan-check}.mjs (dev test harness).
- TruffleHog unverified URI hits — example.com / host.com placeholder creds in tests and prior reports.
## Fixes Applied
- postMessage targetOrigin '*' → window.location.origin (harness loads over http://127.0.0.1); semgrep re-run: 0 findings.
## Known Remaining Issues
- block-buffer 0.10.4 advisory: no upstream fix.
- Deep-audit and mcp-scan not run (unattended).
