# Security Report — 2026-06-09

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-09T04:18:00Z
**Git HEAD:** 353be6aa
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

---

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    353be6aa
Include:     all supported
Exclude:     .gitignore honored by each tool
```

---

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 835 commits | — |
| Bandit | SKIPPED | 1.9.4 | 0 | No .py files |
| Semgrep OWASP | OK | latest | 125 JS/TS | — |
| Semgrep TypeScript | OK | latest | 6 .ts | — |
| Semgrep Secrets | OK | latest | 1550 | — |
| Trivy | OK | 0.69.3 | bun.lock | — |
| TruffleHog | OK | 3.94.2 | 835 commits | — |
| CodeQL | SKIPPED | N/A | — | No codeql.yml workflow |
| mcps-audit | OK | 1.0.0 | 389 files | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (624 pkgs pre-fix, 613 post) | — |
| mcp-scan | OPT-IN | N/A | — | Sends data to invariantlabs.ai; not consented |
| config-audit (security-audit) | OK | bundled | global + project configs | — |
| skill-security-auditor | OK | bundled | 14 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | 39 skill files + MCP | — |

---

## Gitleaks — Secret Detection

**Summary:** 0 findings across 835 commits, 54.55 MB scanned.

No secrets detected in git history or filesystem.

---

## Semgrep OWASP — SAST

**Summary:** 75 findings (blocking) — all one rule, all copies of the same source file.

**Rule:** `wildcard-postmessage-configuration`
**Root file:** `detect-antipatterns-browser.js` (duplicated across 15 agent-specific dirs)

All 75 findings trace to `window.postMessage({...}, '*')` in `detect-antipatterns-browser.js`. This is a browser extension injected/content script that communicates between extension context and page via `postMessage`. The wildcard origin is intentional for this architecture: the injected script runs in page context and cannot know the parent page's origin at load time. All messages use a typed `source` field for filtering. This is a known architectural pattern for browser extensions.

**Assessment:** Low actual risk. The extension sends structured scan results; no sensitive user data flows through these channels. No upstream fix needed.

---

## Semgrep TypeScript — SAST

**Summary:** 0 findings across 6 TypeScript files.

---

## Semgrep Secrets — Secret Detection

**Summary:** 0 findings across 1,550 files.

---

## Trivy — Dependency Vulnerabilities

**Summary:** 0 vulnerabilities, 0 secrets (post-fix after bun install).

---

## TruffleHog — Secret Detection (Live-verified)

**Summary:** 0 verified secrets, 0 unverified secrets. 44,559 chunks scanned.

---

## mcps-audit — OWASP MCP Top 10

**Summary:** 1,138 reported findings; the vast majority are false positives.

| OWASP MCP | Status | Notes |
|-----------|--------|-------|
| MCP-01 Rug Pulls | flagged | False positive — standard JS function declarations |
| MCP-02 Tool Poisoning | N/A | — |
| MCP-03 Privilege Escalation | flagged | False positive — `execSync` in CLI (user-invoked commands) |
| MCP-04 CSRF | flagged | False positive |
| MCP-05 Sampling Manipulation | N/A | — |
| MCP-06 Prompt Injection | warning | Low confidence; no verified injection |
| MCP-07 Resource Exhaustion | OK | — |
| MCP-08 Insufficient Logging | OK | — |
| MCP-09 Insecure Communication | OK | — |
| MCP-10 Context Pollution | flagged | False positive |

AS-001 "Dangerous execution" flags on function declarations (`const highlight = function(...)`, `const scan = function(...)`) are systematic mcps-audit false positives. The `execSync` usage in `cli/bin/commands/skills.mjs` is a CLI tool that runs user-invoked commands — expected behavior.

**Assessment:** No actionable findings.

---

## OSV-Scanner — SCA / Dependency CVEs

### Pre-fix (22 CVEs across 6 packages)

| Package | Version | CVSS | Fixed Version | CVEs |
|---------|---------|------|--------------|------|
| `fast-uri` | 3.1.0 | 7.5 High | 3.1.2 | GHSA-q3j6-qgpj-74h6, GHSA-v39h-62p7-jpjc |
| `hono` | 4.12.14 | up to 6.5 | 4.12.21 | GHSA-2gcr, -3hrh, -69xw, -9vqf, -f577, -hm8q, -p77w, -qp7p, -xrhx (8 CVEs) |
| `protobufjs` | 7.5.5 | 8.1 High | 7.5.8 | GHSA-75px, -66ff, -685m, -2pr8, -fx83, -jggg, -jvwf, -q6x5 (7 CVEs) |
| `@protobufjs/utf8` | 1.1.0 | 5.3 | 1.1.1 | GHSA-q6x5-8v7m-xcrf |
| `ip-address` | 10.1.0 | 5.3 | 10.1.1 | GHSA-v2v4-37r5-5v8g |
| `qs` | 6.15.1 | 6.3 | 6.15.2 | GHSA-q8mj-m7cp-5q26 |

### Fix Applied

`package.json` already had `overrides` pinning all packages to safe versions. Running `bun install` regenerated `bun.lock` (613 packages, down from 624) to resolve the fixed versions.

### Post-fix Verification

**0 CVEs** — all 22 resolved. Confirmed by re-running OSV-Scanner after `bun install`.

---

## config-audit — Claude Config Security

**Summary:** 39 issues (5 CRITICAL, 10 HIGH, 19 MEDIUM, 5 LOW). All are false positives or known-good configurations.

| Severity | Count | Assessment |
|----------|-------|------------|
| CRITICAL (5) | Scanner detecting itself | `security-scanner`, `skill-security-auditor`, `mcp-exfil-scan.sh`, `skill-audit.sh`, `config-audit.py` are flagged because they *look for* base64/env/ncat patterns — not because they perform these operations maliciously |
| HIGH (10) | cc-beeper hooks (7) + plugin examples (2) + optimize skill (1) | cc-beeper uses `curl localhost:${PORT}` — a local notification daemon, not exfiltration. Plugin hook examples demonstrate patterns for educational purposes. |
| MEDIUM (19) | Broad matchers on hooks, skipDangerousModePermissionPrompt, skill .env references | Known intentional configurations |
| LOW (5) | Hook presence notes | Informational |

No actionable findings.

---

## skill-security-auditor — Skill Risk Scores

All 14 SKILL.md files scored **LOW RISK** (0–15/100). No MEDIUM or HIGH findings.

| Score | Count |
|-------|-------|
| 0/100 | 2 |
| 5/100 | 4 |
| 15/100 | 8 |

---

## mcp-exfil-scan — MCP Exfiltration Detection

**Summary:** 11 findings (2 CRITICAL, 5 HIGH, 4 MEDIUM). All are false positives.

| Finding | Assessment |
|---------|-----------|
| CRITICAL: `impeccable/SKILL.md` "exfiltration instruction" | False positive — "extract" in skill description triggers keyword match |
| CRITICAL: `security-audit/SKILL.md` "exfiltration instruction" | False positive — scanner scans for exfil keywords, finds them in its own description |
| HIGH: `skill-security-auditor` Read+WebFetch chain | Expected — security auditor needs both to fetch and analyze skills |
| HIGH: `atlas-cloud` URL shortener | False positive — matches `client.chat.completions.create` |
| HIGH: env var + network in security skills | Expected — scanners reference env vars in pattern matching |
| MEDIUM: playwright-cli, pyright, vtsls no source attribution | Informational — known tools, unrelated to impeccable repo |

No actionable findings.

---

## Cross-Tool Observations

- **Wildcard postMessage** (Semgrep OWASP, 75 findings): Single root cause — one source file duplicated 15 times across agent-specific build output dirs. Intentional browser extension architecture.
- **Transitive dep CVEs** (OSV-Scanner, 22 pre-fix): `package.json` overrides already targeted safe versions; `bun.lock` needed regeneration via `bun install`. All resolved.
- **Security tooling self-flagging** (config-audit + mcp-exfil-scan): The security scanner's own scripts are consistently flagged. Known false-positive pattern when scanning a repo that contains security tooling.

---

## Fixes Applied

| Package | Old Version | New Version | Method |
|---------|------------|-------------|--------|
| `fast-uri` | 3.1.0 | >=3.1.2 | `package.json` overrides already set; `bun install` applied them |
| `hono` | 4.12.14 | >=4.12.21 | Same |
| `protobufjs` | 7.5.5 | >=7.5.8 | Same |
| `@protobufjs/utf8` | 1.1.0 | >=1.1.1 | Same |
| `ip-address` | 10.1.0 | >=10.1.1 | Same |
| `qs` | 6.15.1 | >=6.15.2 | Same |

All 22 CVEs resolved. Verified by re-running OSV-Scanner (0 findings post-fix).

---

## Known Remaining Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Wildcard `postMessage` in `detect-antipatterns-browser.js` | Low (accepted) | Intentional browser extension architecture; 15 identical copies across agent-specific build dirs |

---

## Coverage Gaps

- Business logic, IDOR, runtime behavior not covered by static analysis.
- mcp-scan (invariantlabs.ai) not run — requires opt-in due to data sharing.
- CodeQL not run — no `codeql.yml` workflow present.
- 14 files >0.3 MB skipped by Semgrep (large bundled JS files).

---

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260609T041450Z.jsonl`
- **Tool runs recorded:** 13
- **Standard:** OWASP APTS § Auditability
