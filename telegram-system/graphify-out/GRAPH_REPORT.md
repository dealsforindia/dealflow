# Graph Report - telegram-system  (2026-11-05)

## Corpus Check
- 47 files · ~76,179 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .toml 1)

## Summary
- 639 nodes · 982 edges · 40 communities (38 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bc2a4046`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- agent/skills/security-audit/validate-coverage-ledger.cjs
- .agents/skills/security-audit/validate-coverage-ledger.cjs
- agent/skills/security-audit/validate-findings.cjs
- .agents/skills/security-audit/validate-findings.cjs
- Vulnerability Hunting
- Vulnerability Hunting
- .agents/skills/security-audit/validate-findings.test.cjs
- agent/skills/security-audit/validate-findings.test.cjs
- Security Audit
- Security Audit
- compilerOptions
- package.json
- Client-Side and Browser Hunting
- preflightJsonText
- HTTP-Protocol and Authentication Hunting
- Cloud and Deployment Hunting
- preflightJsonText
- Cloud and Deployment Hunting
- Desktop, Mobile, and Local IPC Hunting
- Memory Safety, Binary, and Kernel Hunting
- security-audit
- Resource Exhaustion and Availability Hunting
- Client-Side and Browser Hunting
- Desktop, Mobile, and Local IPC Hunting
- Memory Safety, Binary, and Kernel Hunting
- Protocols, RPC, and Messaging Hunting
- security-audit
- Resource Exhaustion and Availability Hunting
- HTTP-Protocol and Authentication Hunting
- agent/skills/security-audit/ATTACK-CLASSES.md
- AI, LLM, and Agent Hunting
- Data Isolation and Lifecycle Hunting
- Protocols, RPC, and Messaging Hunting
- Supply Chain and Release Hunting
- .agents/skills/security-audit/ATTACK-CLASSES.md
- AI, LLM, and Agent Hunting
- Data Isolation and Lifecycle Hunting
- Supply Chain and Release Hunting
- index.ts
- DealFlow Edge Gateway Agent Instructions

## God Nodes (most connected - your core abstractions)
1. `collectUnitErrors()` - 16 edges
2. `collectUnitErrors()` - 16 edges
3. `compilerOptions` - 15 edges
4. `validate()` - 13 edges
5. `validate()` - 13 edges
6. `preflightJsonText()` - 12 edges
7. `preflightJsonText()` - 12 edges
8. `validateChecks()` - 11 edges
9. `validateAttempts()` - 11 edges
10. `validateDocument()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `unit()` --calls--> `canonicalCoverageId()`  [EXTRACTED]
  dealflow-edge/.agents/skills/security-audit/validate-coverage-ledger.test.cjs → dealflow-edge/.agents/skills/security-audit/validate-coverage-ledger.cjs
- `errorsFor()` --calls--> `validateDocument()`  [EXTRACTED]
  dealflow-edge/.agents/skills/security-audit/validate-coverage-ledger.test.cjs → dealflow-edge/.agents/skills/security-audit/validate-coverage-ledger.cjs
- `errorsFor()` --calls--> `validateDocument()`  [EXTRACTED]
  dealflow-edge/.agents/skills/security-audit/validate-findings.test.cjs → dealflow-edge/.agents/skills/security-audit/validate-findings.cjs
- `unit()` --calls--> `canonicalCoverageId()`  [EXTRACTED]
  dealflow-edge/agent/skills/security-audit/validate-coverage-ledger.test.cjs → dealflow-edge/agent/skills/security-audit/validate-coverage-ledger.cjs
- `errorsFor()` --calls--> `validateDocument()`  [EXTRACTED]
  dealflow-edge/agent/skills/security-audit/validate-coverage-ledger.test.cjs → dealflow-edge/agent/skills/security-audit/validate-coverage-ledger.cjs

## Import Cycles
- None detected.

## Communities (40 total, 2 thin omitted)

### Community 0 - "agent/skills/security-audit/validate-coverage-ledger.cjs"
Cohesion: 0.07
Nodes (54): ATTEMPT_FIELDS, ATTEMPT_STATUSES, canonicalCoverageId(), collectUnitErrors(), createErrorList(), encodeCanonicalRef(), escapeUnsafeDiagnosticCharacters(), fs (+46 more)

### Community 1 - ".agents/skills/security-audit/validate-coverage-ledger.cjs"
Cohesion: 0.08
Nodes (54): ATTEMPT_FIELDS, ATTEMPT_STATUSES, canonicalCoverageId(), collectUnitErrors(), createErrorList(), encodeCanonicalRef(), escapeUnsafeDiagnosticCharacters(), fs (+46 more)

### Community 2 - "agent/skills/security-audit/validate-findings.cjs"
Cohesion: 0.10
Nodes (38): canonicalKey(), append(), encode(), codePointLength(), collect(), collectDataLimitErrors(), collectFindingSemanticErrors(), collectSchemaErrors() (+30 more)

### Community 3 - ".agents/skills/security-audit/validate-findings.cjs"
Cohesion: 0.12
Nodes (37): canonicalKey(), append(), encode(), codePointLength(), collect(), collectDataLimitErrors(), collectFindingSemanticErrors(), collectSchemaErrors() (+29 more)

### Community 4 - "Vulnerability Hunting"
Cohesion: 0.07
Nodes (24): Core hunting method — include in every hunter prompt, Core validation rules — include in every hunter prompt, Coverage-critic waves, Local validation boundaries, Parent consolidation and ledger update, Phase 2: Run coverage-led hunting waves, Promotion procedure — copy this promotion procedure verbatim into every hunter prompt, Required hunter prompt (+16 more)

### Community 5 - "Vulnerability Hunting"
Cohesion: 0.07
Nodes (24): Core hunting method — include in every hunter prompt, Core validation rules — include in every hunter prompt, Coverage-critic waves, Local validation boundaries, Parent consolidation and ledger update, Phase 2: Run coverage-led hunting waves, Promotion procedure — copy this promotion procedure verbatim into every hunter prompt, Required hunter prompt (+16 more)

### Community 6 - ".agents/skills/security-audit/validate-findings.test.cjs"
Cohesion: 0.12
Nodes (17): LIMITS, assert, confirmed(), errorsFor(), evidence(), fs, needsValidation(), os (+9 more)

### Community 7 - "agent/skills/security-audit/validate-findings.test.cjs"
Cohesion: 0.14
Nodes (16): assert, confirmed(), errorsFor(), evidence(), fs, needsValidation(), os, path (+8 more)

### Community 8 - "Security Audit"
Cohesion: 0.11
Nodes (18): Anti-patterns, Core principles, Cost budget, Coverage and prior runs, Full audit planning, Full audit setup, Full audit workflow, Operating modes (+10 more)

### Community 9 - "Security Audit"
Cohesion: 0.11
Nodes (18): Anti-patterns, Core principles, Cost budget, Coverage and prior runs, Full audit planning, Full audit setup, Full audit workflow, Operating modes (+10 more)

### Community 10 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, allowSyntheticDefaultImports, checkJs, forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 11 - "package.json"
Cohesion: 0.16
Nodes (14): description, devDependencies, @cloudflare/workers-types@^4.20240512.0, typescript@^5.4.5, wrangler@^3.57.1, main, name, scripts (+6 more)

### Community 12 - "Client-Side and Browser Hunting"
Cohesion: 0.18
Nodes (10): Client-Side and Browser Hunting, Core discipline (include in every agent prompt for this domain), Cross-origin messaging and network attack classes (subagent_type: `general`), Cross-site information leak classes (subagent_type: `general`), DOM and object-state attack classes (subagent_type: `general`), Service-worker and browser-storage attack classes (subagent_type: `general`), UI-redress and navigation attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 13 - "preflightJsonText"
Cohesion: 0.40
Nodes (11): JsonStructureError, preflightJsonText(), beginContainer(), beginString(), beginValue(), closeContainer(), countValue(), currentContainer() (+3 more)

### Community 14 - "HTTP-Protocol and Authentication Hunting"
Cohesion: 0.18
Nodes (10): API-key and mTLS attack classes (subagent_type: `general`), Browser-session attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Federated-identity attack classes (subagent_type: `general`), HTTP framing and cache attack classes (subagent_type: `general`), HTTP-Protocol and Authentication Hunting, MFA, passkey, and account-transition attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 15 - "Cloud and Deployment Hunting"
Cohesion: 0.18
Nodes (10): Cloud and Deployment Hunting, Configuration and secret lifecycle attack classes (subagent_type: `general`), Container and orchestration attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Ingress, network, and control-plane attack classes (subagent_type: `general`), Managed storage, events, and edge attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+2 more)

