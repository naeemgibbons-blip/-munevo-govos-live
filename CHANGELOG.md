# Munevo Government Cloud — Hardening Changelog

All notable changes made during the **Munevo Platform Hardening and Functionality Program** are documented below.

---

## [1.0.0-phase3-iam] — September 10, 2026

### Phase 3 Identity and Access Management (IAM) Accomplishments
- **Core Authentication Flows:**
  - Implemented end-to-end Login, Sign Up / Registration, Email Confirmation, Unconfirmed Email Resend, Forgot Password, and Reset Password completion flows via Supabase Auth and Prisma database integration.
- **Scoped Invitations & Duplicate Prevention:**
  - Hardened `POST /api/invites` to scope invitations strictly to `[organizationId, normalizedEmail]`.
  - Added detection for existing active memberships (`already_member`), pending invites (`pending_exists`), existing user account membership invites (`membership_invite`), and new account invites (`created`).
  - Added 7-day token expiration (`expiresAt`) and support for `RESEND`, `REVOKE`, and `CANCEL` actions via `POST /api/invites/:id/action`.
- **Account Governance & Status Control:**
  - Added `PATCH /api/profiles/:id/status` allowing organization admins to toggle user profile status (`ACTIVE`, `DISABLED`, `SUSPENDED`).
  - Added `PATCH /api/members/:id/assignment` allowing custom role and municipal department division assignments.
- **Session Security & Inactivity Lock:**
  - Hardened session inactivity timeout with warning modal at **2 minutes** (120s) and workstation session lock at **3 minutes** (180s).
  - Supported "Stay signed in" timer resets and multi-tab `storage` event synchronization.
- **Smart Card / NFC Badge Tap Reauthentication:**
  - Added `POST /api/auth/badge-unlock` verifying NFC/PIV smart card badge UIDs and PINs.
- **Microsoft Entra ID (Azure AD) SSO Integration:**
  - Added `POST /api/auth/entra/login` OAuth 2.0 / OpenID Connect PKCE authorization flow & configuration boundary check.
- **Security Audit Logging:**
  - Added `POST /api/audit-logs/auth` logging 18 security-sensitive event types (`USER_SIGN_IN`, `USER_SIGN_OUT`, `FAILED_LOGIN`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, `EMAIL_CONFIRMATION_SENT`, `EMAIL_CONFIRMED`, `INVITE_CREATED`, `INVITATION_ACCEPTED`, `INVITE_RESENT`, `INVITE_CANCELLED`, `ORGANIZATION_SWITCHED`, `ROLE_CHANGE`, `DEPARTMENT_CHANGE`, `ACCOUNT_DISABLED`, `ACCOUNT_REACTIVATED`, `SESSION_TIMEOUT`, `UNAUTHORIZED_ACCESS_ATTEMPT`).

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
