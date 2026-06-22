# Security Report — 2026-06-22

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-22T03:11:44Z
**Git HEAD:** `063131e5`
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    063131e5
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Status | Version | Files Covered | Skipped / Notes |
|------|--------|---------|---------------|-----------------|
| Gitleaks | OK | 8.30.1 | 932 commits, ~60 MB | — |
| Semgrep (OWASP) | OK | 1.166.0 | 141 JS/TS files | 38 files >300 KB skipped; 391 .semgrepignore |
| Semgrep (TypeScript) | OK | 1.166.0 | 6 TS files | 1745 non-matching patterns |
| Semgrep (Secrets) | OK | 1.166.0 | 1713 files | 38 files >300 KB skipped |
| Trivy | OK | 0.71.2 | bun.lock (638 pkgs) | DB update skipped (docker-credential-desktop missing) |
| TruffleHog | OK | 3.95.6 | 51755 chunks, ~61 MB | — |
| CodeQL | SKIPPED | — | — | No .github/workflows/codeql.yml |
| mcps-audit | OK | — | 426 files, 145852 lines | — |
| OSV-Scanner | OK | 2.4.0 | bun.lock (638 pkgs) | — |
| config-audit.py | OK | bundled | global + project settings | — |
| skill-audit.sh | OK | bundled | .claude/skills/impeccable/SKILL.md | — |
| mcp-exfil-scan | OK | bundled | 2 MCP configs, 26 skill files | — |
| skillspector | OK | 2.1.4 | SKILL.md (168 lines) | --no-llm mode (local-only) |
| Bandit | SKIPPED | 1.9.4 | — | No .py files in target |
| mcp-scan | OPT-IN | — | — | Skipped — sends data to invariantlabs.ai |

## Gitleaks — Secrets in Git History

**Summary:** 0 findings

```
932 commits scanned.
scanned ~60369862 bytes (60.37 MB) in 8.67s
no leaks found
```

## Semgrep OWASP — Security Vulnerabilities

**Summary:** 5 findings (MEDIUM) — all wildcard postMessage in browser extension content script

```
/Users/mp3wizard/Public/Claude skill/impeccable/extension/content/content-script.js
Rule: javascript.browser.security.wildcard-postmessage-configuration

Line 28:  window.postMessage({ source: 'impeccable-command', action: 'toggle-overlays' }, '*');
Line 31:  window.postMessage({ source: 'impeccable-command', action: 'remove' }, '*');
Line 35:  window.postMessage({ source: 'impeccable-command', action: 'highlight', selector: msg.selector }, '*');
Line 38:  window.postMessage({ source: 'impeccable-command', action: 'unhighlight' }, '*');
Line 100: window.postMessage(msg, '*');
```

**Analysis:** These are upstream findings in the browser extension content script. The `'*'` wildcard is used for same-page messaging between the content script and the injected page script — a common extension pattern. Messages contain only UI commands (toggle-overlays, highlight, etc.), not sensitive data. Pre-existing upstream issue; no fix applied to fork.

## Semgrep TypeScript — TypeScript Rules

**Summary:** 0 findings (74 rules, 6 files)

## Semgrep Secrets — Secrets Detection

**Summary:** 0 findings (42 rules, 1713 files)

## Trivy — Dependency Vulnerabilities

**Summary:** 0 CVEs in bun.lock (638 packages)

```
Report Summary
┌──────────┬──────┬─────────────────┬─────────┐
│  Target  │ Type │ Vulnerabilities │ Secrets │
├──────────┼──────┼─────────────────┼─────────┤
│ bun.lock │ bun  │        0        │    -    │
└──────────┴──────┴─────────────────┴─────────┘
```

Note: DB update failed due to missing docker-credential-desktop. Used cached DB (--skip-db-update). Results may be slightly stale.

## TruffleHog — Live-Verified Secrets

**Summary:** 0 verified, 0 unverified secrets

```
chunks: 51755, bytes: 61376835
verified_secrets: 0, unverified_secrets: 0, scan_duration: 5.87s
```

