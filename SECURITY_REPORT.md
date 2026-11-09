# Security Report — 2026-11-09
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | INCOMPLETE (full-history run killed; --no-git rerun timed out) | not a clean result |
| trufflehog (full history) | OK | 35 unverified URI hits (fixtures/docs), 0 verified |
| semgrep owasp-top-ten | OK | 0 |
| semgrep secrets | OK | 0 |
| semgrep typescript / python | NOT RUN | n/a |
| bandit (skill/hermes-plugin) | OK (partial coverage) | 2 Low (B404, B603) |
| trivy fs | OK | 0 |
| osv-scanner | OK | 0 |
| config-audit | OK | 11 MEDIUM, 1 LOW in scope (false positives / docs prose) |
| skill-audit | OK (3 of 26 SKILL.md) | LOW RISK |
| mcp-exfil-scan | OK | 0 (CLEAN) |
| skillspector (--no-llm) | OK | 81 raw pattern hits, triaged as benign |
| mcp-scan, Jev, mcps-audit | SKIPPED | n/a |
## Findings
CVEs: none (226 bun + 217 cargo packages checked by Trivy and OSV-Scanner).
- SEC-001 (Low, CWE-346): `skill/scripts/live-browser.js:12527-12541` postMessage handler lacks e.source/e.origin check; postMessage uses `'*'`.
- SEC-002 (Info, CWE-598): live-server token in query string over loopback (`live-browser.js:3948`, `:7417`).
- SEC-003 (Info, CWE-942): component-review server CORS `*` on fonts only (`crates/context/src/component_review/server.rs:31-33`); Host/Origin pinned.
- SEC-004 (Info, CWE-829): repo-shipped auto-run hooks in `.claude/settings.json`.
- SEC-005 (Info, CWE-78, not exploitable): hermes plugin passes full environment to launcher (`skill/hermes-plugin/__init__.py:72`).
- `claude.md` is a byte-identical duplicate of `CLAUDE.md`.
## Fixes Applied
None. No CVEs or secrets. SEC-001 sits in a generated upstream bundle that would be overwritten by the next sync, so it was not patched locally.
## Known Remaining Issues
- SEC-001 to SEC-005 above (Low/Info). Suggested fix for SEC-001: `if (e.source !== window || e.origin !== location.origin) return;`.
- Gitleaks gap; semgrep typescript not run; Rust engine only grep-reviewed; prebuilt engine binary not analyzed.
- Deep-audit not run (autonomous run).
