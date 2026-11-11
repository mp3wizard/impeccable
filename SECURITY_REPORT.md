# Security Report — 2026-11-11

Target: impeccable @ merge of upstream/main (27 commits, clean merge). Scan mode: local-only (no mcp-scan network, no skillspector LLM, no Jev).

## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (4194 commits + fs) | OK | 0 |
| bandit | OK | 8 Low (B404/B603 subprocess, known/accepted) |
| semgrep p/owasp-top-ten | OK (178 files) | 0 |
| semgrep p/secrets | OK | 0 |
| trivy fs (bun.lock, Cargo.lock) | OK | 0 vulns, 0 secrets |
| trufflehog (git) | OK | 0 verified, 37 unverified (URI detector) |
| osv-scanner (bun.lock 226, Cargo.lock 218) | OK | 0 |
| config-audit.py | OK | impeccable-scoped: hooks (SessionStart/Stop) and CLAUDE.md flagged MEDIUM/LOW; CRITICAL/HIGH items are in other user-level plugins, not this repo |
| mcp-exfil-scan | OK | 0, score 0/100 CLEAN |
| skill-audit.sh (first 20 of 40 SKILL.md copies) | PARTIAL | all LOW RISK (0-15/100) |
| skillspector --no-llm | INCOMPLETE | hung on skill discovery; killed, no result |
| mcp-scan | SKIPPED | opt-in, network |
| CodeQL | SKIPPED | not checked |

## Findings
No CVEs. No verified secrets. 37 unverified TruffleHog URI hits (likely URLs with credentials-like patterns in fixtures/docs; not verified live). Bandit 8 Low subprocess notes.

## Fixes Applied
None needed.

## Known Remaining Issues
- 37 unverified TruffleHog URI hits not individually triaged.
- skillspector did not complete; skill-audit covered only 20 SKILL.md copies.
- Hook/CLAUDE.md MEDIUM config-audit notes are by design (upstream project hooks).