### Community 16 - "preflightJsonText"
Cohesion: 0.40
Nodes (11): JsonStructureError, preflightJsonText(), beginContainer(), beginString(), beginValue(), closeContainer(), countValue(), currentContainer() (+3 more)

### Community 17 - "Cloud and Deployment Hunting"
Cohesion: 0.20
Nodes (10): Cloud and Deployment Hunting, Configuration and secret lifecycle attack classes (subagent_type: `general`), Container and orchestration attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Ingress, network, and control-plane attack classes (subagent_type: `general`), Managed storage, events, and edge attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+2 more)

### Community 18 - "Desktop, Mobile, and Local IPC Hunting"
Cohesion: 0.20
Nodes (10): Application-state and device-lifecycle attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Deep-link, callback, and navigation attack classes (subagent_type: `general`), Desktop, Mobile, and Local IPC Hunting, Local IPC and exported-component attack classes (subagent_type: `general`), Privileged-helper and local-file attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+2 more)

### Community 19 - "Memory Safety, Binary, and Kernel Hunting"
Cohesion: 0.20
Nodes (10): Binary loading and runtime attack classes (subagent_type: `general`), Bounds, integer, and representation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), FFI and ABI attack classes (subagent_type: `general`), Kernel and privileged-interface attack classes (subagent_type: `general`), Lifetime, type, and concurrency attack classes (subagent_type: `general`), Memory Safety, Binary, and Kernel Hunting, Universal moves (apply across the above) (+2 more)

