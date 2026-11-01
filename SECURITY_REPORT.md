# Security Report — 2026-11-01
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (3820 commits) | OK | 0 |
| trivy fs (vuln+secret) | OK | 0 |
| osv-scanner | OK | 1 (Medium 6.9, fixed this run) |
| semgrep owasp-top-ten (223 rules, 150 files) + secrets (43 rules, 1833 files) | OK | 0 |
| trufflehog (git history) | OK | 0 verified, 34 unverified (example URLs, false positives) |
| bandit | OK | 8 Low (B404/B603 subprocess in helper scripts, reviewed, no untrusted input) |
| mcp-exfil-scan | OK | 0 (score 0/100, CLEAN) |
| config-audit | OK | 0 high in target; CRITICAL/HIGH hits are in ~/.claude plugin cache outside target (out of scope) |
| skillspector (--no-llm) | OK, degraded | runtime limit reached, coverage partial, no confirmed issue |
| mcp-scan, CodeQL, deep-audit | SKIPPED | opt-in / unattended run |
## Findings
- GHSA-g3hv-75wg-m249 (Medium, 6.9) — npm minimatch 10.2.5 (transitive via readdir-glob); fixed in 11.0.1.
- bandit: 8 Low subprocess-usage notes.
- skillspector: partial coverage (runtime limit); no confirmed issue.
## Fixes Applied
- Added `"minimatch": "11.0.1"` to package.json overrides, ran `bun install`; osv-scanner re-run reports no issues.
## Known Remaining Issues
- bandit Low subprocess notes (accepted).
- skillspector coverage partial; deep-audit, mcp-scan, LLM-mode skillspector not run (unattended).