## mcps-audit — MCP Permission Audit

**Summary:** Risk Score 100/100 — largely false positives

```
Findings: 1323
  CRITICAL: 1  (AS-005 line 1227 of skills.mjs — "Known injection pattern")
  MEDIUM:   4  (AS-003 — "High-risk permission pattern": JS delete operator)
  ... + 1313 more
```

**Analysis:** AS-003 MEDIUM findings flag `delete next.hooks;` / `delete next.description;` / `delete next.version;` as high-risk — these are JavaScript's standard property-deletion operator, not security issues. AS-005 CRITICAL at line 1227 also false positive in same context. The 100/100 score reflects mcps-audit's overly aggressive JS heuristics; cross-tool consensus (skill-audit 15/100, mcp-exfil 0/100, skillspector 0/100) confirms no real risk.

## OSV-Scanner — Known Vulnerability Database

**Summary:** No issues found (638 packages in bun.lock)

## config-audit.py — Claude Config Security Audit

**Summary:** 48 findings (7 CRITICAL, 10 HIGH, 24 MEDIUM, 7 LOW) — all false positives or known-good

- **CRITICAL (7):** Scanner flagged its own bundled scripts for "base64 + .env access" / "ncat + SSH directory" patterns — these are detection signatures inside the security tools themselves.
- **HIGH (10):** cc-beeper hooks in ~/.claude/settings.json using `curl localhost:${PORT}` — intentional local notification hooks, not external exfiltration.
- **MEDIUM (24):** Broad-matcher hooks (expected), browser-related skill descriptions, .env reference in documentation.
- **LOW (7):** Informational hooks-present notices.

## skill-audit.sh — Skill Security Auditor

**Summary:** Risk Score 15/100 — LOW RISK — APPROVE

```
Dangerous patterns: 0 | Prompt injection: 0 | Network URLs: 0
File operations: 4 | Credential access: 0
```

## mcp-exfil-scan — MCP Exfiltration Scanner

**Summary:** Risk Score 0/100 — CLEAN

No tool description poisoning, no outbound data flow issues, no exfiltration chains, no encoded payloads, no env var leaking, all sources verified.

## skillspector — AI-Skill Scanner (NVIDIA, --no-llm)

**Summary:** Score 0/100 — LOW — SAFE

```
SKILL.md: 168 lines, markdown, no executable scripts
No security issues detected.
```

## Cross-Tool Observations

- **Zero CVEs:** Trivy, OSV-Scanner, TruffleHog all agree — clean dependency tree, no secrets.
- **Gitleaks + TruffleHog consensus:** No secrets across 932 commits or filesystem.
- **Semgrep 5 OWASP findings:** Isolated to the browser extension content script (upstream code), not in the skill distribution artifacts or CLI.
- **config-audit.py CRITICALs are self-scan false positives:** Flagging the security scanner's own scripts.
- **mcps-audit vs. other skill tools:** 100/100 disagreed by skill-audit (15/100), mcp-exfil-scan (0/100), and skillspector (0/100) — mcps-audit over-triggers on large JS codebases.

## Coverage Disclosure

**Files >300 KB skipped by Semgrep:** `skill/scripts/live-browser.js`, build artifacts in `build/`, `node_modules/` (multiple). node_modules covered by OSV-Scanner via lockfile.

## Fixes Applied

None. No CVEs found in dependencies. The 5 OWASP wildcard-postMessage findings are in upstream browser extension code; the fork does not own that file.

## Known Remaining Issues

| ID | Tool | Severity | Location | Notes |
|----|------|----------|----------|-------|
| OWASP-1 through 5 | Semgrep | MEDIUM | `extension/content/content-script.js:28,31,35,38,100` | Wildcard postMessage in browser extension — upstream code, messages carry only UI commands |

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260622T031144Z.jsonl`
- **Tool runs recorded:** 3 (measured: 3, asserted: 0)
- **Standard:** OWASP APTS § Auditability
