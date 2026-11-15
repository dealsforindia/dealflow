# VULN-001: Insecure Direct Object Reference (IDOR) in User Profile Update

**Severity**: HIGH  
**Status**: REMEDIATED  
**CWE**: CWE-639: Authorization Bypass Through User-Controlled Key  
**Component**: `dealbot_backend/dealbot/api.py`  

## Description
The profile preference update endpoint trusted an unauthenticated query parameter (?email=victim@gmail.com), allowing unauthenticated callers to modify other users' preference states without presenting a matching session token.

## Proof of Concept / Verification
```bash
curl -X PUT https://api.rudranil.me/api/v1/user/profile?email=victim@example.com -d '{"is_student": true}' -> Fixed: 401 Unauthorized
```

## Remediation
Removed unverified query parameter resolution. Enforced server-side UserSessions Bearer token resolution and verified identity ownership. Applied and deployed to production.
