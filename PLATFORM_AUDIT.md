# Munevo Government Cloud — Comprehensive Platform Audit

**Document Version:** 1.0.0  
**Audit Date:** July 25, 2026  
**Auditor:** Principal Software Architect & Senior Engineering Team  
**Git Branch:** `platform-hardening`

---

## Executive Summary

Munevo Government Cloud is designed as a multi-tenant municipal operating system ("GovOS"). The application contains a rich set of operational workspaces—including Command Center EOC, Universal Operations Tracker (311/Permits/Code Enforcement), GIS Digital Twin, Sentinel Camera Operations, Munevo Safe CAD Emergency Dispatch, Legislative Hub, Open Records (FOIA), Staff Directory, Identity & IAM Console, and Platform Control Center.

While core infrastructure (PostgreSQL on Supabase, Express API server, Prisma ORM, and initial camera/tracker APIs) is functioning, a systematic audit reveals that several modules rely on hardcoded fallbacks, local-only component states, unpersisted forms, or unhandled user interface triggers.

This audit establishes the exact baseline architecture, security posture, backend coverage, and functionality matrix required to harden Munevo into a dependable, production-grade government operating system.

---

## 1. Current Architecture Overview

### 1.1 Frontend Architecture
- **Framework & Build System:** React 19 + TypeScript + Vite 8 (using `rolldown` bundler).
- **Styling:** Custom Vanilla CSS Design Tokens (`src/index.css`), Glassmorphism UI tokens, CSS variables, and Lucide React icons.
- **Mapping & GIS:** Leaflet (`react-leaflet`) with custom GeoJSON parcel rendering and camera coordinate pins.
- **State Management:** React local state (`useState`, `useEffect`) and props drilling from `src/App.tsx`.
- **Navigation Model:** Dual navigation paradigm:
  - Top Navigation Bar (Product / App Launcher + Tenant Selector + Profile Menu + Universal Search + Global Create).
  - Left Sidebar (`src/components/Sidebar.tsx`) displaying module items.
- **Modals & Drawers:** `UniversalSearchModal`, `CommandPalette`, `UniversalCreateModal`, `NotificationCenterDrawer`, and `ErrorBoundary`.

### 1.2 Backend Architecture
- **Server Runtime:** Node.js Express server (`server.ts`) running on port 3001 (or Vercel serverless functions).
- **ORM & Database Client:** Prisma ORM (`@prisma/client` v5.18.0).
- **Authentication Service:** Supabase JS Client (`@supabase/supabase-js` v2.110.1) paired with Prisma `Profile` and `Membership` models.
- **Audit System:** Centralized `recordAudit()` helper writing to the `AuditLog` table on create, update, delete, and invite operations.
- **Camera Connector Framework:** Modular architecture under `src/services/cameras/` featuring:
  - `CameraConnectorRegistry` singleton managing NJ511, NJTA, NYCDOT, and External connectors.
  - `CameraMediaService` & `CameraProxySecurity` providing SSRF-protected media proxying (`/api/cameras/:id/media`).
  - `RiskRoutingService` for low risk (auto-draft service request) vs. safety-critical risk (human verification required) routing.
  - `BusinessOptInLifecycleService` executing a 7-step opt-in business camera onboarding program.

### 1.3 Database Provider & Connection
- **Database Provider:** Managed PostgreSQL hosted on Supabase (AWS `us-west-2`).
- **Connection Mode:**
  - Transaction Pooler (pgBouncer): `DATABASE_URL` (port 6543) used for runtime query execution.
  - Direct Session Connection: `DIRECT_URL` (port 5432) used for Prisma migrations and schema push.
- **Prisma Schema:** `prisma/schema.prisma` currently contains 19 models (`Organization`, `CustomRole`, `Permission`, `Profile`, `Membership`, `Invitation`, `Property`, `Business`, `Project`, `Permit`, `Inspection`, `TrackerItem`, `OpenRecordsRequest`, `Employee`, `Certification`, `Timesheet`, `AuditLog`, `MunicipalOffice`, `VerificationClaim`, `Appointment`, `CaseComment`, `DemoRequest`, `CameraSource`, `PublicCamera`, `CameraObservation`, `BusinessCameraOptIn`).

