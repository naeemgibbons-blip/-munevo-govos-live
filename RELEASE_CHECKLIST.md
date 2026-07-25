# Munevo Government Cloud — Release & Deployment Checklist

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Pre-Deployment Environment Verification

- [x] **Environment Variables Configured:**
  - `DATABASE_URL` set to pgBouncer transaction pooler (port 6543).
  - `DIRECT_URL` set to direct session pooler (port 5432).
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` active.
  - `SUPABASE_SERVICE_ROLE_KEY` populated.
- [x] **Git Branch Hygiene:** Clean working state on `platform-hardening` branch.

---

## 2. Database & Schema Verification

- [x] Prisma schema syntax and relation validation (`schema.prisma` contains 29 models).
- [x] Generated latest Prisma Client (`npx prisma generate`).
- [x] All tenant models include `organizationId` foreign key and indexes.

---

## 3. Code Quality & Build Verification

- [x] TypeScript compiler validation (`npx tsc --noEmit` passes with 0 errors).
- [x] Production bundle build (`npx vite build` outputs minified assets in `dist/`).
- [x] Automated test suite execution (`npx tsx src/services/cameras/tests/runTests.ts` passes 100%).

---

## 4. Operational & Security Checklist

- [x] **Tenant Isolation:** Backend middleware validates `x-organization-id` header on all API calls.
- [x] **Credential Safety:** No raw passwords, secrets, or tokens stored unencrypted in browser storage or logs.
- [x] **SSRF Protection:** Camera media proxy enforces domain allowlist and blocks private IP ranges.
- [x] **Session Security:** Workstation inactivity lock countdown and badge tap reauthentication enabled.
- [x] **Audit Ledger:** All CRUD actions, logins, invites, and role changes logged to `AuditLog`.

---
*End of RELEASE_CHECKLIST.md*
