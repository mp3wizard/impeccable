# Security Report — 2026-08-28

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (working tree, ~201 MB) | OK | 0 |
| TruffleHog 3.95.9 (git history) | OK | 0 verified, 9 unverified (test fixtures) |
| Trivy 0.72.0 (fs + bun.lock SCA, 237 packages) | OK | 0 |
| OSV-Scanner 2.4.0 | OK | 0 |
| Semgrep (OWASP Top Ten) | OK | 23 (all false positives, see below) |
| Semgrep (TypeScript) | OK | 0 (no `.ts` sources tracked by git) |
| Semgrep (secrets) | OK | 0 |
| Bandit | N/A | no `.py` files in repo |
| config-audit.py | OK | 134 total (global scan); ~15 in-repo (all LOW, hooks-config-found notices) |
| skill-audit.sh (`.claude/skills/impeccable/SKILL.md`, representative of all provider copies) | OK | LOW RISK (15/100) |
| skillspector 2.3.13 (`--no-llm`, local-only) | OK | LOW (7/100), SAFE — 2 MEDIUM (unpinned MCP server version) |
| mcp-exfil-scan.sh | OK | 0/100, CLEAN |
| mcps-audit | OK | 1841 findings, assessed as heuristic false positives on this repo's own CLI code |
| mcp-scan / skillspector LLM mode | SKIPPED | opt-in, sends data to a third party — not enabled for unattended runs |

## Findings

**No CVEs, no verified secrets, no exfiltration.** Gitleaks, Trivy, OSV-Scanner, and Semgrep secrets/TS configs all report zero findings across the merged upstream code (15 commits this week) and the working tree / git history.

**TruffleHog** flags 9 unverified results, all in `tests/detect-url-launch.test.mjs` (URL-credential-detection test fixtures: `https://user:pass@example.com`, `http://:secret@host.com`, `https://user:p%40ss@example.com`) and `SECURITY_REPORT.md` itself quoting those same fixtures from the prior report. `example.com`/`host.com` placeholders, not real credentials. 0 verified secrets.

**Semgrep OWASP Top Ten** flags 23 findings, all against the same two source patterns duplicated across the repo's per-platform provider mirrors (`.claude/`, `.cursor/`, `.agents/`, etc. — 17 identical copies of `skill/scripts/live-server.mjs` plus one detector bundle):
- `javascript.express.security.cors-misconfiguration` (17×, one per platform mirror) — `res.setHeader('Access-Control-Allow-Origin', origin)` in `live-server.mjs`. Reviewed: the reflection is gated (`skill/scripts/live-server.mjs:764`) behind `isLoopbackOrigin(origin) || token match`, paired with `Vary: Origin`, and the surrounding comment documents the threat model (a remote page probing the dev-server port gets no ACAO header). Semgrep's pattern doesn't see the guard. False positive — same finding as prior audits.
- `javascript.browser.security.wildcard-postmessage-configuration` (1×, plus its mirrors) — `window.postMessage({...}, '*')` in the live-overlay injected script. These are same-window UI signaling messages (toggle overlay visibility, ready state), not cross-origin data transmission. False positive.

**skillspector** flags 2 MEDIUM findings (RP1): the SKILL.md's `Bash(npx impeccable *)` allowed-tools entry has no pinned version. This is a Bash-tool permission pattern, not an MCP server startup command — skillspector's detector misclassifies it. Same class as prior audits: cosmetic hardening suggestion, not a live vulnerability, since `npx` resolves the published package at install time regardless.

**config-audit.py** flags 134 issues, but the tool scans the whole local Claude Code install (global settings, all installed skills/plugins), not just the target repo. In-repo findings are all LOW "hooks configuration found" notices against this repo's own `.claude/settings.json`, `plugin/skills/impeccable/hooks.json`, and equivalents — expected/by design, not vulnerabilities.

**mcps-audit** reports 1841 findings (CRITICAL/MEDIUM) against this repo's `cli/` directory — this is impeccable's own CLI tool code (a skill/hook manager and DOM-highlighting detector), so `execSync`, hook-file writes, config-object `delete`, and a function literally named `highlight` are its documented job, not injected malicious code. Same false-positive class as prior audits; score 100/100 is not a meaningful signal for this repo's nature.

## Fixes Applied

None needed — no dependency CVEs, no verified secrets, no confirmed hook/config vulnerabilities in this week's 15-commit upstream merge (clean auto-merge, no conflicts).

## Known Remaining Issues

- mcps-audit's 1841 findings remain formally open but non-actionable (heuristic false positives on this repo's own CLI primitives — same class flagged in prior audits).
- Semgrep's 23 CORS/postMessage findings are heuristic false positives against code with an already-safe design (loopback/token-gated CORS, same-window postMessage) — same class flagged in prior audits.
- skillspector's unpinned-MCP-version MEDIUM findings are a detector misclassification of a Bash-tool allowlist entry, not a fix-required item; unaddressed as in prior audits.
- config-audit's global-scope findings (anysearch, ponytail, caveman, claude-plugins-official, etc.) are unrelated to this repo and out of scope for this report.
- mcp-scan and skillspector's LLM-assisted mode remain opt-in and were not run in this unattended scheduled task (both require asking a human first per the security-scanner skill's privacy gate).
