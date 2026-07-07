# Security Report — 2026-07-07

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  **Scanned at:** 2026-07-07T10:04:00+07:00
**Tools run:** Gitleaks, TruffleHog, Trivy, OSV-Scanner, Semgrep (OWASP/TypeScript/secrets), security-audit (config-audit.py), skill-audit, mcp-exfil-scan  **Tools skipped:** Bandit (no `.py` files), CodeQL (no workflow in repo), mcp-scan/skillspector (opt-in, not run this cycle)

## Pre-flight Summary

| Tool | Status | Version / Note |
|------|--------|----------------|
| Gitleaks   | OK      | 8.30.1 |
| Bandit     | SKIPPED | no `.py` files in repo |
| Semgrep    | OK      | community rules (OWASP Top Ten, TypeScript, secrets) |
| Trivy      | OK      | 0.71.2 |
| TruffleHog | OK      | 3.95.6 |
| OSV-Scanner | OK     | 2.4.0 |
| CodeQL     | N/A     | no `.github/workflows/codeql.yml` in repo |
| security-audit (config-audit.py) | OK | scoped to Claude config; repo-local findings informational only |
| skill-audit | OK | run against `.claude/skills/impeccable/SKILL.md` |
| mcp-exfil-scan | OK | run against repo root |
| mcp-scan | OPT-IN, not run | requires explicit user consent |
| skillspector | OPT-IN, not run | not exercised this cycle |

---

## Gitleaks — Secrets in git history + filesystem

**Summary:** 0 findings. 987 commits scanned, ~60.9 MB.

```
10:05AM INF 987 commits scanned.
10:05AM INF scanned ~60921411 bytes (60.92 MB) in 8.02s
10:05AM INF no leaks found
```

---

## TruffleHog — Secrets in git history (live API verification)

**CONFIDENTIAL** — No verified or unverified secrets detected.

```
chunks: 52807
bytes: 61983665
verified_secrets: 0
unverified_secrets: 0
scan_duration: 6.78s
```

---

## Trivy — Dependencies, secrets, IaC

**Summary:** 0 vulnerabilities, 0 secrets. `bun.lock` clean (dev deps suppressed by default).

```
Target: bun.lock (bun)
Vulnerabilities: 0
Secrets: -
```

---

## OSV-Scanner — SCA via OSV.dev

**Summary (pre-fix):** 30 known vulnerabilities across 7 transitive npm packages (0 Critical, 8 High, 21 Medium, 1 Low), all fixable.

| Package | Installed | Fixed | Notable advisory | CVSS |
|---|---|---|---|---|
| `@protobufjs/utf8` | 1.1.0 | 1.1.1 | GHSA-q6x5-8v7m-xcrf | 5.3 |
| `fast-uri` | 3.1.0 | 3.1.2 | GHSA-v39h-62p7-jpjc | 7.5 |
| `hono` | 4.12.14 | 4.12.25 | GHSA-88fw-hqm2-52qc | 7.1 |
| `ip-address` | 10.1.0 | 10.1.1 | GHSA-v2v4-37r5-5v8g | 5.3 |
| `js-yaml` | 4.1.1 | 4.2.0 | GHSA-h67p-54hq-rp68 | 5.3 |
| `protobufjs` | 7.5.5 | 7.6.3 | GHSA-75px-5xx7-5xc7 | 8.1 |
| `qs` | 6.15.1 | 6.15.2 | GHSA-q8mj-m7cp-5q26 | 6.3 |

**Fix applied:** Added an `overrides` block to `package.json` pinning all 7 packages to their fixed versions; ran `bun install`. Re-scan below.

**Summary (post-fix):** `No issues found`.

---

## Semgrep — SAST (OWASP Top 10, TypeScript, secrets)

**OWASP scan (pre-fix):** 1 unique rule type, 5 instances — `javascript.browser.security.wildcard-postmessage-configuration` in `extension/content/content-script.js` (lines 28, 31, 35, 38, 100). Content script bridges the extension's isolated world and the page-context detector script over the same window; a same-origin target was available and unused.

