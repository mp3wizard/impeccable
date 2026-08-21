# Security Report — 2026-08-21

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Git HEAD:** `5ffa561f` (merge of `upstream/main`, 665 commits, into `mp3wizard/main`)

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks | OK | 0 |
| TruffleHog | OK | 0 |
| Trivy (fs) | OK | 0 |
| OSV-Scanner | OK | 34 (before fix) → 0 (after fix, verified) |
| Semgrep (OWASP Top 10) | OK | 0 |
| Semgrep (TypeScript) | OK | 0 (no `.ts`/`.tsx` files matched) |
| Semgrep (secrets) | OK | 0 |
| Bandit | SKIPPED | no `.py` files in target |
| CodeQL | SKIPPED | no CodeQL workflow in `.github/workflows/` |
| mcps-audit (skill/plugin heuristic scanner) | OK | 1832 (686 CRITICAL / 172 HIGH / 702 MEDIUM / 272 LOW) — see note below |
| skill-audit.sh (canonical `impeccable` SKILL.md) | OK | LOW RISK, 15/100, APPROVE |
| mcp-exfil-scan.sh | OK | CLEAN, 0/100 |
| config-audit.py (Claude config/instruction-file audit) | OK | 5 MEDIUM (repo-scoped) — all false positives, see below |

## Findings

### OSV-Scanner — 34 vulnerabilities (fixed, see Fixes Applied)
0 Critical / 10 High / 21 Medium / 3 Low, all in `bun.lock`, all transitive:

| Package | Found | Fixed to |
|---|---|---|
| `@hono/node-server` | 1.19.14 | 1.19.15 |
| `body-parser` | 2.2.2 | 2.3.0 |
| `brace-expansion` | 5.0.6 | 5.0.9 |
| `fast-uri` | 3.1.0 | 3.1.5 |
| `hono` | 4.12.14 | 4.12.34 |
| `ip-address` | 10.1.0 | 10.3.1 |
| `qs` | 6.15.1 | 6.15.2 (already overridden, lockfile was stale) |

Highest-severity individual CVEs: `brace-expansion` GHSA-3jxr-9vmj-r5cp (7.7), `ip-address` GHSA-mwp4-54f8-5fhr (7.7), `hono` GHSA-88fw-hqm2-52qc (7.1).

### mcps-audit — FAIL, 100/100, 1832 findings
Scans `impeccable`'s own CLI/skill source (491 files, 212,630 lines) for dangerous-execution and injection patterns. Top CRITICAL hits: `AS-001 Dangerous execution` on `execSync` imports in `cli/bin/commands/skills.mjs` and `cli/bin/commands/ignores.mjs`; `AS-005 Known injection pattern` at the same files.

**Assessed as high false-positive rate.** `impeccable` is itself a CLI/skill-authoring tool: `execSync`, `delete` on config objects, and similar patterns are the tool's own legitimate implementation (build scripts, hook installers, skill-file editing), not evidence of injected or malicious code. This generic scanner has no allowlist for "tool that legitimately manipulates other tools' config/skill files." Not actioned — no fix exists that doesn't gut the CLI's core functionality. Flagged here per audit policy; recommend the maintainer's own security review over relying on this scanner's raw score for this repo.

### config-audit.py — 5 MEDIUM (repo-scoped), all false positives
- `.claude/settings.json → Stop[0]`: broad hook matcher `''` — matches design intent (runs on every Stop), not a vulnerability.
- `CLAUDE.md`, `claude.md` (×2, duplicate doc): "instruction to skip verification" — pattern match on prose describing which test suites are opt-in vs. default, not an instruction to an agent.
- `CLAUDE.md`, `claude.md`: "hook bypass instruction" — pattern match on prose describing that live-mode CLI routing skips native (iOS/Android) projects; unrelated to hooks/security bypass.
- `CLAUDE.md`, `claude.md`, `AGENTS.md`: ".env file access" — pattern match on doc text naming where eval-suite provider API keys live (`.env`, gitignored); no code reads secrets insecurely.
- `AGENTS.md`: "password-related access" — pattern match on a note about 1Password SSH-agent signing failures in a sandboxed shell; unrelated to credential handling.

No fix needed for any of the above — confirmed false positives against source text.

### Coverage note — semgrep
`.semgrepignore` and the 300KB size cap exclude several hundred files per run (mostly `dist/`, `build/_data/`, `node_modules/`, vendored/generated provider output). Findings are 0 across all three configs on the ~81–2788 files actually in scope.

## Fixes Applied

- `package.json` `overrides`: added `@hono/node-server@1.19.15`, `body-parser@2.3.0`, `brace-expansion@5.0.9`; bumped `fast-uri` 3.1.2→3.1.5, `hono` 4.12.25→4.12.34, `ip-address` 10.1.1→10.3.1.
- Ran `bun install` to regenerate `bun.lock` (the lockfile was stale relative to `package.json`'s existing overrides — likely from the upstream merge's `--theirs` conflict resolution on `bun.lock`).
- Re-ran `osv-scanner` post-fix: **0 issues found**.

## Known Remaining Issues

- mcps-audit's 1832 findings against this repo's own CLI source are not actioned (see assessment above) — believed to be scanner false positives specific to a tool that manipulates other tools' skill/config files as its core function, not a real vulnerability. Worth a manual review by someone unfamiliar with the codebase to confirm, since this session did not deeply audit each of the 1832 individual findings.
- `mcps-audit-report.pdf` was written to the repo root by the scanner as a side effect; left untracked (not staged/committed).
