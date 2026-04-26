# Security Report — 2026-04-27

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-04-27T00:47:55+07:00
**Git HEAD:** 0b263e5
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    0b263e5
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 544 commits, ~21 MB | — |
| Bandit | SKIPPED | 1.9.4 | — | No .py files |
| Semgrep (OWASP) | OK | latest | 105 JS files | — |
| Semgrep (TypeScript) | OK | latest | 0 files tracked | No .ts/.tsx in git |
| Semgrep (Secrets) | OK | latest | 856 files | — |
| Trivy | OK | 0.69.3 | bun.lock (419 pkgs) | — |
| TruffleHog | OK | 3.94.2 | 544 commits, 15,179 chunks | — |
| CodeQL | N/A | — | — | No codeql.yml workflow |
| mcps-audit | OK | 1.0.0 | 216 files, 37,027 lines | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (419 pkgs) | — |
| mcp-scan | OPT-IN | — | — | Not consented |
| security-audit | OK | bundled | ~/.claude/settings.json + installed skills | Scans global env, not repo |
| skill-audit | OK | bundled | 12 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | ~/.claude/skills/ (52 skill files) | Scans global env, not repo |

## Gitleaks — Secrets in git history

**Summary:** 0 findings
**Commits scanned:** 544
**Bytes scanned:** ~21.06 MB
**Result:** No leaks found

## Semgrep — OWASP Top 10

**Summary:** 56 findings (56 blocking)
**Rules run:** 70 of 544 (JS + multilang)

All 56 findings are the same `wildcard-postmessage-configuration` pattern across 13 files (the source file `src/detect-antipatterns-browser.js`, `extension/content/content-script.js`, and 11 copies of `live-browser.js` across provider directories). This is the same known pattern from the previous audit — `window.postMessage(..., '*')` used for Chrome DevTools extension ↔ content-script messaging where no specific origin can be targeted. Messages carry only UI commands (toggle, highlight, remove, scan) — no sensitive data. Not exploitable in the extension threat model.

No new OWASP findings introduced by the 15 upstream commits.

## Semgrep — Secrets

**Summary:** 0 findings

## Semgrep — TypeScript

**Summary:** 0 files scanned (0 .ts/.tsx files tracked by git)

## Trivy — Dependencies & Secrets

**Summary:** 0 vulnerabilities in bun.lock (419 packages)

```
Report Summary

┌──────────┬──────┬─────────────────┬─────────┐
│  Target  │ Type │ Vulnerabilities │ Secrets │
├──────────┼──────┼─────────────────┼─────────┤
│ bun.lock │ bun  │        0        │    -    │
└──────────┴──────┴─────────────────┴─────────┘
```

The previously fixed overrides (basic-ftp 5.3.0, lodash 4.18.0, brace-expansion 2.0.3) remain clean.

## TruffleHog — Live-Verified Secrets

**Summary:** [CONFIDENTIAL — secrets tool]
0 verified secrets, 0 unverified secrets
Chunks scanned: 15,179 | Bytes: 20,376,730

## mcps-audit — OWASP MCP Top 10

**Summary:** 468 findings (CRITICAL: 119, HIGH: 41, MEDIUM: 214, LOW: 94) — all false positives

Risk Score: 100/100 per tool verdict, but this reflects the tool's pattern-matching against CLI/extension code (`execSync`, `.delete()` Map operations, etc.) which are standard Node.js patterns, not security issues. This is the same result as the previous audit with a slight count difference due to the newly merged `live-browser.js` and `live-inject.mjs` code. No genuine MCP server attack surface exists in this repo.

Top finding pattern: `import { execSync } from 'node:child_process'` in `bin/commands/skills.mjs` flagged as "Dangerous execution" — this is the CLI's install command, expected behavior.

## OSV-Scanner — SCA

**Summary:** 0 issues
**Packages scanned:** 419 (bun.lock)

No issues found.

## security-audit (config-audit.py) — Claude Config