```
extension/content/content-script.js
   28  window.postMessage({ source: 'impeccable-command', action: 'toggle-overlays' }, '*');
   31  window.postMessage({ source: 'impeccable-command', action: 'remove' }, '*');
   35  window.postMessage({ source: 'impeccable-command', action: 'highlight', selector: msg.selector }, '*');
   38  window.postMessage({ source: 'impeccable-command', action: 'unhighlight' }, '*');
  100  window.postMessage(msg, '*');
```

**Fix applied:** Replaced `'*'` with `window.location.origin` at all 5 call sites.

**OWASP scan (post-fix, `extension/` only):** `0 findings` (70 rules / 6 files).

**TypeScript scan:** `0 findings` (74 rules / 6 files).

**Secrets scan:** `0 findings` (42 rules / 1,715 files; 38 files >300KB and 391 `.semgrepignore`-matched files skipped — see Coverage Gaps).

---

## security-audit (config-audit.py) — Claude config audit

**Summary:** Tool audits both global `~/.claude` config and any Claude config found under the target path; only the latter is in scope for this repo.

**Repo-scoped findings (informational, no fix needed):**
- `CLAUDE.md` / `claude.md` — flagged for mentioning `.env` file access in prose (documents the evals-repo auth setup; not a live credential reference).
- `/Users/mp3wizard/Public/Claude skill/impeccable/.claude/settings.json` — `PostToolUse` hook present (expected repo tooling, not a vulnerability).

All other findings in the raw tool output (global `~/.claude/settings.json` hooks, installed plugins' `hooks.json`/`plugin.json` broad matchers) concern machine-wide Claude Code configuration outside this repo and are out of scope here.

---

## skill-audit — Skill file security review

**Target:** `.claude/skills/impeccable/SKILL.md`
**Summary:** Risk score **15/100 — LOW RISK**. 0 dangerous patterns, 0 prompt-injection patterns, 0 credential access, 0 network URLs, 4 file operations. Non-standard license field noted (Apache 2.0, informational). **Recommendation: APPROVE.**

---

## mcp-exfil-scan — MCP exfiltration scan

**Summary:** Risk score **0/100 — CLEAN**. 2 MCP configs and 26 skill files scanned; no tool-description poisoning, outbound data flow, exfiltration chains, encoded payloads, env-var leaking, or source-trust issues detected.

---

## Cross-Tool Observations

All three secrets tools (Gitleaks, TruffleHog, Semgrep secrets) returned clean — no cross-tool overlap on secrets.

skill-audit and mcp-exfil-scan agree: no prompt-injection or exfiltration indicators in this repo's skill/MCP surface.

## Coverage Gaps

- **CodeQL**: No workflow present; deep semantic SAST not run.
- **Business logic / IDOR / runtime behavior**: Not covered by static tools run this cycle.
- **Semgrep secrets scan**: 38 files >300KB and 391 `.semgrepignore`-matched files skipped (mostly generated `dist/`/`build/` provider-permutation copies and binary assets).
- **mcp-scan / skillspector LLM mode**: Opt-in, not exercised (requires explicit consent per tool's privacy gate).

## Fixes Applied

- `package.json`: added `overrides` for `@protobufjs/utf8@1.1.1`, `fast-uri@3.1.2`, `hono@4.12.25`, `ip-address@10.1.1`, `js-yaml@4.2.0`, `protobufjs@7.6.3`, `qs@6.15.2`; ran `bun install`, regenerated `bun.lock`. Verified via OSV-Scanner re-scan (0 issues).
- `extension/content/content-script.js`: replaced wildcard `postMessage` target origin (`'*'`) with `window.location.origin` at 5 call sites. Verified via Semgrep re-scan (0 findings).

## Known Remaining Issues

None outstanding from this cycle.
