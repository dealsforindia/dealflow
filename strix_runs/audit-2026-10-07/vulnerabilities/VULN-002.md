# VULN-002: Broken Object-Level Authorization on Price Alert Deletion

**Severity**: MEDIUM  
**Status**: REMEDIATED  
**CWE**: CWE-285: Improper Authorization  
**Component**: `dealbot_backend/dealbot/api.py`  

## Description
The price alert removal endpoint accepted an ObjectId and deleted records without verifying caller ownership or credentials.

## Proof of Concept / Verification
```bash
curl -X DELETE https://api.rudranil.me/api/v1/alerts/650000000000000000000001 -> Fixed: 403 Forbidden
```

## Remediation
Added ownership validation requiring either the matching session token of the alert creator or administrative authorization. Non-matching requests return 403 Forbidden.
