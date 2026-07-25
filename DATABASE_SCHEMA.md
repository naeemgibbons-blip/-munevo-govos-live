# Munevo Government Cloud — Database Schema Documentation

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**ORM:** Prisma ORM `v5.18.0`  
**Provider:** PostgreSQL on Supabase (`AWS us-west-2`)  
**Git Branch:** `platform-hardening`

---

## 1. Overview & Multi-Tenant Isolation Strategy

All tenant-owned operational entities in Munevo Government Cloud include an `organizationId` foreign key referencing the `Organization` table, indexed via `@@index([organizationId])`. Multi-tenant security is enforced at both the database level (foreign keys and RLS rules) and the backend API layer (`x-organization-id` header validation middleware).

---

## 2. Complete Model Directory (29 Models)

### Core Governance & Identity
1. **`Organization`**: Tenant entity representing a municipality or agency (e.g., "City of Newark").
2. **`CustomRole`**: Tenant-isolated custom role definitions (e.g., "Water Dept Inspector", "Code Officer").
3. **`Permission`**: Granular per-module permission cards (`command-center`, `tracker`, `gis`, `permits`, `sentinel`, `safe`, `legislative`, `open-records`).
4. **`Profile`**: User profile identity mapping to Supabase auth user IDs, display name, badge ID, global admin and org admin flags.
5. **`Membership`**: Multi-tenant association connecting users to multiple organizations with primary status and job titles (`@@unique([userId, organizationId])`).
6. **`Invitation`**: Tenant user invitation workflow supporting token hashes, 7-day expiration, duplicate handling, resend, revoke, and cancel tracking (`@@unique([organizationId, normalizedEmail])`).

### Canonical Records & Operations
7. **`Property`**: Canonical anchor property record (address, zip, owner, assessed value, tax status, zoning district).
8. **`Address`**: Canonical location address record (street, unit, ward, district, block, lot, lat/lng).
9. **`Person`**: Canonical resident / contact / contractor entity.
10. **`Business`**: Registered business entity with sector and compliance rating.
11. **`Project`**: Capital or municipal development project.
12. **`Permit`**: Building/zoning permit record tied to Property (`permitNumber`, type, status, estimated cost).
13. **`Inspection`**: Inspection checklist tied to Property and Permit.
14. **`TrackerItem`**: Universal Operations Item for 311 service requests, permits, code cases, and work orders.
15. **`OpenRecordsRequest`**: Citizen FOIA/OPRA open records request.
16. **`Employee`**: Staff directory entry with department affiliation, hire date, and branch office.
17. **`Certification`**: Employee professional certifications with expiration alerts.
18. **`Timesheet`**: Employee hours worked and notes ledger.
19. **`MunicipalOffice`**: Branch office / ward council office.
20. **`Department`**: Municipal operational department (e.g., "Public Works & Sanitation", "Code Enforcement").

### Audit & Security
21. **`AuditLog`**: Centralized audit ledger (`organizationId`, `userId`, `userEmail`, `action`, `tableName`, `recordId`, `oldValues`, `newValues`, `createdAt`).

### Sentinel Camera & Emergency CAD
22. **`CameraSource`**: Camera connector source registry (NYC DOT, 511NJ, NJTA, External).
23. **`PublicCamera`**: Canonical normalized camera entity with `@@unique([cameraSourceId, sourceCameraId])`.
24. **`CameraObservation`**: AI computer vision and operator observation workflow record.
25. **`BusinessCameraOptIn`**: 7-step business CCTV opt-in partnership program table with granular permission flags.

### Workflows, Documents, Activities & Preferences
26. **`Workflow` & `WorkflowStep`**: Workflow engine definitions and automated SLA step routing.
27. **`Document`**: Unified file attachment repository (`recordType`, `recordId`, `fileUrl`, `uploadedBy`).
28. **`Activity`**: Unified activity timeline ledger (`recordType`, `recordId`, `action`, `actorName`, `notes`).
29. **`Notification`**: User notification message queue.
30. **`WorkspaceCatalog` & `WorkspaceInstallation`**: App launcher workspace licensing registry and tenant installations.
31. **`UserWorkspacePreference`**: User pinned workspaces, default workspace launcher, and dock preferences.
32. **`Integration` & `IntegrationConnection`**: Third-party integration connectors (Entra ID, GIS ArcGIS, ShotSpotter).

---
*End of DATABASE_SCHEMA.md*
