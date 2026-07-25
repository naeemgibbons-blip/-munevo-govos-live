# Munevo Government Cloud — API Route Inventory

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Complete Express API Catalog (70 Endpoints)

| Endpoint Path | HTTP Method | Module / Category | Description & Request Data | Status |
| :--- | :---: | :--- | :--- | :---: |
| `/api/properties` | `GET` | Property Anchor | List properties for active tenant org | ⭐ PRODUCTION READY |
| `/api/tracker` | `GET/POST` | Operations Tracker | Query or submit 311/Permit/Code tickets | ⭐ PRODUCTION READY |
| `/api/tracker/:id` | `PATCH/DELETE` | Operations Tracker | Update status or delete tracker item | ⭐ PRODUCTION READY |
| `/api/permits` | `GET/POST` | Permits | Building & zoning permit management | ⭐ PRODUCTION READY |
| `/api/inspections` | `GET/POST` | Inspections | Property & permit inspection checklists | ⭐ PRODUCTION READY |
| `/api/organizations` | `GET/POST` | Multi-Tenancy | Tenant organizations listing & creation | ⭐ PRODUCTION READY |
| `/api/organizations/:id` | `PATCH` | Multi-Tenancy | Update tenant configuration & enabled modules | ⭐ PRODUCTION READY |
| `/api/profiles/me` | `GET` | Identity & Profile | Resolve active profile & tenant context | ⭐ PRODUCTION READY |
| `/api/profiles` | `GET/POST/PATCH` | Identity & Profile | User profiles & badge ID assignments | ⭐ PRODUCTION READY |
| `/api/roles` | `GET/POST/DELETE` | Custom RBAC | Role definitions & per-module permissions | ⭐ PRODUCTION READY |
| `/api/invitations` | `GET/POST` | IAM Invitations | Issue user org invites (7-day token hash) | ⭐ PRODUCTION READY |
| `/api/invites/accept` | `POST` | IAM Invitations | Accept invitation & join organization | ⭐ PRODUCTION READY |
| `/api/invites/:id/action` | `POST` | IAM Invitations | Resend, Revoke, or Cancel invitation | ⭐ PRODUCTION READY |
| `/api/members` | `GET` | IAM Memberships | Multi-tenant organization member roster | ⭐ PRODUCTION READY |
| `/api/employees` | `GET/POST` | Staff Directory | Employee directory & municipal office links | ⭐ PRODUCTION READY |
| `/api/open-records` | `GET/POST/PATCH` | Open Records | Resident FOIA/OPRA requests tracking | ⭐ PRODUCTION READY |
| `/api/sentinel/signals` | `GET/POST` | Sentinel Signals | Public social/weather signals & verification | ⭐ PRODUCTION READY |
| `/api/camera-sources` | `GET` | Sentinel Cameras | Connector status list & health monitoring | ⭐ PRODUCTION READY |
| `/api/camera-sources/:id/health`| `GET` | Sentinel Cameras | Test individual camera connector health | ⭐ PRODUCTION READY |
| `/api/camera-sources/:id/sync` | `POST` | Sentinel Cameras | Trigger catalog synchronization for connector | ⭐ PRODUCTION READY |
| `/api/cameras` | `GET` | Sentinel Cameras | Combined list of public & opt-in cameras | ⭐ PRODUCTION READY |
| `/api/cameras/:id` | `GET` | Sentinel Cameras | Single canonical normalized camera record | ⭐ PRODUCTION READY |
| `/api/cameras/:id/media` | `GET` | Camera Media Proxy | SSRF-validated media & image proxying | ⭐ PRODUCTION READY |
| `/api/camera-observations` | `GET/POST/PATCH` | Camera Risk Engine | Camera observations & risk routing rules | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/applications`| `GET` | Business Opt-In | List opt-in CCTV applications & audit trail | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/apply` | `POST` | Business Opt-In | Step 1: Business application submission | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/:id/verify-ownership`| `POST` | Business Opt-In | Step 2: City ownership deed verification | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/:id/approve`| `POST` | Business Opt-In | Step 2: City participation approval | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/:id/test-connection`| `POST` | Business Opt-In | Step 3: Stream ping & HTTPS test | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/:id/install`| `POST` | Business Opt-In | Step 4: Install connection & assign camera ID | ⭐ PRODUCTION READY |
| `/api/sentinel/opt-in/:id/permissions`| `PATCH` | Business Opt-In | Step 5: Update business sharing preferences | ⭐ PRODUCTION READY |
| `/api/safe/incidents` | `GET/POST` | Munevo Safe CAD | Emergency CAD incidents & Silent SOS | ⭐ PRODUCTION READY |
| `/api/auth/entra/login` | `POST` | IAM & SSO | Microsoft Entra ID SSO initiation helper | ⭐ PRODUCTION READY |
| `/api/auth/reset-password` | `POST` | IAM Security | Password reset email request & token issue | ⭐ PRODUCTION READY |
| `/api/auth/confirm-reset` | `POST` | IAM Security | Complete password reset | ⭐ PRODUCTION READY |
| `/api/auth/session-config` | `GET/POST` | Workstation Security| Organization session lock & inactivity timeout | ⭐ PRODUCTION READY |
| `/api/auth/badge-reauth` | `POST` | Workstation Security| Smart Card NFC/PIV Badge reauthentication | ⭐ PRODUCTION READY |
| `/api/records/:type/:id/related`| `GET` | Unified Record | Related entities for canonical anchor record | ⭐ PRODUCTION READY |
| `/api/records/:type/:id/activity`| `GET/POST` | Unified Activity | Timeline activity ledger per record | ⭐ PRODUCTION READY |
| `/api/workflow/311/submit` | `POST` | 311 Workflow | Step 1: Resident 311 request submission | ⭐ PRODUCTION READY |
| `/api/workflow/311/:id/dispatch-field`| `POST` | 311 Workflow | Step 4: Dispatch to Mobile Field Worker | ⭐ PRODUCTION READY |
| `/api/workflow/311/:id/complete-work`| `POST` | 311 Workflow | Step 5: Field worker completion & photos | ⭐ PRODUCTION READY |
| `/api/workflow/311/:id/verify` | `POST` | 311 Workflow | Step 6: Supervisor verification & closure | ⭐ PRODUCTION READY |

---
*End of API_INVENTORY.md*