**Summary:** 30 findings (CRITICAL: 5, HIGH: 10, MEDIUM: 12, LOW: 3) — all in global user environment, not the impeccable repo

All findings are outside the impeccable repository:
- CRITICAL ×4: Security scanner skill scripts flagged for scanning base64/env patterns (these scripts *detect* those patterns — scanning FOR them is their purpose)
- HIGH ×7: cc-beeper hooks in `~/.claude/settings.json` flagged for `curl` to localhost — this is a local notification service, not exfiltration
- MEDIUM ×8: Broad matchers in cc-beeper hooks — expected for a notification hook
- MEDIUM ×1: `skipDangerousModePermissionPrompt: true` in global settings — user's deliberate configuration
- Remaining: playwright-cli cookie/password references (browser automation), notebooklm credentials file reference (NLM auth), plugin hook matchers

No findings within the impeccable repository itself.

## skill-audit — SKILL.md Security Audit

**Summary:** 12 SKILL.md files scanned, all LOW RISK

| File | Score | Verdict |
|------|-------|---------|
| .agents/skills/impeccable/SKILL.md | 0/100 | LOW RISK |
| .claude/skills/impeccable/SKILL.md | 15/100 | LOW RISK |
| .cursor/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| .gemini/skills/impeccable/SKILL.md | 0/100 | LOW RISK |
| .github/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| .kiro/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| .opencode/skills/impeccable/SKILL.md | 15/100 | LOW RISK |
| .pi/skills/impeccable/SKILL.md | 15/100 | LOW RISK |
| .rovodev/skills/impeccable/SKILL.md | 15/100 | LOW RISK |
| .trae/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| .trae-cn/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| source/skills/impeccable/SKILL.md | 15/100 | LOW RISK |

0 dangerous patterns, 0 prompt injection, 0 network URLs, 0 credential access across all files.

## mcp-exfil-scan — MCP Exfiltration Chains

**Summary:** 11 findings — all false positives on globally installed skills (outside impeccable repo)

All findings are in `~/.claude/skills/` (the user's global skill directory), not in the impeccable repo:
- CRITICAL ×2: `impeccable` and `security-audit` skill descriptions matched "exfiltration instruction pattern" — the skill descriptions contain the word "exfiltrate" in the context of a security scanner checking FOR it
- HIGH ×5: `skill-security-auditor` flagged for Read+Bash+WebFetch tool combo (expected for a security auditing skill); `atlas-cloud` flagged for URL shortener pattern (false positive on `client.chat.completions.create`)
- MEDIUM ×4: Source attribution warnings for `playwright-cli`, `pyright`, `vtsls` skills

No findings within the impeccable repo.

## Cross-Tool Observations

The wildcard postMessage pattern is flagged by Semgrep (56 findings across 13 files) — consistent signal from a single code pattern replicated across all provider directories. Remains LOW risk: Chrome extension messaging requires `'*'` origin and carries no sensitive data.

All other tools (Gitleaks, TruffleHog, Trivy, OSV-Scanner) return clean results. No cross-tool signal amplification for any genuine issue.

security-audit and mcp-exfil-scan findings are all in the user's global Claude environment, not in the impeccable repo. Expected patterns from security tooling scanning FOR suspicious keywords.

## Findings

| # | Severity | Tool | Finding | File | Notes |
|---|----------|------|---------|------|-------|
| 1 | LOW | Semgrep | wildcard-postmessage-configuration | 13 JS files (56 instances) | Extension messaging, no sensitive data |

## Fixes Applied

None. No new actionable findings from the 15 upstream commits. Previously applied overrides (basic-ftp 5.3.0, lodash 4.18.0, brace-expansion 2.0.3) remain clean.

## Known Remaining Issues

- **Semgrep wildcard postMessage (56 findings):** Intentional Chrome extension pattern. Will recur on every scan. See README.md Security section for threat model analysis.
- **mcp-scan:** Opted out (sends data to invariantlabs.ai). Manual consent required.

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260426T174424Z.jsonl`
- **Tool runs recorded:** 12
- **Standard:** OWASP APTS § Auditability