### Community 20 - "security-audit"
Cohesion: 0.20
Nodes (9): Contact, Design principles, Files, Installation, License, Requirements, security-audit, Usage (+1 more)

### Community 21 - "Resource Exhaustion and Availability Hunting"
Cohesion: 0.20
Nodes (9): Computational amplification attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Failure and recovery attack classes (subagent_type: `general`), Quota and scheduling attack classes (subagent_type: `general`), Resource accumulation attack classes (subagent_type: `general`), Resource Exhaustion and Availability Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 22 - "Client-Side and Browser Hunting"
Cohesion: 0.20
Nodes (10): Client-Side and Browser Hunting, Core discipline (include in every agent prompt for this domain), Cross-origin messaging and network attack classes (subagent_type: `general`), Cross-site information leak classes (subagent_type: `general`), DOM and object-state attack classes (subagent_type: `general`), Service-worker and browser-storage attack classes (subagent_type: `general`), UI-redress and navigation attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 23 - "Desktop, Mobile, and Local IPC Hunting"
Cohesion: 0.20
Nodes (10): Application-state and device-lifecycle attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Deep-link, callback, and navigation attack classes (subagent_type: `general`), Desktop, Mobile, and Local IPC Hunting, Local IPC and exported-component attack classes (subagent_type: `general`), Privileged-helper and local-file attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+2 more)

### Community 24 - "Memory Safety, Binary, and Kernel Hunting"
Cohesion: 0.20
Nodes (10): Binary loading and runtime attack classes (subagent_type: `general`), Bounds, integer, and representation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), FFI and ABI attack classes (subagent_type: `general`), Kernel and privileged-interface attack classes (subagent_type: `general`), Lifetime, type, and concurrency attack classes (subagent_type: `general`), Memory Safety, Binary, and Kernel Hunting, Universal moves (apply across the above) (+2 more)

### Community 25 - "Protocols, RPC, and Messaging Hunting"
Cohesion: 0.20
Nodes (9): Broker and queue isolation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Framing, schema, and interpretation attack classes (subagent_type: `general`), Protocols, RPC, and Messaging Hunting, Replay, ordering, and transaction attack classes (subagent_type: `general`), RPC identity and authorization attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 26 - "security-audit"
Cohesion: 0.20
Nodes (9): Contact, Design principles, Files, Installation, License, Requirements, security-audit, Usage (+1 more)

