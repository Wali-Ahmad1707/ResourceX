# ResourceX — Vercel & Turso Production Deployment Guide

This guide provides step-by-step instructions for deploying **ResourceX** to [Vercel](https://vercel.com/) with a serverless cloud database on [Turso](https://turso.tech/) and cloud media storage on [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).

---

## 1. Architecture Overview

ResourceX is designed for serverless execution:
- **Compute**: Next.js 16 App Router on Vercel Serverless Functions (stateless, zero persistent local disk dependency).
- **Database**: Turso Cloud SQLite over HTTP/WebSocket via `@libsql/client`.
- **Media Storage**: Vercel Blob via `@vercel/blob` (public CDN-hosted resource photos).
- **Payments**: Razorpay Node SDK in **Test Mode** (`PAYMENT_MODE=test`).
- **Authentication**: JWT stored in secure `HttpOnly` cookies, signed using `JWT_SECRET`.

---

## 2. Prerequisites

1. A [GitHub](https://github.com/) repository with the ResourceX project.
2. A [Vercel](https://vercel.com/) account.
3. A [Turso](https://turso.tech/) account.
4. A [Razorpay](https://razorpay.com/) account configured in **Test Mode**.

---

## 3. Step 1: Create a Turso Cloud Database

Turso provides globally distributed SQLite databases compatible with `@libsql/client`.

### Option A: Using the Turso CLI
```bash
# Install Turso CLI (if not installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Log in to your Turso account
turso auth login

# Create a new database
turso db create resourcex-db

# Get the database URL (e.g., libsql://resourcex-db-myorg.turso.io)
turso db show resourcex-db --url

# Generate a persistent authentication token
turso db tokens create resourcex-db
```

### Option B: Using the Turso Web Console
1. Log in to [app.turso.tech](https://app.turso.tech).
2. Click **Create Database**, name it `resourcex-db`, and choose your preferred primary region.
3. Copy the **Database URL** (`libsql://...`).
4. Navigate to the **Tokens** tab, create a new token, and copy the **Auth Token**.

> [!NOTE]
> Database tables, indexes, triggers, and default initial catalog data are automatically initialized on the first application request via `initDb()` in `lib/db.ts`.

---

## 4. Step 2: Set Up Vercel Blob Storage

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the **Storage** tab from the top navigation.
3. Click **Create Database** or **Create Store**, and select **Blob**.
4. Choose a name (e.g., `resourcex-media`) and click **Create**.
5. Once created, click **Connect to Project** and select your ResourceX project.
   - Vercel will automatically inject the `BLOB_READ_WRITE_TOKEN` environment variable into your project deployments.

---

## 5. Step 3: Configure Environment Variables in Vercel

In your Vercel Project Settings, navigate to **Settings > Environment Variables** and configure:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | **Yes** | 256-bit cryptographically secure secret for JWT cookies | `a8f3b2c1d9e8...` (32+ hex/base64 chars) |
| `TURSO_DATABASE_URL` | **Yes** | Turso database URL | `libsql://resourcex-db-myorg.turso.io` |
| `TURSO_AUTH_TOKEN` | **Yes** | Turso authentication token | `eyJh...` |
| `BLOB_READ_WRITE_TOKEN` | **Yes** | Vercel Blob read/write token (auto-injected if linked) | `vercel_blob_rw_...` |
| `RAZORPAY_KEY_ID` | **Yes** | Razorpay Test Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | **Yes** | Razorpay Test Key Secret | `your_test_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | **Yes** | Razorpay Webhook Secret | `your_webhook_secret` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`| **Yes** | Public Razorpay Test Key ID (matches `RAZORPAY_KEY_ID`)| `rzp_test_...` |
| `PAYMENT_MODE` | **Yes** | Enforce test mode | `test` |
| `SEED_DEMO_ACCOUNTS` | No | Keep `false` or omit in production | `false` |

> [!CAUTION]
> **Production Security**: Keep `SEED_DEMO_ACCOUNTS=false` in production. Demo account passwords should never be set in production environments.

---

## 6. Step 4: Deploy the Project to Vercel

1. In the Vercel Dashboard, click **Add New... > Project**.
2. Select your imported GitHub repository.
3. Configure the build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or `./ResourceX-master` if the repository root contains the nested directory)
   - **Build Command**: `pnpm run build` (or Next.js default)
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
4. Confirm environment variables are populated.
5. Click **Deploy**.

---

## 7. Step 5: Verification & Post-Deployment Checklist

After the build succeeds:
1. **Health & Homepage**: Visit your deployed URL (e.g., `https://your-app.vercel.app`) and verify the catalog displays diversified equipment listings.
2. **Registration / Login**: Register a new user account. Verify that the JWT session cookie is set with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes.
3. **Database Persistence**: Create a new resource or update your profile. Refresh the page to verify data persists across serverless instances in Turso.
4. **Vercel Blob Uploads**: List a new resource and upload an image. Verify the uploaded image renders from the Vercel Blob CDN (`https://*.public.blob.vercel-storage.com/...`).
5. **Razorpay Payments**: Complete a test booking with Razorpay Test Mode card details (`4111 1111 1111 1111`). Ensure the mock transaction processes and updates booking status to `confirmed`.
6. **Admin Panel**: Promote or log in with an admin account and verify moderation, user management, and audit logging dashboards function properly.
