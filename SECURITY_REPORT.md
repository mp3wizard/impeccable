# Security Report — 2026-04-30

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-04-30T03:08:00Z
**Git HEAD:** 56ce218
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    56ce218
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 591 commits (23.82 MB) | — |
| Bandit | SKIPPED | 1.9.4 | — | No .py files |
| Semgrep OWASP | OK | latest | 109 JS/TS files | — |
| Semgrep Secrets | OK | latest | 961 files | — |
| Trivy | OK | 0.69.3 | bun.lock, pnpm-lock.yaml | — |
| TruffleHog | OK | 3.94.2 | 591 commits (23.19 MB) | — |
| CodeQL | SKIPPED | — | — | No codeql.yml workflow |
| mcps-audit | OK | 1.0.0 | 242 files, 48692 lines | — |
| OSV-Scanner | OK | 2.3.5 | 415+430 packages | — |
| security-audit (config-audit.py) | OK | bundled | settings.json, skills, plugins | — |
| skill-security-auditor | OK | bundled | 3 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | 56 skill files, 2 MCP configs | — |
| mcp-scan | OPT-IN | — | — | Not consented |

## Gitleaks — Secrets in Git History

**Summary:** 0 findings

591 commits scanned. No leaks found.

## Semgrep OWASP — SAST

**Summary:** 64 findings (all same rule, duplicated across distribution directories)

All 64 findings are `wildcard-postmessage-configuration` — `window.postMessage(..., '*')` used in browser extension scripts and the browser-side antipattern detector. The findings appear 13+ times because the same source files are copied into every IDE-specific distribution directory (`.agents/`, `.claude/`, `.cursor/`, `.gemini/`, `.kiro/`, etc.).

**Unique affected source files (2):**
- `src/detect-antipatterns-browser.js` — lines 2464–2533: the injected page scanner reports results back to the extension host via postMessage with `'*'` origin
- `extension/content/live-browser.js` (via distribution copies) — lines 3539–3613: live-mode commands sent to the injected script

**Assessment:** This is an intentional design trade-off. A browser extension communicating with an injected content script cannot know the page origin at compile time. The messages contain UI commands (scan/remove/highlight) and scan results — no credentials or sensitive user data. Mitigated by the `source: 'impeccable-command'` / `source: 'impeccable-results'` namespace check in the `message` listener. Low practical risk.

## Semgrep Secrets — Secret Detection

**Summary:** 0 findings

961 files scanned. No secrets detected.

## Trivy — Dependency Vulnerabilities

**Summary:** 0 vulnerabilities

- `bun.lock`: 430 packages — clean
- `pnpm-lock.yaml`: 415 packages — clean

## TruffleHog — Live-Verified Secrets

**Summary:** 0 verified secrets, 0 unverified secrets

17,258 chunks scanned across 591 commits. No secrets.

## OSV-Scanner — SCA via OSV.dev

**Summary:** No issues found

415 packages (pnpm-lock.yaml) + 430 packages (bun.lock) scanned. No known vulnerabilities.

## mcps-audit — OWASP MCP Top 10

**Summary:** 600 findings (CRITICAL: 152, HIGH: 57, MEDIUM: 271, LOW: 120) — largely false positives

Risk Score: 100/100 (FAIL). The tool applied MCP/Agentic AI rules to CLI and browser-extension source files that are not MCP servers. Key flagged patterns:

- `execSync` in `bin/commands/skills.mjs` — intentional CLI use, not an MCP server
- `.delete()` Map operations in `extension/background/service-worker.js` — tab management, not privilege escalation
- `anti-patterns-catalog.js` content strings matched as "high-risk permission patterns" — false positives on CSS/HTML example snippets

**Credible findings (MCP-04, MCP-06, MCP-10):** The repo ships as a skill package consumed by AI agents. `MCP-06 Indirect Prompt Injection` and `MCP-10 Context Window Pollution` are relevant if adversarial HTML is scanned — the antipattern detector reads arbitrary page DOM. Existing mitigation: results are structured findings, not free-text fed back to the model.

