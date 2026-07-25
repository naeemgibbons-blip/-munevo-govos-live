# Munevo Government Cloud — Hardening Changelog

All notable changes made during the **Munevo Platform Hardening and Functionality Program** are documented below.

---

## [1.0.0-phase3-iam] — July 25, 2026

### Phase 3 Identity and Access Management (IAM) Accomplishments
- **Scoped Invitations & Duplicate Prevention:**
  - Hardened `POST /api/invites` to scope invitations strictly to `[organizationId, normalizedEmail]`.
  - Added detection for existing active memberships (`already_member`), pending invites (`pending_exists`), existing user account membership invites (`membership_invite`), and new account invites (`created`).
  - Added 7-day token expiration (`expiresAt`) and support for `RESEND`, `REVOKE`, and `CANCEL` actions via `POST /api/invites/:id/action`.
- **Account Governance & Status Control:**
  - Added `PATCH /api/profiles/:id/status` allowing organization admins to toggle user profile status (`ACTIVE`, `DISABLED`, `SUSPENDED`).
  - Added `PATCH /api/members/:id/assignment` allowing custom role and municipal department division assignments.
- **Session Security & Inactivity Lock:**
  - Hardened session inactivity timeout with warning modal at **2 minutes** (120s) and workstation session lock at **3 minutes** (180s).
  - Supported "Stay signed in" timer resets and multi-tab `BroadcastChannel` synchronization.
- **Smart Card / NFC Badge Tap Reauthentication:**
  - Added `POST /api/auth/badge-reauth` verifying NFC/PIV smart card badge UIDs and PINs.
- **Microsoft Entra ID (Azure AD) SSO Integration:**
  - Added `POST /api/auth/entra/login` OAuth 2.0 / OpenID Connect initialization architecture helper.
- **Security Audit Logging:**
  - Added `POST /api/audit-logs/auth` logging 12 security event types (`USER_SIGN_IN`, `USER_SIGN_OUT`, `FAILED_LOGIN`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, `INVITE_CREATED`, `INVITATION_ACCEPTED`, `INVITE_RESENT`, `ROLE_CHANGE`, `DEPARTMENT_CHANGE`, `ACCOUNT_DISABLED`, `ACCOUNT_REACTIVATED`, `SESSION_TIMEOUT`).

---

## [1.0.0-phase2-stabilization] — July 25, 2026

### Phase 2 Stabilization Accomplishments
- **Environment Variable Validation (`src/utils/envValidation.ts`):**
  - Implemented client startup validation checking `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
- **Unsafe Array & Crash Protection (`src/utils/arrayUtils.ts`):**
  - Integrated `ensureArray()` and `safeMap()` helpers across components to eliminate `s.map is not a function` crashes.
- **Error Boundary Enhancements (`src/components/ErrorBoundary.tsx`):**
  - Configured error boundary with unique correlation IDs (`ERR-xxxxxx`), log tracebacks, and recovery action buttons.
- **Production Build Verification (`npm run build`):**
  - Production bundle generated cleanly via Vite/Rolldown (`1,890 modules transformed`).

---
*End of CHANGELOG.md*
