# Security Report — 2026-06-15

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-15T03:10:49Z
**Git HEAD:** c83a80aa
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    c83a80aa
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Status | Version | Finding count | Notes |
|------|--------|---------|---------------|-------|
| Gitleaks | OK | 8.30.1 | 0 | 868 commits, 57.64 MB scanned |
| Semgrep OWASP | OK | — | 5 (wildcard postMessage) | JS/TS files |
| Semgrep TypeScript | OK | — | 0 | 6 tracked .ts files |
| Semgrep Secrets | OK | — | 0 | 1637 files |
| Trivy | OK | 0.69.3 | 0 | bun.lock, no CVEs |
| TruffleHog | OK | 3.94.2 | 0 verified, 0 unverified | 48019 chunks |
| OSV-Scanner | OK | 2.3.5 | 0 after fixes | bun.lock, 623 packages |
| mcps-audit | OK | — | 1220 (FP) | Expected for browser-injection tool |
| config-audit.py | OK | — | 46 (7C/10H/22M/7L) | Mostly self-scan FPs |
| skill-audit.sh | OK | — | 5–15/100 LOW | All SKILL.md variants approved |
| mcp-exfil-scan.sh | OK | — | 0/100 CLEAN | |
| skillspector | OK | 2.1.4 | 0/100 SAFE | --no-llm mode |
| CodeQL | SKIPPED | — | — | No codeql.yml workflow |
| mcp-scan | OPT-IN | — | — | Not run (sends data to invariantlabs.ai) |

**Files >300KB skipped by semgrep:** mcps-audit-report.pdf, dist/universal.zip, public/docs/impeccable.html, build/ artifacts, node_modules/ large files (not scanned by semgrep by design).

## Findings

### GHSA-gv7w-rqvm-qjhr — esbuild 0.27.3 (HIGH, CVSS 8.1)
- **Affected package:** esbuild (transitive via astro, vite, wrangler)
- **Fixed in:** 0.28.1
- **Status:** FIXED

### GHSA-g7r4-m6w7-qqqr — esbuild 0.27.3 (LOW, CVSS 2.5)
- **Affected package:** esbuild (transitive via astro, vite, wrangler)
- **Fixed in:** 0.28.1
- **Status:** FIXED

### GHSA-v2v4-37r5-5v8g — ip-address 10.1.0 (MEDIUM, CVSS 5.3)
- **Affected package:** ip-address (transitive)
- **Fixed in:** 10.1.1
- **Status:** FIXED

### Semgrep OWASP — wildcard postMessage (MEDIUM)
- **Rule:** javascript.browser.security.wildcard-postmessage-configuration
- **Files:** skill/scripts/live-browser.js and distributed copies across provider dirs
- **Detail:** `window.postMessage(..., '*')` used for live-mode browser overlay cross-frame communication
- **Assessment:** Intentional design — the overlay injects into arbitrary third-party pages; origin cannot be known at injection time. Not fixable without architectural rework.
- **Status:** KNOWN / ACCEPTED

### mcps-audit 1220 findings (risk score 100/100)
- **Assessment:** False positives. `cli/engine/browser/injected/index.mjs` legitimately defines JS functions at runtime. mcps-audit flags all function definitions as "dangerous execution". Expected for a browser-injection tool category.
- **Status:** FALSE POSITIVE

### config-audit.py 7 CRITICAL
- **Assessment:** Self-scan artifacts — the security scanner plugin scripts (mcp-exfil-scan.sh, skill-audit.sh, config-audit.py) contain the very patterns they scan for. cc-beeper hook findings are intentional user notification hooks (localhost curl only).
- **Status:** FALSE POSITIVES / USER CONFIG

## Fixes Applied

1. Added `"overrides": {"esbuild": ">=0.28.1", "ip-address": ">=10.1.1"}` to package.json
2. Ran `bun install` to regenerate bun.lock with patched versions
3. Verified with OSV-Scanner post-fix: "No issues found" (623 packages)

## Known Remaining Issues

- Wildcard postMessage in browser overlay scripts — accepted design constraint
- mcps-audit 1220/1220 — false positives inherent to browser-injection tool category

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260615T030549Z.jsonl`
- **Tool runs recorded:** 2 (measured: 2, asserted: 0)
- **Standard:** OWASP APTS § Auditability
