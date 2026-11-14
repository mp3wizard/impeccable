# Security Report — 2026-11-14
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | ran | 3 (all test fixtures, crates/cli/tests/foundations.rs) |
| bandit | ran | 12 Low (B404/B603 subprocess in Hermes hook, 6 file copies) |
| semgrep (owasp-top-ten, typescript, secrets) | ran | 0 |
| trivy (vuln, secret, misconfig) | ran | 0 |
| osv-scanner | ran | 0 |
| trufflehog (verified only) | ran | 0 |
| skill-audit.sh (SKILL.md) | ran | risk 5/100, LOW |
| config-audit.py | ran | 2 Low (hooks configured) |
| mcp-exfil-scan.sh | ran | 0 |
| mcp-scan / skillspector LLM | skipped (opt-in off, unattended run) | n/a |
## Findings
No CVEs. No verified secrets. gitleaks hits are intentional fake keys inside Rust test cases. bandit B404/B603 are Low subprocess usage in the Hermes design hook.
## Fixes Applied
None needed.
## Known Remaining Issues
Hermes hook launches a subprocess (Low, by design). mcp-scan and skillspector not run.
