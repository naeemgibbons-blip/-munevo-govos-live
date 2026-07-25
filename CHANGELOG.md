# Munevo Government Cloud — Hardening Changelog

All notable changes made during the **Munevo Platform Hardening and Functionality Program** are documented below.

---

## [1.0.0-hardening] — July 25, 2026

### Added
- **Phase 1 Audit & Functionality Matrix:** Created `PLATFORM_AUDIT.md` and `FUNCTIONALITY_MATRIX.md`.
- **Phase 3 IAM Endpoints & Workstation Security:**
  - Added Microsoft Entra ID SSO login helper (`POST /api/auth/entra/login`).
  - Added Password Reset Email request (`POST /api/auth/reset-password`) and Completion (`POST /api/auth/confirm-reset`).
  - Added Session Config policy endpoint (`GET/POST /api/auth/session-config`).
  - Added NFC/PIV Badge Tap Reauthentication endpoint (`POST /api/auth/badge-reauth`).
- **Phase 4 Multi-Tenant Database Expansion:**
  - Expanded `prisma/schema.prisma` from 19 to 29 database models (`Department`, `Address`, `Person`, `Workflow`, `WorkflowStep`, `Document`, `Activity`, `Notification`, `WorkspaceCatalog`, `WorkspaceInstallation`, `UserWorkspacePreference`, `Integration`, `IntegrationConnection`).
  - Added opposite relations to `Organization` model and ran `prisma generate`.
- **Phase 6 Unified Record Model Endpoints:**
  - Added `GET /api/records/:type/:id/related` for anchor entity related query resolution.
  - Added `GET/POST /api/records/:type/:id/activity` for unified activity timeline ledger.
- **Phase 7 Reference 311 End-to-End Vertical Workflow Endpoints:**
  - Added `POST /api/workflow/311/submit` (Step 1 Resident Submission & Property linking).
  - Added `POST /api/workflow/311/:id/dispatch-field` (Step 4 Field Dispatch).
  - Added `POST /api/workflow/311/:id/complete-work` (Step 5 Field Completion).
  - Added `POST /api/workflow/311/:id/verify` (Step 6 Supervisor Quality Verification & Resolution).
- **Phase 9 Program Deliverables:**
  - Created `DATABASE_SCHEMA.md`, `AUTH_AND_IDENTITY.md`, `RBAC_MATRIX.md`, `WORKSPACE_CATALOG.md`, `API_INVENTORY.md`, `TEST_PLAN.md`, `RELEASE_CHECKLIST.md`, `SECURITY_NOTES.md`, and `CHANGELOG.md`.

### Fixed & Hardened
- **Error Boundaries:** Refined `ErrorBoundary.tsx` to log technical correlation IDs and present clean recovery actions ("Retry", "Return Home", "Sign Out").
- **Unsafe Array Handling:** Guaranteed all component API responses use `ensureArray()` to prevent `s.map is not a function` runtime exceptions.
- **SSRF & Camera Proxy Security:** Enforced domain allowlist and private IP range blocking in `/api/cameras/:id/media`.
- **Git Branching:** Executed all work cleanly on dedicated branch `platform-hardening`.

---
*End of CHANGELOG.md*
