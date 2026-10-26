# Security Report — 2026-10-26
## Tools Run
| Tool | Status | Finding count |
|------|--------|---------------|
| gitleaks | OK (3671 commits) | 0 |
| trufflehog | OK | 0 verified, 42 unverified (test-fixture `user:pass@example.com` URIs, false positives) |
| osv-scanner | OK | 8 advisories on 3 dev packages → fixed |
| trivy fs | OK | 0 |
| semgrep (owasp/ts/secrets) | OK | 3 (wildcard postMessage in dev test scripts, Informational) |
| mcp-exfil-scan | OK | 0 (0/100) |
| skill-audit | OK | 5/100 low risk |
| config-audit | PARTIAL | doc-text false positives only |
| skillspector (--no-llm) | OK | parse-limit warnings on minified bundles (Informational) |
| bandit | N/A | no Python |
| CodeQL / mcps-audit / mcp-scan / Jev | skipped | opt-in off / not applicable |
## Findings
- SEC-001 Medium: body-parser 2.3.0 (GHSA-27r3-jxmh-p828), undici 7.29.1 (GHSA-xjj6-f33q-929c, -4qv8-2p9j-2685, -f72v-6w45-q472), fast-uri 3.1.8 (GHSA-w74x-v6f9-j3xg and 3 more). Dev-only.
- SEC-002 Medium: engine binary checksum fetched from same release channel (`.claude/skills/impeccable/scripts/impeccable`, `cli/bin/cli.js`).
- SEC-003 Low: live-server token in query string / injected live.js (`crates/live/src/live_server.rs`).
- SEC-004..009 Informational: wildcard postMessage in dev scripts, project hooks, minified bundles, fixture URIs, positive CI/.env notes.
## Fixes Applied
- SEC-001: overrides bumped to body-parser 2.4.0, fast-uri 3.1.9, undici 7.30.1; bun.lock regenerated; osv-scanner now clean.
## Known Remaining Issues
- SEC-002, SEC-003 (design-level, need upstream/architectural change); SEC-004..006 informational. Deep-audit skipped (unattended run).
