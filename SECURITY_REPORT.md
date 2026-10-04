# Security Report — 2026-10-04

## Tools Run

| Tool | Status | Finding count |
|---|---|---|
| Gitleaks (git history, 2674 commits) | OK | 0 leaks |
| TruffleHog (git history) | OK | 30 unverified, 0 verified (all `URI` placeholders in `SECURITY_REPORT.md`) |
| Trivy fs | OK | 0 vulnerabilities, 0 secrets |
| OSV-Scanner | OK | 7 (devalue, 4 High / 2 Medium / 1 Low) → 0 after fix |
| Semgrep (owasp-top-ten, 139 files) | OK | 0 |
| Semgrep (secrets, 1657 files) | OK | 0 |
| Bandit | SKIPPED — no `.py` files in repo | — |
| config-audit (Claude config/hooks/skills) | OK | 20 CRITICAL, 14 HIGH, 66 MEDIUM, 19 LOW — all outside repo, heuristic (see Findings) |
| skill-audit (SKILL.md) | OK | 15/100 and 5/100 LOW RISK (`impeccable` skill copies) |
| mcp-exfil-scan | **NOT RUN** — bundled script failed SHA256 integrity check | — |
| mcps-audit | NOT RUN — not run this week (no MCP files in repo) | — |
| CodeQL | SKIPPED — no CodeQL workflow in repo | — |
| skillspector (`--no-llm`) | OK | 1062 heuristic results (533 warning, 529 error), mostly in generated provider copies |
| mcp-scan | SKIPPED — opt-in, sends data to invariantlabs.ai, no interactive user (unattended run) | — |
| skillspector LLM mode | SKIPPED — opt-in, same consent gate | — |

## Findings

### OSV-Scanner — 7 vulnerabilities, 1 package: `devalue` 5.9.2 (direct dependency)

| Advisory | CVSS | Fixed in |
|---|---|---|
| GHSA-4q55-j62x-fr9h | 6.3 | 5.9.3 |
| GHSA-hx4r-w6wj-j8fg | 6.3 | 5.9.3 |
| GHSA-j22f-vq7h-c4qm | 7.5 | 5.9.3 |
| GHSA-mcm9-63f2-9j32 | 8.2 | 5.9.3 |
| GHSA-r9w8-h9r3-54w4 | 8.2 | 5.9.3 |
| GHSA-wf3x-273g-mvxv | 2.3 | 5.9.3 |
| GHSA-x5rw-q4pp-hg5g | 8.2 | 5.9.3 |

Direct dependency at `package.json:88`. Fixed (see below). Re-scan: No issues found.

### TruffleHog — 30 unverified, 0 verified

All hits are `URI` detector matches on placeholder strings (`http://:secret@host.com`, `https://user:pass@example.com`) in `SECURITY_REPORT.md`. Not real credentials. Not actioned.

### Gitleaks, Trivy, Semgrep (OWASP / secrets), Bandit

Clean. Bandit N/A (no Python).

### config-audit — 20 CRITICAL / 14 HIGH, all outside this repo

Every CRITICAL hit is in an installed plugin cache (`plugin:caveman/...`, `plugin:ponytail/...`, `plugin:impeccable/...`, `plugin:claude-code-security-plugins/...`, `skill:anysearch/...`). The rule is a co-occurrence heuristic: a file that contains base64, `curl`, `eval`, or `ncat` *and* mentions `.env` or `~/.ssh` is flagged. Examples: `generate-image.mjs`, `binary-installer.generated.mjs`, and this scanner's own `mcp-exfil-scan.sh`. No data-flow evidence was shown. Not actioned in this repo. Worth a manual look at `anysearch_cli.sh` (curl + `.env`) since it is the only CRITICAL that is a shell script calling curl with command substitution. Its own reviewer should confirm.

### skill-audit — impeccable SKILL.md

15/100 and 5/100, LOW RISK. No injection, no credential access.

### skillspector (`--no-llm`) — 1062 heuristic results

Concentrated in the generated provider copies (`.agent/`, `.agents/`, `.claude/`, etc.): `MP3`, `AR2`, `P2`, `SC9` rules. The `SC9` hits are the launcher and browser-JS scripts that the skill ships on purpose (`scripts/impeccable`, `live-browser-*.js`). The rule flags them as executable payload. Triage needed, not a confirmed issue. Not actioned this run.

### mcp-exfil-scan — NOT RUN

`scripts/mcp-exfil-scan.sh` in the bundled security-scanner plugin failed its SHA256 integrity check (`shasum -c SHA256SUMS`: 1 mismatch, `mcp-exfil-scan.sh: FAILED`). Per the scanner's own rule, a mismatched script is not executed. This run therefore has no MCP exfiltration coverage. **Action needed:** reinstall `claude-code-security-plugins` from a trusted release, then re-run this check. This was an intentional skip, not a tool failure.

## Fixes Applied

- `package.json:88`: `devalue` `5.9.2` → `5.9.3` (direct dependency; fixes all 7 OSV advisories).
- `bun install` ran. Two packages reinstalled. `bun.lock` was updated as part of this.
- Re-ran OSV-Scanner after fix: **No issues found**.

## Known Remaining Issues

- **mcp-exfil-scan not run** (bundled script checksum mismatch). Requires plugin reinstall.
- config-audit CRITICAL/HIGH hits are heuristic and sit in other plugins' caches. Need manual triage, especially `anysearch_cli.sh`.
- skillspector's 1062 results are unreviewed. The `SC9` executable-payload hits on shipped launcher scripts are expected for this product.
- `mcp-scan` and skillspector LLM mode unrun (opt-in, need interactive consent; unattended run).
- CodeQL not configured in this repo.
