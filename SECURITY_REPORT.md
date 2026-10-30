# Security Report — 2026-10-30
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | OK | 0 |
| trivy fs (vuln+secret) | OK | 0 |
| osv-scanner | OK | 1 (Medium, no fix) |
| semgrep owasp-top-ten + secrets | OK | 0 |
| trufflehog (git history) | OK | 0 verified, 34 unverified URI (example URLs in SECURITY_REPORT.md, tests/detect-url-launch.test.mjs, crates/browser/src/lib.rs — false positives) |
| mcp-exfil-scan | OK | 0 (score 0/100, CLEAN) |
| config-audit | OK | 0 in target; CRITICAL/HIGH hits are in ~/.claude plugin cache outside target (out of scope) |
| skillspector (--no-llm) | OK, partial coverage | many SC9 "excluded artifact not fully inspected" (byte limit) and AR2/AS1/MP3/P2 pattern hits on skill docs that describe such patterns; no confirmed issue |
| bandit, mcp-scan, CodeQL | SKIPPED | no .py files / opt-in / not applicable |
## Findings
- GHSA-qwgh-2vcv-g2f7 (Medium, 6.3) — crates.io block-buffer 0.10.4 (transitive via digest/sha1; fix needs 0.12.1).
- skillspector: pattern hits are in design-skill reference docs (prose about prompt injection / agent config), reviewed as non-malicious; coverage partial due to total_bytes_limit.
## Fixes Applied
- None needed this week (previous overrides for @hono/node-server and qs remain; bun.lock clean).
## Known Remaining Issues
- block-buffer 0.10.4: transitive crate pinned by digest 0.10; no compatible upstream fix.
- Deep-audit, mcp-scan, LLM-mode skillspector not run (unattended).
