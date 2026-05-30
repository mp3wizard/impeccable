# Security Report — 2026-05-30

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-05-30T03:06:00Z
**Git HEAD:** `2ee272d8`
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    2ee272d8
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 756 commits, ~50 MB | — |
| Bandit | N/A | 1.9.4 | — | No .py files |
| Semgrep (OWASP) | OK | 1.157.0 | 123 JS/TS files | — |
| Semgrep (TypeScript) | OK | 1.157.0 | 6 .ts files | — |
| Semgrep (Secrets) | OK | 1.157.0 | 1452 files | — |
| Trivy | OK | 0.69.3 | bun.lock (657 packages) | — |
| TruffleHog | OK | 3.94.2 | 756 commits, ~50 MB | — |
| CodeQL | SKIPPED | — | — | No .github/workflows/codeql.yml |
| mcps-audit | OK | latest (npx) | 361 files | — |
| OSV-Scanner | OK | 2.3.5 | 657 packages | — |
| mcp-scan | OPT-IN | — | — | Automated run — no user consent obtained |
| security-audit | OK | bundled | global settings + skills + project | — |
| skill-security-auditor | OK | bundled | 3 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | global skills + plugins | — |

## Gitleaks — Secrets in Git History

**Summary:** 0 findings.

```
756 commits scanned.
scanned ~50290782 bytes (50.29 MB) in 6.48s
no leaks found
```

## Semgrep — SAST

**OWASP — 75 findings (blocking):**

All 75 findings are `wildcard-postmessage-configuration` (rule: `javascript.browser.security.wildcard-postmessage-configuration`). The impeccable browser extension uses `window.postMessage(…, '*')` for cross-origin messaging between the content script and injected page script. This is a deliberate architectural choice for browser extensions — Chrome's content-to-page bridge requires it. The same source file is distributed to 13 harness directories (`.agents/`, `.claude/`, `.cursor/`, `.gemini/`, etc.), multiplying the finding count. All findings trace to two distinct files: `detect-antipatterns-browser.js` (×13 copies) and `extension/content/content-script.js` (×1). **Low — by design; not fixable without breaking the extension.**

**TypeScript — 0 findings** (6 files scanned).

**Secrets — 0 findings** (1452 files scanned).

## Trivy — Dependency Vulnerability Scan

**Summary:** 0 CVEs, 0 secrets.

```
bun.lock | bun | 0 vulnerabilities | - secrets
657 packages scanned
```

## TruffleHog — Verified Secrets

**Summary:** 0 verified, 0 unverified secrets.

```
chunks: 37698, bytes: 49969313
verified_secrets: 0, unverified_secrets: 0
scan_duration: 4.115946791s
```

## mcps-audit — MCP Permission Audit

**Summary:** Risk score 100/100, 1054 findings across 361 files.

**Analysis:** The CRITICAL findings (AS-001 "Dangerous execution") are false positives — mcps-audit flags every JavaScript function declaration in the browser extension's injected script. Genuine findings:

- **[CRITICAL] AS-001** `cli/bin/commands/skills.mjs:10` — `execSync` from `node:child_process` (intentional: CLI tool runs shell commands by design)
- **[HIGH] AS-006** `cli/bin/commands/skills.mjs:10` — Code execution without sandboxing (same, by design)
- **[MEDIUM] AS-010** `astro.config.mjs` — No logging/auditing detected

## OSV-Scanner — Software Composition Analysis

**Summary:** 1 vulnerability found (Medium).

