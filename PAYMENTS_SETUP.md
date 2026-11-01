# ResourceX â€” Razorpay Payment Gateway & Escrow Setup Guide

This guide documents the configuration, architecture, test credentials, webhook wiring, and security procedures for the **Phase 7 Payment & Escrow Subsystem** in ResourceX.

---

## 1. Overview & Architecture

ResourceX implements a community escrow system for resource security deposits using **Razorpay Test Mode**.

- **Currency & Precision**: Strictly Indian Rupee (INR) calculated using **integer arithmetic in paise** (1 INR = 100 paise; e.g. â‚¹50 = 5000 paise). This completely eliminates floating-point rounding inaccuracies.
- **Server-Side Authority**: Deposit amounts are computed exclusively on the server from validated resource database records. Client-submitted prices are rejected.
- **Cryptographic Signatures**: All payment callback signatures and webhook payloads are verified server-side using HMAC SHA-256 via `crypto.timingSafeEqual`.
- **Database Persistence**: Every order, captured payment, administrative refund, and incoming webhook is persisted in SQLite with relational foreign keys.

---

## 2. Environment Configuration

Copy `.env.example` to `.env.local` or set environment variables in your environment:

```env
# Razorpay Test Mode Credentials
# Obtain from Razorpay Dashboard -> Settings -> API Keys (ensure Test Mode is toggled on)
RAZORPAY_KEY_ID="rzp_test_your_test_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_test_key_secret"

# Webhook Secret configured in Razorpay Dashboard -> Webhooks
RAZORPAY_WEBHOOK_SECRET="your_custom_webhook_secret_12345"

# Public Key for Browser Checkout Dialogs
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_test_key_id"

# Payment Environment ("test" or "live" â€” strictly "test" for Phase 7)
PAYMENT_MODE="test"

# JWT Authentication Secret
JWT_SECRET="replace_with_a_random_secret_at_least_32_chars"
```

---

## 3. Obtaining Razorpay Test Credentials

1. Navigate to [Razorpay Dashboard](https://dashboard.razorpay.com/) and register or sign in.
2. In the top navigation bar or left sidebar, toggle **Test Mode** on.
3. Go to **Settings** > **API Keys**.
4. Click **Generate Test Key**.
5. Copy the generated `Key Id` and `Key Secret`.
6. Paste them into `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local`.

---

## 4. Configuring Webhooks

1. In Razorpay Dashboard (Test Mode), navigate to **Settings** > **Webhooks**.
2. Click **Add New Webhook**.
3. Set Webhook URL to:
   - Local development with ngrok/tunnel: `https://<your-subdomain>.ngrok-free.app/api/webhooks/razorpay`
   - Production / Staging: `https://<domain>/api/webhooks/razorpay`
4. Set **Secret** to match `RAZORPAY_WEBHOOK_SECRET` from your `.env.local`.
5. Under **Active Events**, select:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
6. Click **Save Webhook**.

---

## 5. Razorpay Test Payment Instruments

Razorpay provides sandbox instruments for testing without deducting real currency:

### A. Test Credit / Debit Cards
| Card Network | Card Number | Expiry | CVV | OTP / PIN |
| :--- | :--- | :--- | :--- | :--- |
| **Visa (Success)** | `4012 0010 3000` or `4111 1111 1111 1111` | Any future date | `123` | Any 4-6 digits |
| **Mastercard (Success)** | `5123 4567 8901 2346` | Any future date | `123` | Any 4-6 digits |
| **RuPay (Success)** | `5081 5900 0000 0000` | Any future date | `123` | Any 4-6 digits |
| **Declined / Failed Card** | `4012 0010 3001` | Any future date | `123` | Fails at gateway |

### B. Test UPI
- Success VPA: `success@razorpay`
- Failure VPA: `failure@razorpay`

### C. Test NetBanking
- Select any bank (e.g. HDFC, SBI, ICICI) in the test modal.
- Choose **Success** or **Failure** on the simulated bank redirection page.

---

## 6. End-to-End Workflow Testing

### Flow 1: Security Deposit Payment
1. Sign in as a borrower (`borrower@resourcex.com` / `password123`).
2. Go to `/profile` or `/resources`.
3. Locate an active or approved booking.
4. Click **Pay Deposit**.
5. Review the calculated escrow deposit in the dialog.
6. Click **Authorize Test Deposit**.
7. The deposit status updates to `paid` and escrow protection is activated.
8. View the transaction receipt under `/dashboard/borrower/payments`.

### Flow 2: Owner Escrow Verification
1. Sign in as an owner (`your-local-owner-account`).
2. Navigate to `/dashboard/owner/payments`.
3. View the list of equipment deposits held in platform escrow, borrower information, and total active collateral protection.

### Flow 3: Administrative Refunds
1. Sign in as an admin (`your-local-admin-account`).
2. Navigate to `/dashboard/admin/payments`.
3. View platform payment metrics (total volume captured in â‚¹, refund volume, transaction counts).
4. In the transactions table, find a captured deposit and click **Issue Refund**.
5. Enter the refund amount (supports partial or full return) and select a reason.
6. Click **Authorize & Process Refund**.
7. Verify that:
   - Payment status updates to `refunded` or `partially_refunded`.
   - Associated booking `depositStatus` updates accordingly.
   - An immutable audit trail entry (`REFUND_PROCESSED`) is recorded.
   - Automated in-app notifications are delivered to both borrower and owner.

---

## 7. Security Best Practices

> [!CAUTION]
> **Strict Security Rules**
> 1. **Never use Live API keys** during development, testing, or demonstrations.
> 2. **Never expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET`** to browser bundles or public repositories.
> 3. **Never trust client-submitted transaction amounts**; always derive amounts server-side from catalog listings.
> 4. **Never accept payments without verifying signatures** using constant-time comparison (`crypto.timingSafeEqual`).
> 5. **Idempotent processing**: Ensure webhook event IDs and payment IDs are tracked to prevent duplicate captures or double refunds.

---

## 8. Financial Regulatory & Custody Disclosures (Phase 8 Compliance)

- **Platform-Held Security Deposits**: Funds collected via Razorpay Test Mode represent refundable security deposits held by the platform merchant account under platform terms of service. They do not constitute an independent banking trust or escrow account managed by a licensed escrow depository agent.
- **Settlement & Custody Model**: In live operation, Razorpay settles funds into the verified platform account. Refunds are processed back to the original funding instrument.
- **Rate Limiting**: Order creation is throttled to 50 requests per minute per user via `lib/rate-limit.ts` to prevent order flooding or inventory locking abuse.

