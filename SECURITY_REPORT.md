# Security Report — 2026-11-12
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | OK | 0 |
| trufflehog | OK | 0 verified, 37 unverified (placeholder URIs) |
| bandit | OK | 8 Low (B404/B603, Hermes plugin) |
| semgrep (owasp, typescript, secrets) | OK | 0 |
| trivy fs | OK | 0 |
| osv-scanner | OK | 0 |
| config-audit | OK (host-scoped) | 12 MEDIUM doc pattern matches, 1 LOW (noise) |
| skill-audit | OK | all LOW RISK |
| mcp-exfil-scan | OK | 0 (clean) |
| skillspector --no-llm | Partial (scoped to skill/SKILL.src.md; whole repo timed out) | 3 HIGH (false positive), 1 MEDIUM |
| mcp-scan, mcps-audit, CodeQL, Jev | Skipped (opt-in off / no MCP config) | n/a |
## Findings
- No CVEs (Cargo.lock 218 pkgs, bun.lock 226 pkgs). No live secrets.
- SEC-001 Low: in-repo hook launcher can download/exec engine binary (trust-on-open).
- SEC-003 Low: DESIGN.md/critique uploads default-on after sign-in; notice after first upload.
- SEC-004 Low: third-party CI action (nscloud-cache-action, SHA-pinned) in jobs with job-level API-key env.
- SEC-005/006/007 Informational: bandit B404/B603, trufflehog placeholder URIs, config-audit/skillspector noise.
## Fixes Applied
None needed. No dependency vulnerabilities; Low items are upstream design points.
## Known Remaining Issues
SEC-001, SEC-003, SEC-004 (upstream). skillspector whole-repo run did not complete. Deep-audit not run (unattended).
