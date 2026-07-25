# Munevo Government Cloud — Authentication & Identity Architecture

**Document Version:** 1.2.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`  
**Phase Status:** Phase 3 Identity & Access Management Completed

---

## 1. Multi-Tenant Identity Architecture

Munevo Government Cloud leverages a hybrid identity model connecting **Supabase Auth** with a multi-tenant **Prisma Profile & Membership** schema:

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

## 2. Implemented Authentication & Access Journeys

### 2.1 Email & Password Auth & Email Confirmation
- User credentials are verified via Supabase Auth (`supabaseClient.ts`).
- Password reset emails trigger via `POST /api/auth/reset-password`, generating a cryptographically secure token with a 30-minute expiration window.
- Reset completion executes via `POST /api/auth/confirm-reset`.
- Raw passwords are **never** stored in application tables or browser storage.

### 2.2 Scoped Invitations & Duplicate Prevention
- Endpoints: `POST /api/invites`, `GET /api/invites`, `POST /api/invites/accept`, `POST /api/invites/:id/action`.
- Invitations are scoped strictly to `[organizationId, normalizedEmail]`.
- **Behavior Rules:**
  - **Already Member:** If user has an active `Membership` in target org $\rightarrow$ returns status `already_member` ("*This user is already a member of this organization.*").
  - **Pending Exists:** If pending invitation exists $\rightarrow$ returns status `pending_exists` (offers Resend or Cancel).
  - **Membership Invite:** If existing user account exists outside target org $\rightarrow$ issues organization membership invite without duplicating user profile.
  - **New User Invite:** If email has no account $\rightarrow$ issues pending invitation with 7-day expiration (`expiresAt`).
- **Token Hashing & Expiration:** 7-day expiration date with token hash (`tokenHash`). Supported lifecycle actions: `RESEND`, `REVOKE`, and `CANCEL`.

### 2.3 Organization Switching
- Users with multiple `Membership` records switch active tenant context cleanly via the top bar organization dropdown.
- Organization switching updates context and loads tenant-specific custom roles without destroying active sessions.

### 2.4 Workstation Session Lock & Inactivity Timeout
- **Default Policy:** Warning modal displays at **2 minutes** (120 seconds) of inactivity; workstation session locks at **3 minutes** (180 seconds).
- **"Stay Signed In":** Activity reset button resets timer and broadcasts `UNLOCK` across tabs via `BroadcastChannel('munevo_session_action')`.
- **Smart Card / Badge Tap Reauthentication (`POST /api/auth/badge-reauth`):** NFC/PIV smart card badge tap reauthentication with PIN validation allows field staff and EOC operators to quickly unlock sessions.

### 2.5 Microsoft Entra ID (Azure AD) SSO Architecture
- Endpoint: `POST /api/auth/entra/login`.
- Redirects to Microsoft's OAuth 2.0 / OpenID Connect authorization endpoint (`https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize`).
- Callback handler exchanges authorization codes for JWT bearer tokens and maps tenant identity to `Profile` and `Membership` records.

### 2.6 Account Disable & Suspension Governance
- Endpoint: `PATCH /api/profiles/:id/status`.
- Allows organization administrators to toggle profile status between `ACTIVE`, `DISABLED`, and `SUSPENDED`.

---

## 3. Security Audit Logging

All 12 security event types are logged to the `AuditLog` table:

| Security Action Event | Endpoint / Trigger | Audit Details Logged |
| :--- | :--- | :--- |
| `USER_SIGN_IN` | `/api/audit-logs/auth` | User ID, email, IP header, timestamp |
| `USER_SIGN_OUT` | `/api/audit-logs/auth` | User ID, session duration |
| `FAILED_LOGIN` | `/api/audit-logs/auth` | Email, IP, provider |
| `PASSWORD_RESET_REQUESTED` | `POST /api/auth/reset-password` | Email, token hash |
| `PASSWORD_RESET_COMPLETED` | `POST /api/auth/confirm-reset` | User ID, email |
| `INVITE_CREATED` | `POST /api/invites` | Inviter ID, target email, role ID, org ID |
| `INVITATION_ACCEPTED` | `POST /api/invites/accept` | User ID, org ID, membership ID |
| `INVITE_RESENT` | `POST /api/invites/:id/action` | Invite ID, target email |
| `ROLE_CHANGE` | `PATCH /api/members/:id/assignment` | Target user ID, new role ID, role name |
| `DEPARTMENT_CHANGE` | `PATCH /api/members/:id/assignment` | Target user ID, department code |
| `ACCOUNT_DISABLED` | `PATCH /api/profiles/:id/status` | Target user ID, status (`DISABLED`/`SUSPENDED`), reason |
| `ACCOUNT_REACTIVATED` | `PATCH /api/profiles/:id/status` | Target user ID, status (`ACTIVE`) |
| `SESSION_TIMEOUT` | `/api/audit-logs/auth` | User ID, workstation IP, timeout timestamp |

---
*End of AUTH_AND_IDENTITY.md*
