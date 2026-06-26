# Security Report — 2026-06-26

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-26T03:10:00Z
**Git HEAD:** `5901d974` (post-merge)

## Tools Run

| Tool | Status | Finding count |
|------|--------|--------------|
| Gitleaks 8.30.1 | OK | 0 |
| Bandit 1.9.4 | Skipped — no .py files | N/A |
| Semgrep 1.166.0 | OK | 5 (blocking) |
| Trivy 0.71.2 | OK (offline; vuln DB stale) | 0 |
| TruffleHog 3.95.6 | OK | 0 |
| CodeQL | N/A — no `.github/workflows/codeql.yml` | — |
| mcps-audit 1.0.0 | OK | 1,323 (mostly false positives) |

## Findings

### Semgrep — 5 wildcard postMessage (CWE-345)

**File:** `extension/content/content-script.js`
**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`

Lines 28, 31, 35, 38, 100 use `window.postMessage({...}, '*')`.

**Assessment:** Accepted architectural pattern. Content scripts communicate with injected page-context scripts (`detector/detect.js`) via `window.postMessage`. Because the content script runs on arbitrary user pages, no specific targetOrigin can be specified. The receiver in `detect.js` guards with `e.source !== window` to filter same-window messages only. This is standard browser extension architecture — not fixable without breaking extension functionality. Same assessment as all prior weekly audits.

### mcps-audit — 1,323 findings (399 critical, 147 high, 555 medium, 222 low)

**Assessment:** Predominantly false positives for a CLI tool:
- `AS-001` CRITICAL: flags `execSync` in CLI command files — expected; the CLI legitimately shells out
- `AS-003` MEDIUM: flags JavaScript `delete` operator as "high-risk permission pattern" — false positive
- `AS-005` CRITICAL: "Known injection pattern" — triggers on normal JS patterns in CLI code

OWASP MCP Top 10 coverage: 5/8 mitigated. MCP-01, MCP-03, MCP-04 listed as failing — consistent with previous weeks; these are CLI/skill concerns, not active server vulnerabilities.

### Trivy

0 vulnerabilities in `bun.lock`. Note: vuln DB offline scan only (Docker credential issue prevented DB update). Known gap: may miss very recent CVEs published after last DB update. OSV-scanner not separately run this cycle.

## Fixes Applied

None. All actionable findings from prior weeks remain resolved. No new fixable findings this cycle.

## Known Remaining Issues

1. **Wildcard postMessage (Semgrep, 5 findings):** Accepted browser-extension architectural pattern. Receiver-side `e.source !== window` guard is in place. No fix possible without breaking content-script ↔ page-context communication.
2. **mcps-audit false positives:** CLI tool's use of `execSync`, `delete`, and standard JS patterns triggers noise. Not reflective of real vulnerabilities.
3. **Trivy vuln DB stale:** Docker credential missing prevents DB update. Scan uses cached/offline DB. Risk: may miss recent CVEs.
