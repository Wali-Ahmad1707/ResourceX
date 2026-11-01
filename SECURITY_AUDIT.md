# ResourceX — Comprehensive Security Audit Report
**Phase 8 Final Integration & Hardening**
*Date: November 2026 | Version: 1.0.0-production-ready*

---

## 1. Executive Summary

A comprehensive security audit of **ResourceX** was conducted across all application layers, including authentication, authorization (RBAC), API boundaries, cryptographic verification, file uploads, database transactions, input validation, and payment processing.

All critical vulnerabilities identified during architectural review have been addressed through defense-in-depth mitigations. The application uses parameterized SQLite queries, constant-time HMAC SHA-256 signatures, scrypt password hashing with unique 16-byte cryptographic salts, HttpOnly SameSite session cookies, and in-memory sliding window rate limiting.

---

## 2. Security Assessment Matrix

| Vulnerability Category | Severity | Initial Status | Mitigation Applied | Residual Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Brute Force / Credential Stuffing** | Medium | No rate limiting on auth endpoints | Implemented sliding-window rate limiting in `lib/rate-limit.ts` (40 req/min limit on login, 30 on register) with `Retry-After` headers. | Low |
| **Payment Order Flooding** | Medium | Unbounded order creation | Implemented user-scoped rate limiting (50 req/min) on `/api/payments/create-order`. | Low |
| **Timing Attacks on Signatures & Hashes** | High | Potential timing leaks | Constant-time comparison enforced via `crypto.timingSafeEqual` in `verifyPassword`, `verifyJwt`, `verifyPaymentSignature`, and `verifyWebhookSignature`. | Negligible |
| **Insecure Direct Object Reference (IDOR)** | High | Risk of accessing other users' bookings/payments | Ownership validation enforced server-side: borrowers can only view/cancel their own bookings and payments; owners can only inspect requests for their own listings. | Negligible |
| **Malicious File Upload / Remote Code Execution** | Critical | Arbitrary file extension risk | Strict 5MB file size limit, MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`), randomized cryptographic filenames, extension re-mapped server-side. | Low |
| **SQL Injection** | Critical | Risk with dynamic SQL strings | 100% of SQLite database operations utilize parameterized queries with prepared statements (`db.prepare('... ?').run(...)`). Zero string interpolation. | Negligible |
| **Misleading Financial Escrow Claims** | Medium | UI claimed "legal escrow trust" | Corrected UI messaging to "platform-held refundable security deposit", clarifying platform holding rather than third-party custodial banking trust. | Informational / Compliance |
| **Last Administrator Lockout** | High | Risk of demoting last admin | Safeguard implemented in `PATCH /api/admin/users/[id]` preventing demotion or suspension of the platform's last active administrator. | Negligible |
| **Database Exposure in Git** | High | `data/*.db` unignored in `.gitignore` | Updated `.gitignore` to explicitly ignore `data/*.db*`, `*.db`, `/public/uploads/*`, and server logs. Backed up `resourcex.db.bak`. | Negligible |
| **Missing HTTP Security Headers** | Medium | Default Next.js headers | Configured `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, and `Permissions-Policy` in `next.config.mjs`. | Negligible |

---

## 3. Dependency & Vulnerability Audit (`pnpm audit`)

Running `pnpm audit` against the production package manifest yielded 49 advisory notices (4 low, 20 moderate, 21 high, 4 critical), with primary focus on the upstream Next.js framework package (`next@16.0.10`):

- **GHSA-p293-qw3h-jr36**: Unauthenticated RCE on Windows-hosted servers (Patched in `>=16.3.3`).
- **GHSA-vfv6-92ff-j949**: Image Optimization API advisory when AVIF files are used.
- **GHSA-39w2-rjm5-chcv**: Development server Model Context Protocol info disclosure.

### Mitigations & Compensating Controls:
1. **Windows-hosted server vulnerability**: ResourceX production deployments run on Linux container environments (Alpine / Debian Node.js 20/22 runtime) behind an Nginx reverse proxy.
2. **Image Optimization**: `next.config.mjs` explicitly sets `images: { unoptimized: true }`, completely bypassing Next.js internal image processing server routes.
3. **AVIF restriction**: Upload handlers strictly whitelist `image/jpeg`, `image/png`, `image/webp`, and `image/gif`. AVIF is not accepted.
4. **Upgrade Roadmap**: When the upstream Next.js repository publishes a stable general availability release of `16.3.x` compatible with Turbopack and React 19, an automated patch bump will resolve remaining advisory alerts.

---

## 4. Authentication & Session Security

1. **Password Storage**:
   - Algorithm: `scrypt` with 64-byte key length.
   - Salt: 16-byte cryptographically random hex salt per user (`crypto.randomBytes(16)`).
   - Format: `${salt}:${derivedKeyHex}`.
2. **JWT Implementation**:
   - Signature: HMAC-SHA256 (`HS256`).
   - Expiration: 24 hours standard (7 days with Remember Me).
   - Cookie Parameters:
     - `httpOnly: true` (prevents XSS access).
     - `sameSite: "lax"` (mitigates CSRF).
     - `secure: true` on HTTPS connections.
     - `path: "/"`.
3. **Immediate Session Invalidation**:
   - `getCurrentUser()` inspects the SQLite database on each request.
   - If an administrator suspends a user (`status = 'suspended'`), subsequent requests immediately fail with `401 Unauthorized` without waiting for the JWT token to expire.

---

## 5. Authorization & RBAC Matrix

| Role | Resource Catalog | Booking Request | Booking Approval | Own Payments | Escrow Refunds | Admin Control Panel |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Guest / Anonymous** | Read-Only | Denied (401) | Denied (401) | Denied (401) | Denied (401) | Denied (401) |
| **Borrower** | Read-Only | Permitted | Denied (403) | Permitted (Own) | Denied (403) | Denied (403) |
| **Owner** | Full Management | Denied (403) | Permitted (Own) | Permitted (Escrow) | Denied (403) | Denied (403) |
| **Admin** | Moderation | Permitted | Permitted | Full Access | Full Access | Full Access |

---

## 6. Payment & Financial Integrity

1. **Integer Arithmetic in Paise**:
   - All monetary amounts are computed and stored as integer paise ($1\text{ INR} = 100\text{ paise}$).
   - Client-side requested prices are ignored; deposit amounts are extracted server-side from catalog resource records.
2. **Razorpay Test Mode**:
   - `PAYMENT_MODE=test` ensures no real money is ever processed.
   - API keys are prefixed with `rzp_test_`.
3. **Idempotency & Concurrency**:
   - Webhook deliveries are deduplicated via unique `eventId` indexing in `payment_webhook_events`.
   - Redundant payment verifications return existing captured records idempotently.
4. **Refund Safeguards**:
   - Admin refunds enforce $\text{amount} \le \text{remaining refundable balance}$.
   - Every refund action creates an immutable audit trail (`REFUND_PROCESSED`).

---

## 7. Residual Risks & Operational Recommendations

1. **Persistent Storage Requirement**: SQLite requires persistent storage. Ephemeral serverless platforms (e.g. standard AWS Lambda, Vercel Serverless) must not be used without persistent volume attachments.
2. **Reverse Proxy SSL**: Deploy behind Nginx, Caddy, or Cloudflare with TLS 1.3 to terminate HTTPS and provide edge rate limiting.
3. **Secret Rotation**: Change `JWT_SECRET` and Razorpay production keys upon deploying to live environments.

---

## 8. Pre-Push Security Hardening (Public Repository Cleanup)

Prior to the public GitHub repository release, the codebase underwent a targeted credential eradication and secret hardening cleanup:

1. **Login Interface Sanitization (`app/login/page.tsx`)**:
   - Removed all quick-login demo shortcut buttons (`handleQuickLogin`) and hardcoded demo credentials.
   - Removed displayed email/password combinations from modal dialogs and replaced them with standard account recovery instructions.
   - Preserved full authentication and registration workflows.

2. **JWT Secret Enforcement (`lib/auth.ts`)**:
   - Removed hardcoded fallback JWT secret (`resourcex-super-secure-...`).
   - Implemented `getJwtSecret()`: requires `JWT_SECRET` from environment variables, failing immediately and securely if missing or empty.
   - Verified that session signing never uses predictable defaults.

3. **Database Initialization & Demo Seeding Hardening (`lib/db.ts`)**:
   - Removed all hardcoded demo passwords from database initialization routines.
   - Demo account creation is now strictly opt-in via development-only environment flags (`SEED_DEMO_ACCOUNTS=true` or `ENABLE_DEMO_ACCOUNTS=true`).
   - Demo accounts are explicitly disabled when `NODE_ENV === "production"`.
   - Passwords for demo accounts must be supplied via environment variables (`DEMO_BORROWER_PASSWORD`, `DEMO_OWNER_PASSWORD`, `DEMO_ADMIN_PASSWORD`), dynamically hashed with unique 16-byte random salts.

4. **Client-Server Boundary Hardening (`lib/currency.ts`)**:
   - Extracted universal currency and deposit parsing functions (`formatPaiseToINR`, `parseDepositToPaise`) into a pure client-safe utility module (`lib/currency.ts`).
   - Eliminated leakage of `node:crypto` and server SDKs into client-rendered bundles.

5. **Environment Configuration Security (`.env.example`)**:
   - Documented all required and optional environment keys with safe, descriptive placeholders.
   - Zero real passwords, API secrets, or private keys committed to source control.
   - `.gitignore` explicitly excludes `.env*` while preserving `.env.example`.
