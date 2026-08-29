# Security Report — 2026-08-29

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (SARIF + plain, git history, 2042 commits, ~208 MB) | OK | 0 |
| TruffleHog 3.95.9 (git history) | OK | 0 verified, 12 unverified (test fixtures) |
| Trivy 0.72.0 (fs + bun.lock SCA, 237 packages) | OK | 0 |
| OSV-Scanner 2.4.0 | OK | 0 |
| Semgrep (OWASP Top Ten) | OK | 0 |
| Semgrep (TypeScript) | OK | 0 (no `.ts` sources tracked by git) |
| Semgrep (secrets) | OK | 0 |
| Bandit | N/A | no `.py` files in repo |
| config-audit.py | OK | 137 total (global `~/.claude` scan, not repo-scoped); in-repo hits are heuristic base64+`.env`-access false positives on legitimate key-loading code (`generate-image.mjs`, `detect-url.mjs`) |
| skill-audit.sh (`.claude/skills/impeccable/SKILL.md`, representative of all provider copies) | OK | LOW RISK (15/100) |
| mcp-exfil-scan.sh | OK | 0/100, CLEAN |
| mcps-audit | OK | 1840 findings, same heuristic false positives as prior audits (own CLI code: `execSync` in a skill/hook manager, `delete` on config objects, a function named `highlight`) |
| skillspector, mcp-scan LLM mode | SKIPPED | opt-in, third-party data send — not enabled for unattended runs |

## Findings

**No CVEs, no verified secrets, no exfiltration.** Gitleaks, Trivy, OSV-Scanner, and all three Semgrep configs report zero findings across the merged upstream code (77 commits this week, clean fast-forward-style merge with no conflicts) and the full git history.

**TruffleHog** flags 12 unverified results, all `https://user:pass@example.com` / `http://:secret@host.com` style placeholders in `tests/detect-url-launch.test.mjs` (URL-credential-detection test fixtures) and `SECURITY_REPORT.md` quoting the same fixtures from prior reports. 0 verified secrets.

**config-audit.py** scans the whole local Claude Code install (global settings, all installed skills/plugins across the machine), not just this repo. The handful of in-repo hits are its base64+`.env`-access heuristic firing on `impeccable/scripts/generate-image.mjs` and `detect-url.mjs` reading an API key to call an image/detection API — legitimate use, cross-checked clean by the more precise `mcp-exfil-scan.sh` on the same files (0/100).

**mcps-audit** reports 1840 findings against this repo's `cli/` directory — this is impeccable's own CLI tool (a skill/hook manager and DOM anti-pattern detector), so `execSync`, hook-file `delete`, and a function literally named `highlight` are its documented job, not injected malicious code. Same false-positive class flagged in every prior audit of this repo.

## Fixes Applied

None needed — no dependency CVEs, no verified secrets, no confirmed hook/config vulnerabilities in this week's 77-commit upstream merge.

## Known Remaining Issues

- mcps-audit's 1840 findings remain formally open but non-actionable (heuristic false positives on this repo's own CLI primitives — same class as every prior audit).
- config-audit's global-scope findings (anysearch, other installed skills/plugins) are unrelated to this repo and out of scope for this report.
- mcp-scan and skillspector's LLM-assisted mode remain opt-in and were not run in this unattended scheduled task (both require asking a human first per the security-scanner skill's privacy gate).
