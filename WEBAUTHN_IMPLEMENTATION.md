# Munevo FIDO2 / WebAuthn Implementation Guide

**Document Version:** 1.0  
**Target:** Cryptographic Hardware Token Authentication  

---

## 1. WebAuthn Authentication Sequence

```
Client (Workstation Guard)                Munevo Server                  Hardware Token (YubiKey)
          │                                      │                                  │
          ├─── 1. POST /api/auth/webauthn/challenge ──►                            │
          │    (Request Single-Use Challenge)    │                                  │
          │                                      │                                  │
          ◄─── 2. { challengeId, challenge, rpId } ──┘                                  │
          │                                                                         │
          ├─── 3. navigator.credentials.get({ challenge }) ─────────────────────────►│
          │       (Prompt for Hardware Touch / PIN)                                 │
          │                                                                         │
          ◄─── 4. Hardware Signature Assertion ─────────────────────────────────────┘
          │       (clientDataJSON, authenticatorData, signature)
          │                                      │
          ├─── 5. POST /api/auth/webauthn/verify ──►
          │       (Send Assertion Payload)       │
          │                                      ├── 6. Validate Challenge Nonce
          │                                      ├── 7. Verify RP ID & Origin
          │                                      ├── 8. Verify EC/RSA Signature
          │                                      ├── 9. Map Credential to Profile
          │                                      └── 10. Record AUTH_WEBAUTHN_SUCCESS
          │                                      │
          ◄─── 11. { status: 'VERIFIED', user } ─┘
```

---

## 2. Server Security Requirements

1. **Single-Use Challenge Nonces:** Challenges are 32-byte cryptographically random base64url strings stored in a server-side cache with a **5-minute TTL**. Once verified or expired, the challenge is immediately purged to prevent **replay attacks**.
2. **Origin & RP ID Enforcement:** Server strictly verifies `clientDataJSON.origin` matches the allowed Munevo municipal domain and `rpId` matches the expected relying party identifier.
3. **Authenticator Counter Validation:** Server tracks `signCount` for each registered public key to detect cloned hardware authenticators.
4. **User Verification (UV):** Workstation Guard requests `userVerification: 'required'`, enforcing biometric or PIN entry on the hardware token.
