# Security Report — 2026-06-16

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-16T12:40:55Z
**Git HEAD:** f17c1dc8
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    f17c1dc8
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Status | Version | Finding count | Notes |
|------|--------|---------|---------------|-------|
| Gitleaks | OK | 8.30.1 | 0 | 890 commits, 59.03 MB scanned |
| Semgrep OWASP | OK | — | 5 MEDIUM | JS/TS files; wildcard postMessage in extension |
| Semgrep TypeScript | OK | — | 0 | 6 tracked .ts files |
| Semgrep Secrets | OK | — | 0 | 1656 files; 38 >300KB skipped |
| Trivy | OK (skip-db-update) | 0.69.3 | 0 | bun.lock, 650 packages |
| TruffleHog | OK | 3.94.2 | 0 verified, 0 unverified | 50051 chunks, 58.9 MB |
| OSV-Scanner | OK | 2.3.5 | 0 | bun.lock, 650 packages |
| config-audit.py | OK | — | Global env findings (out-of-scope for repo) | |
| skill-audit.sh | OK | — | LOW RISK | All 5 sampled SKILL.md variants |
| skillspector | OK | — | SAFE (no issues) | impeccable SKILL.md, --no-llm |
| mcp-exfil-scan.sh | OK | — | 0 in-repo | Global ~/.claude/skills/ findings out-of-scope |
| CodeQL | SKIPPED | — | — | No codeql.yml workflow |
| mcp-scan | OPT-IN | — | — | Not run (sends data to invariantlabs.ai) |
| Bandit | N/A | — | — | No .py files |

**Coverage note:** 38 files >300KB were skipped by Semgrep. 14 .ts files in build/ skipped by .semgrepignore.

## Findings

### Semgrep OWASP — wildcard postMessage (MEDIUM, KNOWN/ACCEPTED)

**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`
**File:** `extension/content/content-script.js`
**Lines:** 28, 31, 35, 38, 100

`window.postMessage(..., '*')` is used for browser extension cross-frame communication between the content script and the injected overlay. The wildcard origin is an accepted architectural constraint: a browser extension communicates with arbitrary tabs and cannot hardcode the page origin at inject time. Messages are namespaced via `source: 'impeccable-command'` and carry only UI commands (toggle-overlays, remove, highlight, unhighlight) — no sensitive data.

This finding was present in the previous audit (2026-06-16 prior run) and remains accepted.

## Fixes Applied

None required. All findings are either absent (secrets, CVEs) or accepted architectural constraints (wildcard postMessage in browser extension).

## Known Remaining Issues

- Wildcard postMessage in `extension/content/content-script.js`: accepted architectural constraint for browser extension cross-frame messaging.
- Trivy ran with `--skip-db-update` due to Docker credential unavailability. OSV-Scanner covered the dependency surface (650 packages, 0 issues).
- 38 files >300KB were skipped by Semgrep `--max-target-bytes 300000` (images, build artifacts, dist zips).

---

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260616T123622Z.jsonl`
- **Tool runs recorded:** 11 (measured: 11, asserted: 0)
- **Standard:** OWASP APTS § Auditability
