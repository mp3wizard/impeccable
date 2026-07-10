# Security Report — 2026-07-10

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  **Scanned at:** 2026-07-10T10:05:06+07:00
**Tools run:** Gitleaks, TruffleHog, Trivy, OSV-Scanner, Semgrep (OWASP/TypeScript/secrets), security-audit (config-audit.py), skill-audit, mcp-exfil-scan, mcps-audit  **Tools skipped:** Bandit (no `.py` files), CodeQL (no workflow in repo), mcp-scan/skillspector (opt-in, not run — unattended scheduled run, no user available to consent)

**New upstream merged this cycle:** 11 commits from `origin/main` — OpenAI plugin submission bundle (#363), init flow now captures positioning/conversion/proof context (#315), Node 22 CLI install fix (#361), sheriff stale-classification softening (#360), docs UI polish (#358), mechanical pre-scan for typeset/layout (#345), native-project routing for audit/adapt command variants (#357), plus generated-provider-output syncs.

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
| skill-audit | OK | run against all 65 `SKILL.md` files found under the repo (incl. per-IDE generated copies) |
| mcp-exfil-scan | OK | run against repo root |
| mcps-audit | OK | 1360 findings, sampled and assessed as heuristic false positives (see below) |
| mcp-scan | OPT-IN, not run | requires explicit user consent — unattended run |
| skillspector | OPT-IN, not run | requires explicit user consent — unattended run |

---

## Gitleaks — Secrets in git history + filesystem

**Summary:** 0 findings. 1027 commits scanned, ~62.14 MB.

```
10:05AM INF 1027 commits scanned.
10:05AM INF scanned ~62143305 bytes (62.14 MB) in 8.3s
10:05AM INF no leaks found
```

---

## TruffleHog — Secrets in git history (live API verification)

**CONFIDENTIAL** — No verified or unverified secrets detected.

```
chunks: 56061
bytes: 63257248
verified_secrets: 0
unverified_secrets: 0
scan_duration: 6.59s
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

**Summary:** `No issues found` (597 packages scanned in `bun.lock`). No regression from this cycle's 11-commit upstream merge.

---

## Semgrep — SAST (OWASP Top 10, TypeScript, secrets)

**OWASP scan:** `0 findings` (77 rules / 143 files; 14 files >0.3MB and 394 `.semgrepignore`-matched files skipped).

**TypeScript scan:** `0 findings` (74 rules / 6 files).

**Secrets scan:** `0 findings` (42 rules / 1,714 files; 38 files >0.3MB and 394 `.semgrepignore`-matched files skipped — see Coverage Gaps).

---

## security-audit (config-audit.py) — Claude config audit

**Summary:** Tool audits both global `~/.claude` config and any Claude config found under the target path; only the latter is in scope for this repo.

**Repo-scoped findings (informational, no fix needed):**
- `CLAUDE.md` / `claude.md` — flagged (MEDIUM) for a "hook bypass instruction" match (the CLAUDE.md prose describing that live mode / `detect.mjs` / the design hook skip native projects — a routing rule, not a security bypass) and for mentioning `.env` file access (documents the private evals-repo auth setup at `~/code/impeccable-evals/.env`; no code in this repo reads `.env` outside that documented, gitignored evals harness).
- `/Users/mp3wizard/Public/Claude skill/impeccable/.claude/settings.json` — `PostToolUse` hook present (LOW, expected repo tooling — runs the bundled UI-change detector, no network calls or credential access).

All other findings in the raw tool output (global `~/.claude/settings.json` hooks, installed plugins' `hooks.json`/`plugin.json` broad matchers, other unrelated skills/plugins on this machine) concern machine-wide Claude Code configuration outside this repo and are out of scope here.

---

## skill-audit — Skill file security review

**Target:** all 65 `SKILL.md` files under the repo (source `skill/` tree plus per-IDE generated copies under `.claude/`, `.cursor/`, `.trae/`, `.gemini/`, `.pi/`, `.qoder/`, `.rovodev/`, `.opencode/`, `.trae-cn/`, `dist/`, etc.).

**Summary:** Score distribution — 6× 0/100, 10× 5/100, 18× 15/100, 15× 25/100, 16× 35/100. Verdicts: 34 LOW RISK, 31 MEDIUM RISK. **No HIGH or CRITICAL verdict across any of the 65 files.** The MEDIUM-risk files are duplicated copies of the same handful of source skills (`taste`, `wizard`, `handoff`, `claude-handoff`, `notebooklm-cli`, `migrate-to-shoehorn`) that reference credentials/cookies/`.env` in their own prose (e.g. "captures cookie/browser data", "reads `.env`") because that is literally what those skills legitimately do (browser-taste extraction, NotebookLM auth, wizard-driven `.env` setup) — reviewed as boilerplate description language, not an injection payload or a live secret reference. **Recommendation: no actionable fix identified.**

---

## mcp-exfil-scan — MCP exfiltration scan

**Summary:** Risk score **0/100 — CLEAN**. 2 MCP configs and 26 skill files scanned; no tool-description poisoning, outbound data flow, exfiltration chains, encoded payloads, env-var leaking, or source-trust issues detected.

---

## mcps-audit — OWASP MCP Top 10 + Agentic AI findings

**Summary:** Verdict **FAIL**, risk score 100/100, 1360 findings (CRITICAL: 415, HIGH: 151, MEDIUM: 564, LOW: 230) across 436 files / 150,302 lines.

Manually verified a sample of the CRITICAL hits against source:
- `cli/bin/commands/skills.mjs:11` "Dangerous execution: `import { execSync } from 'node:child_process'`" — legitimate use; this is the CLI's own skill-installer, which needs to shell out (e.g. `git status --porcelain`) as its core function. No user-controlled string reaches `execSync` unsanitized.
- `cli/bin/commands/skills.mjs:1315-1318` "Known injection pattern" / "High-risk permission pattern" — flagged on `delete next.hooks`, `delete next.description`, `delete next.version` (plain JS object-property cleanup in a config-scaffolding helper). Not injection; the scanner's heuristic matches the `delete` keyword literally.
- `cli/bin/commands/ignores.mjs:142` "Known injection pattern" — flagged on `config.ignoreRules.join(', ')` (string formatting for CLI output). Not injection.

mcps-audit's generic pattern matcher over-triggers on common JS idioms (`execSync`, `delete obj.prop`, `.join()`) across this repo's ~150K lines, amplified by 436 scanned files that include roughly a dozen duplicated per-IDE copies of the same `skill/impeccable/` source tree under `.claude/`, `.cursor/`, `.trae/`, `dist/`, `build/`, etc. No CVE-worthy or exploitable finding identified in the sampled set; no fix applied since there is no real defect to patch. Consistent with last cycle's assessment (1333 findings, same false-positive shape).

---

## Cross-Tool Observations

All three secrets tools (Gitleaks, TruffleHog, Semgrep secrets) returned clean — no cross-tool overlap on secrets.

mcp-exfil-scan and mcps-audit again disagree on MCP-server risk (0/100 clean vs. 100/100 fail); manual review of mcps-audit's CRITICAL sample found only generic-JS-idiom false positives, not genuine MCP exfiltration/injection vectors — mcp-exfil-scan's more targeted exfiltration-chain analysis remains the higher-confidence signal here.

skill-audit and mcp-exfil-scan agree: no genuine prompt-injection or exfiltration indicators in this repo's skill/MCP surface (skill-audit's MEDIUM hits were reviewed and dismissed as legitimate feature descriptions, not injection payloads).

## Coverage Gaps

- **CodeQL**: No workflow present; deep semantic SAST not run.
- **Business logic / IDOR / runtime behavior**: Not covered by static tools run this cycle.
- **Semgrep OWASP/secrets scans**: 14 and 38 files respectively >0.3MB, plus 394 `.semgrepignore`-matched files, skipped each run (mostly generated `dist/`/`build/` provider-permutation copies and binary assets).
- **mcp-scan / skillspector LLM mode**: Opt-in, not exercised — this is an unattended scheduled run with no user present to grant the required consent.
- **mcps-audit**: 1360 findings were sampled rather than triaged exhaustively, given the false-positive rate observed in the sample (see above).

## Fixes Applied

None this cycle — no in-scope finding matched a fixable category (dependency CVE or hook/config issue). No dependency CVEs found (OSV-Scanner and Trivy both clean); no secrets found; no genuinely exploitable config/hook issue identified.

## Known Remaining Issues

- mcps-audit's 1360 findings remain formally open but assessed as non-actionable heuristic false positives (see above). Recommend excluding `dist/`, `build/`, and duplicated per-IDE `skills/impeccable/` copies from future mcps-audit runs to cut noise — this has now been flagged across two consecutive cycles.
- 31 of 65 scanned `SKILL.md` files score MEDIUM (25-35/100) under skill-audit purely because their descriptions legitimately mention credentials/cookies/`.env` access as part of what the skill does (browser taste-capture, NotebookLM auth, `.env`-driven wizards). Not a defect; flagged for awareness only.
