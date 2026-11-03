# Security Report — 2026-11-03
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks (3858 commits) | OK | 0 |
| trivy fs (vuln+secret) | OK | 0 |
| osv-scanner | OK | 0 |
| semgrep owasp-top-ten + secrets | OK | 0 |
| trufflehog (git history) | OK | 0 verified, 34 unverified (example URLs, false positives) |
| bandit | OK | 8 Low (B404/B603 subprocess in hermes plugin copies) |
| skillspector (--no-llm) | OK, degraded | 81 heuristic hits, mostly noise for a prompt-library skill; none confirmed |
| skill-audit | RAN | no output, inconclusive |
| config-audit, mcp-exfil-scan | SKIPPED | scan host ~/.claude / write to plugin cache; out of scope |
| mcp-scan, CodeQL, mcps-audit, Jev, deep-audit | SKIPPED | opt-in / unattended run |
## Findings
- SEC-001 (Medium, manual): live-mode Apply spawns `codex --dangerously-bypass-approvals-and-sandbox` or `claude --permission-mode bypassPermissions` (crates/live/src/copy_edit_agent.rs:1524, :1552). Prompt includes page HTML (prompt-injection vector). Server is 127.0.0.1 only; disclosed in README. Mitigation: set `IMPECCABLE_LIVE_COPY_AGENT=chat` or `off`.
- SEC-002 (Low): subprocess.run list-form in skill/hermes-plugin/__init__.py:72 (bandit B603), no untrusted input.
- SEC-003 (Info): unpinned `npx impeccable` references in skill/ (skillspector RP1).
- SEC-004 (Info): skillspector prompt-pattern heuristics, unconfirmed.
- CVEs: none.
## Fixes Applied
- None needed. SEC-001 is an upstream design decision (behavior change, not a patch-level fix); left as-is.
## Known Remaining Issues
- SEC-001 through SEC-004 above. Recommended deep-audit: crates/live, skill (not run).