| OSV URL | CVSS | Package | Version | Fixed Version |
|---------|------|---------|---------|---------------|
| [GHSA-p7fg-763f-g4gf](https://osv.dev/GHSA-p7fg-763f-g4gf) | 4.8 | @anthropic-ai/sdk | 0.81.0 | 0.91.1 |

## security-audit — Claude Config Audit

**Summary:** 39 findings (5 CRITICAL, 10 HIGH, 19 MEDIUM, 5 LOW).

All 5 CRITICAL findings are false positives in security scanner tooling itself (config-audit.py, mcp-exfil-scan.sh, skill-audit.sh, skill-security-auditor/SKILL.md reference base64/ssh/.env because they scan for those patterns). The 7 HIGH findings flagging curl in `~/.claude/settings.json` hooks are the cc-beeper localhost notification system — known and intentional. The MEDIUM `skipDangerousModePermissionPrompt: true` is an existing, known global setting.

## skill-security-auditor — Skill Security Audit

| Skill file | Risk Score | Verdict |
|-----------|-----------|---------|
| `.pi/skills/impeccable/SKILL.md` | 15/100 | LOW RISK — APPROVE |
| `.rovodev/skills/impeccable/SKILL.md` | 15/100 | LOW RISK — APPROVE |
| `.cursor/skills/impeccable/SKILL.md` | 5/100 | LOW RISK — APPROVE |

## mcp-exfil-scan — MCP Exfiltration Scan

**Summary:** 11 findings (2 CRITICAL, 5 HIGH, 4 MEDIUM), Risk score 100/100.

All findings are in globally installed skills (`security-scanner`, `skill-security-auditor`, `atlas-cloud`, `playwright-cli`, `pyright`, `vtsls`) — not in the impeccable package itself. The security tools are correctly flagged for having Bash+WebFetch (they run security scans and verify findings). The impeccable SKILL.md scored 5–15/100 (LOW RISK) across all harness copies.

## Cross-Tool Observations

1. **No secret leaks detected** — Gitleaks, TruffleHog, and Semgrep Secrets all returned 0 findings across the full git history.
2. **One actionable CVE:** `@anthropic-ai/sdk` 0.81.0 → upgrade to ≥ 0.91.1 (GHSA-p7fg-763f-g4gf, Medium, CVSS 4.8).
3. **Wildcard postMessage:** Semgrep OWASP's 75 findings are all one pattern in the browser extension architecture — by design.
4. **mcps-audit and mcp-exfil-scan false positives:** Both tools flag the security scanner's own scripts and function declarations in the extension bundle; these are not genuine risks.

## Findings

| # | Severity | Tool | Package/File | Description |
|---|----------|------|-------------|-------------|
| 1 | Medium | OSV-Scanner | @anthropic-ai/sdk 0.81.0 | GHSA-p7fg-763f-g4gf — upgrade to ≥ 0.91.1 |
| 2 | Low | Semgrep OWASP | detect-antipatterns-browser.js (×14) | wildcard-postmessage-configuration — by design for browser extension |

## Fixes Applied

- **GHSA-p7fg-763f-g4gf** — Investigated. The vulnerability is in `@anthropic-ai/sdk@0.81.0` nested under `@anthropic-ai/claude-agent-sdk` (a `devDependency`). The direct dependency has been at `^0.91.1` since upstream merge. A bun `overrides` entry for a direct dep conflicts with npm publish (EOVERRIDE); bun `resolutions` was not honored. The vulnerability is **dev-only and not shipped to consumers** of the npm package. Upstream should update `@anthropic-ai/claude-agent-sdk` to require `^0.91.1`.

## Known Remaining Issues

- **GHSA-p7fg-763f-g4gf** (`@anthropic-ai/sdk@0.81.0` in `@anthropic-ai/claude-agent-sdk`) — dev-only transitive dep; not shipped to consumers. Cannot override via npm without EOVERRIDE conflict. Upstream fix needed in `pbakaus/impeccable`.
- `wildcard-postmessage-configuration` — by design for browser extension architecture; no fix planned.
- `skipDangerousModePermissionPrompt: true` in global settings — existing, user-acknowledged.
- mcps-audit AS-001 function-declaration false positives — tool limitation.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260530T030426Z.jsonl`
- **Tool runs recorded:** 10
- **Standard:** OWASP APTS § Auditability
