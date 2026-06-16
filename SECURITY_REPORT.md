# Security Report — 2026-06-16

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-16T02:39:47Z
**Git HEAD:** 90284530
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    90284530
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Status | Version | Finding count | Notes |
|------|--------|---------|---------------|-------|
| Gitleaks | OK | 8.30.1 | 0 | 885 commits, 57.94 MB scanned |
| Semgrep OWASP | OK | — | 5 (wildcard postMessage) | JS/TS files |
| Semgrep TypeScript | OK | — | 0 | 6 tracked .ts files |
| Semgrep Secrets | OK | — | 0 | 1637 files |
| Trivy | SKIPPED | 0.69.3 | — | DB download failed (docker-credential-desktop) |
| TruffleHog | OK | 3.94.2 | 0 verified, 0 unverified | 48766 chunks |
| OSV-Scanner | OK | 2.3.5 | 0 after fixes | bun.lock, 658 packages post-fix |
| config-audit.py | OK | — | 6 Low (global hooks) | No project-level findings |
| skill-audit.sh | OK | — | 5–15/100 LOW | 5 SKILL.md variants scanned, all approved |
| mcp-exfil-scan.sh | OK | — | 0/100 CLEAN | |
| skillspector | N/A | — | — | No standalone AI skill artifacts |
| CodeQL | SKIPPED | — | — | No codeql.yml workflow |
| mcp-scan | OPT-IN | — | — | Not run (sends data to invariantlabs.ai) |

## Findings

### GHSA-fx2h-pf6j-xcff — vite 7.3.2 (HIGH, CVSS 8.2) — FIXED
- **Affected package:** vite (transitive via astro / wrangler)
- **Fixed in:** 7.3.5
- **Fix:** `"vite": ">=7.3.5"` added to `overrides` in package.json

### GHSA-96hv-2xvq-fx4p — ws 8.20.1 (HIGH, CVSS 7.5) — FIXED
- **Affected package:** ws (transitive)
- **Fixed in:** 8.21.0
- **Fix:** `"ws": ">=8.21.0"` added to `overrides` in package.json

### GHSA-v6wh-96g9-6wx3 — vite 7.3.2 (MEDIUM, CVSS 5.5) — FIXED
- Same vite finding as GHSA-fx2h, same fix

### GHSA-h67p-54hq-rp68 — js-yaml 4.1.1 (MEDIUM, CVSS 5.3) — FIXED
- **Affected package:** js-yaml (transitive)
- **Fixed in:** 4.2.0
- **Fix:** `"js-yaml": ">=4.2.0"` added to `overrides` in package.json

### Semgrep OWASP — wildcard postMessage (MEDIUM, KNOWN/ACCEPTED)
- **Rule:** javascript.browser.security.wildcard-postmessage-configuration
- **Files:** extension/content/content-script.js lines 28, 31, 35, 38, 100
- **Detail:** `window.postMessage(..., '*')` used for browser extension cross-frame communication
- **Assessment:** Accepted design constraint — browser extension must communicate with arbitrary tabs; origin is unknowable at inject time. Namespaced via `source: 'impeccable-command'`.

## Fixes Applied

| CVE | Package | Old version | Fixed version | Method |
|-----|---------|-------------|---------------|--------|
| GHSA-fx2h-pf6j-xcff | vite | 7.3.2 | 7.3.5 | `overrides` in package.json |
| GHSA-96hv-2xvq-fx4p | ws | 8.20.1 | 8.21.0 | `overrides` in package.json |
| GHSA-v6wh-96g9-6wx3 | vite | 7.3.2 | 7.3.5 | same override as above |
| GHSA-h67p-54hq-rp68 | js-yaml | 4.1.1 | 4.2.0 | `overrides` in package.json |

Post-fix OSV-Scanner: **No issues found** (658 packages) ✓

## Known Remaining Issues

- Wildcard postMessage in browser extension content script — accepted architectural constraint
- Trivy DB download failed (missing docker-credential-desktop) — covered by OSV-Scanner

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260616T023947Z.jsonl`
- **Standard:** OWASP APTS § Auditability
- Note: apts-audit.sh finalize encountered an upstream syntax error; all tool runs were measured during execution.
