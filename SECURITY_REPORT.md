# Security Report — 2026-06-04

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-06-04T03:07:00Z
**Git HEAD:** 302c9718
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    302c9718
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 775 commits / 52MB | — |
| Bandit | SKIPPED | 1.9.4 | 0 | No .py files |
| Semgrep OWASP | OK | latest | 124 JS/TS files | 14 files >300KB, 369 gitignored |
| Semgrep TypeScript | OK | latest | 6 TS files | — |
| Semgrep Secrets | OK | latest | 1499 files | — |
| Trivy | OK | 0.69.3 | bun.lock (657 pkgs) | — |
| TruffleHog | OK | 3.94.2 | 42,140 chunks / 52MB | — |
| CodeQL | SKIPPED | N/A | — | No CodeQL workflow in .github/workflows/ |
| mcps-audit | OK | 1.0.0 | Skill files | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (657 pkgs) | — |
| mcp-scan | OPT-IN | — | — | Not consented (sends data to invariantlabs.ai) |
| security-audit | OK | bundled | ~/.claude + project | — |
| skill-security-auditor | OK | bundled | 5 SKILL.md files | — |
| mcp-exfil-scan | OK | bundled | skills + MCP configs | — |

## Gitleaks — Secrets in git history

**Summary:** 0 findings across 775 commits (52.54 MB scanned)

```
775 commits scanned.
scanned ~52535254 bytes (52.54 MB) in 6.18s
no leaks found
```

## Semgrep — OWASP Top 10

**Summary:** 75 findings — all `wildcard-postmessage-configuration` in `detect-antipatterns-browser.js`

The 75 findings are all the same pattern in a single source file (`detect-antipatterns-browser.js`) duplicated across 15 provider-specific directories (`.claude/`, `.cursor/`, `.gemini/`, `.github/`, `.kiro/`, `.opencode/`, `.pi/`, `.qoder/`, `.rovodev/`, `.trae-cn/`, `.trae/`, `.agents/`, `plugin/`, `cli/`, `extension/`).

