# Security Report — 2026-10-29
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| gitleaks | OK | 0 |
| trivy fs (vuln+secret) | OK | 0 |
| osv-scanner | OK | 3 (Medium) → 2 fixed |
| semgrep owasp-top-ten + typescript + secrets | OK | 0 |
| mcp-exfil-scan | OK | no findings |
| config-audit | OK | 2 LOW (hooks config present, informational) |
| trufflehog, bandit, skill-audit, skillspector, mcp-scan, CodeQL | SKIPPED | unattended run (not re-run this week; no .py files for bandit) |
## Findings
- GHSA-rmxm-3fg6-px4f (Medium, 5.3) — npm @hono/node-server 1.19.15 (serveStatic double-decode middleware bypass). Fixed in 2.1.3.
- GHSA-6pq8-jhm2-2vcw (Medium) — npm qs 6.16.0 (stringify arrayFormat=comma DoS). Fixed in 6.16.1.
- GHSA-qwgh-2vcv-g2f7 (Medium, 6.3) — crates.io block-buffer 0.10.4 (transitive via digest/sha1; fix needs 0.12.1).
## Fixes Applied
- package.json overrides: @hono/node-server 1.19.15 → 2.1.3, qs 6.16.0 → 6.16.1; `bun install`; osv-scanner on bun.lock: no issues; `bun run build:skills` passes.
## Known Remaining Issues
- block-buffer 0.10.4: transitive crate pinned by digest 0.10; no compatible upstream fix.
- Deep-audit, mcp-scan, trufflehog, skillspector not run (unattended).
