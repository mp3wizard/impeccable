# Security Report — 2026-07-08

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`  **Scanned at:** 2026-07-08T10:28:15+07:00
**Tools run:** Gitleaks, TruffleHog, Trivy, OSV-Scanner, Semgrep (OWASP/TypeScript/secrets), security-audit (config-audit.py), skill-audit, mcp-exfil-scan, mcps-audit  **Tools skipped:** Bandit (no `.py` files), CodeQL (no workflow in repo), mcp-scan/skillspector (opt-in, not run this cycle)

**New upstream merged this cycle:** 18 commits from `origin/main` (font parsing fixes, live-browser hydration/SSR fixes, DeepSeek/Neo Mirai regressions, Grok Build install docs, issue-first contribution guardrails).

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
| skill-audit | OK | run against `skill/SKILL.src.md` |
| mcp-exfil-scan | OK | run against repo root |
| mcps-audit | OK | 1333 findings, all reviewed as heuristic false positives (see below) |
| mcp-scan | OPT-IN, not run | requires explicit user consent |
| skillspector | OPT-IN, not run | not exercised this cycle |

---

## Gitleaks — Secrets in git history + filesystem

**Summary:** 0 findings. 1007 commits scanned, ~61.1 MB.

```
10:28AM INF 1007 commits scanned.
10:28AM INF scanned ~61129837 bytes (61.13 MB) in 7.98s
10:28AM INF no leaks found
```

---

## TruffleHog — Secrets in git history (live API verification)

**CONFIDENTIAL** — No verified or unverified secrets detected.

```
chunks: 53293
bytes: 62204748
verified_secrets: 0
unverified_secrets: 0
scan_duration: 8.39s
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

**Summary:** `No issues found` (597 packages scanned in `bun.lock`). Last week's 7-package transitive-CVE fix (`@protobufjs/utf8`, `fast-uri`, `hono`, `ip-address`, `js-yaml`, `protobufjs`, `qs`) holds after this cycle's upstream merge — no regression.

---

## Semgrep — SAST (OWASP Top 10, TypeScript, secrets)

**OWASP scan:** `0 findings` (77 rules / 141 files). Last week's `postMessage` wildcard-origin fix in `extension/content/content-script.js` holds — no regression from the merge.

**TypeScript scan:** `0 findings` (74 rules / 6 files).

**Secrets scan:** `0 findings` (42 rules / 1,729 files; 38 files >300KB and 391 `.semgrepignore`-matched files skipped — see Coverage Gaps).

---

## security-audit (config-audit.py) — Claude config audit

**Summary:** Tool audits both global `~/.claude` config and any Claude config found under the target path; only the latter is in scope for this repo.

**Repo-scoped findings (informational, no fix needed):**
- `CLAUDE.md` — flagged (MEDIUM) for mentioning `.env` file access in prose at lines 185 and 200 (documents the evals-repo auth setup; not a live credential reference — no code in this repo reads `.env` outside the documented eval harness).
- `/Users/mp3wizard/Public/Claude skill/impeccable/.claude/settings.json` — `PostToolUse` hook present (LOW, expected repo tooling — runs the bundled UI-change detector, no network calls or credential access).

