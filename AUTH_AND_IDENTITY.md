# Munevo Government Cloud — Authentication & Identity Architecture

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Multi-Tenant Identity Model

Munevo Government Cloud leverages a hybrid identity architecture combining **Supabase Auth** for core credential authentication with a multi-tenant **Prisma Profile & Membership** database schema:

```
[Supabase Auth auth.users]
        │
        ▼ (1:1 link via User ID)
 [Prisma Profile Entity] ── (1:N) ── [Membership Entity] ── (N:1) ── [Organization Entity]
                                          │
                                          ▼ (N:1)
                                  [CustomRole Entity] ── (1:N) ── [Permission Cards]
```

---

## 2. Supported Authentication Modes

### 2.1 Email & Password Auth
- User credentials are verified via Supabase Auth (`supabaseClient.ts`).
- Raw passwords are **never** stored in application tables or browser storage.
- Password reset emails trigger via `POST /api/auth/reset-password`, generating a cryptographically secure token with a 30-minute expiration window. Reset completion executes via `POST /api/auth/confirm-reset`.

### 2.2 Microsoft Entra ID (Azure AD) SSO Architecture
- Enterprise SSO initiation endpoint: `POST /api/auth/entra/login`.
- Redirects to Microsoft's OAuth 2.0 / OpenID Connect authorization endpoint: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize`.
- Callback handler exchanges authorization codes for JWT bearer tokens and syncs user identity to the tenant's `Profile` and `Membership` records.

### 2.3 Smart Card / Badge Tap Reauthentication
- High-security workstation mode supports NFC/PIV smart card badge tap reauthentication (`POST /api/auth/badge-reauth`).
- Allows field workers and EOC operators to quickly unlock locked workstation sessions using their badge ID (`badgeId`) and PIN without re-entering full passwords.

---

## 3. Workstation Session Lock & Inactivity Timeout

- **Configurable Timeout:** Organization administrators configure inactivity lock limits via `GET/POST /api/auth/session-config` (default: 15 minutes).
- **Warning Lead Time:** Displays a 60-second warning countdown modal (`showInactivityWarning`) before locking.
- **Multi-Tab Synchronization:** Uses `BroadcastChannel('munevo_session_channel')` so that locking or signing out in one browser tab immediately locks all open tabs.
- **Cache Clearing:** Workstation lock clears transient component state and invalidates temporary tokens.

---

## 4. Multi-Tenant Invitations & Organization Switching

- **Invitation Creation:** Admins invite new or existing users via `POST /api/invitations`.
- **Token Hashing & Expiration:** Invitations generate a unique token hash with a strict 7-day expiration date (`expiresAt`).
- **Duplicate Prevention:** Enforces `@@unique([organizationId, normalizedEmail])` to prevent duplicate pending invites per tenant.
- **Actions:** Resend (`action: "RESEND"`), Revoke (`action: "REVOKE"`), and Cancel (`action: "CANCEL"`).
- **Organization Switching:** Users with multiple `Membership` records switch tenant context cleanly via the top bar organization dropdown without destroying their active session.

---

## 5. Security Audit Logging

All IAM operations trigger an automated record in `AuditLog`:

| Action Event | Trigger | Audit Details Logged |
| :--- | :--- | :--- |
| `USER_SIGN_IN` | User login | User ID, email, IP header, timestamp |
| `USER_SIGN_OUT` | User logout | User ID, session duration |
| `PASSWORD_RESET_REQUESTED` | Reset email request | Email, token hash |
| `PASSWORD_RESET_COMPLETED` | Password updated | User ID, email |
| `INVITATION_SENT` | Org invite created | Inviter ID, target email, role ID |
| `INVITATION_ACCEPTED` | User accepts invite | User ID, org ID, membership ID |
| `ROLE_ASSIGNED` | Custom role granted | Target user ID, role name, org ID |
| `BADGE_TAP_REAUTH_SUCCESS` | Badge unlock | Badge ID, profile ID |

---
*End of AUTH_AND_IDENTITY.md*
