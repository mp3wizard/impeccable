# Security Report — 2026-11-06
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (3930 commits) | OK | 0 |
| trufflehog | not completed (scan run was cut off; gitleaks covers secrets) | n/a |
| semgrep owasp-top-ten (js/ts/py) | OK | 0 |
| semgrep secrets | OK | 0 |
| bandit | OK | 8 (B404/B603 subprocess, informational, list-form args, hermes-plugin `__init__.py` + 3 generated copies) |
| trivy fs | OK | 0 |
| osv-scanner | OK | 2 (before fix) |
| config-audit.py | OK | findings only in global ~/.claude plugins, out of scope for this repo |
| mcp-exfil-scan | OK | 0 (score 0/100) |
| skillspector --no-llm | incomplete (skill discovery partial) | n/a |
| mcp-scan | skipped (opt-in, unattended run) | n/a |
## Findings
- RUSTSEC-2026-0382 rustls-webpki 0.103.15 (fixed 0.103.16)
- RUSTSEC-2026-0381 webpki-roots 1.0.9 (fixed 1.0.10)
## Fixes Applied
- `cargo update`: rustls-webpki → 0.103.16, webpki-roots 1.0.9 → 1.0.11. osv-scanner re-run: no issues.
## Known Remaining Issues
- Bandit B404/B603 subprocess notes (no shell, fixed argv).
- trufflehog and skillspector did not complete this run.
