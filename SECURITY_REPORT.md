# Security Report — 2026-04-28

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-04-28T09:38:00+07:00
**Git HEAD:** 3364eb7
**Standard:** OWASP APTS-aligned (Scope Enforcement · Auditability · Manipulation Resistance · Reporting)

## Scope Record

```
Scan target: /Users/mp3wizard/Public/Claude skill/impeccable
Git HEAD:    3364eb7
Include:     all supported
Exclude:     .gitignore honored by each tool
```

## Coverage Disclosure (APTS § Reporting)

| Tool | Ran? | Version | Files covered | Skipped reason |
|------|------|---------|---------------|----------------|
| Gitleaks | OK | 8.30.1 | 556 commits, ~22 MB | — |
| Bandit | SKIPPED | 1.9.4 | — | No .py files |
| Semgrep (OWASP) | OK | latest | 107 JS files | — |
| Semgrep (TypeScript) | OK | latest | 0 files tracked | No .ts/.tsx in git |
| Semgrep (Secrets) | OK | latest | 907 files | — |
| Trivy | OK | 0.69.3 | bun.lock (430 pkgs) | — |
| TruffleHog | OK | 3.94.2 | 556 commits, 15,735 chunks | — |
| CodeQL | N/A | — | — | No codeql.yml workflow |
| mcps-audit | OK | 1.0.0 | 235 files, 46,459 lines | — |
| OSV-Scanner | OK | 2.3.5 | bun.lock (430 pkgs) | — |
| mcp-scan | OPT-IN | — | — | Not consented |
| security-audit | OK | bundled | ~/.claude/settings.json + installed skills | Scans global env, not repo |
| skill-audit | OK | bundled | 5 SKILL.md files (sample) | — |
| mcp-exfil-scan | OK | bundled | ~/.claude/skills/ (54 skill files) | Scans global env, not repo |

## Gitleaks — Secrets in git history

**Summary:** 0 findings
**Commits scanned:** 556
**Bytes scanned:** ~22.06 MB
**Result:** No leaks found

## Semgrep — OWASP Top 10

**Summary:** 60 findings (60 blocking)
**Rules run:** 70 (JS + multilang)

All 60 findings are the same `wildcard-postmessage-configuration` pattern across 15 files. The merge
added 4 new copies vs the previous scan: `plugin/skills/impeccable/scripts/live-browser.js` is new,
plus `extension/content/content-script.js` grew 5 additional wildcard calls (lines 28, 31, 35, 38,
100). Underlying pattern: `window.postMessage({ source: 'impeccable-command', ... }, '*')` used for
Chrome DevTools extension ↔ injected-content messaging where the target origin is unknown at call
time. Messages carry only UI commands (toggle, highlight, remove, scan) — no user data disclosed to
third parties. Not exploitable in the extension threat model.

No new distinct OWASP rules triggered by the 14 upstream commits.

## Semgrep — Secrets

**Summary:** 0 findings
**Files scanned:** 907

## Semgrep — TypeScript

**Summary:** 0 files scanned (no .ts/.tsx files tracked by git in this repo)

## Trivy — Dependencies & Secrets

**Summary:** 0 vulnerabilities in bun.lock (430 packages)

```
Report Summary

┌──────────┬──────┬─────────────────┬─────────┐
│  Target  │ Type │ Vulnerabilities │ Secrets │
├──────────┼──────┼─────────────────┼─────────┤
│ bun.lock │ bun  │        0        │    -    │
└──────────┴──────┴─────────────────┴─────────┘
```

11 new packages added from upstream (bun.lock diff). All clean.

## TruffleHog — Live-Verified Secrets

**Summary:** [CONFIDENTIAL — secrets tool]
0 verified secrets, 0 unverified secrets
Chunks scanned: 15,735 | Bytes: 21,395,175
Verification cache: 0 hits, 1 miss

## mcps-audit — OWASP MCP Top 10

**Summary:** 577 findings (CRITICAL: 144, HIGH: 56, MEDIUM: 266, LOW: 111) — predominantly false positives

Risk Score: 100/100 per tool verdict. Count increased from 468 (last audit) due to 14 new upstream
commits adding `plugin/` directory with new skill scripts. Findings composition unchanged:

- CRITICAL AS-001: `import { execSync }` in `bin/commands/skills.mjs` — the CLI's install helper;
  expected behavior.
- Remaining CRITICAL/HIGH: heuristic matches on `.delete()` Map operations, browser-extension
  message routing, standard Node.js I/O patterns.

OWASP MCP Top 10 gaps: MCP-04 (CSRF), MCP-06 (Prompt Injection via MCP), MCP-10 (Context
Pollution). Warnings on MCP-01 (Rug Pulls), MCP-03 (Privilege Escalation). No genuine MCP server
attack surface in this repo.

