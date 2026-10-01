# Munevo Workstation Guard — FIDO2 Hardware Test Plan

**Document Version:** 1.0  
**Target Execution:** Real Physical FIDO2 / WebAuthn Hardware Authenticator Test  

---

## 1. Hardware & System Prerequisites

Before connecting physical hardware, ensure the following requirements are met:

- **Physical Security Key:** YubiKey 5 Series NFC, YubiKey 5C FIPS, Feitian FIDO2 Key, or active Windows Hello TPM biometric authenticator.
- **Browser Environment:** Microsoft Edge or Google Chrome (v100+) with WebAuthn API enabled.
- **Origin Context:** Executing on `http://localhost:3001` or secure HTTPS domain (`https://*.munevo.gov`).
- **Backend Service:** Munevo API Server running (`npm run dev` or `node server.ts` on port 3001).

---

## 2. Telemetry & Diagnostic Steps (12-Step Ladder)

```
 1. Browser WebAuthn Support Check      ► [Passed: window.PublicKeyCredential present]
 2. RP ID Verification                  ► [Passed: localhost / target hostname]
 3. Expected Origin Verification        ► [Passed: http://localhost:3001]
 4. Server Registration Challenge       ► [Passed: POST /api/auth/webauthn/register-challenge]
 5. Hardware User Gesture / Touch       ► [Prompting: Physical YubiKey metal sensor touch]
 6. Public-Key Persistence & Attest     ► [Passed: Credential ID stored server-side]
 7. Server Assertion Challenge          ► [Passed: POST /api/auth/webauthn/challenge]
 8. Hardware Assertion Gesture / Touch  ► [Prompting: Physical YubiKey metal sensor touch]
 9. Signed Assertion Payload            ► [Passed: clientDataJSON, authenticatorData, signature]
10. Server Signature & Nonce Verify     ► [Passed: Single-use challenge verified]
11. Munevo Identity Resolution          ► [Passed: Profile email & role verified]
12. Workstation Guard Session Unlock    ► [Passed: Unlocked with authMethod: WEBAUTHN]
```

---

## 3. Step-by-Step Physical Test Procedure

### Phase A: Credential Enrollment (Registration)
1. Navigate to **Munevo Identity Console** (`src/components/IdentityConsole.tsx`).
2. Select the **⚡ FIDO2 Hardware Test Mode Diagnostic** tab.
3. Click **"Run Guided FIDO2 Hardware Test"** (or click **"Register Security Key"** in the Overview roster).
4. When the browser native security prompt appears ("Making sure it's you..."), **insert your YubiKey into the USB port and tap the flashing metal contact sensor** (or complete Windows Hello biometric verification).
5. Verify in the Diagnostic Log that `AUTH_WEBAUTHN_REGISTER_SUCCESS` is logged and a credential ID (e.g. `FIDO2-HW-...`) is assigned.

### Phase B: Workstation Lock & Physical Hardware Unlock
1. Click the **Lock Workstation** button in the profile dropdown menu (or wait 2 minutes for inactivity lock).
2. On the **Opaque Workstation Guard Overlay** screen, click **"Authenticate FIDO2 Hardware"**.
3. When the browser prompt appears, **tap the physical YubiKey metal contact sensor**.
4. Confirm that:
   - Server verifies the challenge nonce (`AUTH_WEBAUTHN_SUCCESS`).
   - Workstation Guard unlocks immediately.
   - Notification Toast displays: `Cryptographic WebAuthn Assertion Verified! Welcome back Mayor Naeem Gibbons.`

---

## 4. Strict Security Verification Rules

- **Zero Private-Key Exposure:** The authenticator's private key never leaves the YubiKey secure element.
- **No Identifier-Only Unlock:** Badge UIDs, static PINs, or raw email strings cannot satisfy a WebAuthn challenge.
- **Replay Protection:** Challenges are single-use nonces with a 5-minute TTL; reuse attempts trigger `CHALLENGE_EXPIRED`.
