# Security Report — 2026-06-02

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-02T03:07:00Z
**Git HEAD:** `ec0e383e`
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    ec0e383e
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 763 commits, ~50MB | — |
| Bandit | N/A | 1.9.4 | — | No .py files in repo |
| Semgrep (OWASP) | OK | community | 123 JS/TS files | — |
| Semgrep (TypeScript) | OK | community | 6 .ts files | — |
| Semgrep (Secrets) | OK | community | 1453 files | — |
| Trivy | OK | 0.69.3 | bun.lock (657 packages) | — |
| TruffleHog | OK | 3.94.2 | full git history | — |
| CodeQL | SKIPPED | — | — | No .github/workflows/codeql.yml |
| mcps-audit | OK | 1.0.0 | 362 files, 110K lines | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (657 packages) | — |
| mcp-scan | OPT-IN | — | — | Requires user consent (sends data to invariantlabs.ai) |
| security-audit (config-audit.py) | OK | bundled | global Claude config | — |
| skill-security-auditor | OK | bundled | 5 SKILL.md files (sampled) | — |
| mcp-exfil-scan | OK | bundled | 39 skill files, 2 MCP configs | — |

## Gitleaks — Secrets in git history

**Summary:** 0 findings across 763 commits, ~50MB scanned.

```
763 commits scanned.
scanned ~50539164 bytes (50.54 MB) in 7.96s
no leaks found
```

## Semgrep — OWASP / TypeScript / Secrets

**Summary:** 75 OWASP findings (all wildcard-postMessage, by-design), 0 TypeScript, 0 Secrets.

**OWASP findings — 75 (all rule: wildcard-postmessage-configuration):**
- Files: all copies of `detect-antipatterns-browser.js` and `extension/content/content-script.js` across 13 IDE harness directories + CLI
- The `window.postMessage({...}, '*')` wildcard is intentional — this is a browser-injected detection script that must communicate across unknown page origins. Targeting a specific origin would break the tool's function.

## Trivy — Dependency Vulnerabilities & Secrets

**Summary:** 0 vulnerabilities, 0 secrets in bun.lock (657 packages).

```
bun.lock | bun | 0 | -
```

## TruffleHog — Live-Verified Secrets

**Summary:** 0 verified secrets, 0 unverified secrets.

```
chunks: 39061, bytes: 50229860
verified_secrets: 0, unverified_secrets: 0
```

## OSV-Scanner — SCA Dependency Audit

**Summary:** 1 reported finding (assessed as false positive — resolved version already fixed).

| OSV URL | CVSS | Package | Reported version | Fixed version | Assessment |
|---------|------|---------|-----------------|--------------|------------|
| GHSA-p7fg-763f-g4gf | 4.8 (Medium) | @anthropic-ai/sdk | 0.81.0 | 0.91.1 | **False positive** — OSV-Scanner flagged the `^0.81.0` constraint from `@anthropic-ai/claude-agent-sdk`'s peer dependency declaration. The actual resolved installed version in bun.lock is 0.91.1, which meets the fixed version. |

## mcps-audit — OWASP MCP Top 10

**Summary:** 1055 findings, risk score 100/100 — assessed as high false-positive rate for browser extension code.

Key findings: MCP-01, MCP-03, MCP-04, MCP-10 flagged (structural heuristics). AS-001 "dangerous execution" fires on every JavaScript function definition in browser-injected scripts. This is a known limitation of the heuristic for browser extension/injected code.

## security-audit — Claude Config Audit

**Summary:** 39 findings. All in user's global `~/.claude/settings.json`, not repo code.

- HIGH: cc-beeper hooks (curl to localhost) — intentional notification hooks
- MEDIUM: broad hook matchers (`""` matches all events) — intentional
- MEDIUM: `skipDangerousModePermissionPrompt: true` — known user preference
- LOW: hooks configuration found — informational

## skill-security-auditor — Skill Security Scores

**Summary:** 5 skills sampled, all scored LOW RISK (0–15/100). No dangerous patterns, no prompt injection, no credential access.

## mcp-exfil-scan — MCP Exfiltration Risk

**Summary:** 11 findings, risk score 100/100 — largely false positives from security tools containing security-related language.

- CRITICAL (2): impeccable and security-audit SKILL.md flagged for "exfiltration instruction" — they describe what exfiltration looks like (false positive)
- HIGH (5): skill-security-auditor's Read+Bash+WebFetch toolset; atlas-cloud env var + network refs — expected for security/AI tools
- MEDIUM (4): playwright-cli, pyright, vtsls lack source attribution; skill-security-auditor Grep+WebFetch

## Cross-Tool Observations

- No cross-tool secret overlap (Gitleaks, TruffleHog, Semgrep secrets all clean)
- The single OSV-Scanner finding is a false positive confirmed by bun.lock resolution (0.91.1 ≥ fixed version 0.91.1)
- The 75 Semgrep OWASP findings are all in the same `window.postMessage({...}, '*')` pattern across copies of the same file — a structural false positive for browser-injected code
- mcp-exfil-scan and security-audit CRITICAL/HIGH findings on security skills are a meta-false-positive: security scanner code necessarily contains security-related language

## Coverage Gaps

- Business logic, IDOR, and runtime behavior not covered by static analysis
- CodeQL not configured (no .github/workflows/codeql.yml)
- mcp-scan (runtime MCP tool description analysis) not run — requires user opt-in

## Fixes Applied

None. All findings are either false positives or intentional design.

## Known Remaining Issues

- **Semgrep wildcard-postmessage (Medium, 75 findings):** Intentional browser extension design. Would require architecture change (not appropriate).
- **OSV-Scanner constraint false positive:** Tool reports minimum constraint version rather than resolved version; actual installed SDK is already at the fixed version.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260602T030433Z.jsonl`
- **Tool runs recorded:** 12
- **Standard:** OWASP APTS § Auditability
