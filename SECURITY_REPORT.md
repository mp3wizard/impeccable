# Security Report — 2026-10-16
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks 8.30.1 (full history, 3326 commits) | ok | 0 |
| trufflehog 3.99.1 (git history) | ok | 42 unverified URI (test fixtures), 0 verified |
| osv-scanner 2.6.0 (209 Cargo + 223 bun pkgs) | ok | 0 |
| trivy 0.75.0 (Cargo.lock, bun.lock) | ok | 0 |
| semgrep 1.180.0 (owasp-top-ten, typescript, secrets) | ok | 0 |
| mcp-exfil-scan | ok | 0 (risk 0/100, CLEAN) |
| config-audit | ok (host-level results discarded) | 4 MEDIUM, 1 LOW (hooks/CLAUDE.md prose, by design) |
| skillspector 2.12.0 (--no-llm, skill/) | partial | 75 informational (expected for agent playbooks / bundles) |
| bandit | n/a (no Python) | 0 |
| codeql, mcps-audit, mcp-scan, Jev | skipped / opt-out | n/a |
## Findings
No CVEs. No verified secrets.
- SEC-001 (Low): launcher `.claude/skills/impeccable/scripts/impeccable:96-196` verifies downloaded engine only via same-origin sha256 (CWE-494/345).
- SEC-002 (Low): `crates/live/src/live_server.rs:638-658` CORS reflects any loopback origin, no Host check, token in query string (CWE-346/598).
- SEC-003 (Info): CI jobs use paid API secrets on pull_request (`.github/workflows/ci.yml`).
- SEC-004 (Info): `sync-generated-output.yml` contents:write, step output inlined in shell `if`.
- SEC-005 (Info): URL-credential test fixtures flagged by trufflehog (false positives).
- SEC-006 (Info): skillspector/config-audit playbook, hook and unpinned `npx impeccable` notes.
## Fixes Applied
None required: no dependency CVEs or fixable config issues. Lockfiles merged from upstream 4.6.0.
## Known Remaining Issues
SEC-001..006 are upstream design observations; left unpatched to avoid diverging the fork. Large bundles (`live-browser.js`, 536 KB) were not scanned by semgrep. Deep-audit skipped (unattended run; recommended scope crates/live, skill/scripts, .github/workflows).
