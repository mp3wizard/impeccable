# Security Report — 2026-08-27

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (full git history, 1987 commits) | OK | 0 |
| Gitleaks 8.30.1 (working tree) | OK | 0 |
| TruffleHog 3.95.9 (git history) | OK | 0 verified, 3 unverified (test fixtures) |
| Trivy 0.72.0 (fs + bun.lock SCA) | OK | 0 |
| OSV-Scanner 2.4.0 (237 packages) | OK | 0 |
| Semgrep (OWASP Top Ten, TS, secrets configs) | OK | 0 |
| Bandit | N/A | no `.py` files in repo |
| config-audit.py | OK | 134 total (global scan); ~10 in-repo (all MEDIUM/LOW, false positives) |
| skill-audit.sh (`.claude/skills/impeccable/SKILL.md`, representative of all provider copies) | OK | LOW RISK (15/100) |
| skillspector 2.3.13 (`--no-llm`, local-only) | OK | LOW (7/100), SAFE — 2 MEDIUM (unpinned MCP server version) |
| mcp-exfil-scan.sh | OK | 0/100, CLEAN |
| mcps-audit | OK | 1818 findings, assessed as heuristic false positives on this repo's own CLI code |
| mcp-scan / skillspector LLM mode | SKIPPED | opt-in, sends data to a third party — not enabled for unattended runs |

## Findings

**No CVEs, no verified secrets, no exfiltration.** Gitleaks, Trivy, OSV-Scanner, and Semgrep (OWASP/TS/secrets) all report zero findings across the merged upstream code (6 commits this week) and the full 1987-commit git history.

**TruffleHog** flags 3 unverified results in `tests/detect-url-launch.test.mjs` (lines 85, 89, 97): `https://user:pass@example.com`, `https://user:p%40ss@example.com`, `http://:secret@host.com`. These are the test's own fixtures for a URL-credential-detection rule — `example.com`/`host.com` placeholders, not real credentials. 0 verified secrets.

**skillspector** flags 2 MEDIUM findings (RP1): the SKILL.md's `npx impeccable...` MCP server reference has no pinned version. Same class as prior audits — cosmetic hardening suggestion, not a live vulnerability, since npx resolves the published package at install time.

**config-audit.py** flags 134 issues, but the tool scans the whole local Claude Code install (global settings, all installed skills/plugins), not just the target repo. In-repo findings:
- `CLAUDE.md` / `claude.md` / `AGENTS.md` (MEDIUM) — "instruction to skip verification" / "hook bypass instruction" / ".env file access" all matched doc prose describing the project's own test-suite and platform-routing behavior (e.g. "SKILL.md's routing skips live... for any native project"), not actual bypass instructions.
- `.claude/settings.json` (MEDIUM/LOW) — the repo's own build-sync hook and hooks config, expected/by design.

**mcps-audit** reports 1818 findings (667 CRITICAL) against this repo's `cli/` directory — this is impeccable's own CLI tool code (a skill/hook manager), so `execSync`, hook-file writes, and config-object `delete` are its documented job, not injected malicious code. Same false-positive class as prior audits; score 100/100 is not a meaningful signal for this repo's nature.

## Fixes Applied

None needed — no dependency CVEs, no verified secrets, no confirmed hook/config vulnerabilities in this week's 6-commit upstream merge.

## Known Remaining Issues

- mcps-audit's 1818 findings remain formally open but non-actionable (heuristic false positives on this repo's own CLI primitives — same class flagged in prior audits).
- skillspector's unpinned-MCP-version MEDIUM findings are a hardening suggestion, not a fix-required item; unaddressed as in prior audits.
- config-audit's global-scope findings (anysearch, ponytail, caveman, claude-plugins-official, etc.) are unrelated to this repo and out of scope for this report.
- mcp-scan and skillspector's LLM-assisted mode remain opt-in and were not run in this unattended scheduled task (both require asking a human first per the security-scanner skill's privacy gate).