**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`
**Locations:** `detect-antipatterns-browser.js` lines 4265-4524 and `extension/content/content-script.js` lines 28-100
**Assessment:** Intentional design. The browser extension/detector injects into arbitrary pages and must send postMessage to the page host. Messages contain only scan results (no sensitive user data). The wildcard `'*'` target origin is required since the receiving page is unknown at send time. This is a known, acceptable pattern for browser extension content scripts communicating with injected page scripts. **Not fixable without breaking the tool's core function.**

## Semgrep — TypeScript

**Summary:** 0 findings across 6 TS files

## Semgrep — Secrets

**Summary:** 0 findings across 1499 files

## Trivy — Dependencies & Secrets

**Summary:** 0 vulnerabilities, 0 secrets in bun.lock (657 packages)

```
Target: bun.lock | Type: bun | Vulnerabilities: 0 | Secrets: -
```

## TruffleHog — Live-verified Secrets

**Summary:** 0 verified secrets, 0 unverified secrets

```
chunks: 42140, bytes: 52256029, verified_secrets: 0, unverified_secrets: 0
scan_duration: 4.657967333s
```

## OSV-Scanner — SCA

**Initial scan:** 1 Medium vulnerability found
- `GHSA-p7fg-763f-g4gf` (CVSS 4.8) — `@anthropic-ai/sdk` 0.81.0 in transitive dep of `@anthropic-ai/claude-agent-sdk@0.2.119`; fixed in 0.91.1

**After fix:** 0 vulnerabilities (verified by re-scan)

## mcps-audit — OWASP MCP Top 10

**Summary:** Tool reports high finding counts (335 CRITICAL, 127 HIGH, 448 MEDIUM, 195 LOW) but the majority are false positives from AS-001 "Dangerous execution" triggered on normal JavaScript function declarations in the CLI engine and browser injected scripts. The `execSync` import in `cli/bin/commands/skills.mjs` is the only notable pattern; it's used for running npm/node child processes in the CLI install flow — a necessary capability.

Coverage: 3/8 MCP Top 10 mitigated. No MCPS SDK detected (not applicable — this is a skill, not an MCP server).

## security-audit — Claude Config Audit

**Summary:** 39 issues (5 CRITICAL, 10 HIGH, 19 MEDIUM, 5 LOW)

The CRITICAL findings are all false positives: they flag the security scanner skill scripts themselves (mcp-exfil-scan.sh, skill-audit.sh, config-audit.py, skill-security-auditor/SKILL.md, security-scanner/SKILL.md) for "data exfiltration" patterns — these scripts contain detection logic that pattern-matches on the very patterns they scan for.

The HIGH findings flag global `~/.claude/settings.json` hook commands that use `curl` to POST to `localhost` (cc-beeper notification system) — these are intentional, pre-existing hooks, not new findings from this merge.

**Project-specific findings:**
- MEDIUM: `CLAUDE.md` and `claude.md` reference `.env` file — false positive; the CLAUDE.md instructs to skip cleanup that references `.env` test context.

## skill-security-auditor — Skill Audit

**Summary:** 5 SKILL.md files audited (sampled)

All scored with no dangerous patterns, no obfuscation, no hardcoded URLs, no credential access, no external dependencies, no privilege escalation. File operations (5 per file) are expected for the impeccable skill which reads/writes design files. All pass.

## mcp-exfil-scan — MCP Exfiltration Detection

**Summary:** 11 issues (2 CRITICAL, 5 HIGH, 4 MEDIUM) — all out-of-scope

All findings are in globally-installed skills (`~/.claude/skills/security-audit`, `~/.claude/skills/skill-security-auditor`, `~/.claude/skills/atlas-cloud`, `~/.claude/skills/playwright-cli`, `~/.claude/skills/pyright`, `~/.claude/skills/vtsls`) — not in the impeccable repo itself. These are pre-existing findings unrelated to this upstream sync.

Risk score: 100/100 — inflated by scanning global skill installations outside the repo scope.

## Cross-Tool Observations

- **Zero secrets across all three secret scanners** (Gitleaks, TruffleHog, Semgrep secrets) — strong signal.
- **Zero CVEs after fix** — OSV-Scanner initially found 1 Medium transitive dep CVE; fixed by adding `@anthropic-ai/sdk: ">=0.91.1"` to `package.json` overrides and running `bun install`. Trivy independently confirmed 0 vulns.
- **postMessage wildcard**: Flagged by Semgrep OWASP but not by Gitleaks/TruffleHog/Trivy — consistent with being a design pattern, not a secret or supply chain issue.
- **config-audit + mcp-exfil-scan overlap**: Both flag the security scanner scripts themselves — mutual false positive from the scanner examining its own detection logic.

## Fixes Applied

| Finding | CVE/ID | Severity | Fix |
|---------|--------|----------|-----|
| Transitive dep `@anthropic-ai/sdk` 0.81.0 | GHSA-p7fg-763f-g4gf | Medium (CVSS 4.8) | Added `"@anthropic-ai/sdk": ">=0.91.1"` to `overrides` in `package.json`, ran `bun install` |

## Known Remaining Issues

| Issue | Severity | Reason not fixed |
|-------|----------|------------------|
| `wildcard-postmessage-configuration` (75 findings) | Medium | Intentional design — browser extension content script requires wildcard origin for postMessage to arbitrary pages |
| `execSync` in `cli/bin/commands/skills.mjs` | Medium | Required for CLI npm/node child process invocation; input is not user-controlled at the relevant callsite |
| Global hook HIGH findings (cc-beeper curl) | HIGH | Pre-existing global config, not introduced by this merge; out of scope |
| mcp-exfil-scan findings in global skills | Various | Out of scope — these are in `~/.claude/skills/`, not in the impeccable repo |

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260604T030424Z.jsonl`
- **Tool runs recorded:** Via bash invocations in main session
- **Standard:** OWASP APTS § Auditability
