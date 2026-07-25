# Munevo Government Cloud — Role-Based Access Control (RBAC) Matrix

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Governance Hierarchy & Role Levels

Munevo Government Cloud enforces a 4-tier access hierarchy:

1. **Global Administrator (`isGlobalAdmin = true`):** Platform super-user with full system access across all tenant organizations, microservice provisioning, and global telemetry.
2. **Organization Administrator (`isOrgAdmin = true`):** Municipal tenant administrator managing tenant settings, user memberships, invitations, and custom role definitions for their organization.
3. **Custom Departmental Roles (`CustomRole` + `Permission` cards):** Granular roles created per tenant organization (e.g. "Water Dept Inspector", "Code Supervisor", "City Clerk Officer").
4. **Resident / Citizen Access:** Public portal access limited to 311 request submissions, public camera views, and FOIA open record requests.

---

## 2. Granular Module Permission Matrix

Each `CustomRole` contains granular `Permission` cards per workspace module defining `canView` and `canEdit` privileges:

| Role Archetype | Command Center EOC | Operations Tracker (311/Permits) | GIS Digital Twin | Sentinel Camera Wall | Munevo Safe CAD | Legislative Hub | Open Records (FOIA) | Identity & Org Admin | Platform Control Center |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global Admin** | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit |
| **Mayor / Executive** | View Only | View Only | View Only | View Only | View Only | View & Edit | View Only | View Only | View Only |
| **Municipal Org Admin** | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View & Edit | View Only |
| **Department Supervisor** | View Only | View & Edit | View & Edit | View & Edit | View & Edit | View Only | View & Edit | No Access | No Access |
| **Field Worker / Inspector** | No Access | View & Edit | View & Edit | View Only | View Only | No Access | No Access | No Access | No Access |
| **City Clerk / Records Officer** | No Access | View Only | View Only | No Access | No Access | View & Edit | View & Edit | No Access | No Access |
| **Resident / Citizen** | No Access | Create 311 | View Map | View Public Cams | Silent SOS | View Public Agenda | Submit FOIA | No Access | No Access |

---

## 3. Enforcement Layers

- **Frontend Navigation Gating:** `WorkspaceHome.tsx` and top bar menus filter visible products and modules based on `currentProfile.isGlobalAdmin`, `isOrgAdmin`, and `permissions` array.
- **Backend API Guard Middleware:** Express API routes validate `x-organization-id` header against user memberships and enforce tenant boundary queries (`where: { organizationId }`).
- **Database Row Level Security (RLS):** Supabase RLS policies block cross-tenant database access at the PostgreSQL query level.

---
*End of RBAC_MATRIX.md*
