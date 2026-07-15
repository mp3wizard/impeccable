# Security Report — 2026-07-15

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  **Scanned at:** 2026-07-15T10:05:06+07:00  **Git HEAD:** `994509ea`
**Tools run:** Gitleaks, TruffleHog, Trivy, OSV-Scanner, Semgrep (OWASP/TypeScript/secrets), security-audit (config-audit.py), skill-audit, mcp-exfil-scan, mcps-audit  **Tools skipped:** Bandit (no `.py` files), CodeQL (no workflow in repo), mcp-scan/skillspector-LLM (opt-in, not run — unattended scheduled run, no user available to consent)

**New upstream merged this cycle:** 3 commits from `origin/main` — Fix light-mode command demo contrast (#370), chore(deps) bun-minor-and-patch group bump ×10 (#368), Base sheriff stale clock on blocker age (#364).

## Tools Run

| Tool | Status | Finding count |
|------|--------|----------------|
| Gitleaks   | OK      | 0 |
| Bandit     | SKIPPED | no `.py` files in repo |
| Semgrep (OWASP)     | OK | 0 |
| Semgrep (TypeScript) | OK | 0 |
| Semgrep (secrets)    | OK | 0 |
| Trivy      | OK      | 0 |
| TruffleHog | OK      | 0 |
| OSV-Scanner | OK     | 0 |
| CodeQL     | N/A     | no `.github/workflows/codeql.yml` in repo |
| security-audit (config-audit.py) | OK | repo-scoped findings: 3 MEDIUM (informational, see below) |
| skill-audit | OK | 0/100–35/100 across all copies, MEDIUM ceiling, no HIGH/CRITICAL |
| mcp-exfil-scan | OK | 0/100 — CLEAN |
| mcps-audit | OK | 1360 findings (415 CRITICAL, 151 HIGH, 564 MEDIUM, 230 LOW) — assessed as heuristic false positives, see below |

## Findings

No CVEs, no secrets, no dependency vulnerabilities. Repo-scoped config-audit MEDIUM findings (informational, same as prior cycles):
- `CLAUDE.md` / `claude.md` — "hook bypass instruction" pattern match on prose describing that live mode/`detect.mjs` skip native projects (a routing rule, not a bypass); ".env file access" match on the documented, gitignored evals-repo auth setup.
- `.claude/settings.json` — `PostToolUse` hook present (expected repo tooling, the bundled UI-change detector).

skill-audit: 65 `SKILL.md` copies scanned (source + per-IDE generated). MEDIUM-risk copies are duplicated instances of skills (`taste`, `wizard`, `handoff`, `notebooklm-cli`, `migrate-to-shoehorn`) whose descriptions legitimately mention credentials/cookies/`.env` as part of their function. No injection payload identified.

mcps-audit: verdict FAIL, 100/100 risk score, 1360 findings across 436 files/150,702 lines — unchanged shape from prior cycles. Sampled CRITICAL hits: `cli/bin/commands/skills.mjs:11` (`execSync` import — legitimate use by the CLI's own skill-installer, no unsanitized user input reaches it), `cli/bin/commands/skills.mjs:1315-1318` ("known injection pattern" / "high-risk permission pattern" — flagged on plain `delete next.hooks`/`delete next.description` object-property cleanup), `cli/bin/commands/ignores.mjs:142` ("known injection pattern" — flagged on `.join()` string formatting for CLI output). The scanner's generic pattern matcher over-triggers on common JS idioms (`execSync`, `delete obj.prop`, `.join()`), amplified by the ~436 scanned files including a dozen duplicated per-IDE copies of the same `skill/impeccable/` source tree. No exploitable finding identified in the sampled set.

## Fixes Applied

None — no in-scope finding matched a fixable category (dependency CVE or hook/config issue). `bun install` run after merge to sync `bun.lock` (10 deps updated via upstream's bun-minor-and-patch bump); no CVEs introduced.

## Known Remaining Issues

- 31 of 65 scanned `SKILL.md` copies score MEDIUM (25-35/100) under skill-audit purely because their descriptions legitimately mention credential/cookie/`.env` access as part of what the skill does. Not a defect; flagged for awareness only (recurring across cycles).
- mcps-audit's 1360 findings remain formally open but assessed as non-actionable heuristic false positives (see above), consistent across three consecutive cycles now. Recommend excluding `dist/`, `build/`, and duplicated per-IDE `skills/impeccable/` copies from future mcps-audit runs to cut noise.
- `mcps-audit-report.pdf` regenerated at repo root by this run's `npx mcps-audit` invocation (untracked, matches prior-cycle behavior).
