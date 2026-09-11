# Security Report — 2026-09-11

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (sarif + text, full git history, 2368 commits) | OK | 0 |
| TruffleHog 3.97.4 (git mode) | OK | 28 unverified, 0 verified |
| Trivy 0.74.0 (fs) | OK | 0 |
| OSV-Scanner 2.5.1 (Cargo.lock, bun.lock) | OK | 0 |
| Semgrep 1.176.1 (OWASP top ten, TypeScript, secrets) | OK | 0 |
| Bandit | N/A — no `.py` files in target | — |
| config-audit.py (Claude config/hooks/CLAUDE.md audit) | OK | 13 in-scope (0 critical/high) |
| skill-audit.sh (canonical `skill/SKILL.src.md`) | OK | LOW RISK, 15/100 |
| mcp-exfil-scan.sh | OK | 0/100 — CLEAN |
| mcps-audit (npx) | OK | 531 — heuristic false positives (see below) |
| mcp-scan | SKIPPED (opt-in, no user present to consent) | — |
| skillspector LLM mode | SKIPPED (opt-in, no user present to consent) | — |
| CodeQL | N/A — no `.github/workflows/codeql.yml` | — |

## Findings

**OSV-Scanner:** clean. `Cargo.lock`/`bun.lock` were untouched by this merge (the `hono` fix from the prior audit is still in place).

**TruffleHog — 28 unverified, 0 verified:** all in `tests/detect-url-launch.test.mjs`, a test fixture deliberately embedding credential-shaped URLs (`user:p%40ss@example.com`, `:secret@host.com`) to exercise the project's own URL-credential detector rule. No real secret.

**config-audit.py — 13 in-scope findings (11 MEDIUM, 2 LOW), 0 CRITICAL/HIGH:** `CLAUDE.md`/`claude.md`/`AGENTS.md` keyword matches on ordinary developer-documentation prose (test-suite descriptions containing "skip", an architecture note mentioning `.env`, a project-structure note mentioning "password"). Two LOW findings are informational (`.claude/settings.json` declares `Stop`/`PostToolUse` hooks, expected for a skill repo). ~121 additional findings scoped to other globally-installed plugins/skills under `~/.claude` (ponytail, caveman, anysearch, this scanner itself) are out of scope per APTS Scope Enforcement and not counted here.

**mcps-audit — 531 findings, risk score 100/100:** spot-checked; all are the generic pattern matcher flagging ordinary `function(){}` / IIFE syntax in `browser-bundle/*.js` (this project's own shipped browser anti-pattern scanner) as "Dangerous execution" (AS-001) / "Known injection pattern" (AS-005). No actual code-injection or exfiltration mechanism on manual review. Consistent with the prior audit's characterization of this tool's false-positive rate on generated JS bundles.

## Fixes Applied

None required — no CVEs, no verified secrets, no hook/config issues introduced by this merge's 6 upstream commits (placeholder-contrast detection, live-poll `--reply` JSON output, carbonize diagnostic cleanup, touch-gesture verification).

## Known Remaining Issues

- `mcps-audit`'s raw risk score remains unreliable for this codebase due to its high false-positive rate on ordinary JS function syntax in the generated browser-bundle; no actionable fix.
- `mcp-scan` and `skillspector` LLM-assisted mode were not run — both are opt-in and require user consent, unavailable in this unattended scheduled run.
