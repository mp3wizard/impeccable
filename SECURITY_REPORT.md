# Security Report — 2026-08-24

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Git HEAD:** merge of `upstream/main` (41 commits, incl. 6 new upstream branches) into `mp3wizard/main`, clean auto-merge (no conflicts)

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks | OK | 0 |
| TruffleHog | OK | 0 |
| Trivy (fs) | OK | 0 |
| OSV-Scanner | OK | 0 (`bun.lock`, 235 packages) |
| Semgrep (OWASP Top 10) | OK | 0 |
| Semgrep (secrets) | OK | 0 |
| Bandit | SKIPPED | no `.py` files in target |
| CodeQL | SKIPPED | no CodeQL workflow in `.github/workflows/` |
| mcp-exfil-scan.sh | OK | CLEAN, 0/100 |
| skill-audit.sh (30 unique authored `SKILL.md` variants, deduped from 78 per-harness copies) | OK | 30/30 LOW RISK (0-15/100), APPROVE |
| config-audit.py (repo-scoped findings only) | OK | 10 MEDIUM / 1 LOW, all false positives (same pattern as last run) — see below |
| mcps-audit (skill/plugin heuristic scanner) | OK | 1811 findings (666 CRITICAL / 168 HIGH / 705 MEDIUM / 272 LOW) — see note below |
| mcps-audit (MCP config) | N/A | no `.mcp.json` / `mcp*.json` in target |

## Findings

### OSV-Scanner — 0 vulnerabilities
`bun.lock` scanned clean, all 235 packages. Prior weeks' `package.json` `overrides` survived this week's 41-commit merge untouched — no regression, no new transitive CVEs.

### skill-audit.sh — all authored SKILL.md clean
78 `SKILL.md` files on disk are per-harness copies of 30 distinct authored variants (`.claude/`, `.cursor/`, `skill/`, `plugin/`, and other provider harness dirs, plus each subcommand's redirect shim). Deduped by content hash and audited once each: all 30 scored LOW RISK, 0-15/100, verdict APPROVE.

### mcps-audit — FAIL, 100/100, 1811 findings
Scans impeccable's own CLI/skill source (483 files, ~209K lines). Top CRITICAL hits are `AS-001 Dangerous execution` on `execSync` imports (`cli/bin/commands/skills.mjs`) and `AS-005 Known injection pattern` at the same file plus `cli/bin/commands/ignores.mjs`; MEDIUM hits include the JS `delete` keyword (`delete next.hooks`) misread as a file-deletion risk.

**Assessed as high false-positive rate**, same conclusion as prior runs. impeccable is itself a CLI/skill-authoring tool — `execSync`, `delete` on config objects, and similar patterns are its own legitimate implementation (build scripts, hook installers, skill-file editing), not injected code. Not actioned — no fix exists that doesn't gut the CLI's core functionality.

### config-audit.py — 11 findings (repo-scoped), all false positives
Same lines, same verdicts as prior weeks, now including the merged content:
- `.claude/settings.json → Stop[0]`: broad hook matcher `''` — intentional (runs on every Stop), not a vulnerability.
- `CLAUDE.md` / `claude.md` (×3 each): "instruction to skip verification" and "hook bypass instruction" — pattern matches on prose about which test suites are opt-in and native-platform CLI routing skips.
- `CLAUDE.md` / `claude.md` / `AGENTS.md`: ".env file access" — pattern match on doc text naming where eval-suite provider API keys live (gitignored).
- `AGENTS.md`: "password-related access" — pattern match on a note about 1Password SSH-agent signing in a sandboxed shell.

Read each flagged excerpt directly: all are documentation prose about testing/routing conventions, not injected agent instructions. No fix needed.

### Coverage note — semgrep
`.semgrepignore` and the 300KB size cap exclude `dist/`, `build/`, `node_modules/`, and vendored/generated provider output (36 files >300KB this run). 0 findings across both configs on the ~2700+ files actually in scope.

## Fixes Applied

None needed this run — no CVEs, no secrets, no real injected instructions found. All actionable findings from prior weeks (OSV overrides) survived the merge unchanged.

## Known Remaining Issues

- mcps-audit's 1811 findings against this repo's own CLI source remain unactioned — scanner false positives specific to a tool whose core function is manipulating other tools' skill/config files, not a real vulnerability. No allowlist exists in this scanner for that case.
- `mcps-audit-report.pdf` written one directory above the repo root (`/Users/mp3wizard/Public/Claude skill/mcps-audit-report.pdf`) as a scanner side effect; outside the git repo, untracked, no action needed.
