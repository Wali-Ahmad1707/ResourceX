# Architecture Overview

**Version:** 1.0  
**Date:** 2026-10-31

---

## 1. System Overview
CODEVERSE is a **single‑page application (SPA)** built with **Next.js 16** (React 19) on the frontend and **Node.js** (via Next API routes) for backend logic. All UI follows the **Evasion design system** defined in `DESIGN.md`.

The system consists of:
- **Frontend** – React components, pages, and API client.
- **Backend** – Next.js API routes handling authentication, resource CRUD, booking workflow, and audit logging.
- **Database** – PostgreSQL (or SQLite for the hackathon) accessed via Prisma ORM (not yet added but assumed).
- **Static Asset Store** – Local `public/` folder for images; future cloud storage optional.
- **Optional AI services** – Placeholder for visual condition assessment (see `AI_GUARDRAILS.md`).

## 2. Frontend Architecture
- **Pages** (`app/page.tsx`, `app/layout.tsx`) compose the public landing page and protected routes.
- **Components** – Re‑usable UI (Header, Footer, Card, Button, FadeImage, etc.) built with Tailwind CSS and Radix UI primitives.
- **State Management** – React context for auth (`next-themes` for theme), local component state for forms and bookings.
- **Routing** – Next.js file‑system routing; protected routes check auth session.
- **Styling** – Tailwind utility classes; custom colours via CSS variables from `globals.css`.
- **Animations** – CSS keyframes defined in `globals.css` and applied via Tailwind animation utilities.

## 3. Backend Architecture
- **API Layer** – Next.js API routes (`/api/auth/*`, `/api/resources/*`, `/api/bookings/*`).
- **Business Logic** – Encapsulated in service modules (e.g., `services/auth.ts`, `services/bookings.ts`).
- **Authentication** – JWT‑based sessions stored in HTTP‑only cookies; password hashing with bcrypt.
- **Authorization** – Role checks (borrower vs owner) enforced in each endpoint.
- **Audit Logging** – Every state change writes to `audit_logs` table.
- **Error Handling** – Uniform JSON error responses (`errorCode`, `message`).

## 4. Database Architecture
- See `DATABASE_SCHEMA.md` for detailed ER diagram and table definitions.
- Primary tables: `users`, `resources`, `bookings`, `waitlist_entries`, `audit_logs`.
- Relationships enforce ownership (`resources.ownerId → users.id`) and booking ties.

## 5. Authentication & Authorization
- **Sign‑up / Login** – Email + password, stored hashed.
- **Session** – JWT signed with server secret, stored in `HttpOnly` cookie.
- **Roles** – `user` (can borrow) and `owner` (can list & approve). A user can be both roles.
- **Policy** – Owners can only modify their own resources; borrowers can only view/modify their own bookings.

## 6. AI Integration Architecture
- **Current State** – No AI model is integrated in the MVP (see `AI_GUARDRAILS.md`).
- **Future Hook** – An optional microservice could receive an image URL and return a condition score; the result must be reviewed by a human before any automated decision.

## 7. File / Image Storage
- Images uploaded via the UI are stored in the `public/uploads/` directory (local for hackathon). Paths are saved in the `resources.images` JSON column.
- The `FadeImage` component lazily loads images and applies the verified fade‑in animation.

## 8. External Services
- **Email Service** – Placeholder (e.g., console log) for development; production could use SendGrid.
- **Analytics** – `@vercel/analytics` is included but not required for MVP.

## 9. Data Flow
1. **User registers** → POST `/api/auth/register` → creates `users` record, returns session cookie.
2. **Owner creates resource** → POST `/api/resources` → stores metadata, images.
3. **Borrower searches** → GET `/api/resources?query=…` → returns list with pagination.
4. **Booking request** → POST `/api/bookings` → creates `bookings` with status `PENDING` and writes audit log.
5. **Owner approves** → PATCH `/api/bookings/:id` (status → `APPROVED`) → audit entry.
6. **Borrower marks returned** → PATCH `/api/bookings/:id` (status → `RETURNED`) → condition report optional.
7. **Waitlist allocation** – When a booking is cancelled, the next entry is promoted.

## 10. Scalability & Security Considerations
- **Stateless API** – JWT enables horizontal scaling without sticky sessions.
- **Rate Limiting** – To be added (OPEN DECISION).
- **Input Validation** – `zod` schemas on all endpoints.
- **CSRF Protection** – SameSite cookies; POST routes require CSRF token (OPEN DECISION).
- **Data Encryption** – TLS enforced in production.
- **Auditability** – Immutable `audit_logs` with timestamps and actor IDs.

## 11. Payment Gateway & Escrow Subsystem (Phase 7)
- **Integration**: Razorpay SDK (`razorpay@2.9.8`) operating exclusively in **Test Mode**.
- **Currency System**: Indian Rupee (`INR`) stored and processed strictly as integer paise (1 INR = 100 paise) to prevent floating-point inaccuracies.
- **Server Authority**: Amount derivation strictly server-side from catalog resource records.
- **Signature Cryptography**: Verification of Razorpay payment signatures (`order_id|payment_id`) and webhook payload signatures using `crypto.createHmac("sha256")` and `crypto.timingSafeEqual`.
- **Database Tables**:
  - `payments`: Tracks orders, statuses (`created`, `captured`, `failed`, `refunded`, `partially_refunded`), Razorpay IDs, and timestamps.
  - `refunds`: Tracks partial or full security deposit refunds issued by administrators.
  - `payment_webhook_events`: Idempotent log of incoming Razorpay webhook events to prevent duplicate state transitions.
- **Booking State Synchronization**: Bookings maintain `depositStatus` (`awaiting_payment`, `paid`, `held`, `refunded`, `partially_refunded`) updated atomically upon payment verification or refund processing.

## 12. Security Architecture, Error Boundaries & Deployment Infrastructure (Phase 8)
- **Sliding-Window Rate Limiting**: In-memory rate limiting (`lib/rate-limit.ts`) guarding authentication and payment endpoints against credential stuffing and automated order flooding.
- **HTTP Transport Hardening**: Strict response headers configured in `next.config.mjs` enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy`, and `Permissions-Policy`.
- **Fault-Tolerant Error Boundaries**: Custom branded 404 handler (`app/not-found.tsx`), client error boundary (`app/error.tsx`), and root error boundary (`app/global-error.tsx`) displaying user-friendly recovery actions without exposing stack traces.
- **Persistent Storage Architecture**: Architecture strictly mandates persistent container volumes or VM block storage for `node:sqlite` database (`data/resourcex.db*`) and uploaded assets (`public/uploads/*`). Ephemeral serverless executions are prohibited.
- **Zero-Downtime Database Backups**: SQLite running in WAL mode with support for online atomic snapshotting via `VACUUM INTO`.

---

*All architectural decisions are aligned with the product requirements (PRD) and the design system (`DESIGN.md`).*
