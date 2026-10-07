# Security Report — 2026-10-07

Scope: `/Users/mp3wizard/Public/Claude skill/impeccable` @ `0f39e6bef` (after merging 243 upstream commits from pbakaus/impeccable).

## Tools Run
| Tool | Status | Finding count |
|------|--------|---------------|
| Gitleaks | OK (3035 commits, 857 MB) | 0 |
| TruffleHog | OK (filesystem, incl. node_modules) | 0 verified, 0 unverified |
| Trivy fs | OK (bun.lock, Cargo.lock) | 0 vulns, 0 secrets |
| OSV-Scanner | OK (230 bun + 209 cargo packages) | 1 High before fix, 0 after |
| Semgrep p/owasp-top-ten | OK (js/ts/py) | 0 |
| Bandit | OK | 0 |
| config-audit.py | OK | LOW only (hooks in other plugins/user settings; not this repo) |
| mcp-exfil-scan.sh | OK | 0 — score 0/100 CLEAN |
| skillspector (--no-llm) | Degraded (hit runtime limit) | inconclusive |
| mcp-scan | Skipped (opt-in, unattended run) | n/a |

## Findings
- GHSA-6qxp-vccf-f47h, High (CVSS 7.5), `@modelcontextprotocol/sdk` 1.29.0 (peer dep of claude-agent-sdk; fixed in 1.31.0).

## Fixes Applied
- Added `@modelcontextprotocol/sdk@1.31.0` as devDependency (an `overrides` entry did not move the peer-resolved copy). OSV re-scan: no issues.

## Known Remaining Issues
- skillspector local scan timed out on the full tree; no findings reported by it.
