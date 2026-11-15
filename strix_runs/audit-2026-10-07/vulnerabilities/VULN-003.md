# VULN-003: Exposed Fallback Administrative Tokens in Client Bundles

**Severity**: HIGH  
**Status**: REMEDIATED  
**CWE**: CWE-798: Use of Hard-coded Credentials  
**Component**: `tg-setup/src/app/App.tsx, adminAuth.ts, VideosView.tsx`  

## Description
Vite client-side components contained string literal fallback tokens which would compile directly into public JavaScript bundles.

## Proof of Concept / Verification
```bash
gitleaks dir tg-setup/dist -> Fixed: 0 leaks found
```

## Remediation
Removed all hardcoded fallback string literals from client code, routing authorization strictly through environment variables and runtime authentication headers. Bundles re-scanned and verified 100% clean with Gitleaks.
