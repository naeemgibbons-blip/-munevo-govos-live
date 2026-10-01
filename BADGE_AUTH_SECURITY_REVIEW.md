# Munevo Physical Badge & PIV Authentication Security Review

**Date:** October 1, 2026  
**Auditor:** Antigravity AI Security Specialist  
**Target Platform:** Munevo Cloud Municipal OS (`munevo-cloud`)  
**Status:** Proof-of-Concept / Development Architecture Review  

---

## 1. Executive Summary & Direct Security Response

### Question
> *If I plug a compatible USB PIV/NFC smart-card reader into this Windows computer right now and tap/insert a real PIV-compatible badge, will Munevo cryptographically authenticate that credential and unlock the workstation?*

### Answer
**NO.**

> **"Physical cryptographic PIV/CAC authentication is not yet implemented."**

---

## 2. Detailed Technical Breakdown (Feature-by-Feature Verification)

### 1. Development Badge Simulation
- **Status:** **IMPLEMENTED (SIMULATED ONLY)**
- **Analysis:** The system contains hardcoded mock badge IDs (`BDG-NWK-0092`, `BDG-NWK-0412`, `BDG-NWK-0881`, `BDG-NWK-0994`) in `server.ts` and `src/components/IdentityConsole.tsx`. UI buttons trigger string-based REST API calls simulating badge taps.
- **Production Status:** Not safe for production; must be gated behind development feature flags.

### 2. Web NFC / NDEFReader Integration
- **Status:** **PARTIALLY IMPLEMENTED (UI WRAPPER ONLY)**
- **Analysis:** `src/services/badgeAuthService.ts` contains a wrapper around `window.NDEFReader`. This API only reads unencrypted NDEF records and hardware serial numbers from basic RFID/NFC tags in Android Chrome. It **cannot** communicate with PIV smart cards via ISO/IEC 7816-4 APDU commands or perform cryptographic authentication.
- **Production Status:** Does not provide cryptographic identity verification.

### 3. Physical USB NFC / Smart Card Reader (PC/SC)
- **Status:** **NOT IMPLEMENTED**
- **Analysis:** No integration with Windows PC/SC WinCard middleware, WebCard APIs, or native smart card reader drivers (e.g. HID OmniKey 5022 / SCM SCR3310). Web browsers cannot directly talk to USB PC/SC smart card readers without a client-side daemon or WebAuthn bridge.
- **Production Status:** Requires native PC/SC daemon or WebAuthn / Entra CBA bridge.

### 4. Windows Smart Card Subsystem Integration
- **Status:** **NOT IMPLEMENTED**
- **Analysis:** No hook into Windows CryptoAPI / CNG (Cryptography Next Generation) or Microsoft Smart Card Minidriver subsystem.
- **Production Status:** Not connected to OS-level Windows Smart Card architecture.

### 5. PIV / CAC Certificate Authentication
- **Status:** **NOT IMPLEMENTED**
- **Analysis:** X.509 PIV authentication certificates (OID 2.16.840.1.101.3.6.7.2.1) on smart card applets are not extracted, parsed, or validated against Federal PKI / Municipal Certificate Authority CRL/OCSP endpoints.
- **Production Status:** Certificate validation is not active.

### 6. Cryptographic Private-Key Challenge / Response
- **Status:** **NOT IMPLEMENTED**
- **Analysis:** No asymmetric challenge generation (`RANDOM_CHALLENGE`), no client-side signing using card-bound private key (Key Spec 9A / 9E), and no server-side signature verification (`RSA-PSS` or `ECDSA`).
- **Production Status:** Zero cryptographic proof of key possession is performed.

### 7. FIDO2 / WebAuthn Hardware Tokens
- **Status:** **PARTIALLY SIMULATED**
- **Analysis:** `IdentityConsole.tsx` displays WebAuthn / YubiKey registration UI controls, but does not invoke browser `navigator.credentials.get()` or `navigator.credentials.create()` with standard server nonces.
- **Production Status:** Requires integration with standard WebAuthn API endpoints.

### 8. Microsoft Entra Certificate-Based Authentication (CBA)
- **Status:** **NOT IMPLEMENTED**
- **Analysis:** Enterprise SSO UI toggle for Entra ID exists in `IdentityConsole.tsx`, but no OIDC / OAuth2 Certificate-Based Authentication redirect endpoint or Azure AD PIV binding is connected.
- **Production Status:** Not connected to Entra ID CBA endpoint.

### 9. PIN Verification
- **Status:** **SIMULATED AT APPLICATION LEVEL ONLY**
- **Analysis:** The application accepts a static 4-digit PIN string (`9832` / `0881`) matched in Node.js server memory. It **does NOT** issue a PIV `VERIFY` APDU command (0x20) to the smart card's secure element to verify the on-card PIN counter.
- **Production Status:** Application-level static string match; must be replaced with smart card APDU / WebAuthn user verification.

