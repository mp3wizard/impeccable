# Security Report — 2026-04-24

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  
**Scanned at:** 2026-04-24T03:07:50Z  
**Git HEAD:** 0607ed3  
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    0607ed3
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 528 commits (~20.6 MB) | — |
| Bandit | SKIPPED | 1.9.4 | 0 | No .py files |
| Semgrep (OWASP) | OK | 1.157.0 | 104 JS files | — |
| Semgrep (TypeScript) | OK | 1.157.0 | 0 | No .ts tracked by git |
| Semgrep (Secrets) | OK | 1.157.0 | 824 files | 4 files >0.3 MB skipped |
| Trivy | OK | 0.69.3 | bun.lock (419 pkgs) | — |
| TruffleHog | OK | 3.94.2 | 528 commits (14663 chunks) | — |
| CodeQL | SKIPPED | N/A | — | No .github/workflows/codeql.yml |
| mcps-audit | OK | 1.0.0 | 143 files (33627 lines) | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (419 pkgs) | — |
| mcp-scan | OPT-IN | N/A | — | User consent not obtained (sends data to invariantlabs.ai) |
| security-audit (config-audit.py) | OK | bundled | ~/.claude/settings.json + skills/plugins | — |
| skill-security-auditor (skill-audit.sh) | OK | bundled | 11 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | 52 skill files, 2 MCP configs | — |

## Gitleaks — Secret Detection

**Summary:** 0 findings

528 commits scanned (~20.6 MB). No secrets detected in git history or filesystem.

## Semgrep — SAST

**Summary:** 56 findings (OWASP), 0 secrets, 0 TypeScript issues

### OWASP Top 10 — 56 findings (all `wildcard-postmessage-configuration`)

All 56 findings are the same pattern — `window.postMessage(…, '*')` with a wildcard origin — present in `live-browser.js` (distributed to 11 agent-specific skill directories) and `extension/content/content-script.js`.

**Affected files:**
- `.agents/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.claude/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.cursor/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.gemini/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.github/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.kiro/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.opencode/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.pi/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.rovodev/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.trae-cn/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `.trae/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `source/skills/impeccable/scripts/live-browser.js` — lines 3365, 3370, 3410, 3439
- `extension/content/content-script.js` — lines 28, 31, 35, 38, 100
- `src/detect-antipatterns-browser.js` — lines 2327–2331, 2351, 2396

**Assessment:** This is a browser extension / live-preview tool. The wildcard `'*'` is expected here — the extension injects into unknown third-party pages and cannot know the target origin at compile time. This is a known architectural tradeoff for browser devtools extensions. **Not actionable without redesigning the extension's communication model.**

## Trivy — Dependency Vulnerabilities

**Summary:** 3 HIGH CVEs in `basic-ftp` (transitive via `get-uri`)

| Package | Installed | Fixed | CVE/Advisory | CVSS | Title |
|---------|-----------|-------|--------------|------|-------|
| basic-ftp | 5.2.0 | 5.2.1 | CVE-2026-39983 | HIGH | Command injection via CRLF in file path params |
| basic-ftp | 5.2.0 | 5.2.2 | GHSA-6v7q-wjvx-w8wg | HIGH | Incomplete CRLF injection protection |
| basic-ftp | 5.2.0 | 5.3.0 | GHSA-rp42-5vxx-qpwr | HIGH | DoS via unbounded memory in `Client.list()` |

All fixed in `basic-ftp@5.3.0`. Applied via `overrides` in `package.json` (see Fixes Applied).

## TruffleHog — Live Secret Verification

**Summary:** 0 findings (verified: 0, unverified: 0)

14,663 chunks scanned. No secrets detected.

## mcps-audit — OWASP MCP Top 10

**Summary:** 404 findings — CRITICAL:114, HIGH:35, MEDIUM:183, LOW:72. Risk score: 100/100.

**Top findings:**
- AS-001 CRITICAL: `import { execSync } from 'node:child_process'` in `bin/commands/skills.mjs:10`
- AS-006 HIGH: Code execution without sandboxing (same location)
- AS-003 MEDIUM: High-risk permission patterns in `extension/background/service-worker.js` (Map.delete operations — FPs)
- AS-009 MEDIUM: Unsafe output handling in `content/site/anti-patterns-catalog.js`
- AS-010 MEDIUM: No logging/auditing in `content/site/anti-patterns-catalog.js`

**Assessment:** The `execSync` finding is the CLI tool that runs the impeccable skill binary — expected for a CLI. Service-worker Map.delete() findings are false positives from the agentic AI rule set. The count is high due to this rule set's sensitivity on browser extension patterns.

## OSV-Scanner — SCA

**Summary:** 6 vulnerabilities in 3 packages (4 HIGH, 2 MEDIUM), all fixable via overrides

| Package | Version | Fixed | Advisory | CVSS |
|---------|---------|-------|----------|------|
| basic-ftp | 5.2.0 | 5.2.1 | GHSA-chqc-8p9q-pq6q | 8.6 |
| basic-ftp | 5.2.0 | 5.2.2 | GHSA-6v7q-wjvx-w8wg | 8.2 |
| basic-ftp | 5.2.0 | 5.3.0 | GHSA-rp42-5vxx-qpwr | 7.5 |
| brace-expansion | 2.0.2 | 2.0.3 | GHSA-f886-m6hf-6m8v | 6.5 |
| lodash | 4.17.23 | 4.18.0 | GHSA-f23m-r3pf-42rh | 6.5 |
| lodash | 4.17.23 | 4.18.0 | GHSA-r5fr-rjxr-66jc | 8.1 |

