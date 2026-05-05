# Security Report — 2026-05-05

## Tools Run

| Tool | Status | Finding count |
|------|--------|--------------|
| Gitleaks 8.30.1 | OK | 0 |
| Bandit 1.9.4 | SKIPPED (no .py files) | — |
| Semgrep (OWASP, TypeScript, Secrets) | OK | 64 (OWASP), 0 (TS), 0 (Secrets) |
| Trivy 0.69.3 | OK | 0 |
| TruffleHog 3.94.2 | OK | 0 |
| CodeQL | SKIPPED (no workflow) | — |
| mcps-audit | OK | 630 (mostly false positives — see below) |
| OSV-Scanner 2.3.5 | OK | 2 HIGH (fixed) |
| mcp-scan | OPT-IN (skipped — sends data to invariantlabs.ai) | — |
| config-audit.py | OK | 30 (config-level, pre-existing) |
| skill-audit.sh | OK | 0 real (all SKILL.md: LOW RISK 0–15/100) |
| mcp-exfil-scan.sh | OK | 11 (7 false positives on scanner skill itself) |

## Findings

### Real / Actionable

| CVE / ID | CVSS | Severity | Package | Version | Fixed In | Lockfile |
|----------|------|----------|---------|---------|----------|---------|
| GHSA-rp42-5vxx-qpwr | 7.5 | HIGH | basic-ftp | 5.2.2 | 5.3.0 | bun.lock, pnpm-lock.yaml |
| GHSA-5j98-mcp5-4vw2 | 7.5 | HIGH | glob | 10.4.5 | 10.5.0 | pnpm-lock.yaml |

### Informational / Pre-existing (not introduced by this upstream merge)

**Semgrep — wildcard postMessage (64 findings, same pattern):**
All 64 findings are `wildcard-postmessage-configuration` in `live-browser.js` and `detect-antipatterns-browser.js`. The `*` origin is intentional for the browser extension page communication model (extension cannot know the page origin at inject time). Same pattern exists across all agent-specific copies of the skill. Upstream design decision; not fixable without architectural change.

**mcps-audit — 630 findings:**
Predominantly false positives. The tool flags all `while` loops and `execSync` calls as "dangerous execution" (AS-001), resulting in 157 "CRITICAL" for standard CLI patterns. The 2 real OWASP MCP findings (MCP-04 Cross-Server Request Forgery, MCP-10 Context Window Pollution) are inherent to a browser extension skill that reads page content by design.

**config-audit.py — 30 findings:**
All relate to the user's global `~/.claude/settings.json` (cc-beeper hooks with localhost curl) and installed security-scanner skill itself — neither introduced by this repo's upstream changes.

**mcp-exfil-scan — 11 findings:**
7 are false positives on the security-scanner skill itself (correctly detecting its own scanning patterns as "suspicious"). 4 relate to user's installed skills (atlas-cloud, skill-security-auditor, playwright-cli, pyright) — pre-existing.

## Fixes Applied

1. **GHSA-rp42-5vxx-qpwr (basic-ftp)** — `package.json` already contained `overrides: {"basic-ftp": ">=5.3.0"}`. Ran `bun install` and `npx pnpm install` to regenerate lockfiles. Both `bun.lock` and `pnpm-lock.yaml` now resolve to the fixed version.
2. **GHSA-5j98-mcp5-4vw2 (glob)** — `package.json` already contained `overrides: {"glob": ">=10.5.0"}`. Same install run resolved this. Both lockfiles clean.

Verification: `osv-scanner scan -L bun.lock` -> No issues. `osv-scanner scan -L pnpm-lock.yaml` -> No issues.

## Known Remaining Issues

- **Wildcard postMessage** in browser extension scripts: upstream architectural pattern; requires upstream change to scope origins.
- **mcps-audit false positives**: tool is overly aggressive for CLI codebases; findings do not represent real attack vectors.
- **mcp-scan**: not run (opt-in, sends data to invariantlabs.ai).
- **CodeQL**: no workflow configured.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260505T062338Z.jsonl`
- **Tool runs recorded:** 9
- **Standard:** OWASP APTS § Auditability
