# Security Report — 2026-10-23
## Tools Run
| Tool | Status | Finding count |
|------|--------|---------------|
| gitleaks | OK (3555 commits) | 0 |
| trufflehog | OK | 0 verified, 42 unverified (placeholder `user:pass@example.com` / `host.com` URIs — false positives) |
| osv-scanner | OK | 1 (Medium) → fixed |
| trivy fs | OK | 0 |
| mcp-exfil-scan | OK | 0 (score 0/100) |
| config-audit | OK | 185 total, all in global `~/.claude` settings / installed plugins, none in this repo |
| skillspector (--no-llm) | INCOMPLETE — hung, killed after >10 min | n/a |
| bandit / semgrep | not run this pass (no .py files; semgrep skipped) | n/a |
| mcp-scan / Jev | opt-in, not enabled | n/a |
## Findings
- GHSA-rxp7-6hxx-x8q5 — ip-address 10.7.1 — CVSS 6.3 Medium (npm, pinned via package.json override)
## Fixes Applied
- Bumped `ip-address` override 10.7.1 → 10.7.4; `bun install`; osv-scanner re-run: no issues.
## Known Remaining Issues
- skillspector scan did not complete; coverage gap.
- Trufflehog unverified URI hits are test/doc placeholders.
