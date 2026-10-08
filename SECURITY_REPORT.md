# Security Report — 2026-10-08
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | OK (3062 commits) | 0 |
| trufflehog | OK | 0 verified, 33 unverified URI (test fixtures/docs) |
| osv-scanner | OK (Cargo.lock, bun.lock) | 0 |
| trivy | OK | 0 |
| semgrep (owasp-top-ten, secrets) | OK | 3 (wildcard-postMessage, dev check scripts) / 0 secrets |
| config-audit | OK | LOW-only (hooks present) |
| mcp-exfil-scan | OK | 0 (score 0/100) |
| bandit | N/A (no Python) | - |
| skillspector, mcp-scan | Skipped (opt-in, unattended run) | - |
## Findings
- Semgrep: `wildcard-postmessage-configuration` x3 in `crates/wasm/tools/*.mjs` (same-window dev check scripts, no sensitive data).
- TruffleHog: unverified URI matches in `tests/detect-url-launch.test.mjs`, `crates/browser/src/lib.rs`, earlier SECURITY_REPORT.md (URL test fixtures).
- No CVEs.
## Fixes Applied
None needed.
## Known Remaining Issues
Semgrep postMessage '*' in dev-only wasm tooling (accepted, upstream code).
