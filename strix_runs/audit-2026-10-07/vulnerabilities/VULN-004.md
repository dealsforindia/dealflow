# VULN-004: Denial of Service via source-map-js Package Vulnerability

**Severity**: HIGH  
**Status**: REMEDIATED  
**CWE**: CWE-1284: Improper Input Validation  
**Component**: `rudranil-deals-web/package-lock.json`  

## Description
source-map-js dependency (<1.2.2) allowed event-loop denial of service through indexed source-map section offsets (GHSA-68fv-2mgg-jv7q).

## Proof of Concept / Verification
```bash
npm audit -> Fixed: 0 vulnerabilities
```

## Remediation
Executed npm audit fix, resolving the dependency tree. The storefront now reports 0 npm vulnerabilities and zero CVEs.
