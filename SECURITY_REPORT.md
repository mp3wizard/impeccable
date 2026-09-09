# Security Report — 2026-09-09

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (sarif + text, full git history) | OK | 0 |
| TruffleHog 3.97.4 (git mode) | OK | 28 unverified, 0 verified |
| Trivy 0.74.0 (fs) | OK | 0 |
| OSV-Scanner 2.5.1 | OK | 3 (1 package, `hono`) |
| Semgrep 1.176.1 (OWASP top ten, TypeScript, secrets) | OK | 0 |
| Bandit | N/A — no `.py` files in target | — |
| config-audit.py (Claude config/hooks/CLAUDE.md audit) | OK | 13 in-scope (0 critical/high; rest is global-install noise, out of scope) |
| skill-audit.sh (canonical SKILL.md files) | OK | 0 — LOW RISK (5/100, 15/100) |
| mcp-exfil-scan.sh | OK | 0/100 — CLEAN |
| mcps-audit (npx) | OK | 531 — heuristic false positives (see below) |
| mcp-scan | SKIPPED (opt-in, no user present to consent) | — |
| skillspector LLM mode | SKIPPED (opt-in, no user present to consent) | — |
| CodeQL | N/A — no `.github/workflows/codeql.yml` | — |

## Findings

**OSV-Scanner — `hono` 4.12.34 (npm, via `bun.lock`), CVSS 5.3–6.5, Medium:**
- `GHSA-crvj-82cr-hjcx`, `GHSA-g6gw-c38x-mqfc`, `GHSA-gqvv-2mrq-wpjv` — fixed in `hono` 4.13.5.

**TruffleHog — 28 unverified, 0 verified:** all in `tests/detect-url-launch.test.mjs`, a test fixture that deliberately embeds credential-shaped URLs (`user:p%40ss@example.com`, `:secret@host.com`) to test the project's own URL-credential detector rule. No real secret.

**config-audit.py — 13 in-scope findings (11 MEDIUM, 2 LOW), 0 CRITICAL/HIGH:** `CLAUDE.md`/`claude.md`/`AGENTS.md` keyword matches on ordinary developer-documentation prose ("skip" in a test-suite description, ".env" mentioned in an unrelated architecture note, "password" in an example). Two LOW findings are informational (repo declares `Stop`/`PostToolUse` hooks in `.claude/settings.json`, expected for a skill repo). The scanner also surfaced 121 findings scoped to *other* globally-installed plugins/skills (ponytail, caveman, anysearch, security-scanner itself, other impeccable install copies under `~/.claude`) — out of scope for this target per APTS Scope Enforcement, not counted above.

**mcps-audit — 531 findings, risk score 100/100:** Spot-checked top findings; all are the tool's generic pattern matcher flagging ordinary `function(){}` / IIFE syntax in `browser-bundle/*.js` (the project's own shipped browser-scanning code) as "Dangerous execution" (AS-001) and "Known injection pattern" (AS-005). No actual code-injection or exfiltration mechanism found on manual review. Consistent with last week's characterization of this tool's false-positive rate on generated JS bundles.

## Fixes Applied

- Bumped `hono` from `^4.12.x` to `4.13.5`+ via `package.json` override, then `bun install`. *(see commit)*

## Known Remaining Issues

- `mcps-audit`'s raw risk score remains unreliable for this codebase due to its high false-positive rate on ordinary JS function syntax in the generated browser-bundle; no actionable fix.
- `mcp-scan` and `skillspector` LLM-assisted mode were not run — both are opt-in and require user consent, unavailable in this unattended scheduled run.
