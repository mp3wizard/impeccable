# Security Report — 2026-09-25

## Tools Run
| Tool | Status | Finding count |
|------|--------|---------------|
| Gitleaks 8.x (git history, 2517 commits) | OK | 0 |
| TruffleHog 3.97.5 (git history) | OK | 0 verified; 28 unverified (historical, pre-existing placeholder/test-fixture URLs; 0 in new merged commits) |
| Trivy fs | OK | 0 (Cargo.lock, bun.lock) |
| OSV-Scanner | OK | 0 (431 packages) |
| Semgrep (owasp-top-ten, secrets) | OK | 0 |
| Bandit | OK | 0 (no Python findings) |
| config-audit.py | OK | LOW hook-config notes only (global ~/.claude scope, out of repo scope) |
| mcp-exfil-scan | OK | 0 (score 0/100, CLEAN) |
| mcp-scan / skillspector LLM mode | SKIPPED | opt-in, unattended run |

## Findings
None actionable. No CVEs. Upstream merge (4 commits, incl. human component review UI, engine 0.1.6 lockfile) introduced no vulnerabilities.

## Fixes Applied
None needed.

## Known Remaining Issues
- config-audit.py pattern matching is noisy and scans global config outside the target; reviewed, none actionable.
- mcp-scan and skillspector LLM mode not run (require interactive consent).