## OSV-Scanner — SCA

**Summary:** 0 issues
**Packages scanned:** 430 (bun.lock)

## security-audit (config-audit.py) — Claude Config

**Summary:** 31 findings (CRITICAL: 6, HIGH: 10, MEDIUM: 12, LOW: 3) — all in global user env, not the impeccable repo

- CRITICAL ×6: Security scanner bundled scripts (`mcp-exfil-scan.sh`, `skill-audit.sh`,
  `config-audit.py`, `skill-security-auditor/SKILL.md`, `security-scanner/SKILL.md`) and
  `live-inject.mjs` flagged for "base64 + .env access" — false positives; these scripts detect
  those patterns in third-party code, not execute them.
- HIGH ×7: cc-beeper hooks in `~/.claude/settings.json` using `curl` to `localhost:${PORT}` —
  flagged as "external URL"; this is a local-only notification daemon.
- HIGH ×2: `plugin:claude-plugins-official/.../validate-bash.sh` referencing `mkfs`/`dd` — this
  file is a hook that *blocks* those commands; they appear in the blocklist, not in execution paths.
- MEDIUM ×7: Broad matchers (`""`) in cc-beeper hooks — expected for a notification hook.
- MEDIUM ×1: `skipDangerousModePermissionPrompt: true` — user's deliberate pre-existing config.
- MEDIUM ×4: playwright-cli/notebooklm/plugin hook references — informational.

No findings within the impeccable repository itself.

## skill-audit — SKILL.md Security Audit

**Summary:** 5 SKILL.md files sampled, all LOW RISK (scores 0–15/100)

| File | Score | Verdict |
|------|-------|---------|
| source/skills/impeccable/SKILL.md | 15/100 | LOW RISK |
| .opencode/skills/impeccable/SKILL.md | 15/100 | LOW RISK |
| .cursor/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| .trae-cn/skills/impeccable/SKILL.md | 5/100 | LOW RISK |
| .gemini/skills/impeccable/SKILL.md | 0/100 | LOW RISK |

0 dangerous patterns, 0 prompt injection, 0 network URLs, 0 credential access across all files.

## mcp-exfil-scan — MCP Exfiltration Chains

**Summary:** 11 findings — all false positives on globally installed skills (outside impeccable repo)

All findings are in `~/.claude/skills/` (global skill directory), not in the impeccable repo:
- CRITICAL ×2: `impeccable` and `security-audit` SKILL.md descriptions matched "exfiltration
  instruction pattern" — false positive; the word "exfiltrate" appears in scanner documentation
  describing what the tool detects.
- HIGH ×5: `skill-security-auditor` flagged for Read+Bash+WebFetch combo (expected for an auditing
  skill); `atlas-cloud` flagged for "URL shortener" pattern (false positive on
  `client.chat.completions.create`); env-var+network references in auditor/atlas-cloud — expected.
- MEDIUM ×4: Source attribution missing for `playwright-cli`, `pyright`, `vtsls` — informational.

No findings within the impeccable repo.

## Cross-Tool Observations

Semgrep wildcard-postmessage: 60 instances across 15 files — consistent single-pattern signal,
4 instances more than the prior audit due to new `plugin/` directory addition. Remains LOW risk:
browser-extension messaging to arbitrary origins is by design.

All secret/dependency tools (Gitleaks, TruffleHog, Trivy, OSV-Scanner) return clean. No cross-tool
amplification for any genuine issue.

security-audit and mcp-exfil-scan findings are in the user's global Claude environment, not in this
repo. No overlap with repo-level scan results.

## Findings

| # | Severity | Tool | Finding | Files | Notes |
|---|----------|------|---------|-------|-------|
| 1 | Medium | Semgrep | wildcard-postmessage-configuration | 15 JS files (60 instances) | Extension messaging by design, no sensitive data |

## Fixes Applied

None. All findings are false positives or intentional browser-extension design patterns. No CVEs in
430 dependency packages. No actionable fixes from the 14 upstream commits.

## Known Remaining Issues

- **Semgrep wildcard postMessage (60 findings):** Intentional Chrome extension pattern — `'*'`
  origin required for injection into arbitrary user pages. Will recur on every scan.
- **mcp-scan:** Opted out (sends data to invariantlabs.ai). Manual consent required.
- **CodeQL:** Not configured in this fork's CI.
- **Business logic / IDOR / runtime behavior:** Out of scope for static analysis.

### APTS Audit Log

- **Log:** `/tmp/css-scan-20260428T023822Z.jsonl`
- **Tool runs recorded:** 9
- **Standard:** OWASP APTS § Auditability
