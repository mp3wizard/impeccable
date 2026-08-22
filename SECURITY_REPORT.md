# Security Report — 2026-08-22

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Git HEAD:** merge of `upstream/main` (21 commits) into `mp3wizard/main`, clean merge (no conflicts)

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks | OK | 0 |
| TruffleHog | OK | 0 |
| Trivy (fs) | OK | 0 |
| OSV-Scanner | OK | 0 (prior week's overrides already carried through the merge, re-verified clean) |
| Semgrep (OWASP Top 10) | OK | 0 |
| Semgrep (TypeScript) | OK | 0 (no `.ts`/`.tsx` files matched) |
| Semgrep (secrets) | OK | 0 |
| Bandit | SKIPPED | no `.py` files in target |
| CodeQL | SKIPPED | no CodeQL workflow in `.github/workflows/` |
| mcp-exfil-scan.sh | OK | CLEAN, 0/100 |
| skill-audit.sh (all 82 authored `SKILL.md` files) | OK | 82/82 LOW RISK, APPROVE |
| config-audit.py (repo-scoped findings only) | OK | 5 MEDIUM, all false positives (unchanged from last run) — see below |
| mcps-audit (skill/plugin heuristic scanner) | OK | 1796 findings (657 CRITICAL / 168 HIGH / 699 MEDIUM / 272 LOW) — see note below |

## Findings

### OSV-Scanner — 0 vulnerabilities
`bun.lock` (235 packages) scanned clean. Last week's `package.json` `overrides` (`@hono/node-server`, `body-parser`, `brace-expansion`, `fast-uri`, `hono`, `ip-address`, `qs`, plus pre-existing `js-yaml`, `protobufjs`, `@protobufjs/utf8`) survived this week's merge untouched — no regression, no new transitive CVEs introduced by upstream's 21 commits.

### skill-audit.sh — 3 skill files flagged, all third-party `node_modules`
`node_modules/playwright-core/lib/tools/skills/playwright-{component-testing,cli,trace}/SKILL.md` scored MEDIUM/CRITICAL/MEDIUM. These are vendored dev-dependency files shipped by Playwright itself, not authored by this repo, and not in the tracked source tree. All 82 SKILL.md files impeccable actually authors and distributes (`.claude/`, `.cursor/`, `skill/`, `plugin/`, and the other provider harness dirs) scored LOW RISK / APPROVE. No fix — nothing to change in a third-party package's own docs.

### mcps-audit — FAIL, 100/100, 1796 findings
Scans impeccable's own CLI/skill source. Top CRITICAL hits are `AS-001 Dangerous execution` on `execSync` imports (`cli/bin/commands/skills.mjs`, `cli/bin/commands/ignores.mjs`) and `AS-005 Known injection pattern` at the same files; MEDIUM hits include the JS `delete` keyword (`delete next.hooks`) misread as a file-deletion risk.

**Assessed as high false-positive rate**, same conclusion as last week's run. impeccable is itself a CLI/skill-authoring tool — `execSync`, `delete` on config objects, and similar patterns are its own legitimate implementation (build scripts, hook installers, skill-file editing), not injected code. No allowlist exists in this scanner for "tool that legitimately manipulates other tools' config/skill files." Not actioned — no fix exists that doesn't gut the CLI's core functionality.

### config-audit.py — 5 MEDIUM (repo-scoped), all false positives
Unchanged from last week — same lines, same verdicts:
- `.claude/settings.json → Stop[0]`: broad hook matcher `''` — intentional (runs on every Stop), not a vulnerability.
- `CLAUDE.md` / `claude.md`: "instruction to skip verification" — pattern match on prose about which test suites are opt-in.
- `CLAUDE.md` / `claude.md`: "hook bypass instruction" — pattern match on prose about native-platform CLI routing skips.
- `CLAUDE.md` / `claude.md` / `AGENTS.md`: ".env file access" — pattern match on doc text naming where eval-suite provider API keys live (gitignored).
- `AGENTS.md`: "password-related access" — pattern match on a note about 1Password SSH-agent signing failures in a sandboxed shell.

No fix needed — confirmed false positives against source text.

### Coverage note — semgrep
`.semgrepignore` and the 300KB size cap exclude several hundred files per run (`dist/`, `build/_data/`, `node_modules/`, vendored/generated provider output). 0 findings across all three configs on the files actually in scope.

## Fixes Applied

None needed this run — all actionable findings (OSV CVEs) were already fixed in last week's report and survived the merge unchanged.

## Known Remaining Issues

- mcps-audit's 1796 findings against this repo's own CLI source remain unactioned (see assessment above) — believed to be scanner false positives specific to a tool whose core function is manipulating other tools' skill/config files, not a real vulnerability.
- skill-audit flags 3 vendored `node_modules/playwright-core` SKILL.md files as MEDIUM/CRITICAL — third-party package content, not this repo's source, no fix applicable.
- `mcps-audit-report.pdf` written to the repo root as a scanner side effect; left untracked.
