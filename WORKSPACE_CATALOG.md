# Munevo Government Cloud — Workspace Catalog Documentation

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Overview & Workspace Launcher Model

Munevo Government Cloud organizes municipal functionality into distinct, specialized workspaces accessible from the **Munevo Home App Launcher** (`WorkspaceHome.tsx`). Changing workspaces updates the active tools, navigation sidebar, and contextual controls while preserving the user's authenticated session, tenant organization boundary, and unified underlying records.

---

## 2. Installed Workspaces & Product Suite

| Product ID | Workspace Title | Key Features & Responsibilities | Required Entitlements / Licensing | Primary User Roles |
| :--- | :--- | :--- | :--- | :--- |
| **`core`** | **Command Center EOC & Operations** | City Operational Health index, Universal Tracker (311 / Permits / Code Enforcement), GIS Digital Twin, Open Record Tabs | Core GovOS License (Installed for all tenants) | Mayor, Executive, Org Admin, Supervisors, Operators |
| **`sentinel`** | **Sentinel Camera & AI Intelligence** | Public traffic camera connectors (511NJ, NJTA, NYC DOT), SSRF camera media proxy, AI computer vision observation engine, risk routing rules, 7-step business CCTV opt-in program | Sentinel AI Module License | EOC Operators, Public Safety Director, Emergency Management |
| **`safe`** | **Munevo Safe Emergency CAD** | Emergency CAD incidents list, Silent SOS citizen reports, emergency unit dispatch, location geocoding, high-priority incident management | Munevo Safe CAD Module License | Dispatchers, Police / Fire Chiefs, First Responders |
| **`gis`** | **GIS Spatial Digital Twin** | Leaflet parcel map, address intelligence geocoding engine, layer toggles (cameras, permits, 311, water, zoning), spatial analysis | GIS Digital Twin Module License | GIS Analysts, Engineers, Urban Planners, Public Works |
| **`legislative`** | **Legislative Hub & City Council** | Ordinance & resolution registry, city council voting ledger, meeting agendas, public voting records | Legislative Module License | City Clerk, Council Members, Legal Counsel, Mayor |
| **`foia`** | **Open Records (FOIA / OPRA)** | Citizen public records request portal, requester tracking, status lifecycle, department fulfillment queues | Open Records Module License | Open Records Custodian, City Clerk, Legal Officers |
| **`staff`** | **Staff Directory & Workforce** | Employee roster, office branch assignment, staff certification tracker with expiration alerts, timesheet logger | Workforce Module License | HR Administrator, Department Directors, Office Managers |
| **`iam`** | **Identity & Organization Admin** | Multi-tenant user management, custom roles, granular module permission cards, invitations, badge tap reauth config | Tenant Admin License | Organization Administrator, IT System Administrator |
| **`control`** | **Platform Control Center** | Microservices telemetry, UDM schema sync, Knowledge Graph inspector, Camera Sources registry, session policies | Global Admin License | Platform System Administrator, Cloud Engineers |

---

## 3. Workspace Memory & Deep Linking

- **Workspace Memory:** The platform shell remembers the last visited sub-module per workspace product (stored in `workspaceMemory[productId]`).
- **Context Preservation:** Navigating between `core`, `sentinel`, `gis`, or `legislative` maintains open record tabs in `ChartingSystem.tsx` so users do not lose their place while cross-referencing records.

---
*End of WORKSPACE_CATALOG.md*
