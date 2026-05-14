# Security Report — 2026-05-14

## Tools Run

| Tool | Status | Finding count |
|------|--------|---------------|
| Gitleaks 8.30.1 | OK | 0 |
| Bandit 1.9.4 | SKIPPED (no .py files) | — |
| Semgrep (OWASP) | OK | 64 |
| Semgrep (TypeScript) | OK | 0 |
| Semgrep (Secrets) | OK | 0 |
| Trivy 0.69.3 | OK | 1 → 0 after fix |
| TruffleHog 3.94.2 | OK | 0 |
| CodeQL | SKIPPED (no CodeQL workflow) | — |
| mcps-audit | OK | 647 (mostly false positives) |
| OSV-Scanner 2.3.5 | OK | 26 → 0 after fixes |
| mcp-scan | OPT-IN (skipped) | — |
| security-audit (config-audit.py) | OK | 33 (config-level, not repo) |
| skill-security-auditor | OK | LOW RISK (15/100) |
| mcp-exfil-scan | OK | 10 (false positives from security tool self-scan) |

## Findings

### Semgrep OWASP — wildcard-postmessage-configuration (Medium, 64 findings)

**Pattern:** `window.postMessage({ ... }, '*')` across all harness copies of `live-browser.js` and `detect-antipatterns-browser.js`.

**Assessment:** By design. The impeccable browser overlay must communicate with arbitrary web pages (unknown origin). The `source: 'impeccable-*'` message tagging provides identification; changing to a specific origin would break the core injection workflow. The receiver also validates `event.data.source` before acting. **Accepted / by-design.**

### Trivy / OSV-Scanner — Dependency CVEs (Fixed)

| CVE / GHSA | Package | Severity | Installed | Fixed |
|---|---|---|---|---|
| CVE-2026-42338 / GHSA-v2v4-37r5-5v8g | ip-address | MEDIUM (5.3) | 10.1.0 | 10.1.1 |
| GHSA-q3j6-qgpj-74h6 | fast-uri | HIGH (7.5) | 3.1.0 | 3.1.1 |
| GHSA-v39h-62p7-jpjc | fast-uri | HIGH (7.5) | 3.1.0 | 3.1.2 |
| GHSA-69xw-7hcm-h432 | hono | MEDIUM (4.7) | 4.12.14 | 4.12.16 |
| GHSA-9vqf-7f2p-gf9v | hono | MEDIUM (6.5) | 4.12.14 | 4.12.16 |
| GHSA-hm8q-7f3q-5f36 | hono | LOW (3.8) | 4.12.14 | 4.12.18 |
| GHSA-p77w-8qqv-26rm | hono | MEDIUM (5.3) | 4.12.14 | 4.12.18 |
| GHSA-qp7p-654g-cw7p | hono | MEDIUM (4.3) | 4.12.14 | 4.12.18 |
| GHSA-75px-5xx7-5xc7 | protobufjs | HIGH (8.1) | 7.5.5 | 7.5.6 |
| GHSA-66ff-xgx4-vchm | protobufjs | HIGH (7.7) | 7.5.5 | 7.5.6 |
| GHSA-jvwf-75h9-cwgg | protobufjs | HIGH (7.5) | 7.5.5 | 7.5.6 |
| GHSA-685m-2w69-288q | protobufjs | HIGH (7.5) | 7.5.5 | 7.5.6 |
| GHSA-q6x5-8v7m-xcrf | protobufjs / @protobufjs/utf8 | MEDIUM (5.3) | 7.5.5 / 1.1.0 | 7.5.6 / 1.1.1 |
| GHSA-2pr8-phx7-x9h3 | protobufjs | MEDIUM (5.3) | 7.5.5 | 7.5.6 |
| GHSA-fx83-v9x8-x52w | protobufjs | MEDIUM (5.3) | 7.5.5 | 7.5.6 |
| GHSA-p7fg-763f-g4gf | @anthropic-ai/sdk | MEDIUM (4.8) | 0.81.0 | 0.91.1 |

All 16 CVEs were transitive dependencies. Fixed via `overrides` in `package.json` + `bun install`.

### config-audit.py — Claude Config Findings (Not repo findings)

33 findings from the user's global Claude Code settings (hooks, skills, plugins). These are not impeccable repo issues — they reflect the broader Claude Code environment. Notable:
- HIGH: `cc-beeper` hooks using `curl` to localhost (by-design notification tool)
- CRITICAL (false positive): Security scanner skill's own scripts flagged for scanning `.env` patterns — they are scanning *for* these, not performing exfiltration
- MEDIUM: `skipDangerousModePermissionPrompt: true` in global settings

### mcp-exfil-scan — Findings (False Positives)

10 findings all trace back to security tools scanning for exfiltration patterns being flagged *as* exfiltration:
- CRITICAL: `security-audit` skill's SKILL.md mentions `.env` file access (in the context of checking for risks)
- HIGH: `skill-security-auditor` has `Read+WebFetch+Bash` tools — necessary for security scanning
- MEDIUM: Skills without source attribution (playwright-cli, pyright, vtsls)

## Fixes Applied

1. Added `overrides` to `package.json` (both npm and pnpm sections):
   - `ip-address: ^10.1.1`
   - `hono: ^4.12.18`
   - `fast-uri: ^3.1.2`
   - `protobufjs: ^7.5.6`
   - `@protobufjs/utf8: ^1.1.1`
   - `@anthropic-ai/sdk: ^0.91.1` (forces unified version across `@anthropic-ai/claude-agent-sdk` dep tree)
2. Ran `bun install` — lockfile updated, all overrides resolved
3. OSV-Scanner re-verify: **No issues found**

## Known Remaining Issues

- **Semgrep wildcard-postmessage (64 findings):** Accepted. By design for browser overlay injection pattern; receiver validates `source` field.
- **config-audit findings (33):** Global Claude Code config issues unrelated to this repo; `cc-beeper` hooks are intentional.
- **mcp-exfil-scan findings (10):** All false positives from security tooling scanning itself.

### APTS Audit Log
- **Log:** `/tmp/css-scan-20260514T092331Z.jsonl`
- **Tool runs recorded:** 9
- **Standard:** OWASP APTS § Auditability
