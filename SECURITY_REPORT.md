# Security Report — 2026-10-09
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (new commits) | OK | 0 |
| trufflehog (since 5f8e7e517) | OK | 10 unverified URI-detector hits (false positives: Rust/test code, no credentials) |
| osv-scanner (bun.lock) | OK | 0 |
| trivy fs (vuln+secret, bun.lock + Cargo.lock) | OK | 0 |
| semgrep owasp+secrets (5 changed JS/TS files) | OK | 0 |
| bandit | N/A (no .py) | - |
| mcp-exfil-scan.sh | SKIPPED: bundled-script checksum mismatch | - |
## Findings
None actionable. Trufflehog URI hits: crates/browser/src/lib.rs, tests/detect-url-launch.test.mjs (unverified, not secrets).
## Fixes Applied
None needed. Merge conflict in package.json resolved by keeping @mp3wizard scope + upstream version 4.5.1.
## Known Remaining Issues
mcp-exfil-scan.sh integrity mismatch in security-scanner plugin 1.8.0 (not run). Full-repo gitleaks hung on 623MB history; scoped to new commits.
