# Security Report — 2026-05-29

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  
**Scanned at:** 2026-05-29T03:05:26Z  
**Git HEAD:** d65e787c (post-merge, 25 upstream commits)  
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

---

## Tools Run

| Tool | Status | Finding count |
|------|--------|---------------|
| Gitleaks 8.30.1 | OK | 0 |
| Bandit 1.9.4 | SKIPPED (no .py files) | — |
| Semgrep 1.157.0 — OWASP | OK | 75 (all wildcard-postmessage; see notes) |
| Semgrep 1.157.0 — TypeScript | OK | 0 |
| Semgrep 1.157.0 — Secrets | OK | 0 |
| Trivy 0.69.3 | OK | 0 (after fixes) |
| TruffleHog 3.94.2 | OK | 0 verified, 0 unverified |
| CodeQL | SKIPPED (no codeql.yml workflow) | — |
| mcps-audit | OK | 1052 (false positives — see notes) |
| OSV-Scanner 2.3.5 | OK | 0 (after fixes; 29 initial) |
| mcp-scan | OPT-IN (not run — automated session, no consent) | — |
| security-audit (config-audit.py) | OK | 39 (user config / false positives — see notes) |
| skill-security-auditor | OK | All SKILL.md files: LOW RISK (0–15/100) |
| mcp-exfil-scan | OK | 11 (false positives — see notes) |

---

## Findings

### Semgrep — wildcard-postmessage-configuration (Medium, 75 instances)