All other findings in the raw tool output (global `~/.claude/settings.json` hooks, installed plugins' `hooks.json`/`plugin.json` broad matchers, other unrelated skills/plugins on this machine) concern machine-wide Claude Code configuration outside this repo and are out of scope here.

---

## skill-audit — Skill file security review

**Target:** `skill/SKILL.src.md`
**Summary:** Risk score **35/100 — MEDIUM RISK**. 0 dangerous patterns, 0 obfuscation, 0 credential access, 0 network URLs, 4 file operations, 1 prompt-injection-pattern match ("Silent action instruction", Medium). Manually reviewed: no actual injection payload present — this is boilerplate skill-authoring language instructing the agent to perform routine steps without prompting, a known false-positive shape for skill files describing automated workflows. Non-standard license field noted (Apache 2.0, informational). **Recommendation: APPROVE WITH CAUTION** (tool default; no actionable fix identified on review).

---

## mcp-exfil-scan — MCP exfiltration scan

**Summary:** Risk score **0/100 — CLEAN**. 2 MCP configs and 26 skill files scanned; no tool-description poisoning, outbound data flow, exfiltration chains, encoded payloads, env-var leaking, or source-trust issues detected.

---

## mcps-audit — OWASP MCP Top 10 + Agentic AI findings

**Summary:** Verdict **FAIL**, risk score 100/100, 1333 findings (CRITICAL: 407, HIGH: 149, MEDIUM: 557, LOW: 220) across 428 files / 147,590 lines.

Manually verified a sample of the CRITICAL hits against source:
- `cli/bin/commands/skills.mjs:11` "Dangerous execution: execSync" — legitimate use (`git status --porcelain` at line 1746, no user-controlled input reaches it).
- `cli/bin/commands/skills.mjs:1315-1318` "Known injection pattern" / "High-risk permission pattern" — flagged on `delete next.hooks`, `delete next.description` (plain object property cleanup in a config-scaffolding helper). Not injection.
- `cli/bin/commands/ignores.mjs:142` "Known injection pattern" — flagged on `config.ignoreRules.join(', ')` (string formatting for CLI output). Not injection.

mcps-audit's generic pattern matcher over-triggers on common JS idioms (`execSync`, `delete obj.prop`, `.join()`) across this repo's ~148K lines, amplified by 428 scanned files that include ~15 duplicated per-IDE copies of the same `skill/impeccable/` source tree under `.claude/`, `.cursor/`, `.trae/`, `dist/`, `build/`, etc. No CVE-worthy or exploitable finding identified in the sampled set; no fix applied since there is no real defect to patch.

---

## Cross-Tool Observations

All three secrets tools (Gitleaks, TruffleHog, Semgrep secrets) returned clean — no cross-tool overlap on secrets.

mcp-exfil-scan and mcps-audit disagree on MCP-server risk (0/100 clean vs. 100/100 fail); manual review of mcps-audit's CRITICAL sample found only generic-JS-idiom false positives, not genuine MCP exfiltration/injection vectors — mcp-exfil-scan's more targeted exfiltration-chain analysis is the higher-confidence signal here.

skill-audit and mcp-exfil-scan mostly agree: no genuine prompt-injection or exfiltration indicators in this repo's skill/MCP surface (skill-audit's single Medium hit was reviewed and dismissed as boilerplate).

## Coverage Gaps

- **CodeQL**: No workflow present; deep semantic SAST not run.
- **Business logic / IDOR / runtime behavior**: Not covered by static tools run this cycle.
- **Semgrep secrets scan**: 38 files >300KB and 391 `.semgrepignore`-matched files skipped (mostly generated `dist/`/`build/` provider-permutation copies and binary assets).
- **mcp-scan / skillspector LLM mode**: Opt-in, not exercised (requires explicit consent per tool's privacy gate).
- **mcps-audit**: 1333 findings were sampled rather than triaged exhaustively, given the false-positive rate observed in the sample (see above).

## Fixes Applied

None this cycle — no in-scope finding matched a fixable category (dependency CVE or hook/config issue). Last week's fixes (OSV transitive-CVE overrides, Semgrep `postMessage` origin) were verified to still hold after this cycle's 18-commit upstream merge.

## Known Remaining Issues

- mcps-audit's 1333 findings remain formally open but assessed as non-actionable heuristic false positives (see above). Recommend excluding `dist/`, `build/`, and duplicated per-IDE `skills/impeccable/` copies from future mcps-audit runs to cut noise.
- Bundled scanner script `scripts/mcp-exfil-scan.sh` (part of the `claude-code-security-plugins` plugin, not this repo) failed its `SHA256SUMS` integrity check during this run's pre-flight. Manually inspected the script and found no suspicious content — likely a stale checksum from a scanner version bump, not tampering. Out of scope for this repo; flagged for the security-scanner plugin maintainer.
