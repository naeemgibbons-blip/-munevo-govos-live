# Munevo Government Cloud — Security & Compliance Notes

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Multi-Tenant Authorization & Boundary Isolation

Multi-tenancy in Munevo Government Cloud is secured across three defense layers:

1. **Database Row-Level Isolation:** Every tenant-owned model features `organizationId` foreign keys indexed with `@@index([organizationId])`.
2. **Backend API Middleware Guard:** API endpoints validate `x-organization-id` header against user profiles and enforce `where: { organizationId }` on all database operations.
3. **Frontend Permission Filtering:** App launcher and sidebars filter products and modules according to user custom role permissions cards (`canView`, `canEdit`).

---

## 2. Server-Side Request Forgery (SSRF) & Media Proxy Security

The camera media proxy (`/api/cameras/:id/media`) implements strict SSRF protection:

- **HTTPS Protocol Requirement:** Requests using plain HTTP or non-web protocols are rejected.
- **Fixed Domain Allowlist:** Only approved traffic camera domains (`webcams.nyctmc.org`, `511nj.org`, `www.511nj.org`, `njta.gov`, `www.njta.gov`, `images.unsplash.com`) are allowed.
- **Private IP & Localhost Blocking:** Rejects requests to `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`, `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`, and `169.254.0.0/16`.
- **Payload & Content Limits:** Maximum 10 MB payload size, 8-second request timeout, and `Content-Type` validation (`image/jpeg`, `image/png`, `video/mp4`).

---

## 3. Workstation Session Lock & Smart Card Authentication

- **Inactivity Timeout:** Workstation locks automatically after a configurable inactivity threshold (default: 15 minutes).
- **60-Second Warning:** Displays a visual countdown modal before locking.
- **Multi-Tab Sync:** Utilizes `BroadcastChannel` to lock or sign out all open tabs simultaneously.
- **Smart Card / Badge Tap Reauth:** High-security municipal environments support NFC/PIV badge tap reauthentication (`POST /api/auth/badge-reauth`) with PIN validation.

---

## 4. Immutable Audit Ledger

All administrative, identity, record mutation, and camera access actions are recorded in the `AuditLog` table with:
- `organizationId`
- `userId` & `userEmail`
- `action` (e.g. `CREATE`, `UPDATE`, `DELETE`, `INVITE_SENT`, `PASSWORD_RESET_COMPLETED`, `CAMERA_CATALOG_ACCESSED`)
- `tableName` & `recordId`
- `oldValues` & `newValues` JSON snapshots
- Timestamp (`createdAt`)

---
*End of SECURITY_NOTES.md*
