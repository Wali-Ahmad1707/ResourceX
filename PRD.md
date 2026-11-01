# Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-10-31

---

## 1. Problem Statement
People often need to borrow or share specialized resources (e.g., outdoor gear, tools, equipment) but lack a trusted, transparent platform to connect owners with borrowers securely. Existing marketplaces focus on commercial sales rather than temporary, trust‑based sharing.

## 2. Product Vision
Create **CODEVERSE**, a trusted resource‑sharing platform that enables owners to list items, users to discover and request them, and both parties to manage bookings with clear accountability, minimal friction, and a premium visual experience inspired by the Evasion design system.

## 3. Target Users & Roles
| Role | Description |
|------|-------------|
| **Guest** | Browses publicly available resources, sees teasers. |
| **User / Borrower** | Registers, creates a profile, searches for resources, submits booking requests, and manages own bookings. |
| **Owner** | Registers, lists resources, sets eligibility criteria, reviews and approves/rejects booking requests, manages own inventory. |
| **Admin** (future) | Oversees platform health, resolves disputes, audits activity. |

## 4. Core Value Proposition
- **Trust** – Transparent eligibility rules, owner‑approved bookings, audit trail.
- **Efficiency** – Fast discovery, instant request flow, automated status updates.
- **Premium Experience** – High‑quality visual design, smooth animations, responsive UI.
- **Community** – Ability to rate resources, report conditions, and build reputation.

## 5. Functional Requirements
1. **User Management** – Sign‑up, login (email/password), profile editing, password reset.
2. **Resource Listing** – Owners can create resource entries with title, description, images, eligibility rules, and availability calendar.
3. **Discovery** – Search & filter resources by category, location, availability.
4. **Booking Workflow** – Borrower requests a resource, owner reviews, decides (approve/reject), borrower receives confirmation.
5. **Waitlist** – If a resource is unavailable, users can join a waitlist; owners allocate based on FIFO.
6. **Condition Reporting** – After return, borrower reports condition; owner can approve or flag damage.
7. **Notifications** – Email (or placeholder) alerts for request status changes.
8. **Dashboard** – Separate views for borrowers and owners with relevant actions.
9. **Audit Log** – Immutable record of all state changes for compliance.

## 6. Non‑Functional Requirements
- **Performance** – Page load < 2 s on typical 3G connection.
- **Security** – OWASP Top 10 mitigations, password hashing, HTTPS.
- **Scalability** – Horizontal scaling possible; MVP runs on a single Node/Next instance.
- **Accessibility** – WCAG AA compliance.
- **Reliability** – 99% uptime for demo period.
- **Data Privacy** – GDPR‑style consent for personal data; no AI‑driven decisions without human approval.

## 7. Features & User Journeys
### Guest
1. Land on **Landing Page** → view hero, featured resources, navigation.
2. Click **Explore** → view public resource list (limited details).

### Borrower
1. Register / login.
2. Visit **Resource Discovery** → apply filters, view resource cards.
3. Click a resource → open **Resource Detail**.
4. Click **Request** → fill optional request note → submit.
5. Receive **Booking Request** status (Pending).
6. Owner approves → borrower sees **Confirmed** booking.
7. After use, borrower marks **Returned**, optionally reports condition.
8. View **Booking Management** screen for history.

### Owner
1. Register / login.
2. Access **Owner Dashboard** → **Create/Edit Resource**.
3. Define eligibility (e.g., age, verified identity) – **OPEN DECISION** on exact rule set.
4. Receive incoming **Booking Requests** → approve/reject.
5. Manage **Waitlist** if applicable.
6. After return, review **Condition Report** → accept or flag damage.
7. View **Analytics** (future) – **OPEN DECISION** on metrics.

## 8. Success Metrics
- **Acquisition**: ≥ 50 registered users by the end of the 48‑hour hackathon demo.
- **Engagement**: ≥ 20 resource listings created.
- **Conversion**: ≥ 10 booking requests submitted, with ≥ 70% approved.
- **Retention**: Users returning to the dashboard within 24 h of first login.
- **Performance**: Average page load ≤ 1.8 s on demo environment.

## 9. MVP Acceptance Criteria
- All functional requirements #1‑9 are implemented and pass functional tests.
- Visual design matches **DESIGN.md** (fonts, colours, spacing, animations).
- Authentication works with email/password.
- Owner can approve/reject a booking request and the status updates in real time.
- Waitlist functionality works for at least one resource.
- Audit log records every state change with timestamp and actor.
- Documentation (this PRD, ARCHITECTURE, API_CONTRACT, etc.) is complete.
- Demo flow runs end‑to‑end without errors.

## 10. Phase 7: Payment Gateway, Security Deposits, Refunds & Escrow System
- **Test Mode Gateway**: Integrated Razorpay Test Mode with INR support.
- **Integer Arithmetic in Paise**: Avoids floating-point discrepancies; 1 INR = 100 paise.
- **Server-Side Authorization**: Deposit requirements are verified server-side against listing specifications.
- **HMAC SHA-256 Signatures**: Verification of payment callbacks and webhook events using constant-time comparison (`crypto.timingSafeEqual`).
- **Escrow & Refund Lifecycle**: Security deposits held during reservations, with support for full or partial administrative refunds and automatic state synchronization with bookings.
- **Idempotent Webhooks**: Tracking of webhook event IDs to prevent duplicate transaction state updates.

## 11. Phase 8: Final Integration, Security Hardening, Performance Optimization & Deployment Readiness
- **Complete System Integration**: End-to-end integration verified across discovery, booking calendar, approvals, security deposits, dispute resolution, and community reviews.
- **Security Hardening**: Sliding-window in-memory rate limiting (`lib/rate-limit.ts`) implemented on authentication and payment creation endpoints.
- **Transport & Browser Security**: Enforced HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`).
- **Error Boundaries & Reliability**: Custom branded 404 page (`app/not-found.tsx`), client error boundary (`app/error.tsx`), and root error boundary (`app/global-error.tsx`).
- **Financial Compliance Alignment**: Adjusted UI terminology to reflect platform-held security deposits, eliminating misleading claims of third-party legal escrow banking trusts.
- **Production Persistence Requirements**: Full operational deployment documentation in `DEPLOYMENT_GUIDE.md` detailing persistent disk volume requirements for SQLite and uploads.
- **Comprehensive Regression Suite**: Phase 4 (20 tests), Phase 5 (27 tests), Phase 6 (44 tests), Phase 7 (45 tests), and Phase 8 (25 tests) all pass with zero errors.

---

*All specifications are derived from the existing design audit and the agreed project scope. Unknown decisions are flagged as `OPEN DECISION`.*
