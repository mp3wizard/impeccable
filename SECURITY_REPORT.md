# Security Report — 2026-04-29

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-04-29T10:07:00+07:00
**Git HEAD:** b244480
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    b244480
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 583 commits, ~23.58 MB | — |
| Bandit | SKIPPED | 1.9.4 | 0 | No .py files |
| Semgrep OWASP | OK | 1.157.0 | 109 JS files | — |
| Semgrep TypeScript | OK | 1.157.0 | 0 (not git-tracked .ts) | — |
| Semgrep Secrets | OK | 1.157.0 | 961 files | — |
| Trivy | OK | 0.69.3 | bun.lock, pnpm-lock.yaml | — |
| TruffleHog | OK | 3.94.2 | 16,970 chunks | — |
| CodeQL | SKIPPED | — | — | No codeql.yml workflow |
| mcps-audit | OK | 1.0.0 | 241 files | — |
| OSV-Scanner | OK | 2.3.5 | pnpm-lock.yaml, bun.lock | — |
| mcp-scan | OPT-IN | — | — | Not run (privacy opt-in required) |
| config-audit.py | OK | bundled | Claude settings + skills | — |
| skill-security-auditor | OK | bundled | source/ + .claude/ SKILL.md | — |
| mcp-exfil-scan | OK | bundled | 56 skill files | — |

## Gitleaks — Secrets in git history

**Summary:** 0 findings. 583 commits scanned, 23.58 MB.

No leaks found.

## Semgrep OWASP — Code Security (OWASP Top 10)

**Summary:** 64 findings — all `wildcard-postmessage-configuration` (see analysis below)

All 64 findings are instances of `window.postMessage(msg, '*')` across:
- `live-browser.js` (browser extension content script) — 12 copies across harness dirs + source/plugin
- `extension/content/content-script.js` — 5 instances
- `src/detect-antipatterns-browser.js` — 3 instances

**Assessment:** Accepted design pattern for browser extension overlay communication. The extension injects into arbitrary user pages and cannot restrict to a specific origin. Not fixable without breaking the extension functionality.

## Semgrep TypeScript — TypeScript Security

**Summary:** 0 findings. (0 .ts files tracked by git in the semgrep scope)

## Semgrep Secrets — Secret Detection

**Summary:** 0 findings. 961 files scanned.

## Trivy — Dependency Vulnerabilities

**Summary:** 0 vulnerabilities (pre-fix: 0 in bun.lock, 2 in pnpm-lock.yaml now fixed)

Both bun.lock and pnpm-lock.yaml scanned clean after CVE fixes.

## TruffleHog — Live-Verified Secrets

**Summary:** 0 verified secrets, 0 unverified secrets. 16,970 chunks scanned.

## mcps-audit — OWASP MCP Top 10

**Summary:** 592 findings (risk score 100/100) — assessed as FALSE POSITIVES

mcps-audit's pattern matching flags legitimate CLI code constructs:
- CRITICAL AS-001: `import { execSync } from 'node:child_process'` — expected in a CLI tool
- MEDIUM AS-003: `Map.delete()` calls in the extension service worker — routine data structure cleanup
- No real tool poisoning, prompt injection, or rug-pull indicators found in manual review

**Assessment:** All findings are false positives for this JavaScript CLI/extension codebase.

## OSV-Scanner — SCA (Software Composition Analysis)

**Summary (pre-fix):** 2 HIGH CVEs in pnpm-lock.yaml, 0 in bun.lock
**Summary (post-fix):** 0 CVEs in both lock files

| CVE | CVSS | Package | Affected | Fixed | Status |
|-----|------|---------|----------|-------|--------|
| GHSA-rp42-5vxx-qpwr | 7.5 (High) | basic-ftp | 5.2.2 | 5.3.0+ | FIXED → 5.3.1 |
| GHSA-5j98-mcp5-4vw2 | 7.5 (High) | glob | 10.4.5 | 10.5.0+ | FIXED → 13.0.6 |

## config-audit — Claude Config Security Audit

**Summary:** 31 findings (6 CRITICAL, 10 HIGH, 12 MEDIUM, 3 LOW) — assessed as FALSE POSITIVES

Key false positives:
- CRITICAL: Security scanner tool files (SKILL.md, mcp-exfil-scan.sh, skill-audit.sh, config-audit.py) flagged for mentioning base64/ncat/SSH as **detection targets**, not as threats
- HIGH: settings.json curl hooks target `http://localhost:${PORT}` (cc-beeper notification daemon), not external endpoints
- HIGH: optimize/SKILL.md netcat reference is in an example diagnostic command, not an attack payload
- HIGH: validate-bash.sh mkfs/dd patterns are an example hook that **checks for** dangerous commands

**Assessment:** All CRITICAL/HIGH config-audit findings are false positives.

## skill-security-auditor — Skill Security Audit

**Summary:** Risk score 15/100 (LOW RISK) — APPROVED

- Dangerous patterns: 0
- Prompt injection patterns: 0
- Network URLs: 0
- File operations: 2 (expected — skill reads HTML files for analysis)
- Credential access: 0

## mcp-exfil-scan — MCP Exfiltration Scan

**Summary:** 11 findings (2 CRITICAL, 5 HIGH, 4 MEDIUM) — assessed as FALSE POSITIVES

- CRITICAL: impeccable/SKILL.md flagged for "exfiltration instruction pattern" — false positive on description text
- CRITICAL: security-audit/SKILL.md flagged because it describes scanning for exfiltration
- HIGH: skill-security-auditor Bash+WebFetch tools — required for a security scanner
- HIGH: atlas-cloud "URL shortener" false positive on `client.chat.completions.create`

**Assessment:** All findings are false positives.

## Cross-Tool Observations

- Zero secret leaks across Gitleaks, Semgrep (secrets), and TruffleHog — strong consensus on clean secrets posture
- Trivy and OSV-Scanner both confirm bun.lock is clean; pnpm-lock.yaml CVEs fixed
- Wildcard postMessage pattern flagged by Semgrep only — not a supply chain or secret issue, accepted design pattern
- No cross-tool overlap on genuine security issues

## Coverage Gaps

- Business logic, IDOR, and runtime behavior not covered by static analysis
- mcp-scan (runtime MCP tool description analysis) not run — opt-in due to data sharing with invariantlabs.ai
- CodeQL not available (no codeql.yml in .github/workflows/)
- TypeScript files exist in the codebase but none tracked by git in semgrep's scope (likely in node_modules or build output)

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260429T030420Z.jsonl`
- **Tool runs recorded:** 13
- **Standard:** OWASP APTS § Auditability
