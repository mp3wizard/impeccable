# Security Report — 2026-05-19

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-05-19T03:18:00Z
**Git HEAD:** 41c42683
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    41c42683
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 675 commits, ~35 MB | — |
| Bandit | SKIPPED | 1.9.4 | — | No .py files |
| Semgrep OWASP | OK | latest | 135 JS/TS files (77 rules) | — |
| Semgrep TypeScript | OK | latest | 5 TS files (74 rules) | — |
| Semgrep Secrets | OK | latest | 1390 files (42 rules) | — |
| Trivy | OK | 0.69.3 | bun.lock, pnpm-lock.yaml | — |
| TruffleHog | OK | 3.94.2 | 25000 chunks, 34.6 MB | — |
| CodeQL | SKIPPED | N/A | — | No github.com remote |
| mcps-audit | N/A | — | — | Not applicable |
| OSV-Scanner | OK | 2.3.5 | bun.lock (653 pkgs), pnpm-lock.yaml (638 pkgs) | — |
| mcp-scan | OPT-IN | — | — | Privacy opt-in required |
| security-audit | OK | bundled | ~/.claude settings, skills, plugins | — |
| skill-security-auditor | OK | bundled | 15 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | 41 skill files, 2 MCP configs | — |

## Gitleaks — Secrets in git history

**Summary:** 0 findings — 675 commits scanned, ~35 MB, no leaks found.

## Semgrep OWASP — JavaScript/TypeScript SAST

**Summary:** 131 findings (131 blocking) — all `wildcard-postmessage-configuration` rule.

All 131 findings are the same rule: `window.postMessage({...}, '*')` using wildcard origin in browser extension injected scripts (`detect-antipatterns-browser.js`, `live-browser.js`, `content-script.js`). These files are browser extension content scripts that communicate between an injected page script and the extension using the established browser extension pattern where `*` origin is required because the extension cannot know the target page's origin at injection time. This is an accepted architectural pattern for browser extensions, not a data leak risk. The pattern is present in multiple copies (one per harness: `.claude/`, `.cursor/`, `.agents/`, etc.) which multiplies the count.

**Assessment:** Low practical risk. The postMessage communication is local to the browser tab, uses prefixed message types (`impeccable-results`, `impeccable-command`), and carries only UI scan results — no credentials or sensitive data.

## Semgrep TypeScript — TypeScript SAST

**Summary:** 0 findings across 5 TypeScript files.

## Semgrep Secrets — Secret detection

**Summary:** 0 findings across 1390 files.

## Trivy — Dependency vulnerabilities

**Summary:** 1 finding in bun.lock — fixed by override.

| Library | CVE | Severity | Installed | Fixed | Status |
|---------|-----|----------|-----------|-------|--------|
| ws | CVE-2026-45736 | MEDIUM | 8.19.0 | 8.20.1 | Fixed via bun override → 8.20.1 |

## TruffleHog — Live-verified secrets

**Summary:** 0 verified secrets, 0 unverified secrets. 25000 chunks scanned.

## OSV-Scanner — Dependency SCA

**Summary (bun.lock):** 0 vulnerabilities — clean after overrides applied.

**Summary (pnpm-lock.yaml):** 12 vulnerabilities remain in 7 packages. All are transitive dependencies. pnpm v11.1.3 does not apply overrides correctly in non-TTY/CI mode with this repo structure (both `package.json#overrides` and `pnpm.yaml#overrides` are present but pnpm does not update the lockfile to reflect them). The bun.lock is the primary install lockfile and is clean.

| GHSA | CVSS | Package | Installed | Fixed | Source |
|------|------|---------|-----------|-------|--------|
| GHSA-p7fg-763f-g4gf | 4.8 | @anthropic-ai/sdk | 0.81.0 | 0.91.1 | pnpm-lock.yaml (transitive) |
| GHSA-77vg-94rm-hx3p | 7.5 | devalue | 5.8.0 | 5.8.1 | pnpm-lock.yaml (transitive, astro dep) |
| GHSA-q3j6-qgpj-74h6 | 7.5 | fast-uri | 3.1.0 | 3.1.2 | pnpm-lock.yaml (transitive) |
| GHSA-v39h-62p7-jpjc | 7.5 | fast-uri | 3.1.0 | 3.1.2 | pnpm-lock.yaml (transitive) |
| GHSA-69xw-7hcm-h432 | 4.7 | hono | 4.12.15 | 4.12.16 | pnpm-lock.yaml (transitive) |
| GHSA-9vqf-7f2p-gf9v | 6.5 | hono | 4.12.15 | 4.12.16 | pnpm-lock.yaml (transitive) |
| GHSA-hm8q-7f3q-5f36 | 3.8 | hono | 4.12.15 | 4.12.18 | pnpm-lock.yaml (transitive) |
| GHSA-p77w-8qqv-26rm | 5.3 | hono | 4.12.15 | 4.12.18 | pnpm-lock.yaml (transitive) |
| GHSA-qp7p-654g-cw7p | 4.3 | hono | 4.12.15 | 4.12.18 | pnpm-lock.yaml (transitive) |
| GHSA-v2v4-37r5-5v8g | 5.3 | ip-address | 10.1.0 | 10.1.1 | pnpm-lock.yaml (transitive) |
| GHSA-58qx-3vcg-4xpx | 4.4 | ws | 8.18.0 | 8.20.1 | pnpm-lock.yaml (transitive, miniflare) |
| GHSA-58qx-3vcg-4xpx | 4.4 | ws | 8.20.0 | 8.20.1 | pnpm-lock.yaml (transitive, puppeteer) |

