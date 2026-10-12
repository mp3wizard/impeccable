# Security Report — 2026-10-12
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (merged range) | ok | 0 |
| trufflehog (HEAD~4..HEAD) | ok | 10 unverified URI (fixtures: crates/browser/src/lib.rs, tests/detect-url-launch.test.mjs), 0 verified |
| osv-scanner (bun.lock, Cargo.lock) | ok | 0 |
| trivy fs (vuln+secret) | ok | 0 |
| semgrep (owasp-top-ten, secrets, typescript) | ok | 4 (1 ERROR, 3 WARNING) |
| bandit / mcp-scan / skill-audit / config-audit / mcp-exfil-scan | not run (no Python/MCP surface changed in merge) | n/a |
## Findings
- semgrep run-shell-injection: .github/workflows/sheriff.yml:61 (ERROR) — `${{ }}` expressions interpolated in `run:`.
- semgrep wildcard-postmessage-configuration x3 (WARNING): crates/wasm/tools/{disabled-values-check,skip-scan-check}.mjs — same-window postMessage in test tooling; false positive.
- trufflehog URI x10 unverified: test fixture URLs; false positive.
- No CVEs (osv/trivy clean).
## Fixes Applied
- sheriff.yml: moved `github.event_name` / `inputs.dry_run` into `env:` and referenced as shell vars.
## Known Remaining Issues
- 3 wildcard-postMessage warnings in test-only tooling (accepted).