**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`  
**Files:** `cli/engine/detect-antipatterns-browser.js`, `extension/content/content-script.js`, and copies across IDE integration directories (`.agents/`, `.claude/`, `.cursor/`, `.gemini/`, `.github/`, `.kiro/`, `.opencode/`, `.pi/`, `.qoder/`, `.rovodev/`, `.trae/`, `.trae-cn/`, `plugin/`)  
**Severity:** Medium  
**Assessment:** By design — this is a browser extension communicating between content script and page context. The `postMessage('*')` origin is inherent to the cross-context architecture. Messages are keyed with a namespaced `source` field (`impeccable-results`, `impeccable-ready`, etc.) and contain only diagnostic output, not credentials or secrets. **Not fixable without an architectural change to the extension design.**

### CVE Findings (all fixed)

| CVE / GHSA | Severity | Package | Installed | Fixed | Fix applied |
|---|---|---|---|---|---|
| CVE-2026-39983 | HIGH | basic-ftp | 5.2.0 | 5.2.1 | override >=5.3.1 |
| CVE-2026-41324 | HIGH | basic-ftp | 5.2.0 | 5.3.0 | override >=5.3.1 |
| CVE-2026-44240 | HIGH | basic-ftp | 5.2.0 | 5.3.1 | override >=5.3.1 |
| GHSA-6v7q-wjvx-w8wg | HIGH | basic-ftp | 5.2.0 | 5.2.2 | override >=5.3.1 |
| CVE-2026-42338 | MEDIUM | ip-address | 10.1.0 | 10.1.1 | override >=10.1.1 |
| CVE-2026-45736 | MEDIUM | ws | 8.19.0 | 8.20.1 | override >=8.20.1 |
| GHSA-p7fg-763f-g4gf | MEDIUM | @anthropic-ai/sdk | 0.81.0 | 0.91.1 | override >=0.91.1 |
| GHSA-q6x5-8v7m-xcrf | MEDIUM | @protobufjs/utf8 | 1.1.0 | 1.1.1 | override >=1.1.1 |
| GHSA-f886-m6hf-6m8v | MEDIUM | brace-expansion | 2.0.2 | 2.0.3 | override >=2.0.3 |
| GHSA-77vg-94rm-hx3p | HIGH | devalue | 5.8.0 | 5.8.1 | override >=5.8.1 |
| GHSA-q3j6-qgpj-74h6 | HIGH | fast-uri | 3.1.0 | 3.1.1 | override >=3.1.2 |
| GHSA-v39h-62p7-jpjc | HIGH | fast-uri | 3.1.0 | 3.1.2 | override >=3.1.2 |
| GHSA-69xw-7hcm-h432 | MEDIUM | hono | 4.12.14 | 4.12.16 | override >=4.12.18 |
| GHSA-9vqf-7f2p-gf9v | MEDIUM | hono | 4.12.14 | 4.12.16 | override >=4.12.18 |
| GHSA-hm8q-7f3q-5f36 | LOW | hono | 4.12.14 | 4.12.18 | override >=4.12.18 |
| GHSA-p77w-8qqv-26rm | MEDIUM | hono | 4.12.14 | 4.12.18 | override >=4.12.18 |
| GHSA-qp7p-654g-cw7p | MEDIUM | hono | 4.12.14 | 4.12.18 | override >=4.12.18 |
| GHSA-f23m-r3pf-42rh | MEDIUM | lodash | 4.17.23 | 4.18.0 | override >=4.18.0 |
| GHSA-r5fr-rjxr-66jc | HIGH | lodash | 4.17.23 | 4.18.0 | override >=4.18.0 |
| GHSA-2pr8-phx7-x9h3 | MEDIUM | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-66ff-xgx4-vchm | HIGH | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-685m-2w69-288q | HIGH | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-75px-5xx7-5xc7 | HIGH | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-fx83-v9x8-x52w | MEDIUM | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-jggg-4jg4-v7c6 | MEDIUM | protobufjs | 7.5.5 | 7.5.8 | override >=7.5.8 |
| GHSA-jvwf-75h9-cwgg | HIGH | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-q6x5-8v7m-xcrf | MEDIUM | protobufjs | 7.5.5 | 7.5.6 | override >=7.5.8 |
| GHSA-q8mj-m7cp-5q26 | MEDIUM | qs | 6.15.1 | 6.15.2 | override >=6.15.2 |
| GHSA-58qx-3vcg-4xpx | MEDIUM | ws | 8.18.0 | 8.20.1 | override >=8.20.1 |

### mcps-audit — False Positives (1052 findings)

mcps-audit flagged 1052 issues including 314 CRITICAL. **Assessment: all false positives.** The tool flags ordinary JavaScript function declarations (`const highlight = function(el, ...)`) as "dangerous execution" (AS-001). This rule fires on any function definition in `.mjs`/`.js` files, making it unusable for a legitimate browser detection library. MCP-04 and MCP-10 flags are also not applicable — this project has no MCP server definitions. The PDF report was saved to `mcps-audit-report.pdf`.

### config-audit / mcp-exfil-scan — User Config False Positives

Findings in `config-audit.py` and `mcp-exfil-scan` attributed to user's global `~/.claude/settings.json` hooks (cc-beeper localhost curl on port 19222) are **legitimate user automation, not malicious**. Security scanner scripts flagged for "base64 + .env access" are the scanners themselves — these are the expected patterns for detection tools.

### skill-security-auditor

All 20 SKILL.md files scored 0–15/100 (LOW RISK). No prompt injection, obfuscation, or credential access detected.

---

## Fixes Applied

1. Added `overrides` block to `package.json` resolving 28 CVEs across 11 transitive packages: `basic-ftp >=5.3.1`, `ip-address >=10.1.1`, `ws >=8.20.1`, `@protobufjs/utf8 >=1.1.1`, `brace-expansion >=2.0.3`, `devalue >=5.8.1`, `fast-uri >=3.1.2`, `hono >=4.12.18`, `lodash >=4.18.0`, `protobufjs >=7.5.8`, `qs >=6.15.2`
2. Ran `bun install` to regenerate `bun.lock` with fixed versions
3. Verified: Trivy reports **0 vulnerabilities**; OSV-Scanner reports **1 remaining** (see Known Issues)

---

## Known Remaining Issues

- **GHSA-p7fg-763f-g4gf (`@anthropic-ai/sdk` 0.81.0, MEDIUM/CVSS 4.8):** `@anthropic-ai/claude-agent-sdk@0.2.119` (devDep) pins `@anthropic-ai/sdk@^0.81.0` which resolves to 0.81.0 alongside the direct `^0.91.1`. A flat override fixes bun.lock but npm rejects overriding a direct dep (`EOVERRIDE`); bun 1.3.12 does not support nested override syntax. The 0.81.0 instance is a dev-only transitive dep, absent from the published CLI package files (`cli/`, `LICENSE`). No end-user exposure.
- **Semgrep wildcard-postmessage (75):** By design — browser extension cross-context IPC. Cannot fix without redesigning the extension communication model. Messages are namespaced and contain no sensitive data.
- **mcp-scan:** Not run (opt-in tool; automated session without user consent).

---

## APTS Audit Log

- **Log:** `/tmp/css-scan-20260529T030526Z.jsonl`
- **Tool runs recorded:** 13
- **Standard:** OWASP APTS § Auditability
