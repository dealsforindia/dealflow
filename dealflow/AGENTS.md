# DealFlow Ecosystem Agent Instructions

## Scope & Operating Context
Diagnostic tools, architecture topology, healing scripts, and orchestration for the DealFlow ecosystem (`indiadealhunts.me`, edge workers, and backend services).

## Security Audit & Skills
- Cloudflare's `security-audit` skill is installed at `.agents/skills/security-audit/SKILL.md`.
- Use this skill for full-system vulnerability scans, data lifecycle tracking, API trust boundary checks, and coverage ledgers.
- Standard audit ledger and findings scripts:
  - `validate-coverage-ledger.cjs`
  - `validate-findings.cjs`
- Output directory defaults to `~/security-audit-skill/dealflow/run-<N>`.

