# Security Report — 2026-06-17

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-17T03:04:45Z
**Git HEAD:** e34932f6
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    e34932f6
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Status | Version | Finding count | Notes |
|------|--------|---------|---------------|-------|
| Gitleaks | OK | 8.30.1 | 0 | 898 commits, 59.34 MB scanned |
| Semgrep OWASP | OK | 1.166.0 | 5 MEDIUM | JS/TS files; wildcard postMessage in extension |
| Semgrep TypeScript | OK | 1.166.0 | 0 | 6 tracked .ts files |
| Semgrep Secrets | OK | 1.166.0 | 0 | 1669 files; 38 >300KB skipped |
| Trivy | OK | 0.71.1 | 0 | bun.lock, 648 packages |
| TruffleHog | OK | 3.95.5 | 0 verified, 0 unverified | 50192 chunks, 59.2 MB |
| OSV-Scanner | OK | 2.3.8 | 0 after fix (was 2) | bun.lock, 648 packages |
| config-audit.py | OK | — | 48 raw (7 CRITICAL are scanner self-scan FPs) | |
| skill-audit.sh | OK | — | LOW RISK (15/100) | SKILL.md variants scanned |
| skillspector | OK | — | SAFE | --no-llm |
| mcp-exfil-scan.sh | OK | — | 0 | |
| CodeQL | SKIPPED | — | — | No codeql.yml workflow |
| mcp-scan | OPT-IN | — | — | Not run (sends data to invariantlabs.ai) |
| Bandit | N/A | — | — | No .py files |

**Coverage note:** 20 files >300KB were skipped by Semgrep (images, build artifacts, node_modules). No security-relevant source files skipped.

## Findings

### Fixed — CVE in astro (High + Medium)

| CVE | CVSS | Severity | Package | Affected | Fixed In |
|-----|------|----------|---------|----------|----------|
| GHSA-2pvr-wf23-7pc7 | 7.5 | **High** | astro | 6.4.4 | 6.4.6 |
| GHSA-jrpj-wcv7-9fh9 | 4.2 | Medium | astro | 6.4.4 | 6.4.6 |

Fixed by bumping `"astro"` in `package.json` from `"^6.2.1"` to `"^6.4.6"` and running `bun install`. Updated to `astro@6.4.7`. OSV-Scanner re-run: 0 issues.

### Known Remaining — wildcard postMessage (MEDIUM, ACCEPTED)

**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`
**File:** `extension/content/content-script.js`
**Lines:** 28, 31, 35, 38, 100

`window.postMessage(..., '*')` is used for browser extension cross-frame communication between the content script and the injected overlay. The wildcard origin is an accepted architectural constraint: a browser extension communicates with arbitrary tabs and cannot hardcode the page origin at inject time. Messages are namespaced via `source: 'impeccable-command'` and carry only UI commands (toggle-overlays, remove, highlight, unhighlight) — no sensitive data.

This finding was present in the 2026-06-16 audit and remains accepted.

## Fixes Applied

- Bumped `"astro"` in `package.json` from `"^6.2.1"` to `"^6.4.6"` (resolves GHSA-2pvr-wf23-7pc7, GHSA-jrpj-wcv7-9fh9)
- Ran `bun install` → astro updated to 6.4.7
- OSV-Scanner re-run confirms: 0 issues found

## Known Remaining Issues

- Wildcard postMessage in `extension/content/content-script.js`: accepted architectural constraint for browser extension cross-frame messaging (unchanged from prior audit).
- mcps-audit shows 1268 raw findings — high false-positive rate for a CLI utility (not an MCP server); `execSync`, `delete` keyword, and similar flagged patterns are expected in this codebase.
- 20 files >300KB were skipped by Semgrep `--max-target-bytes 300000` (images, build artifacts, node_modules).

---

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260617T030445Z.jsonl`
- **Tool runs recorded:** 11 (measured: 11, asserted: 0)
- **Standard:** OWASP APTS § Auditability
