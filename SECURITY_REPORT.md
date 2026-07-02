# Security Report — 2026-07-02

**Target:** `/Users/mp3wizard/Public/Claude skill/impeccable`
**Scanned at:** 2026-07-02T00:00:00Z
**Git HEAD:** post-merge (11 upstream commits)

## Tools Run

| Tool | Status | Finding count |
|------|--------|---------------|
| scan.py (Claude Code security audit) | ✅ Complete | 54 raw (all false positives — see below) |
| Dependency review (package.json) | ✅ Complete | 0 CVEs |

## Findings

### CRITICAL (7) — All False Positives

| Finding | File | Verdict |
|---------|------|---------|
| base64 + .env reference | `skill:skill-security-auditor/SKILL.md` | FP: security scanner skill referencing patterns it scans for |
| base64 + .env reference | `plugin:claude-code-security-plugins/.../mcp-exfil-scan.sh` | FP: exfiltration scanner itself |
| base64 + SSH reference | `plugin:claude-code-security-plugins/.../skill-audit.sh` | FP: security audit tool itself |
| ncat + SSH reference | `plugin:claude-code-security-plugins/.../config-audit.py` | FP: security audit tool itself |
| curl + .env (caveman init.js) | `plugin:caveman/.../caveman-init.js` | FP: globally installed caveman plugin installer, not in impeccable repo |
| curl + .env (caveman uninstall.sh) | `plugin:caveman/.../uninstall.sh` | FP: globally installed caveman plugin uninstaller |
| curl + .env (caveman install.sh) | `plugin:caveman/.../install.sh` | FP: globally installed caveman plugin installer |

### HIGH (11) — All False Positives / Benign

| Finding | File | Verdict |
|---------|------|---------|
| curl to external URL (7 hooks) | `~/.claude/settings.json` | Benign: cc-beeper localhost notification system (curl to 127.0.0.1) |
| netcat connection | `skill:optimize/SKILL.md` | FP: netcat mentioned in docs as network diagnostic tool |
| curl to external URL | `skill:qa/SKILL.md` | FP: curl used to test external web apps (skill's intended function) |
| mkfs/dd patterns | `plugin:claude-plugins-official/.../validate-bash.sh` | FP: validation script *blocking* these patterns, not executing them |

### MEDIUM (28) — All False Positives / Benign

Broad matchers in session hooks (cc-beeper, codex, caveman, pordee, agent-skills): all intentionally installed by the user. Sensitive file references in skills (playwright-cli, taste, handoff, notebooklm-cli): these skills legitimately interact with browser cookies/credentials as part of their documented function. `.env` references in `CLAUDE.md` and `claude.md` are documentation text, not code.

### LOW (8)

Standard hooks-configuration informational findings. All hooks are intentional user configurations.

## Fixes Applied

None. All findings are false positives or benign. No CVEs identified in direct or transitive dependencies.

## Known Remaining Issues

None.