### 1.4 Environment Variables
- `DATABASE_URL`: PostgreSQL transaction-pooler connection string.
- `DIRECT_URL`: PostgreSQL direct session connection string.
- `VITE_SUPABASE_URL`: Supabase project URL (`https://ihwtaxltvsgfvgcgcpdw.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/publishable API key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase administrative service role secret key.
- `VITE_API_URL`: Backend API base URL (`http://localhost:3001` in local dev).

---

## 2. API Routes Audit

The backend server (`server.ts`) exposes **59 typed Express API endpoints**:

| Category | Endpoint Range | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Properties & Utility** | `GET /api/properties` | Functional | Filtered by tenant org, returns GIS coords |
| **Operations Tracker** | `GET/POST/PATCH/DELETE /api/tracker` | Functional | Persists 311/Permits/Code cases to Prisma |
| **Tenant & Orgs** | `GET/POST /api/organizations` | Functional | Organization creation & multi-tenant isolation |
| **Identity & Profiles** | `GET/POST/PATCH /api/profiles` | Functional | User profiles, badge IDs, role mapping |
| **Custom Roles & Perms** | `GET/POST/DELETE /api/roles` | Functional | Granular per-module RBAC cards |
| **Org Invitations** | `GET/POST/PATCH /api/invitations` | Functional | Multi-tenant user invite workflow with token hash |
| **Staff & Employees** | `GET/POST /api/employees` | Functional | Staff directory & office branch assignment |
| **Open Records (FOIA)** | `GET/POST/PATCH /api/open-records` | Functional | Citizen FOIA/OPRA request submission & tracking |
| **Sentinel Signals** | `GET/POST /api/sentinel/signals` | Functional | Public intelligence signals & verification |
| **Sentinel Cameras** | `GET/POST /api/cameras` | Functional | Canonical normalized cameras & proxying |
| **Camera Media Proxy** | `GET /api/cameras/:id/media` | Functional | SSRF-validated image/video proxying |
| **Risk Routing & Obs** | `POST/GET/PATCH /api/camera-observations` | Functional | Safety-critical & low-risk routing rules |
| **Business Opt-In CCTV** | `POST/PATCH /api/sentinel/opt-in/*` | Functional | 7-Step business onboarding & permission wizard |
| **Munevo Safe CAD** | `GET/POST /api/safe/incidents` | Functional | Emergency CAD incidents & citizen Silent SOS |

---

## 3. Detailed Deficiency & Gap Analysis

### 3.1 Hardcoded Data & Local State Usages
1. **`src/mockData.ts`**: Standard properties, permits, violations, inspections, and legislative items are still seeded locally when backend fetch fails or during offline fallback.
2. **`CityPulse.tsx`**: Uses hardcoded metrics for city operational health score, carbon index, and revenue collections.
3. **`KnowledgeGraph.tsx`**: Uses hardcoded node and edge arrays rendered on an interactive SVG canvas.
4. **`Marketplace.tsx`**: Uses static app licensing catalog cards.
5. **`LegislativeHub.tsx`**: Partial mock data for voting records and ordinance agenda items.

### 3.2 Unhandled Buttons & Non-Persisting Forms
1. **Top Shell Quick Actions**: "Global Create" buttons in top navigation open modals, but some sub-types (e.g. "Create Workflow", "Create Asset") do not persist to database tables yet.
2. **Identity Console Entra ID / MFA Toggles**: Visual switches for Microsoft Entra ID SSO and hardware badge key pair pairing do not update real database fields.
3. **Audit Trail Export Buttons**: "Export CSV" and "Download Audit Audit Log" trigger toast notifications rather than generating real downloadable files.

### 3.3 Security & Multi-Tenancy Gaps
1. **Tenant Isolation Enforcement**: While endpoints accept `x-organization-id` header, missing backend middleware allows unauthenticated or cross-tenant query execution if `x-organization-id` is omitted or forged.
2. **Password & Token Storage Safety**: Client storage needs explicit session encryption and cookie-clearing logic on workstation lock.
3. **Session Timeout & Lock Strategy**: `App.tsx` has a basic workstation lock screen, but lacks configurable per-org inactivity timeouts, 60-second warning modals, and tab broadcast synchronization.

### 3.4 Missing Loading, Empty & Error States
1. **Workspace Loaders**: Components render blank or default empty tables while initial API fetches complete.
2. **Error Boundary**: `ErrorBoundary.tsx` catches exceptions but displays a static fallback message without technical diagnostic logs or actionable recovery buttons.
3. **Empty Data States**: Tables in Tracker, Open Records, and Staff Directory lack explicit empty-state graphics when 0 records are returned for a tenant.

---

## 4. Remediation Strategy & Implementation Order

To fulfill the **Munevo Platform Hardening and Functionality Program**, execution will proceed across the following phases:

1. **Phase 1 Audit Completion (Current):** Document architecture, API inventory, and functionality matrix (`PLATFORM_AUDIT.md` & `FUNCTIONALITY_MATRIX.md`).
2. **Phase 2 Application Stabilization:** Fix type errors, wrap safe array operations (`ensureArray`), refine error boundaries with technical logs and recovery actions, ensure full height/overflow scrolling.
3. **Phase 3 Identity & Access Management (IAM):** Complete login/signup, password reset email flow, Microsoft Entra ID architecture, organization switching context, inactivity lock countdown & badge tap reauthentication, and security audit logs.
4. **Phase 4 Multi-Tenant Database Expansion:** Extend `schema.prisma` with unified models (`addresses`, `people`, `workflows`, `workflow_steps`, `documents`, `activities`, `workspace_catalog`, `workspace_installations`, `user_workspace_preferences`, `integrations`, `integration_connections`), generate Prisma client, and enforce tenant isolation middleware.
5. **Phase 5 Unified Platform Shell & Launcher:** Standardize top navigation, replace duplicate sidebars with single workspace switcher, implement iPhone/365-style App Launcher on `WorkspaceHome`, universal search, open record tabs, and saved user preferences.
6. **Phase 6 Unified Record Model:** Connect Property as the canonical anchor entity linked to permits, 311, violations, inspections, cameras, and timeline activities.
7. **Phase 7 Reference 311 End-to-End Workflow:** Fully build and test the 12-step resident 311 submission → address validation → property link → department assignment → field worker dispatch → completion → audit update journey.
8. **Phase 8 Workspace Hardening:** Wire all remaining workspaces (Sentinel EOC, Munevo Safe CAD, Legislative Hub, Open Records, Staff Directory, Global/Org Admin) to database CRUD endpoints with test coverage.
9. **Phase 9 End-to-End Testing & Release Documentation:** Run unit/integration test suite, create complete release deliverables (`DATABASE_SCHEMA.md`, `AUTH_AND_IDENTITY.md`, `RBAC_MATRIX.md`, `WORKSPACE_CATALOG.md`, `API_INVENTORY.md`, `TEST_PLAN.md`, `RELEASE_CHECKLIST.md`, `SECURITY_NOTES.md`, `CHANGELOG.md`).

---
*End of PLATFORM_AUDIT.md*
