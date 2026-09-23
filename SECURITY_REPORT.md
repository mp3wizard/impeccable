# Security Report — 2026-09-23

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks 8.30.1 (sarif + text, full git history, 2498 commits) | OK | 0 |
| TruffleHog 3.97.5 (git mode) | OK | 0 verified, 28 unverified — all placeholder credential-URL test fixtures |
| Trivy 0.74.0 (fs) | OK | 0 |
| OSV-Scanner 2.6.0 (Cargo.lock, bun.lock) | OK | 42 → 0 after fix |
| Semgrep 1.177.0 (OWASP top ten, TypeScript, secrets) | OK | 0 |
| Bandit | N/A — no `.py` files in target | — |
| config-audit.py (Claude config/hooks/CLAUDE.md audit) | OK | 11 in-scope MEDIUM, 2 LOW, 0 CRITICAL/HIGH |
| skill-audit.sh (canonical `.claude/skills/impeccable/SKILL.md`; 90 further copies are generated per-provider duplicates, not scanned individually) | OK | 5/100 LOW risk, APPROVE |
| skillspector --no-llm (canonical `.claude/skills/impeccable/SKILL.md`) | OK | 0/100 LOW, no issues detected |
| mcp-exfil-scan.sh | OK | 0/100 CLEAN |
| mcps-audit (npx) | OK | flags `browser-bundle/*.js` IIFE/function patterns as CRITICAL — false positives, see below |
| mcp-scan | SKIPPED (opt-in, no user present to consent — unattended scheduled run) |
| skillspector LLM mode | SKIPPED (opt-in, no user present to consent — unattended scheduled run) |
| CodeQL | N/A — no `.github/workflows/codeql.yml` |

## Findings

**OSV-Scanner — 42 → 0:** 42 npm CVEs (`hono` 21, `fast-uri` 7, `brace-expansion` 3, `qs` 3, `ip-address` 2, `body-parser` 1, `@hono/node-server` 1, `devalue` 1). `package.json` already carried `overrides` for most packages from a prior audit, but the new upstream merge introduced `devalue` as a fresh transitive dependency with no override. Added `"devalue": "5.9.2"` to `overrides` and ran `bun install`; re-scanned clean.

**TruffleHog — 0 verified:** all 28 unverified hits are in `tests/detect-url-launch.test.mjs` and `SECURITY_REPORT.md` (this file, from the prior audit's own findings text) — deliberate credential-shaped placeholder URIs (`user:pass@example.com`, `:secret@host.com`) used as fixtures for the project's own URL-credential-detection rule, or descriptions of last week's findings. No real secret.

**config-audit.py — 11 MEDIUM / 2 LOW in-scope, 0 CRITICAL/HIGH:** `CLAUDE.md`/`claude.md`/`AGENTS.md` keyword matches on ordinary developer documentation (e.g. release-gate override text matched "instruction to skip verification"; architecture notes mentioning `.env`/"password" in prose). ~121 additional findings (23 CRITICAL, 14 HIGH, 76 MEDIUM total across the full unfiltered run) are scoped to `~/.claude` globally — the user's global `settings.json` hooks and other installed plugins/skills (caveman, ponytail, anysearch, this scanner's own bundled scripts, etc.), none of which live under the `impeccable` repo. **Scope note:** `config-audit.py` does not constrain itself to the target path argument and always sweeps the global Claude config; this is an APTS Scope Enforcement gap in the bundled script, not an `impeccable` finding — out of scope, not counted here.

**mcps-audit — flags `browser-bundle/*.js` as CRITICAL (AS-001 "Dangerous execution"):** the tool's generic pattern matcher flags ordinary IIFE (`(function(){...})()`) and function-expression syntax in `browser-bundle/00-header.js`, `40-overlay.js` as "dangerous execution". These files are `impeccable`'s own in-page anti-pattern-detection bundle — legitimate browser JS injected into a user's live preview to run detection rules, not attacker payload. Manually reviewed: no obfuscation, no exfiltration, no eval-of-remote-content. False positive from a keyword/pattern heuristic with no code-intent understanding.

**skill-audit.sh — canonical copy only:** the repo intentionally mirrors `SKILL.md` into 91 per-tool provider directories (`.claude/`, `.cursor/`, `.gemini/`, `build/_data/dist/*`, etc. — generated distribution artifacts per `CLAUDE.md`'s "Generated provider output policy", byte-identical content). Scanning one canonical copy (`.claude/skills/impeccable/SKILL.md`) is representative; it scored 5/100 (LOW, APPROVE) — 3 file operations detected, no dangerous patterns, no prompt injection, no credential access.

**skillspector --no-llm — 0/100:** canonical `SKILL.md` scanned clean. 30 `reference_unresolved` ledger notes are the tool being unable to resolve local path-like references (e.g. `scripts/impeccable`) outside the single-file scan scope — informational, not findings.

## Fixes Applied

- Added `"devalue": "5.9.2"` to `package.json` `overrides` (new transitive dependency introduced by this week's upstream merge, unpinned).
- `bun install` — regenerated `bun.lock` against the updated overrides.
- Re-ran OSV-Scanner: **0 issues found** (was 42).

## Known Remaining Issues

- `config-audit.py` and `mcps-audit`'s heuristic pattern matchers produce a high false-positive rate on this repo's legitimate browser-injection code (`browser-bundle/`) and documentation prose. Manually reviewed each category this run; none were actionable. Consider scoping `config-audit.py`'s global-settings sweep behind a flag in the scanner plugin itself (tracked as a scanner-tooling gap, not an `impeccable` issue).
- `mcp-scan` and skillspector LLM mode remain unrun (opt-in, require interactive user consent — this was an unattended scheduled run).
