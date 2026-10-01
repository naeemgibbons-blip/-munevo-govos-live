# Munevo Physical Badge Deployment Requirements & Hardware Procurement Checklist

**Document Version:** 1.0  
**Target Environment:** Physical Hardware Testing & Municipal Deployment  

---

## 1. Procurement & Technical Configuration Checklist

### 🔌 Hardware Readers
- [ ] **PC/SC Compliant USB Smart Card Reader:** ISO 7816 contact & ISO 14443 contactless smart card reader (Recommended: **HID OmniKey 5022**, **Identiv SCR3310**, or **Castles EZ100PU**).
- [ ] **FIDO2 / WebAuthn Hardware Tokens:** USB-C / NFC Security Keys (Recommended: **YubiKey 5 Series NFC** or **YubiKey 5C FIPS**).

### 💳 Physical Badges / Credentials
- [ ] **PIV / CAC FIPS 201 Compliant Smart Card:** Dual-interface (Contact / NFC) smart card pre-loaded with NIST SP 800-73 PIV Data Model & PIV Authentication Certificate (Slot 9A).
- [ ] **FIDO2 / CTAP2 Security Credentials:** Hardware key supporting PIN user verification and resident key storage.

### 🖥️ Windows Workstation OS Requirements
- [ ] **OS Version:** Windows 10 / 11 Enterprise or Pro (x64 / ARM64).
- [ ] **Smart Card Subsystem:** Windows Smart Card Service (`SCardSvr`) set to **Automatic Start**.
- [ ] **Minidriver Package:** Smart Card Minidriver installed for target card hardware (e.g. YubiKey Minidriver or NIST PIV Minidriver).
- [ ] **Browser Support:** Microsoft Edge or Google Chrome with WebAuthn API enabled.

### ☁️ Microsoft Entra ID (Azure AD) Requirements
- [ ] **Licensing:** Microsoft Entra ID P1 / P2 or Microsoft 365 E3/E5.
- [ ] **Certificate-Based Authentication (CBA):** Enabled under Entra Security → Authentication Methods.
- [ ] **Trusted Certificate Authorities:** Root CA and Intermediate CA certificates uploaded to Entra Trust Store.
- [ ] **User Binding Policy:** Certificate SAN `UserPrincipalName` matched to Entra `userPrincipalName` (e.g. `mayor@munevo.gov`).

### 🔐 PKI / Certificate Authority Requirements
- [ ] **X.509 v3 PIV Auth Certificate Profile:** Enhanced Key Usage (EKU) `Client Authentication` (OID `1.3.6.1.5.5.7.3.2`) and `Smart Card Logon` (OID `1.3.6.1.4.1.311.20.2.2`).
- [ ] **CRL / OCSP Access:** Publicly accessible Certificate Revocation List (CRL) and OCSP responder URLs.

---

## 2. Next Steps for Physical Hardware Testing

1. Connect approved USB Smart Card Reader (HID OmniKey 5022) to test workstation.
2. Insert test PIV smart card with valid test certificate signed by test CA.
3. Perform Entra CBA login test in Edge browser.
4. Verify Munevo Workstation Guard unlocks using `authMethod: ENTRA_CBA` or `authMethod: WEBAUTHN`.
