# Security Report — 2026-07-04

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  **Scanned at:** 2026-07-04T10:05:00+07:00
**Tools run:** Gitleaks, Semgrep, Trivy, TruffleHog, mcps-audit  **Tools skipped:** Bandit (no `.py` files), CodeQL (no workflow in repo)

## Pre-flight Summary

| Tool | Status | Version / Note |
|------|--------|----------------|
| Gitleaks   | OK      | 8.30.1 |
| Bandit     | SKIPPED | no `.py` files in repo |
| Semgrep    | OK      | community rules |
| Trivy      | OK      | 0.71.2 |
| TruffleHog | OK      | 3.95.6 |
| CodeQL     | N/A     | no `.github/workflows/codeql.yml` in repo |
| mcps-audit | OK      | 1.0.0 |

---

## Gitleaks — Secrets in git history + filesystem

**Summary:** 0 findings. 979 commits scanned, ~60.8 MB.

```
10:04AM INF 979 commits scanned.
10:04AM INF scanned ~60764856 bytes (60.76 MB) in 7.7s
10:04AM INF no leaks found
```

---

## Semgrep — SAST (OWASP Top 10 + Python rules)

**Summary:** 86 findings (86 blocking) across 3 unique rule types. Root unique issues: 3.

```
Scanning 1732 files tracked by git with 564 Code rules:
  Language      Rules   Files
  <multilang>       6    1732
  js               65    1014
  html              1      51
  json              3      31
  ts               71       6
  yaml             28       6

Scan completed successfully.
 Findings: 86 (86 blocking)
 Rules run: 109
 Targets scanned: 1732
 Parsed lines: ~99.9%
 Files larger than 0.5 MB skipped: 21
 Files matching .semgrepignore patterns: 391
```

### Finding 1: wildcard-postmessage-configuration (MEDIUM) — 85 instances

**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`
**Files:** All `**/scripts/live-browser.js` copies across 14 provider dirs + `extension/content/content-script.js`
**Note:** By-design for browser extension content scripts. Target origin `*` is required because the extension injects into arbitrary pages. Messages contain only scan commands (non-sensitive). This is a known, accepted pattern for Chrome extension content scripts. **No fix applied; upstream design decision.**

```
skill/scripts/live-browser.js
  9823  window.postMessage({ source: 'impeccable-command', action: 'scan', config: { scanId } }, '*');
  9845  window.postMessage({ source: 'impeccable-command', action: 'remove' }, '*');

extension/content/content-script.js
   28  window.postMessage({ source: 'impeccable-command', action: 'toggle-overlays' }, '*');
   31  window.postMessage({ source: 'impeccable-command', action: 'remove' }, '*');
  100  window.postMessage(msg, '*');
```

### Finding 2: dependabot-missing-cooldown (LOW) — 1 instance — FIXED

**Rule:** `package_managers.dependabot.dependabot-missing-cooldown`
**File:** `.github/dependabot.yml`
**Fix applied:** Added `cooldown: default-days: 7` to both `bun` and `github-actions` ecosystems. Verified 0 findings post-fix.

### Finding 3: github-actions-mutable-action-tag (MEDIUM) — ~25 instances

**Rule:** `yaml.github-actions.security.github-actions-mutable-action-tag`
**Files:** `.github/workflows/ci.yml`, `.github/workflows/sync-generated-output.yml`
**Actions affected:** `actions/checkout@v7`, `actions/setup-node@v6`, `oven-sh/setup-bun@v2`, `actions/upload-artifact@v7`, `actions/cache@v6`
**Note:** Mutable tags in CI workflows. These are upstream repo files; pinning here would create merge conflicts on next `origin/main` sync. Upstream responsibility.

---

## Trivy — Dependencies, secrets, IaC

**Summary:** 0 vulnerabilities, 0 secrets. bun.lock clean.

```
Report Summary
Target: bun.lock (bun)
Vulnerabilities: 0
Secrets: -
```

---

## TruffleHog — Secrets in git history (live API verification)

**CONFIDENTIAL** — No verified or unverified secrets detected.

**Summary:** 0 verified secrets, 0 unverified secrets. 52,367 chunks, 61.8 MB scanned.

```
chunks: 52367
bytes: 61815823
verified_secrets: 0
unverified_secrets: 0
scan_duration: 6.42s
```

---

## mcps-audit — MCP skill/tool permission audit

**Summary:** Risk score 100/100. 1,333 findings (CRITICAL: 409, HIGH: 147, MEDIUM: 555, LOW: 222). Majority are false positives for a CLI tool.

**Context:** `impeccable` is a CLI tool. `execSync`, JS `delete` operators, and interactive key handling are expected operations, not vulnerabilities. OWASP Agentic AI rules are calibrated for MCP server contexts, not CLI tools.

```
OWASP MCP Top 10
  FAIL MCP-01  Rug Pulls
  -    MCP-02  Tool Poisoning
  FAIL MCP-03  Privilege Escalation via Tool Composition
  FAIL MCP-04  Cross-Server Request Forgery
  -    MCP-05  Sampling Manipulation
  PASS MCP-06  Indirect Prompt Injection via MCP
  PASS MCP-07  Resource Exhaustion & DoS
  PASS MCP-08  Insufficient Logging & Audit
  PASS MCP-09  Insecure MCP-to-MCP Communication
  PASS MCP-10  Context Window Pollution
  Coverage: 5/8 mitigated

Notable findings requiring manual review:
  [CRITICAL] AS-005 cli/bin/commands/ignores.mjs:142  Known injection pattern detected
  [CRITICAL] AS-005 cli/bin/commands/skills.mjs:1259  Known injection pattern detected
  [CRITICAL] AS-001 cli/bin/commands/skills.mjs:11    Dangerous execution: import { execSync }
  [MEDIUM]   AS-003 cli/bin/commands/skills.mjs:346   High-risk permission pattern: delete
  ... and 1323 more findings (execSync, delete operator, interactive key handling)

  Files: 426 | Lines: 146223 | Findings: 1333
```

---

## Cross-Tool Observations

No cross-tool overlaps on secrets — all three secrets tools (Gitleaks, TruffleHog, Trivy) returned clean.

Semgrep and mcps-audit both surface concerns in `live-browser.js` (wildcard postMessage / injection patterns in bundled scripts), but neither is a critical finding in context.

## Coverage Gaps

- **CodeQL**: No workflow present; deep semantic SAST not run.
- **Business logic**: Not covered by automated tools.
- **Runtime behavior**: Static analysis only; no dynamic testing.
- **IDOR**: Not covered by tools run.
- **21 files >500KB**: Skipped by Semgrep (large bundled `live-browser.js` copies). The source `skill/scripts/live-browser.js` is the canonical file; downstream copies are generated artifacts.
