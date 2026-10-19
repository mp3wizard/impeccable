# Security Report — 2026-10-19
## Tools Run
| Tool | Status | Finding count |
|---|---|---|
| Gitleaks | run | 0 |
| TruffleHog | run | 16 unverified, 0 verified |
| Semgrep (OWASP + secrets) | run | 3 (postMessage '*' in test fixtures) |
| Trivy | run | 0 |
| OSV-Scanner | run | 3 (zip crate) |
| mcp-exfil-scan | run | 0 (score 0/100) |
| config-audit | run | host ~/.claude scope leak, not target |
| skillspector (--no-llm) | run | pattern noise, score 100 on prose/test content |
Opt-ins (mcp-scan, skillspector LLM, Jev) not used.
## Findings
- RUSTSEC-2026-0367 (CVSS 7.3), RUSTSEC-2026-0368, RUSTSEC-2026-0369 (CVSS 9.1): `zip` 2.4.2 in Cargo.lock, fixed in 9.0.0.
- Semgrep: 3 postMessage wildcard-origin hits in test fixtures.
## Fixes Applied
- Bumped `zip` 2 -> 9 in `crates/skills/Cargo.toml`; adapted `entry.name()` Result in `bundle.rs`; `cargo test -p impeccable-skills` passes.
## Known Remaining Issues
- TruffleHog unverified hits and skillspector prose hits: false positives, not suppressed.
- Semgrep postMessage hits are test fixtures.
