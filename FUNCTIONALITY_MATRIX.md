# Munevo Government Cloud — Functionality & Feature Matrix

**Document Version:** 1.2.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`  
**Phase Status:** Phase 3 Identity and Access Management (IAM) Completed

---

## Classification Tiers Legend

- 🔴 **NOT STARTED:** Feature concept exists in specification but no UI component or API route is created yet.
- 🟡 **UI ONLY:** Feature interface exists in React components but relies entirely on static mock arrays or unhandled buttons.
- 🟠 **PARTIALLY FUNCTIONAL:** Feature has UI and partial API connectivity, but lacks full persistence, validation, or error handling.
- 🔵 **BACKEND CONNECTED:** Feature is fully integrated with Express API routes and Prisma PostgreSQL tables.
- 🟢 **TESTED:** Feature has verified unit, integration, or end-to-end automated test coverage.
- ⭐ **PRODUCTION READY:** Feature is fully hardened, tenant-isolated, responsive, load/error handled, tested, and ready for production deployment.

---

## Master Feature Matrix

| Feature / Workspace | Category / Sub-Feature | Status | Implementation Details & Backend Route |
| :--- | :--- | :--- | :--- |
| **Authentication & Identity** | Email & Password Sign-In | ⭐ PRODUCTION READY | Supabase Auth API (`supabaseClient.ts`) + Prisma Profile lookup |
| | Email Confirmation | ⭐ PRODUCTION READY | Supabase Auth confirmation trigger & verified profile status |
| | Forgot Password & Reset Email | ⭐ PRODUCTION READY | `POST /api/auth/reset-password`, 30-min token expiration |
| | Password Reset Completion | ⭐ PRODUCTION READY | `POST /api/auth/confirm-reset`, secure password update |
| | Entra ID / SAML SSO | ⭐ PRODUCTION READY | `POST /api/auth/entra/login` OAuth 2.0 / OpenID Connect helper |
| | Workstation Session Lock | ⭐ PRODUCTION READY | Opaque lock screen, PIN reauth, badge tap reauth UI |
| | Session Inactivity Timeout | ⭐ PRODUCTION READY | Configurable (2 min warning, 3 min lock), "Stay signed in", multi-tab sync |
| | NFC/PIV Badge Tap Reauth | ⭐ PRODUCTION READY | `POST /api/auth/badge-reauth`, smart card UID & PIN validation |
| | Audit Security Ledger | ⭐ PRODUCTION READY | `/api/audit-logs/auth` logs 12 security actions in `AuditLog` |
| **Multi-Tenancy & Governance** | Organization Management | ⭐ PRODUCTION READY | `GET/POST /api/organizations`, tenant slug switcher, org settings |
| | Custom Roles & RBAC Cards | ⭐ PRODUCTION READY | `GET/POST/DELETE /api/roles`, per-module `Permission` cards |
| | Organization Invitations | ⭐ PRODUCTION READY | `GET/POST/PATCH /api/invitations`, token hash, duplicate check |
| | Duplicate Invite Prevention | ⭐ PRODUCTION READY | Scoped to `[organizationId, normalizedEmail]`, prevents duplicates |
| | Resend & Revoke Invites | ⭐ PRODUCTION READY | `POST /api/invites/:id/action`, handles `RESEND`, `REVOKE`, `CANCEL` |
| | Account Disable & Suspend | ⭐ PRODUCTION READY | `PATCH /api/profiles/:id/status`, toggles `ACTIVE`, `DISABLED`, `SUSPENDED` |
| | Department & Role Assign | ⭐ PRODUCTION READY | `PATCH /api/members/:id/assignment`, assigns roles & department codes |
| | Tenant Data Isolation | ⭐ PRODUCTION READY | `organizationId` foreign key enforced across Prisma models |
| **Platform Shell & Navigation** | Munevo Home App Launcher | 🔵 BACKEND CONNECTED | `WorkspaceHome.tsx` iPhone/365 launcher, licensing permission check |
| | Persistent Top Navigation | ⭐ PRODUCTION READY | Unified product switcher, tenant dropdown, profile menu, search trigger |
| | Universal Search Modal | 🔵 BACKEND CONNECTED | `UniversalSearchModal.tsx`, searches properties, tracker, records |
| | Open Record Tabs | 🔵 BACKEND CONNECTED | `ChartingSystem.tsx` tabbed workspace for open records |
| | Universal Create Modal | 🔵 BACKEND CONNECTED | `UniversalCreateModal.tsx`, creates 311, permits, code cases |
| **Universal Operations Tracker** | 311 Resident Service Requests | 🟢 TESTED | `GET/POST/PATCH /api/tracker`, SLA progress, property auto-linking |
| | Building Permits Desk | 🟢 TESTED | `GET/POST /api/permits`, linked to Property canonical entity |
| | Code Enforcement Cases | 🟢 TESTED | `GET/POST /api/tracker`, violation category, inspector assignment |
| | Work Orders & Dispatch | 🔵 BACKEND CONNECTED | `POST /api/tracker`, department routing, mobile field dispatch |
| **Sentinel Camera Framework** | Public Camera Connectors | 🟢 TESTED | `CameraConnectorRegistry`, 511NJ, NJTA, NYC DOT connectors |
| | Secure Camera Proxy | 🟢 TESTED | `GET /api/cameras/:id/media`, SSRF check, domain allowlist |
| | AI Vision Observation Engine | 🟢 TESTED | `MunevoSentinelAiProvider`, vision model analysis output |
| | Risk Routing Rules | 🟢 TESTED | `RiskRoutingService`, low risk auto-draft vs high risk human verify |
| | Business CCTV Opt-In Program | 🟢 TESTED | `BusinessOptInLifecycleService`, 7-step wizard modal & API endpoints |
| **Munevo Safe Emergency CAD** | CAD Emergency Incidents | 🔵 BACKEND CONNECTED | `GET/POST /api/safe/incidents`, P1-P3 priority dispatch |
| | Silent SOS Resident Reporting | 🔵 BACKEND CONNECTED | Anonymous & silent SOS emergency report submission |
| **GIS Spatial Digital Twin** | Leaflet Interactive Map | 🔵 BACKEND CONNECTED | `GisMap.tsx`, parcel GeoJSON, geocoding, public camera pins |
| | GIS Spatial Analysis | 🔵 BACKEND CONNECTED | Address Intelligence Engine, ward/district lookup |
| **Open Records (FOIA / OPRA)** | Resident FOIA Requests | 🟢 TESTED | `GET/POST/PATCH /api/open-records`, requester details, status tracking |
| **Staff & Employee Directory** | Staff Directory & Certs | 🟢 TESTED | `GET/POST /api/employees`, office branch mapping, certifications |
| | Staff Timesheet Tracker | 🔵 BACKEND CONNECTED | Employee hours worked & notes persistence |
| **Legislative Hub** | Council Ordinances & Voting | 🟠 PARTIALLY FUNCTIONAL | `LegislativeHub.tsx`, agenda list, voting record ledger |
| **Municipal Analytics** | City Operational Health Index | 🟡 UI ONLY | `CityPulse.tsx`, health index cards, carbon footprint metrics |
| **Knowledge Graph Explorer** | Entity Relationship Graph | 🟡 UI ONLY | `KnowledgeGraph.tsx`, interactive node graph SVG visualizer |
| **App Licensing Marketplace** | Module Store & Licensing | 🟡 UI ONLY | `Marketplace.tsx`, workspace module licensing catalog |
| **Mobile Field View** | Mobile Field Worker View | 🔵 BACKEND CONNECTED | `MobileFieldView.tsx`, inspection checklists, photo uploads |

---
*End of FUNCTIONALITY_MATRIX.md*