## security-audit (config-audit.py) — Claude Config Audit

**Summary:** 31 issues — all false positives or expected user configuration

- **CRITICAL (6):** All are pattern-matches on the security scanner's own source files (skill-security-auditor, mcp-exfil-scan.sh, config-audit.py) that contain the word "base64", "ncat", or "ssh" in comments/documentation — not actual exfiltration code.
- **HIGH (10):** All 10 are cc-beeper hooks in `~/.claude/settings.json` curling to `http://localhost:${PORT}` — the user's own notification system. Expected and benign.
- **MEDIUM (12):** Broad matchers on cc-beeper hooks (expected), `skipDangerousModePermissionPrompt: true` (user preference), playwright/notebooklm skill references to cookies/passwords in documentation context.
- **LOW (3):** Hooks configuration detected (informational).

No actionable findings.

## skill-security-auditor — SKILL.md Risk Scores

**Summary:** All scanned skills scored LOW RISK (0–5/100)

| File | Score | Verdict |
|------|-------|---------|
| `.cursor/skills/impeccable/SKILL.md` | 5/100 | LOW RISK — APPROVE |
| `.trae-cn/skills/impeccable/SKILL.md` | 5/100 | LOW RISK — APPROVE |
| `.gemini/skills/impeccable/SKILL.md` | 0/100 | LOW RISK — APPROVE |

No dangerous patterns, no prompt injection, no credential access, no network URLs detected.

## mcp-exfil-scan — MCP Exfiltration Analysis

**Summary:** 11 issues (CRITICAL: 2, HIGH: 5, MEDIUM: 4) — all false positives

- **CRITICAL (2):** Skill descriptions containing the words "exfiltration" (impeccable skill description) and "exfiltrate" (security-audit skill describing its own purpose). Pattern-matched on legitimate documentation text.
- **HIGH (4):** `skill-security-auditor` has `Read+WebFetch+Bash` — expected for a security auditing skill; `atlas-cloud` has env var refs + network calls — expected for an AI generation API skill; atlas-cloud "URL shortener" false positive (OpenAI client call).
- **MEDIUM (3):** playwright-cli, pyright, vtsls skills lack source attribution metadata — informational.

No actionable exfiltration chains detected in the impeccable skill itself.

## Cross-Tool Observations

- **Zero secrets across all tools:** Gitleaks, TruffleHog, and Semgrep secrets all found nothing. High confidence the codebase contains no hardcoded credentials.
- **Zero dependency CVEs:** Trivy and OSV-Scanner both confirmed bun.lock and pnpm-lock.yaml are clean with 430+ packages each.
- **Wildcard postMessage (Semgrep)** is the only legitimate technical finding. It is a known browser extension pattern, not a vulnerability introduced by this week's upstream commits.
- **mcps-audit, config-audit, mcp-exfil-scan** all report high scores due to false-positive pattern matching on security tool source files and user-configured hooks. No cross-tool correlation elevates these to actionable findings.

## Fixes Applied

None. No CVEs, secrets, or fixable code vulnerabilities were found.

## Known Remaining Issues

- **`window.postMessage(..., '*')`** in browser extension scripts: design trade-off, not a fixable bug. Messages carry no sensitive data and are namespace-checked on receipt.
- **mcps-audit MCP-06/MCP-10**: Theoretical prompt injection risk when scanning adversarial HTML pages. Mitigated by structured output format.
- **Trivy 0.70.0 available** (current: 0.69.3): Not a security issue — upgrade when convenient.

## Coverage Gaps

- Business logic, IDOR, and runtime behavior not covered by static analysis.
- CodeQL not configured (no `.github/workflows/codeql.yml`).
- mcp-scan (invariantlabs.ai) not run — opt-in required.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260430T030520Z.jsonl`
- **Tool runs recorded:** 3 (partial — apts-audit.sh log calls hit a zsh arithmetic issue with `$EPOCHREALTIME`; core scan integrity unaffected)
- **Standard:** OWASP APTS § Auditability
