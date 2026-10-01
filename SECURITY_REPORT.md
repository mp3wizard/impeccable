# Security Report — 2026-10-01

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks | OK | 0 |
| TruffleHog (git history) | OK | 28 unverified, 0 verified |
| Trivy fs | OK | 0 |
| OSV-Scanner | OK | 60 (pre-fix) → 0 (post-fix) |
| Semgrep (owasp-top-ten) | OK | 0 |
| Semgrep (typescript) | OK | 0 |
| Semgrep (secrets) | OK | 0 |
| Bandit | SKIPPED — no `.py` files | — |
| config-audit (Claude config/hooks audit) | OK | 0 CRITICAL/HIGH, several MEDIUM/LOW (see below) |
| skill-audit (SKILL.md) | OK | 15/100 LOW RISK, APPROVE |
| mcp-exfil-scan | OK | 0/100 CLEAN |
| mcps-audit (OWASP MCP Top 10 + Agentic AI) | OK | 564 pattern matches, FAIL/100 — see note below |
| skillspector (`--no-llm`) | OK | 0 real findings (14 benign `reference_unresolved` notes) |
| mcp-scan | SKIPPED — opt-in, sends data to invariantlabs.ai, no interactive user to consent (automated run) | — |
| skillspector LLM mode | SKIPPED — opt-in, same consent gate | — |

## Findings

### OSV-Scanner — 60 vulnerabilities (0 Critical, 17 High, 37 Medium, 6 Low), all transitive npm deps via `bun.lock`

| Package | Installed | Fixed | Example CVE |
|---|---|---|---|
| @hono/node-server | 1.19.14 | 1.19.15 | GHSA-frvp-7c67-39w9 |
| body-parser | 2.2.2 | 2.3.0 | GHSA-v422-hmwv-36x6 |
| brace-expansion | 5.0.6 | 5.0.12 | GHSA-3jxr-9vmj-r5cp (and 5 more) |
| fast-uri | 3.1.0 | 3.1.8 | GHSA-4c8g-83qw-93j6 (and 8 more) |
| hono | 4.12.14 | 4.13.7 | 24 advisories, highest CVSS 7.1 (GHSA-88fw-hqm2-52qc) |
| ip-address | 10.1.0 | 10.7.1 | GHSA-mwp4-54f8-5fhr (CVSS 7.7, highest) |
| qs | 6.15.1 | 6.16.0 | GHSA-4mjr-xmp4-gh2g (and 2 more) |
| undici | 7.29.0 | 7.29.1 | GHSA-rfgv-xxqx-mfg5 (and 8 more) |

All are transitive dependencies of the `@anthropic-ai/claude-agent-sdk` / eval-tooling devDependency tree, pulled in via `bun.lock`. No direct-dependency CVEs.

### TruffleHog — 28 unverified, 0 verified secrets

All hits are placeholder credential strings (`https://user:pass@example.com`, `http://:secret@host.com`) in `SECURITY_REPORT.md` (prior week's report, same pattern) and `tests/detect-url-launch.test.mjs` (test fixtures exercising URL-credential detection). Not real secrets.

### Gitleaks, Trivy, Semgrep (OWASP/TypeScript/secrets), Bandit (N/A)

Clean.

### config-audit — 0 CRITICAL/HIGH

Several MEDIUM findings, all false positives on normal prose/hooks, not vulnerabilities:
- Broad-matcher (`''`) SessionStart/UserPromptSubmit/Stop hooks in global `~/.claude` plugins (caveman, impeccable) and this repo's `.claude/settings.json` — intentional, scoped to Claude Code session lifecycle, not attacker-controlled input.
- "Suspicious instruction" / "hook bypass" / ".env file access" hits in `CLAUDE.md`, `claude.md`, `AGENTS.md` are substring matches against ordinary engineering documentation (e.g. "the design hook... skips its scan when PRODUCT.md declares a native platform", "`.env` (copied from...)"), not actual instructions to bypass security controls or exfiltrate credentials.
- LOW findings are just "hooks configuration found" inventory notes for globally-installed plugins, out of this repo's scope.

### skill-audit (`.agent/skills/impeccable/SKILL.md`, representative of the 20 generated per-provider copies)

15/100 LOW RISK. 3 file operations, 0 dangerous patterns, 0 prompt injection, 0 credential access, 0 network URLs. APPROVE.

### mcps-audit — 564 findings, FAIL, risk score 100/100

This tool is designed to audit live MCP servers (OWASP MCP Top 10). This repo ships no MCP server — it is a CLI + browser-overlay anti-pattern detector. The "CRITICAL: Dangerous execution" and "AS-001" findings fire on ordinary JavaScript function declarations (`const highlight = function(el, findings) {...}`, `(function () {...})()`) inside `crates/live/assets/detect-antipatterns-browser.js`'s tracked, generated browser bundle (`browser-bundle/*.js`) — the in-page overlay script that IS the product's live-mode detector, documented in `AGENTS.md`/`docs/ENGINE.md`. No eval-of-remote-content, no network exfiltration, no credential access was found by any of the other 12 tools (mcp-exfil-scan: 0/100 clean; Semgrep OWASP/secrets: 0 findings). Treated as scanner noise from a tool applied outside its intended target shape (MCP servers), not a real finding — see Known Remaining Issues.

### skillspector (`--no-llm`)

14 `reference_unresolved` notes (local path-like references in SKILL.md the analyzer couldn't resolve unambiguously, e.g. `skill/reference/*.md` paths). No dangerous-pattern or injection findings. Benign.

## Fixes Applied

- `package.json` `overrides`: bumped `brace-expansion` 5.0.9→5.0.12, `fast-uri` 3.1.6→3.1.8, `hono` 4.13.5→4.13.7, `ip-address` 10.3.1→10.7.1; added `undici` 7.29.1 (new override). `bun install` re-resolved `bun.lock` (230 packages). Re-ran OSV-Scanner post-fix: **0 issues found** (was 60).

## Known Remaining Issues

- `mcps-audit`'s 564 "Agentic AI" findings against `browser-bundle/*.js` are false positives from a scanner built for MCP-server audits being pointed at a non-MCP browser-bundle artifact; no corroborating finding from mcp-exfil-scan or Semgrep. Not actioned.
- TruffleHog's 28 unverified hits are intentional test/doc placeholder credentials; not actioned.
- config-audit's MEDIUM substring matches against `CLAUDE.md`/`AGENTS.md` prose are false positives; not actioned.
- `mcp-scan` and skillspector LLM-assisted mode remain unrun — both require interactive user consent (data sent to invariantlabs.ai / an external LLM respectively) and this was an unattended scheduled run.
