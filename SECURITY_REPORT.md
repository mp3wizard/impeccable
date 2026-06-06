# Security Report — 2026-06-06

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-06T11:40Z
**Git HEAD:** 71414cbd
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    71414cbd
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 808 commits + filesystem | — |
| Bandit | N/A | 1.9.4 | — | No .py files |
| Semgrep (OWASP) | OK | latest | 125 JS/TS files | — |
| Semgrep (TypeScript) | OK | latest | 6 TS files | — |
| Semgrep (Secrets) | OK | latest | 1517 files | — |
| Trivy | OK | 0.69.3 | bun.lock | — |
| TruffleHog | OK | 3.94.2 | 808 commits | — |
| CodeQL | SKIPPED | — | — | No .github/workflows/codeql.yml |
| mcps-audit | OK | npx | 378 files | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (649 pkgs pre-fix) | — |
| mcp-scan | OPT-IN | — | — | Not consented (sends data to invariantlabs.ai) |
| security-audit (config-audit.py) | OK | bundled | ~/.claude config + project | — |
| skill-security-auditor | OK | bundled | SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | skills/MCPs | — |

## Gitleaks — Secrets Detection

**Summary:** 0 findings. 808 commits, 52.86 MB scanned.

## Semgrep — SAST

**OWASP Top 10:** 75 findings (all `wildcard-postmessage-configuration`)
- Root cause: `window.postMessage({...}, '*')` pattern used in `detect-antipatterns-browser.js` (and its 12 copies across harness directories) and `extension/content/content-script.js`.
- **Assessment: By design.** The browser extension injects into arbitrary third-party pages whose origin cannot be known in advance. Using `'*'` as the target origin is intentional; restricting it would break the extension's communication protocol.

**TypeScript:** 0 findings (6 files).
**Secrets:** 0 findings (1517 files).

## Trivy — Dependency Vulnerabilities

**Pre-fix:** 1 finding
- `ws` 8.19.0 — CVE-2026-45736, MEDIUM, fixed in 8.20.1

**Post-fix:** 0 findings. Fixed via `overrides.ws: >=8.20.1` + `bun install`.

## TruffleHog — Verified Secrets

**Summary:** 0 findings. 42,618 chunks, 52.6 MB scanned. 0 verified, 0 unverified.

## OSV-Scanner — SCA

**Pre-fix:** 26 vulnerabilities across 9 packages (0 Critical, 7 High, 18 Medium, 1 Low):

| Package | Version | Fixed In | Notable CVEs |
|---------|---------|----------|------|
| ws | 8.19.0 | 8.20.1 | GHSA-58qx-3vcg-4xpx |
| hono | 4.12.14 | 4.12.21 | GHSA-2gcr, GHSA-3hrh, GHSA-69xw, GHSA-9vqf, GHSA-f577, GHSA-hm8q, GHSA-p77w, GHSA-qp7p, GHSA-xrhx |
| protobufjs | 7.5.5 | 7.5.8 | GHSA-2pr8, GHSA-66ff, GHSA-685m, GHSA-75px, GHSA-fx83, GHSA-jggg, GHSA-jvwf, GHSA-q6x5 |
| @protobufjs/utf8 | 1.1.0 | 1.1.1 | GHSA-q6x5-8v7m-xcrf |
| brace-expansion | 2.0.2 | 2.0.3 | GHSA-f886-m6hf-6m8v |
| fast-uri | 3.1.0 | 3.1.2 | GHSA-q3j6-qgpj-74h6, GHSA-v39h-62p7-jpjc |
| ip-address | 10.1.0 | 10.1.1 | GHSA-v2v4-37r5-5v8g |
| lodash | 4.17.23 | 4.18.0 | GHSA-f23m-r3pf-42rh (MEDIUM), GHSA-r5fr-rjxr-66jc (HIGH) |
| qs | 6.15.1 | 6.15.2 | GHSA-q8mj-m7cp-5q26 |

**Post-fix:** 0 findings. All resolved via `overrides` in `package.json` + `bun install`.

## mcps-audit — Agentic AI / OWASP

**Summary:** 1109 findings (CRITICAL: 335, HIGH: 127, MEDIUM: 452, LOW: 195), Risk Score: 100/100.
- **Assessment: Predominantly false positives.** mcps-audit flags every JavaScript function declaration as "dangerous execution" (AS-001). Tuned for MCP server JSON configs, not compiled browser extension bundles.
- One real finding: `cli/bin/commands/skills.mjs:11` — `execSync` from `node:child_process` (by design — CLI runs shell commands to install skill packages).
- MCP-10 (Context Window Pollution) not mitigated — not fixable in this codebase type.

## Security Audit (config-audit.py)

**Summary:** 39 findings (CRITICAL: 5, HIGH: 10, MEDIUM: 19, LOW: 5).
- CRITICAL: False positives from security-scanner skill files flagging their own detection patterns.
- HIGH: cc-beeper hook curl calls — user's Claude Code notification system (localhost only, out-of-scope for this repo).
- MEDIUM: CLAUDE.md referencing `.env` in build instructions — not a real secret exposure.

## MCP Exfil Scan

**Summary:** 11 findings (CRITICAL: 2, HIGH: 5, MEDIUM: 4), Risk Score: 100/100.
- All findings are in globally-installed skills (`skill-security-auditor`, `atlas-cloud`, `playwright-cli`, `pyright`, `vtsls`), not in the impeccable codebase.
- No exfiltration chains detected within the impeccable repo.

## Fixes Applied

| Finding | Fix |
|---------|-----|
| CVE-2026-45736 — ws 8.19.0 (MEDIUM) | `overrides.ws: >=8.20.1` in package.json; `bun install` |
| GHSA-2gcr, GHSA-f577, GHSA-xrhx, +6 more — hono 4.12.14 | Updated `overrides.hono` from `>=4.12.18` to `>=4.12.21`; `bun install` |
| 8 protobufjs CVEs (HIGH/MEDIUM) | `overrides.protobufjs: >=7.5.8` confirmed; `bun install` |
| @protobufjs/utf8, brace-expansion, fast-uri, ip-address, lodash, qs | Existing overrides confirmed; `bun install` |
| **Total: 26 CVEs across 9 packages** | **0 remaining post-fix** |

## Known Remaining Issues

| Issue | Severity | Reason not fixed |
|-------|----------|-----------------|
| `window.postMessage(..., '*')` — 75 Semgrep findings | Low — by design | Browser extension communicates with arbitrary origins |
| `execSync` in `cli/bin/commands/skills.mjs` | Low — by design | CLI intentionally runs shell commands |
| MCP-10 Context Window Pollution | Informational | Not applicable to this codebase type |

## Cross-Tool Observations

- Trivy and OSV-Scanner both confirmed `ws` CVE-2026-45736 / GHSA-58qx — corroborated.
- Post-fix: all SCA tools agree — 0 dependency vulnerabilities.
- No secrets found across Gitleaks, TruffleHog, or Semgrep secrets.

## Coverage Gaps

- Business logic, IDOR, runtime behavior not covered.
- CodeQL: no `.github/workflows/codeql.yml`.
- mcp-scan: opt-in, not run.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260606T042933Z.jsonl`
- **Standard:** OWASP APTS § Auditability
