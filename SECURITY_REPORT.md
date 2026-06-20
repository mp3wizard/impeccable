# Security Report — 2026-06-20

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-20T03:30:00Z
**Git HEAD:** 280faee1
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    280faee1
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Tools Run

| Tool | Status | Version | Finding count | Notes |
|------|--------|---------|---------------|-------|
| Gitleaks | OK | 8.30.1 | 0 | 910 commits, 59 MB scanned |
| Bandit | SKIPPED | 1.9.4 | n/a | No Python files |
| Semgrep (OWASP) | OK | 1.166.0 | 5 | 140 files |
| Semgrep (TypeScript) | OK | 1.166.0 | 0 | 6 files |
| Semgrep (Secrets) | OK | 1.166.0 | 0 | 1669 files |
| Trivy | OK (offline) | 0.71.1 | 0 | bun.lock only; vuln DB unavailable |
| TruffleHog | OK | 3.95.5 | 0 | 0 verified secrets |
| CodeQL | SKIPPED | — | n/a | No CodeQL workflow in .github/workflows/ |
| mcps-audit | OK | 1.0.0 | 1268 | All false positives (CLI tool, not MCP server) |
| OSV-Scanner | OK | 2.3.8 | 7 → 0 | 7 fixed; clean after override |
| mcp-scan | OPT-IN | — | n/a | Not run (sends data to invariantlabs.ai) |
| config-audit.py | OK | bundled | 48 | CRITICALs are scanner-scanning-itself FP |
| skill-audit.sh | OK | bundled | 0 | All SKILL.md: LOW RISK (0–15/100) |
| mcp-exfil-scan.sh | OK | bundled | 0 | VERDICT: CLEAN, 0/100 |
| skillspector | OK | installed | 0 | --no-llm mode |

## Findings

### Real Findings

#### MEDIUM — Wildcard postMessage origin (Semgrep OWASP)
- **File:** `extension/content/content-script.js`
- **Lines:** 28, 31, 35, 38, 100
- **Rule:** `wildcard-postmessage-configuration`
- **Detail:** `window.postMessage(…, '*')` allows any origin to receive messages. Standard pattern for Chrome extension content-script ↔ page communication, but any page script can intercept.
- **Status:** Known/accepted — extension architecture; fix requires upstream change in pbakaus/impeccable.

#### HIGH — undici 7.24.8 multiple CVEs (OSV-Scanner) — **FIXED**
- **CVEs:** GHSA-hm92-r4w5-c3mj (CVSS 7.5), GHSA-vxpw-j846-p89q (CVSS 7.5), GHSA-vmh5-mc38-953g (CVSS 7.4), GHSA-p88m-4jfj-68fv (CVSS 5.9), GHSA-pr7r-676h-xcf6 (CVSS 5.9), GHSA-35p6-xmwp-9g52 (CVSS 3.7), GHSA-g8m3-5g58-fq7m (CVSS 3.7)
- **Package:** undici (transitive via miniflare devDependency), was 7.24.8
- **Fixed in:** 7.28.0
- **Fix applied:** Added `"undici": ">=7.28.0"` to `overrides` in `package.json` + `bun install`
- **Verified:** OSV re-scan after fix shows "No issues found"

### False Positives / Informational

#### mcps-audit (1268 findings — all false positives)
mcps-audit treats the project as an MCP server; impeccable is a CLI tool and design skill, not an MCP server. CRITICAL `AS-001` flags `execSync` in the CLI, expected for a shell tool. `AS-005` flags standard JavaScript `delete` property operations. Risk Score 100/100 is not meaningful here.

#### config-audit.py (CRITICAL findings — all false positives)
7 CRITICAL findings flag the security scanner plugin's own bundled scripts as "exfiltration" because those scripts contain the patterns being scanned for. HIGH findings for `settings.json` curl hooks are the cc-beeper notification tool (localhost-only, not exfil).

#### Gitleaks / TruffleHog — 0 secrets (clean history)

#### mcp-exfil-scan — RISK SCORE: 0/100, VERDICT: CLEAN

#### skill-audit — all SKILL.md files scored 0–15/100, VERDICT: APPROVE

## Fixes Applied

| Fix | Method | Verified |
|-----|--------|---------|
| undici 7.24.8 → ≥7.28.0 (7 CVEs, max CVSS 7.5) | `"undici": ">=7.28.0"` override in package.json + bun install | OSV re-scan: No issues found |

## Known Remaining Issues

| Issue | Severity | Reason not fixed |
|-------|----------|-----------------|
| wildcard postMessage in extension/content/content-script.js (5 instances) | MEDIUM | Extension architecture; requires upstream author decision |

---

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260620T033008Z.jsonl`
- **Tool runs recorded:** 13 (measured: 13, asserted: 0)
- **Standard:** OWASP APTS § Auditability