## security-audit (config-audit.py) — Claude Config Audit

**Summary:** 37 issues found (5 CRITICAL, 10 HIGH, 17 MEDIUM, 5 LOW).

**CRITICAL findings (5):** All false positives from security scanner scripts flagging their own detection patterns:
- `skill-security-auditor/SKILL.md`, `security-scanner/SKILL.md`: base64 + .env pattern in scanner description text
- `security-scanner/scripts/mcp-exfil-scan.sh`, `skill-audit.sh`, `config-audit.py`: scanner scripts containing detection patterns as targets

**HIGH findings (10):**
- 7x cc-beeper hooks using `curl` to `http://localhost:${PORT}/hook` — legitimate local notification service
- `skill:optimize/SKILL.md` — netcat in performance tool description (false positive)
- `plugin:claude-plugins-official/.../validate-bash.sh` — `mkfs`/`dd` in a validation hook example that blocks these commands

**MEDIUM/LOW findings (22):** Broad hook matchers and `skipDangerousModePermissionPrompt: true` — intentional user configuration.

## skill-security-auditor — Skill security scores

**Summary:** All 15 impeccable SKILL.md copies scored **LOW RISK**. No prompt injection, no credential access, no obfuscation detected.

## mcp-exfil-scan — MCP exfiltration detection

**Summary:** 11 findings (2 CRITICAL, 5 HIGH, 4 MEDIUM). Risk score inflated by global skill inventory false positives.

- 2 CRITICAL: false positives — "extract" in skill description / security scanner mentioning .env detection
- 5 HIGH: security auditor tool's legitimate Read+WebFetch+Bash toolset; atlas-cloud URL shortener false positive
- 4 MEDIUM: missing source attribution on utility skills

## Cross-Tool Observations

- No genuine secret exposure detected: Gitleaks, TruffleHog, and Semgrep Secrets all agreed on 0 secrets.
- wildcard-postmessage-configuration (131 Semgrep findings) is an accepted browser extension IPC pattern.
- config-audit, skill-audit, and mcp-exfil-scan all false-alarmed on the security scanner's own scripts.
- bun.lock is clean; pnpm-lock.yaml has 12 remaining vulnerabilities due to pnpm v11 override application issues in headless mode.

## Coverage Gaps

- Business logic, IDOR, and runtime behavior not covered by static tools.
- mcp-scan (opt-in): not run; would send data to invariantlabs.ai.
- CodeQL: not run; no github.com remote configured.

## Fixes Applied

| Finding | Fix | Method |
|---------|-----|--------|
| ws 8.19.0 (bun) — CVE-2026-45736 MEDIUM | Upgraded to 8.20.1 | Added `"ws": "^8.20.1"` to `package.json#overrides`, ran `bun install` |
| devalue 5.8.0 (bun) — GHSA-77vg-94rm-hx3p HIGH | Upgraded to 5.8.1 | Added `"devalue": "^5.8.1"` to `package.json#overrides`, ran `bun install` |
| pnpm v11 overrides not applied | Created `pnpm.yaml` | Added `pnpm.yaml` with all overrides for pnpm v11 compatibility |

## Known Remaining Issues

1. **pnpm-lock.yaml: 12 vulnerabilities (7 packages)** — pnpm v11 does not update the lockfile to reflect overrides in non-TTY mode. bun.lock (primary install lockfile) is clean. Resolution: run `pnpm install` interactively to regenerate pnpm-lock.yaml with the new `pnpm.yaml` overrides in place.

2. **Semgrep: 131 wildcard-postmessage findings** — Architectural browser extension IPC pattern; `*` origin required for content script communication. Accepted.

3. **config-audit/mcp-exfil-scan false positives** — Pattern-matching scanners flag their own source. Accepted limitation.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260519T031441Z.jsonl`
- **Tool runs recorded:** 1 (Gitleaks logged; other tools run inline)
- **Standard:** OWASP APTS § Auditability
