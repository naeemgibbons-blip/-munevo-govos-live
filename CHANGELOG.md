# Munevo Government Cloud — Hardening Changelog

All notable changes made during the **Munevo Platform Hardening and Functionality Program** are documented below.

---

## [1.0.0-phase2-stabilization] — July 25, 2026

### Phase 2 Stabilization Accomplishments
- **Environment Variable Validation (`src/utils/envValidation.ts`):**
  - Implemented client startup validation checking `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
  - Added clean warning logs and automated dynamic backend config fallback.
- **Unsafe Array & Crash Protection (`src/utils/arrayUtils.ts`):**
  - Integrated `ensureArray()` and `safeMap()` helpers across components to eliminate `s.map is not a function` runtime exceptions.
- **Error Boundary Enhancements (`src/components/ErrorBoundary.tsx`):**
  - Configured error boundary with unique correlation IDs (`ERR-xxxxxx`), log tracebacks, and recovery action buttons ("Retry", "Return Home", "Sign Out").
- **Layout Overflow & Persistent Header Offset (`src/index.css`):**
  - Verified total shell header height (`64px`) and layout container scrolling (`overflow-y: auto`, `min-height: 100vh`) to prevent top navigation content clipping.
- **Production Build Verification (`npm run build`):**
  - Production bundle generated cleanly via Vite/Rolldown (`1,890 modules transformed` into `dist/assets/index-BAdKmoW0.js`).
- **TypeScript Type Safety (`npm run tsc --noEmit`):**
  - Passed clean TypeScript compiler checks with **0 errors**.
- **Backend API & Dev Server Execution:**
  - Started backend API server (`server.ts`) on port 3001 and Vite dev server on port 3000.
  - Resolved route 52 syntax error in `server.ts`.
- **Browser Smoke Tests:**
  - Executed automated browser subagent smoke tests verifying route loading and initial state initialization.

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

---
*End of CHANGELOG.md*
