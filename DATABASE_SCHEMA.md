# Munevo Government Cloud — Database Schema Documentation

**Document Version:** 2.0.0  
**Date:** September 10, 2026  
**ORM:** Prisma ORM `v5.18.0`  
**Provider:** PostgreSQL on Supabase (`AWS us-west-2`)  
**Git Branch:** `platform-hardening`  
**Phase Status:** Phase 4 Multi-Tenant Database & Data Foundation Active  

---

## 1. CURRENT STATE AUDIT

### 1.1 Database Infrastructure & Provider
- **Database Engine:** PostgreSQL 15 on Supabase (`AWS us-west-2`).
- **Connection Architecture:**
  - `DATABASE_URL`: Transaction-mode connection pooler (`port 6543`, `pgbouncer=true`).
  - `DIRECT_URL`: Session-mode direct connection (`port 5432`) for DDL schema migrations and bulk seed scripts.
- **ORM:** Prisma Client `v5.18.0` with `prisma-client-js` generator.

### 1.2 Multi-Tenant Ownership & Isolation Audit
- **Tenant Key:** `organizationId` foreign key referencing `Organization.id`.
- **Enforcement Layers:**
  1. **Database Foreign Keys & Cascades:** `onDelete: Cascade` on operational records bound to `Organization`.
  2. **Unique Composite Constraints:** Enforced per-tenant uniqueness on `Membership (userId, organizationId)`, `Invitation (organizationId, normalizedEmail)`, `CustomRole (organizationId, name)`, `Department (organizationId, name)`, `WorkspaceInstallation (organizationId, workspaceId)`, and `IntegrationConnection (organizationId, integrationId)`.
  3. **Backend Middleware Authorization:** `validateTenantAccess` in `server.ts` validates `x-organization-id` header against user `Membership` records and rejects cross-tenant queries with `403 Forbidden`.
  4. **PostgreSQL RLS Policies:** Configured in `prisma/rls.ts` for database-level tenant isolation.

### 1.3 Discovered Schema Entities (32 Existing Models)
- **Core Identity & Governance:** `Organization`, `CustomRole`, `Permission`, `Profile`, `Membership`, `Invitation`.
- **Canonical Operational Entities:** `Property`, `Address`, `Person`, `Business`, `Project`, `Permit`, `Inspection`, `TrackerItem`, `OpenRecordsRequest`, `Employee`, `Certification`, `Timesheet`, `MunicipalOffice`, `Department`.
- **Security Audit:** `AuditLog`.
- **Sentinel AI & Emergency CAD:** `CameraSource`, `PublicCamera`, `CameraObservation`, `BusinessCameraOptIn`.
- **Workflows, Documents & Activity:** `Workflow`, `WorkflowStep`, `Document`, `Activity`, `Notification`, `WorkspaceCatalog`, `WorkspaceInstallation`, `UserWorkspacePreference`, `Integration`, `IntegrationConnection`.

### 1.4 Mock Data vs. Real Database Persistence Audit
- **Real Database Persistence (Phase 3 Verified):** `Organization`, `Profile`, `Membership`, `CustomRole`, `Permission`, `Invitation`, `AuditLog`.
- **Screens Currently Using In-Memory Fallbacks:**
  - `UniversalTracker.tsx` & `CommandCenter.tsx`: Fall back to hardcoded arrays in `src/mockData.ts` when API requests are unfulfilled.
  - `EmployeeRoster.tsx`: Reads `/api/members` but uses fallback mock employees.
  - `GisMap.tsx`: Properties and parcel spatial geometries read from `/api/properties` with mock fallback coordinates.

### 1.5 Phase 4 Schema Additions & Data Foundation Strategy
To fulfill Phase 4 requirements without breaking existing functionality, the database will be enhanced with additive, non-destructive schema models and indexes:
1. **Canonical `Task` Model (Step 9):** Dedicated platform task management entity linking `organizationId`, `assignedToUserId`, `departmentId`, `propertyId`, and `recordId`.
2. **Canonical `WorkflowInstance` & `WorkflowStepInstance` Models (Step 13):** Runtime workflow execution engine models for Phase 7 SLA step tracking.
3. **Enhanced Canonical `Property` & `Address` Relations (Steps 4 & 5):** Linking `Property` directly to `Address` (`addressId`), `Person` owner (`ownerPersonId`), and `Business` owner (`ownerBusinessId`).
4. **Enhanced `Document` & `Activity` Metadata (Steps 8 & 10):** Adding `accessClassification` to `Document` and `propertyId` to `Activity`.
5. **Enhanced `Notification` Delivery Channels (Step 11):** Adding `deliveryChannel` and `deliveryStatus`.
6. **Tenant Indexes (Step 14):** Adding explicit `@@index([organizationId])` on all tenant operational models to maximize Postgres query execution speed.

---

## 2. Complete Model Directory & Enforced Constraints

*(Updated schema definitions maintained below for active models)*

---
*End of DATABASE_SCHEMA.md*
