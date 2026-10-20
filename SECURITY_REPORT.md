# Security Report — 2026-10-20
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| OSV-Scanner | run | 63 advisories in 10 npm packages (bun.lock); Cargo clean |
| Trivy | run | 0 (dev deps hidden by default) |
| Gitleaks | run | 0 |
| TruffleHog | run | 0 verified, 42 unverified (test fixtures) |
| Semgrep OWASP / TypeScript / secrets | run | 0 / 0 / 0 |
| mcp-exfil-scan | run | 0 (clean) |
| config-audit | run | broad hook matchers, by design |
| skillspector (--no-llm) | partial | hit runtime limit; noise |
| Bandit, CodeQL, mcps-audit, skill-security-auditor, mcp-scan, Jev | skipped | n/a / opt-in off |
## Findings
All dependency findings are dev/transitive; none ship (package `files` = cli/bin, LICENSE).
- Critical: proxy-addr 2.0.7 (CVE-2026-90711).
- High: @modelcontextprotocol/sdk 1.29.0 (CVE-2026-104850), undici 7.29.0 (CVE-2026-19534, -84961 +8), hono 4.12.14 (CVE-2026-54290 +25), fast-uri 3.1.0 (8 High), brace-expansion 5.0.6 (CVE-2026-13149 +5), ip-address 10.1.0 (CVE-2026-69192 +4).
- Medium/Low: qs 6.15.1, body-parser 2.2.2, @hono/node-server 1.19.14.
- Low: SEC-011 hook launcher downloads engine binary, checksum from same origin.
- Info: live server has no Host-header check, non-constant-time token compare (SEC-015); execSync in build scripts; scanner false positives.
## Fixes Applied
- Upstream merge dropped earlier overrides. Re-added `overrides` for all 10 packages plus devDependency @modelcontextprotocol/sdk 1.31.0 (peer dep not overridable). `bun install`; `bun audit` = no vulnerabilities; tests pass.
## Known Remaining Issues
SEC-011 (publish engine hash in-repo or sign assets), SEC-015 (Host check, constant-time compare, fail-closed RNG). Rust sources not covered by SAST. Deep-audit not run (unattended).
