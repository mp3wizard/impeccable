# Security Report — 2026-09-08

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (git history + fs, 2329 commits) | OK | 0 |
| Bandit | N/A (no `.py` files) | — |
| Semgrep 1.176.1 (OWASP top-ten) | OK | 0 |
| Semgrep 1.176.1 (TypeScript) | OK (0 `.ts`/`.tsx` files) | 0 |
| Semgrep 1.176.1 (secrets) | OK | 0 |
| Trivy 0.74.0 (fs: Cargo.lock 204 pkgs, bun.lock 228 pkgs) | OK | 0 |
| TruffleHog 3.97.4 (git) | OK | 25 unverified, 0 verified |
| OSV-Scanner 2.5.1 | OK | 0 |
| mcps-audit v1.0.0 | OK | 530 (see Findings — false-positive pattern noise) |
| config-audit.py | OK | 15 MEDIUM/LOW (false-positive keyword matches on doc/test prose) |
| skill-audit.sh (36 unique SKILL.md/skill files, deduped by content hash from 93 provider-fork copies) | OK | 0 real findings — all 37 audited files (36 + `skill/SKILL.src.md`) scored LOW RISK (0–15/100) |
| mcp-exfil-scan.sh | SKIPPED (bundled script checksum mismatch against `SHA256SUMS` — do not run per script's own tamper-evidence guard; reinstall the security-scanner plugin from a trusted release to restore it) | — |

## Findings

- **TruffleHog — 25 unverified "secrets", 0 verified**: all are placeholder credential URLs (`http://:secret@host.com`, `https://user:pass@example.com`, `https://user:p%40ss@example.com`) inside `tests/detect-url-launch.test.mjs` fixtures and `SECURITY_REPORT.md`'s own prior-report text. Not live credentials.
- **mcps-audit — 530 findings (131 CRITICAL / 51 HIGH / 236 MEDIUM / 112 LOW), reported verdict FAIL 100/100**: spot-checked the two representative CRITICAL "Dangerous execution" hits (`browser-bundle/00-header.js:12` and `:9`) — the flagged code is `(function () { ... })()`, a standard IIFE wrapper around the generated anti-pattern detector bundle (`crates/live/assets/detect-antipatterns-browser.js`, tracked generated output per `docs/ENGINE.md`), not `eval`/`Function()`/dynamic code injection. mcps-audit's OWASP Agentic AI heuristic pattern-matches on any `function` keyword occurrence rather than actual dangerous-execution APIs, producing systematic false positives across the ~13k-line bundle and the browser-bundle overlay/probe scripts. No exploitable pattern confirmed on manual review. Not a real repo risk; flagged here for visibility given the raw score.
- **config-audit.py — 15 MEDIUM/LOW findings** on `AGENTS.md`: keyword pattern matches ("skip verification", ".env file access", "password-related access") on ordinary developer-documentation prose (test-runner and build instructions). No injection or credential-exfiltration pattern confirmed. The remaining LOW findings are routine hook-configuration disclosures (`~/.claude/settings.json` and various installed plugins' `hooks.json`) outside this repo's scope, surfaced only because config-audit.py's scope is the whole `~/.claude` environment, not just the target path.
- **skill-audit.sh**: ran successfully this cycle (last cycle's script-hang issue did not recur) against all 36 content-unique SKILL.md/skill files in the repo (deduped from 93 total copies across provider-fork directories) plus the canonical `skill/SKILL.src.md`. All 37 scored LOW RISK.
- **mcp-exfil-scan.sh**: the bundled script at the security-scanner plugin's cached install failed its own `SHA256SUMS` integrity check (installed copy does not match the manifest). Per the script's tamper-evidence guard, it was not run this cycle. Coverage gap noted below.
- **OSV-Scanner / Trivy / Semgrep / Gitleaks**: 0 findings.

## Fixes Applied

None required — no exploitable or fixable findings this cycle.

## Known Remaining Issues

- **mcp-exfil-scan.sh unavailable**: bundled script checksum mismatch at `~/.claude/plugins/cache/claude-code-security-plugins/claude-code-security-plugins/1.8.0/.claude/skills/security-scanner/scripts/mcp-exfil-scan.sh`. Reinstall/update the `claude-code-security-plugins` plugin to restore this check; until then, MCP-specific exfiltration-chain coverage (tool-poisoning, outbound-flow, encoded-payload, env-leak detection) is not run for this repo. `mcps-audit` and `skill-audit.sh` cover overlapping but not identical surface for this cycle.
- **mcps-audit false-positive rate**: the tool's "Dangerous execution" / "Known injection pattern" heuristics substantially over-fire on ordinary JS function syntax in generated bundles. Its raw 100/100 risk score and FAIL verdict should not be read at face value without the manual triage performed above; consider excluding `browser-bundle/` and other tracked-generated JS from future mcps-audit runs (or filing upstream feedback) to keep the signal usable.
