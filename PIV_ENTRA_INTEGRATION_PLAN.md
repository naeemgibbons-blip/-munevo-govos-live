# Munevo PIV/CAC & Microsoft Entra CBA Integration Plan

**Document Version:** 1.0  
**Target:** Physical PIV Smart-Card & Entra ID Certificate-Based Authentication  

---

## 1. Physical Cryptographic Pipeline

```
  ┌─────────────────────────┐
  │  Physical PIV/CAC Card  │  (Contains Slot 9A Private Key in Secure Element)
  └────────────┬────────────┘
               │  NFC / Contact ISO 7816 APDU
  ┌────────────▼────────────┐
  │ USB Smart-Card Reader   │  (e.g., HID OmniKey 5022 / SCM SCR3310)
  └────────────┬────────────┘
               │  PC/SC Driver Interface
  ┌────────────▼────────────┐
  │ Windows Smart Card Sub  │  (WinSCard / Minidriver CryptoAPI / CNG)
  └────────────┬────────────┘
               │  TLS Client Certificate Handshake
  ┌────────────▼────────────┐
  │ Microsoft Entra CBA     │  (Azure AD Certificate-Based Auth Endpoint)
  └────────────┬────────────┘
               │  Verified OIDC Identity Token & SAML Claims
  ┌────────────▼────────────┐
  │ Munevo Server (IAM)     │  (Maps User Principal Name -> Tenant & Roles)
  └────────────┬────────────┘
               │  Server-Signed Workstation Token
  ┌────────────▼────────────┐
  │ Workstation Guard UI    │  (Unlocks Session with PIV_CBA Assurance)
  └─────────────────────────┘
```

---

## 2. Configuration & Responsibility Matrix

| Component Layer | Configuration Responsibility | Requirements & Setup |
|---|---|---|
| **Windows OS** | Municipal IT Administrator | PC/SC Smart Card Service (`SCardSvr`) enabled; Smart Card Minidriver installed for badge hardware (e.g. YubiKey Minidriver / ActivClient). |
| **PKI / Certificate Authority** | Municipal / Federal CA | X.509 v3 Certificate Authority publishing CRL / OCSP endpoints; Certificate Subject Alternative Name (SAN) contains `UserPrincipalName` (UPN). |
| **Microsoft Entra ID** | Azure AD Tenant Admin | Entra ID Certificate-Based Authentication (CBA) enabled in Security Policy; Root & Intermediate CA certificates uploaded to Entra Trust Store; Authentication Binding Policy maps Certificate User ID to Entra User Principal Name. |
| **Munevo Platform** | Munevo Admin / System Core | OIDC / SAML SSO integration configured; User UPN mapped to `Profile.email` and `Profile.badgeId`; `authMethod: ENTRA_CBA` logged in audit logs. |

---

## 3. Strict Security Mandates

1. **Zero Private Key Exposure:** Munevo application code **never** reads, requests, or stores private keys from the smart card. Private key operations (RSA/ECDSA signatures) occur strictly inside the card's tamper-resistant Secure Element.
2. **No Serial-Only Authentication:** Certificate serial numbers or badge UIDs are **never** sufficient alone to authenticate a user. Cryptographic proof of private key possession via TLS handshake or signed challenge is mandatory.
3. **Hardware PIN Enforcement:** Smart card PIN verification is executed locally by the smart card applet (`VERIFY` APDU 0x20). The application never stores or logs the card PIN.
