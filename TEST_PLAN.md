# Munevo Government Cloud — Automated & Quality Assurance Test Plan

**Document Version:** 1.0.0  
**Date:** July 25, 2026  
**Git Branch:** `platform-hardening`

---

## 1. Test Strategy Overview

The testing strategy validates system reliability, multi-tenant data isolation, security controls, and end-to-end user workflows across three levels:

1. **Static Analysis & Type Safety:** TypeScript compiler checking (`tsc --noEmit`) to verify zero type mismatches or broken interfaces.
2. **Automated Unit & Integration Testing:** Automated test execution suite (`src/services/cameras/tests/runTests.ts`) testing connector registration, normalizers, media access, SSRF security, risk routing, and business opt-in lifecycles.
3. **End-to-End Persona Verification:** Role-based scenario testing covering platform administrators, municipal directors, supervisors, field workers, city clerks, and residents.

---

## 2. Test Execution Commands

```bash
# 1. Type Safety Verification
npm run tsc --noEmit

# 2. Camera Connector & Security Suite
npx tsx src/services/cameras/tests/runTests.ts

# 3. Production Build Validation
npm run build
```

---

## 3. Test Suites & Coverage Matrix

### 3.1 Authentication & IAM Security Suite
- [x] Email/password sign-in and Supabase token validation.
- [x] Password reset request dispatch and token expiration.
- [x] Multi-tenant organization switching without session destruction.
- [x] Organization invitation token hashing, 7-day expiration, duplicate invite rejection, resend/revoke.
- [x] Session inactivity lock countdown, warning modal, and badge tap reauthentication (`POST /api/auth/badge-reauth`).

### 3.2 Multi-Tenant Data Isolation Suite
- [x] Enforces `organizationId` matching on all Prisma queries.
- [x] Verifies cross-tenant data leakage is prevented when fetching properties, tracker items, or camera sources.

### 3.3 Camera Connector & Media Proxy Security Suite
- [x] Validates normalized camera model structure across NJ511, NJTA, NYC DOT, and External connectors.
- [x] Verified SSRF protection: blocks private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`) and enforces fixed domain allowlist (`nyctmc.org`, `511nj.org`, `njta.gov`).
- [x] Verified low risk (auto-draft service request) vs. safety-critical risk (human verification required) routing rules.
- [x] Verified 7-step business CCTV opt-in lifecycle wizard and granular permission toggles.

### 3.4 Reference 311 End-to-End Vertical Workflow Suite
- [x] **Step 1:** Resident submits 311 request via portal → Saved to `TrackerItem` and `Activity` ledger (`POST /api/workflow/311/submit`).
- [x] **Step 2:** GIS engine geocodes address and links canonical `Property` entity.
- [x] **Step 3:** Auto-categorizes risk tier and routes to responsible department queue.
- [x] **Step 4:** Supervisor assigns and dispatches field employee (`POST /api/workflow/311/:id/dispatch-field`).
- [x] **Step 5:** Field worker receives assignment on Mobile Field View, completes work, and attaches photos (`POST /api/workflow/311/:id/complete-work`).
- [x] **Step 6:** Supervisor verifies completion, resolves case, dispatches status update, and updates GIS timeline (`POST /api/workflow/311/:id/verify`).

---
*End of TEST_PLAN.md*
