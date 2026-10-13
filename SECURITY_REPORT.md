# Security Report — 2026-10-13
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (full history, 3189 commits) | ok | 0 |
| trufflehog (git history) | ok | 41 unverified URI, 0 verified |
| osv-scanner (bun.lock, Cargo.lock) | ok | 0 |
| trivy fs (vuln+secret) | ok | 0 |
| semgrep (owasp-top-ten, secrets) | ok | 3 WARNING (owasp), 0 (secrets) |
| mcp-exfil-scan | ok | 0 (risk 0/100, CLEAN) |
| config-audit | ran, scope is user-level ~/.claude (not repo) | repo-relevant: 0 |
| bandit / mcp-scan | not run (no Python in repo; mcp-scan is opt-in/network) | n/a |
## Findings
- semgrep wildcard-postmessage-configuration x3 (WARNING): crates/wasm/tools/{disabled-values-check,skip-scan-check}.mjs — test-only tooling, same-window postMessage; accepted.
- trufflehog URI x41 unverified: test fixtures with dummy `user:pass@host` URLs (crates/browser/src/lib.rs, tests/detect-url-launch.test.mjs) and prior SECURITY_REPORT.md text; false positives.
- No CVEs (osv/trivy clean, incl. rustls 0.23.45).
## Fixes Applied
- None needed this run (sheriff.yml fix from 2026-10-12 retained).
## Known Remaining Issues
- 3 wildcard-postMessage warnings in test-only tooling (accepted).