## security-audit (config-audit.py) — Claude Config Audit

**Summary:** 30 findings — CRITICAL:5, HIGH:10, MEDIUM:12, LOW:3

**CRITICAL (5):** All false positives — the `skill-security-auditor`, `security-scanner`, `mcp-exfil-scan`, `skill-audit`, and `config-audit` scripts themselves contain words like "base64", ".env", "ncat" as part of their *detection* logic. These are not actual exfiltration attempts.

**HIGH (10):** 8 are cc-beeper hooks in `~/.claude/settings.json` that POST to `localhost` — this is a known local notification tool, not an exfiltration risk. 2 are examples in the `hook-development` plugin showing `mkfs`/`dd` commands in a validation blocklist (documenting what to reject, not executing them).

**MEDIUM (12):** 7 are broad-matcher hooks in settings.json (cc-beeper, expected); 1 is `skipDangerousModePermissionPrompt: true`; others are playwright/notebooklm skill descriptions referencing credentials.

**LOW (3):** Hooks configuration present (expected).

## skill-security-auditor — Skill Audit

**Summary:** 11 SKILL.md files scanned — all LOW RISK (scores 0–15/100), all APPROVED

| File | Score | Verdict |
|------|-------|---------|
| .agents/skills/impeccable/SKILL.md | 0 | LOW RISK |
| .claude/skills/impeccable/SKILL.md | 15 | LOW RISK |
| .cursor/skills/impeccable/SKILL.md | 5 | LOW RISK |
| .gemini/skills/impeccable/SKILL.md | 0 | LOW RISK |
| .github/skills/impeccable/SKILL.md | 5 | LOW RISK |
| .kiro/skills/impeccable/SKILL.md | 5 | LOW RISK |
| .opencode/skills/impeccable/SKILL.md | 15 | LOW RISK |
| .pi/skills/impeccable/SKILL.md | 15 | LOW RISK |
| .rovodev/skills/impeccable/SKILL.md | 15 | LOW RISK |
| .trae-cn/skills/impeccable/SKILL.md | 5 | LOW RISK |
| .trae/skills/impeccable/SKILL.md | 5 | LOW RISK |
| source/skills/impeccable/SKILL.md | 15 | LOW RISK |

## mcp-exfil-scan — MCP Exfiltration Scan

**Summary:** 11 findings — CRITICAL:2, HIGH:5, MEDIUM:4. All findings are in `~/.claude/skills/` (global install), not in the impeccable repo.

**CRITICAL (2) — False positives:**
- `~/.claude/skills/impeccable/SKILL.md`: flagged for containing the word "exfiltration" in its description of what the scanner detects
- `~/.claude/skills/security-audit/SKILL.md`: same — describes how to detect exfiltration, not perform it

**HIGH (5):**
- `skill-security-auditor`: Bash+WebFetch tools — expected for a security scanner that fetches skills to audit
- `atlas-cloud`: env var + network refs (URL shortener FP — it's an OpenAI client call pattern)

**MEDIUM (4):**
- `playwright-cli`, `pyright`, `vtsls`: no source attribution in skill metadata

## Cross-Tool Observations

1. **basic-ftp / brace-expansion / lodash CVEs** independently confirmed by both Trivy and OSV-Scanner — high confidence. Fixed via package.json overrides.

2. **Wildcard postMessage** (Semgrep) is the only code-level pattern finding in the impeccable source. It appears consistently across all distributed copies of `live-browser.js` — the single upstream source is `src/detect-antipatterns-browser.js` and `extension/content/content-script.js`. Not fixable without redesigning cross-origin messaging.

3. **No cross-tool secret findings** — Gitleaks, Semgrep secrets, and TruffleHog all returned 0.

4. **Config-audit and mcp-exfil-scan findings** are entirely in the user's global `~/.claude/` install, not in the impeccable source repo. No action required on this repo.

## Fixes Applied

| Finding | Fix | Tool |
|---------|-----|------|
| basic-ftp 5.2.0 (CVE-2026-39983, GHSA-6v7q-wjvx-w8wg, GHSA-rp42-5vxx-qpwr) | `"overrides": {"basic-ftp": "^5.3.0"}` in package.json + bun install | Trivy / OSV |
| brace-expansion 2.0.2 (GHSA-f886-m6hf-6m8v) | `"overrides": {"brace-expansion": "^2.0.3"}` in package.json + bun install | OSV |
| lodash 4.17.23 (GHSA-f23m-r3pf-42rh, GHSA-r5fr-rjxr-66jc) | `"overrides": {"lodash": "^4.18.0"}` in package.json + bun install | OSV |

## Known Remaining Issues

- **Wildcard postMessage (Semgrep, 56 findings):** Architectural — browser extension must communicate with injected pages across unknown origins. Not a fixable finding without breaking extension functionality.
- **mcps-audit 404 findings:** High false-positive rate from AS-003/AS-009/AS-010 rules on browser extension patterns. Primary real finding (execSync) is expected CLI behavior.
- **mcp-scan:** Not run (opt-in, sends data to invariantlabs.ai).
- **CodeQL:** Not run (no workflow configured).
- **Business logic, IDOR, runtime behavior:** Not covered by static analysis.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260424T030423Z.jsonl`
- **Tool runs recorded:** 8
- **Standard:** OWASP APTS § Auditability
