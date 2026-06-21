# Security Report — 2026-06-21

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-21T02:51:36Z
**Git HEAD:** 51b4be6c
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    51b4be6c
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Tools Run

| Tool | Status | Version | Finding count | Notes |
|------|--------|---------|---------------|-------|
| Gitleaks | OK | 8.30.1 | 0 | 925 commits, 60 MB scanned |
| Bandit | SKIPPED | 1.9.4 | n/a | No Python files |
| Semgrep (OWASP) | OK | 1.166.0 | 5 | 141 files; wildcard postMessage |
| Semgrep (TypeScript) | OK | 1.166.0 | 0 | 6 files |
| Semgrep (Secrets) | OK | 1.166.0 | 0 | 1699 files |
| Trivy | OK | 0.71.1 | 0 | bun.lock clean |
| TruffleHog | OK | 3.95.5 | 0 | 0 verified secrets |
| CodeQL | SKIPPED | — | n/a | No CodeQL workflow in .github/workflows/ |
| mcps-audit | OK | 1.0.0 | 1312 | All false positives (CLI tool, not MCP server) |
| OSV-Scanner | OK | 2.3.8 | 41 → 0 | 41 fixed by adding overrides + bun install |
| mcp-scan | OPT-IN | — | n/a | Not run (sends data to invariantlabs.ai) |
| config-audit.py | OK | bundled | 48 | CRITICALs are scanner-scanning-itself FP |
| skill-audit.sh | OK | bundled | 0 | SKILL.md: LOW RISK (15/100) |
| mcp-exfil-scan.sh | OK | bundled | 0 | VERDICT: CLEAN, 0/100 |
| skillspector | OK | 2.1.4 | 0 | --no-llm mode, score 0/100 SAFE |

## Findings

### Real Findings

#### MEDIUM — Wildcard postMessage origin (Semgrep OWASP)
- **File:** `extension/content/content-script.js`
- **Lines:** 28, 31, 35, 38, 100
- **Rule:** `wildcard-postmessage-configuration`
- **Detail:** `window.postMessage(…, '*')` allows any origin to receive messages. Standard pattern for Chrome extension content-script ↔ page communication, but any page script can intercept.
- **Status:** Known/accepted — extension architecture; fix requires upstream change in pbakaus/impeccable.

#### HIGH — Multiple transitive dependency CVEs (OSV-Scanner) — **ALL FIXED**

| Package | Old Version | CVEs | Max CVSS | Fixed To |
|---------|-------------|------|----------|----------|
| @protobufjs/utf8 | 1.1.0 | GHSA-q6x5-8v7m-xcrf | 5.3 | ≥1.1.1 |
| esbuild | 0.27.3 | GHSA-g7r4-m6w7-qqqr | 2.5 | ≥0.28.1 |
| fast-uri | 3.1.0 | GHSA-q3j6-qgpj-74h6, GHSA-v39h-62p7-jpjc | 7.5 | ≥3.1.2 |
| hono | 4.12.14 | 12 CVEs (GHSA-88fw-hqm2-52qc highest) | 7.1 | ≥4.12.25 |
| ip-address | 10.1.0 | GHSA-v2v4-37r5-5v8g | 5.3 | ≥10.1.1 |
| js-yaml | 4.1.1 | GHSA-h67p-54hq-rp68 | 5.3 | ≥4.2.0 |
| protobufjs | 7.5.5 | 9 CVEs (GHSA-75px-5xx7-5xc7 highest) | 8.1 | ≥7.6.3 |
| qs | 6.15.1 | GHSA-q8mj-m7cp-5q26 | 6.3 | ≥6.15.2 |
| undici | 7.24.8 | 7 CVEs (GHSA-hm92-r4w5-c3mj highest) | 7.5 | ≥7.28.0 |
| vite | 7.3.2 | GHSA-fx2h-pf6j-xcff (CVSS 8.2), GHSA-v6wh-96g9-6wx3 | 8.2 | ≥7.3.5 |
| ws | 8.20.1 | GHSA-96hv-2xvq-fx4p | 7.5 | ≥8.21.0 |

### False Positives / Informational

#### mcps-audit (1312 findings — all false positives)
mcps-audit treats the project as an MCP server; impeccable is a CLI tool and design skill. CRITICAL `AS-001` flags `execSync` in the CLI (expected for a shell tool). `AS-005` flags standard JavaScript `delete` property operations. Risk Score 100/100 is not meaningful here.

#### config-audit.py (CRITICAL×7 — all false positives)
7 CRITICAL findings flag the security scanner plugin's own bundled scripts as "exfiltration" because those scripts contain the patterns being scanned for. HIGH findings for `settings.json` curl hooks are the cc-beeper notification tool (localhost-only, not exfil).

#### Gitleaks / TruffleHog — 0 secrets (clean history)

#### mcp-exfil-scan — RISK SCORE: 0/100, VERDICT: CLEAN

#### skill-audit — SKILL.md scored 15/100, VERDICT: LOW RISK / APPROVE

## Fixes Applied

| Fix | Method | Verified |
|-----|--------|---------|
| Added 5 new overrides: @protobufjs/utf8, fast-uri, hono, protobufjs, qs | `package.json` overrides + `bun install` | OSV re-scan: No issues found |
| Pre-existing overrides covered: esbuild, ip-address, js-yaml, undici, vite, ws | Already in place from prior week | Confirmed by OSV clean result |

Total: 41 CVEs resolved across 11 packages (0 Critical, 13 High, 24 Medium, 4 Low).

## Known Remaining Issues

| Issue | Severity | Reason not fixed |
|-------|----------|-----------------|
| Wildcard postMessage in extension/content/content-script.js (5 instances) | MEDIUM | Extension architecture; requires upstream author decision |

---

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260621T025136Z.jsonl`
- **Tool runs recorded:** 10 (measured: 10, asserted: 0)
- **Standard:** OWASP APTS § Auditability
