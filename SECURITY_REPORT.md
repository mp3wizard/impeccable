# Security Report — 2026-08-25

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (full git history, 1978 commits) | OK | 0 |
| Gitleaks 8.30.1 (working tree, `-i .gitignore`) | OK | 0 |
| TruffleHog 3.95.9 (git history) | OK | 0 verified, 0 unverified |
| Trivy 0.72.0 (fs + bun.lock SCA) | OK | 0 |
| OSV-Scanner 2.4.0 (237 packages) | OK | 0 |
| Semgrep (OWASP Top Ten, TS, secrets configs) | OK | 0 |
| Bandit | N/A | no `.py` files in repo |
| config-audit.py | OK | 134 total (global scan); 8 in-repo (all MEDIUM/LOW, false positives) |
| skill-audit.sh (all `SKILL.md` copies) | OK | all LOW RISK (0–15/100) |
| mcp-exfil-scan.sh | OK | 0/100, CLEAN |
| mcps-audit | OK | 1818 findings, assessed as heuristic false positives on this repo's own CLI code |

## Findings

**No CVEs, no secrets, no exfiltration.** Gitleaks, TruffleHog, Trivy, OSV-Scanner, and Semgrep (OWASP/TS/secrets) all report zero findings across the merged upstream code (15 commits this week) and the full 1978-commit git history.

**config-audit.py** flags 134 issues, but the tool scans the whole local Claude Code install (global settings, all installed skills/plugins), not just the target repo — the large majority (anysearch, ponytail, caveman, claude-plugins-official, etc.) are unrelated global skills entirely out of scope for this repo. Findings actually located under the impeccable repo path:
- `CLAUDE.md` / `claude.md` (MEDIUM) — "instruction to skip verification" / "hook bypass instruction" / ".env file access": all matched doc prose describing the project's own test-suite and platform-routing behavior, not actual bypass instructions. Confirmed false positive by reading the flagged text.
- `AGENTS.md` (MEDIUM) — same class, doc prose mentioning `.env`/password handling in test-fixture descriptions.
- `.claude/settings.json` → `Stop[0]` (MEDIUM, broad matcher `''`) — the repo's own build-sync hook, expected.
- `.claude/settings.json` (LOW) — hooks configuration present, expected/by design.

**mcps-audit** reports 1818 findings (667 CRITICAL) against this repo's `cli/` directory — this is impeccable's own CLI tool code (a skill/hook manager), so `execSync`, hook-file writes, and config-object `delete` are its actual documented job, not injected malicious code. The scanner's generic pattern matcher has no way to distinguish "CLI that manages skills/hooks" from "malicious payload doing the same primitives." Score 100/100 is not a meaningful signal for this repo's nature.

**skill:impeccable/scripts/generate-image.mjs** (flagged CRITICAL by config-audit as "base64 encoding + .env access") — read the source (`skill/scripts/generate-image.mjs`): it's the documented OpenAI `gpt-image-2` fallback image generator, uses the user's own `OPENAI_API_KEY` from env to call OpenAI's own API, and discloses per-image cost in its own doc comment. Legitimate, no fix needed.

## Fixes Applied

None needed — no dependency CVEs, no secrets, no confirmed hook/config vulnerabilities in this week's 15-commit upstream merge.

## Known Remaining Issues

- mcps-audit's 1818 findings remain formally open but non-actionable (heuristic false positives on this repo's own CLI primitives — same class flagged in prior audits).
- config-audit's global-scope findings (anysearch, ponytail, caveman, etc.) are unrelated to this repo and out of scope for this report; they belong to a machine-wide config audit, not a per-repo scan.