### 10. Production Session Reauthentication
- **Status:** **DEVELOPMENT OVERLAY ONLY**
- **Analysis:** Unlocking the `App.tsx` Workstation Guard overlay relies on local React state (`setIsSessionLocked(false)`) and localStorage event synchronization. It does not verify an authenticated session token signature from Supabase or server-signed JWT upon unlock.
- **Production Status:** Development UI demonstration.

---

## 3. Route Security Audit (`server.ts`)

### Endpoint Analyzed: `POST /api/auth/badge-unlock` & `POST /api/auth/badge-reauth`

```typescript
// server.ts snippet
app.post('/api/auth/badge-unlock', async (req, res) => {
  const { badgeId, pin } = req.body;
  ...
  // String match against hardcoded map
  if (matched.pinRequired && (!pin || pin !== matched.validPin)) {
    return res.status(401).json({ error: 'PIN validation required' });
  }
  return res.json({ status: 'UNLOCKED', userEmail: matched.email });
});
```

### Classification: **DEVELOPMENT / POC ONLY**

> [!WARNING]  
> **Security Risk:** `POST /api/auth/badge-unlock` can be invoked via simple HTTP REST request containing a static string `badgeId` and `pin` without any physical card presence or cryptographic signature proof.  
> **Mitigation Requirement:** This route must **never** be exposed in production environments without cryptographic challenge-response signature verification or WebAuthn assertion validation.

---

## 4. Production Safety Verification Audit

| Security Control | Current Status | Findings & Required Remediation |
|---|---|---|
| **Simulation Disabled in Prod** | ❌ **FAIL** | Simulated fallback logic is active by default. Must be gated behind `process.env.NODE_ENV !== 'production'`. |
| **No Hardcoded Credentials** | ❌ **FAIL** | `server.ts` and `IdentityConsole.tsx` contain hardcoded badge UIDs (`BDG-NWK-0092`) and static PINs (`9832`). Must be removed from production code. |
| **No Raw PIN Storage** | ❌ **FAIL** | Static PIN strings are held in cleartext memory objects in `server.ts`. Production must use hardware-held PINs verified by card applet or hashed bcrypt strings. |
| **No Private-Key Storage** | ✅ **PASS** | No private key material is stored or handled in the server codebase. |
| **No Access Token Logging** | ✅ **PASS** | Audit logging (`recordAudit`) only records metadata (badge ID, email, timestamp, action result). Tokens are not logged. |
| **No Cert Private Material** | ✅ **PASS** | No certificate private keys exist in repository code or memory. |
| **Server-Side Authorization** | ⚠️ **PARTIAL** | Backend returns `UNLOCKED` status, but relies on static string matching rather than cryptographic signature verification. |
| **Rate Limiting / Anti-Brute-Force** | ❌ **FAIL** | Endpoint lacks rate limiting (`express-rate-limit`). Vulnerable to PIN brute-forcing. |
| **Audit Logging** | ✅ **PASS** | `recordAudit` logs successful taps and PIN validation failures. |
| **Replay Protection** | ❌ **FAIL** | No nonce/challenge per tap. An attacker can replay `POST /api/auth/badge-unlock`. |
| **Tenant / Org Isolation** | ⚠️ **PARTIAL** | Reads `x-organization-id` header with fallback to default Newark org ID. |
| **Revoked Credential Check** | ⚠️ **PARTIAL** | UI state supports Revoked status, but `server.ts` `/api/auth/badge-unlock` does not query `prisma.profile` status for hardcoded fallback badges. |

---

## 5. Security Summary Table

| FEATURE | IMPLEMENTED? | SIMULATED? | PHYSICAL HARDWARE TESTED? | CRYPTOGRAPHICALLY VERIFIED? | PRODUCTION READY? | WHAT IS STILL REQUIRED? |
|---|---|---|---|---|---|---|
| **Development Simulation** | **YES** | **YES** | NO | NO | **NO** | Feature flag to disable in production |
| **Web NFC** | **PARTIAL** | **YES** | NO | NO | **NO** | Replaced by WebAuthn/PC-SC bridge |
| **USB NFC Reader** | **NO** | **YES** | NO | NO | **NO** | Client PC/SC daemon or WebAuthn CTAP2 |
| **PIV/CAC** | **NO** | **YES** | NO | NO | **NO** | X.509 PKI validation & APDU challenge |
| **FIDO2/WebAuthn** | **PARTIAL** | **YES** | NO | NO | **NO** | Standard `navigator.credentials` flow |
| **Microsoft Entra CBA** | **NO** | **YES** | NO | NO | **NO** | Azure AD OIDC CBA Endpoint integration |
| **PIN Reauthentication** | **SIMULATED**| **YES** | NO | NO | **NO** | Card APDU VERIFY / WebAuthn UV |
| **Workstation Guard** | **YES (UI)** | **YES** | NO | NO | **NO** | Server-signed JWT session re-issuance |

---

> [!IMPORTANT]  
> **Architectural Hold:** All badge authentication changes currently in the codebase are strictly proof-of-concept visual and API representations. No additional physical badge implementation will proceed until the production cryptographic architecture is approved by the user.