### Community 27 - "Resource Exhaustion and Availability Hunting"
Cohesion: 0.20
Nodes (9): Computational amplification attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Failure and recovery attack classes (subagent_type: `general`), Quota and scheduling attack classes (subagent_type: `general`), Resource accumulation attack classes (subagent_type: `general`), Resource Exhaustion and Availability Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 28 - "HTTP-Protocol and Authentication Hunting"
Cohesion: 0.20
Nodes (10): API-key and mTLS attack classes (subagent_type: `general`), Browser-session attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Federated-identity attack classes (subagent_type: `general`), HTTP framing and cache attack classes (subagent_type: `general`), HTTP-Protocol and Authentication Hunting, MFA, passkey, and account-transition attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 30 - "AI, LLM, and Agent Hunting"
Cohesion: 0.22
Nodes (9): AI, LLM, and Agent Hunting, Context, retrieval, and memory attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), MCP and sub-agent trust classes (subagent_type: `general`), Output and disclosure attack classes (subagent_type: `general`), Tool and action attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 31 - "Data Isolation and Lifecycle Hunting"
Cohesion: 0.22
Nodes (9): Core discipline (include in every agent prompt for this domain), Data Isolation and Lifecycle Hunting, Deletion, revocation, and lifecycle attack classes (subagent_type: `general`), Derived-data and disclosure attack classes (subagent_type: `general`), Export, backup, restore, and migration attack classes (subagent_type: `general`), Tenant and object-isolation attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 32 - "Protocols, RPC, and Messaging Hunting"
Cohesion: 0.22
Nodes (9): Broker and queue isolation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Framing, schema, and interpretation attack classes (subagent_type: `general`), Protocols, RPC, and Messaging Hunting, Replay, ordering, and transaction attack classes (subagent_type: `general`), RPC identity and authorization attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 33 - "Supply Chain and Release Hunting"
Cohesion: 0.22
Nodes (8): CI and automation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Dependency and build-input attack classes (subagent_type: `general`), Release and update attack classes (subagent_type: `general`), Supply Chain and Release Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here), When to use this file

### Community 35 - "AI, LLM, and Agent Hunting"
Cohesion: 0.22
Nodes (9): AI, LLM, and Agent Hunting, Context, retrieval, and memory attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), MCP and sub-agent trust classes (subagent_type: `general`), Output and disclosure attack classes (subagent_type: `general`), Tool and action attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 36 - "Data Isolation and Lifecycle Hunting"
Cohesion: 0.22
Nodes (9): Core discipline (include in every agent prompt for this domain), Data Isolation and Lifecycle Hunting, Deletion, revocation, and lifecycle attack classes (subagent_type: `general`), Derived-data and disclosure attack classes (subagent_type: `general`), Export, backup, restore, and migration attack classes (subagent_type: `general`), Tenant and object-isolation attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 37 - "Supply Chain and Release Hunting"
Cohesion: 0.22
Nodes (8): CI and automation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Dependency and build-input attack classes (subagent_type: `general`), Release and update attack classes (subagent_type: `general`), Supply Chain and Release Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here), When to use this file

### Community 38 - "index.ts"
Cohesion: 0.43
Nodes (6): cacheKeyFor(), corsHeaders(), DEFAULT_ALLOWED_ORIGINS, Env, fetch(), getAllowedOrigins()

### Community 39 - "DealFlow Edge Gateway Agent Instructions"
Cohesion: 0.50
Nodes (3): DealFlow Edge Gateway Agent Instructions, Scope & Operating Context, Security Audit & Skills

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Security Audit` connect `Security Audit` to `Vulnerability Hunting`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `agent/skills/security-audit/validate-coverage-ledger.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.074034902168165 - nodes in this community are weakly interconnected._
- **Why does `Security Audit` connect `Security Audit` to `Vulnerability Hunting`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `.agents/skills/security-audit/validate-coverage-ledger.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07595628415300547 - nodes in this community are weakly interconnected._
- **Why does `preflightJsonText()` connect `preflightJsonText` to `.agents/skills/security-audit/validate-coverage-ledger.cjs`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `agent/skills/security-audit/validate-findings.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.10220673635307782 - nodes in this community are weakly interconnected._
- **Should `.agents/skills/security-audit/validate-findings.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.11948790896159317 - nodes in this community are weakly interconnected._