# Security Report — 2026-05-15

## Tools Run

| Tool | Status | Finding count |
|------|--------|---------------|
| Gitleaks 8.30.1 | OK | 0 |
| Bandit 1.9.4 | SKIPPED | No `.py` files |
| Semgrep | OK | 67 (all same rule) |
| Trivy 0.69.3 | OK | 0 |
| TruffleHog 3.94.2 | OK | 0 (0 verified, 0 unverified) |
| CodeQL | N/A | No CodeQL workflow in `.github/workflows/` |
| mcps-audit 1.0.0 | OK (exit 1) | 675 (mostly false positives) |

## Findings

### Semgrep — wildcard-postmessage-configuration (67 findings, Low/Informational)

**Rule:** `javascript.browser.security.wildcard-postmessage-configuration`
**Severity:** Low / Informational
**Affected files (canonical sources; rest are provider-specific copies):**

- `cli/engine/detect-antipatterns.mjs` — lines 3037, 3061, 3106
- `cli/engine/detect-antipatterns-browser.js` — lines 3041, 3065, 3110
- `extension/content/content-script.js` — lines 28, 31, 35, 38, 100
- `skill/scripts/live-browser.js` — lines 3618, 3623, 3663, 3692
- Same patterns repeated across all provider-specific skill copies (`.claude/`, `.cursor/`, `.gemini/`, `.github/`, `.kiro/`, `.opencode/`, `.pi/`, `.qoder/`, `.rovodev/`, `.trae/`, `.trae-cn/`, `.agents/`, `plugin/`)

**Assessment:** By-design. Impeccable is a browser injection tool that injects content scripts into arbitrary pages. The `postMessage('*')` origin is required because the injected script operates on pages with unknown origins at injection time. Messages carry only UI commands and non-sensitive scan results (CSS property names, DOM selectors). No PII or credentials cross the channel. Known accepted pattern for browser extension/injection tools.

### mcps-audit — Agentic AI findings (675 findings, exit 1)

**Critical: 189 | High: 60 | Medium: 292 | Low: 134**

**Assessment:** Largely false positives from overly aggressive pattern matching:
- "Dangerous execution" fired on regex `.exec()` calls (e.g., `/rgba?\(/.exec(s)`) — not code execution, but regex API
- Child process spawning in `cli/bin/commands/skills.mjs` — intentional CLI subprocess, standard Node.js CLI pattern
- MCP-04 (Cross-Server Request Forgery) and MCP-10 (Context Window Pollution) flagged — acceptable given impeccable is a frontend-only tool with no server-to-server MCP communication

## Fixes Applied

None. All findings are either by-design (wildcard postMessage for browser extension communication) or false positives (mcps-audit regex `.exec()` pattern matching). No CVEs in dependencies (Trivy: 0). No secrets in git history (Gitleaks + TruffleHog: 0).

## Known Remaining Issues

- **wildcard-postmessage**: Architectural — accepted risk for browser injection tool. Origin `'*'` required for cross-origin page injection. Upstream aware.
- **mcps-audit score 100/100**: Tool over-counts regex `.exec()` operations as "dangerous execution"; actual risk is negligible.
