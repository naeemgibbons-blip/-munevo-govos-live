# Munevo Workstation Guard — Production Credential Architecture

**Document Version:** 2.0  
**Status:** Approved Architectural Specification  

---

## 1. Overview & Provider Abstraction Layer

Munevo Workstation Guard separates authentication UI rendering from credential verification logic through a decoupled provider abstraction layer (`WorkstationCredentialProvider`). 

Authentication state transitions and authorization decisions **must originate from trusted server verification**, never from client-side state manipulation.

```
                  ┌─────────────────────────────────────────┐
                  │    Munevo Workstation Guard UI Overlay │
                  └────────────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │ WorkstationCredentialManager        │
                    └──────────────────┬──────────────────┘
                                       │
        ┌──────────────────┬───────────┴───────┬──────────────────┐
        │                  │                   │                  │
┌───────┴────────┐ ┌───────┴────────┐ ┌────────┴───────┐ ┌────────┴────────┐
│ Development    │ │ WebAuthn /     │ │ Microsoft      │ │ PIV / CAC       │
│ Badge Provider │ │ FIDO2 Provider │ │ Entra CBA      │ │ Hardware        │
│ (Gated Dev)    │ │ (Cryptographic)│ │ (Enterprise)   │ │ Provider        │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

---

## 2. Credential Providers Specification

### 1. `DevelopmentBadgeProvider`
- **Purpose:** Development & demonstration testing.
- **Security Gate:** Strictly gated behind `MUNEVO_ENABLE_BADGE_SIMULATION=true` server configuration. Disabled by default (`false`) in production.
- **Behavior:** Accepts string badge ID & PIN; rejected with HTTP 403 in production.

### 2. `WebAuthnProvider`
- **Purpose:** FIDO2 / WebAuthn hardware token authentication (YubiKey, Windows Hello, Touch ID).
- **Mechanism:** Server generates single-use random challenge (`POST /api/auth/webauthn/challenge`). Browser calls `navigator.credentials.get()`. Hardware token signs challenge with token-bound private key. Server verifies assertion (`POST /api/auth/webauthn/verify`).

### 3. `EntraCertificateProvider`
- **Purpose:** Enterprise Certificate-Based Authentication (CBA) via Microsoft Entra ID (Azure AD).
- **Mechanism:** Smart-card inserted into reader → Windows Smart Card subsystem → Entra ID CBA endpoint authentication → OIDC claims returned → Munevo identity mapping.

### 4. `PIVCertificateProvider`
- **Purpose:** Direct PIV/CAC Smart Card Hardware authentication via PC-SC daemon / Native Middleware.
- **Mechanism:** Reads X.509 PIV authentication certificate (Slot 9A) → Cryptographic challenge signed by card applet → CA CRL/OCSP validation → Munevo authorization.

---

## 3. Workstation Guard State Machine

Workstation Guard operates on an explicit 9-state security state machine:

| Guard State | Description |
|---|---|
| `LOCKED` | Inactivity lock active; concealing backdrop active. |
| `WAITING_FOR_CREDENTIAL` | Reader listening for physical token insertion or tap. |
| `AUTHENTICATING` | Hardware assertion or server challenge in flight. |
| `VERIFIED` | Server verified cryptographic proof; session unlocked. |
| `PIN_REQUIRED_BY_CREDENTIAL_PROVIDER` | Authenticator requires 4-digit card PIN / WebAuthn UV. |
| `ACCESS_DENIED` | Signature verification failed or credential invalid. |
| `CREDENTIAL_REVOKED` | Badge / Certificate marked as REVOKED in directory. |
| `READER_UNAVAILABLE` | PC-SC hardware daemon or WebAuthn reader disconnected. |
| `IDENTITY_NOT_AUTHORIZED` | Valid certificate, but user lacks role/tenant access. |

---

## 4. Secure User Context Switching Protocol (Multi-User Shared Workstation)

When Workstation Guard is locked under **User A** and **User B** authenticates:

1. **Session Termination:** User A's transient workspace memory, open chart tabs, and local cache are securely wiped.
2. **Context Isolation:** User A's Supabase session token is revoked.
3. **User B Initialization:** Server verifies User B's identity, role entitlements, and organization context.
4. **Workspace Hydration:** User B's explicit department modules and chart tabs are loaded cleanly without inheriting User A state.
5. **Audit Event:** `AUTH_USER_CONTEXT_SWITCH` event recorded with `previousUser`, `newUser`, `timestamp`, and `authMethod`.

---

## 5. Security & Assurance Assurance Levels

Authentication events record explicit `authMethod` assurance levels:

- `PASSWORD`: Single-factor / password reauthentication.
- `WEBAUTHN`: Hardware token FIDO2 cryptographic challenge-response (High Assurance).
- `PIV_CBA`: Physical smart card PIV X.509 certificate validation (FedRAMP / CJIS High Assurance).
- `ENTRA_CBA`: Federated Microsoft Entra Certificate-Based Authentication.
- `DEV_SIMULATION`: Gated simulation mode (Development Only).
