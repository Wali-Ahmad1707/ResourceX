# ResourceX â€” Production Deployment & Operations Guide
**Phase 8 Final Deployment Preparation**
*Target: Self-Hosted Container / VPS / Cloud VM with Persistent Storage*

---

## 1. Architecture & Persistence Requirements

> [!CRITICAL]
> **Persistent Disk Storage is Mandatory**
> ResourceX utilizes:
> 1. Native `node:sqlite` database (`data/resourcex.db` and its WAL logs).
> 2. Local filesystem image uploads (`public/uploads/*`).
>
> **Do NOT deploy ResourceX to ephemeral serverless platforms (e.g., standard Vercel serverless functions, AWS Lambda, Google Cloud Run without persistent volumes) without persistent volume attachments.** Ephemeral cold starts will wipe out registered users, bookings, payments, and uploaded assets.

### Recommended Hosting Environments
- **Linux Virtual Machine (VPS)**: Ubuntu 22.04 LTS / 24.04 LTS or Debian 12 (DigitalOcean Droplet, Linode, AWS EC2, Hetzner, GCP Compute Engine).
- **Persistent Container Platform**: Docker with persistent bind mounts or named volumes; Kubernetes with PersistentVolumeClaims (PVC).
- **PaaS with Persistent Disks**: Render (with Persistent Disk attached to `/app/data` and `/app/public/uploads`), Railway (with persistent volume), Fly.io (with fly volumes).

---

## 2. Production Prerequisites

- **Node.js**: `v20.x` or `v22.x` LTS (native `node:sqlite` support requires Node.js $\ge 20$).
- **Package Manager**: `pnpm` (recommended) or `npm`.
- **Reverse Proxy**: Nginx, Caddy, or Traefik with automated Let's Encrypt SSL/TLS certificate.
- **Process Manager**: `systemd` or `pm2`.

---

## 3. Environment Variable Configuration

Create a `.env.production` or `.env.local` file on your server (never commit this file to version control):

```bash
# ========================================================
# RESOURCEX PRODUCTION ENVIRONMENT VARIABLES
# ========================================================

# Production Node Environment
NODE_ENV=production
PORT=3000

# Application Secret: Generate with `openssl rand -base64 48`
JWT_SECRET=generate_a_cryptographically_secure_random_string_here

# Payment Gateway Configuration (Razorpay)
# For Test Mode:
PAYMENT_MODE=test
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_signing_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id

# Database Path (Optional override; defaults to ./data/resourcex.db)
# DATABASE_PATH=/var/data/resourcex/resourcex.db
```

---

## 4. Build & Run Steps

### Option A: Standard PM2 / Systemd Service

1. **Clone repository and install dependencies**:
   ```bash
   git clone <repo-url> /opt/resourcex
   cd /opt/resourcex
   pnpm install --frozen-lockfile
   ```

2. **Build the Next.js production bundle**:
   ```bash
   pnpm build
   ```

3. **Initialize directories**:
   ```bash
   mkdir -p data public/uploads
   chmod 755 public/uploads
   ```

4. **Start using PM2**:
   ```bash
   pnpm add -g pm2
   pm2 start npm --name "resourcex" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```

### Option B: Docker Container Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

# Expose persistent volumes
VOLUME ["/app/data", "/app/public/uploads"]

EXPOSE 3000
CMD ["pnpm", "start"]
```

Run with persistent volumes:
```bash
docker build -t resourcex:latest .
docker run -d \
  --name resourcex \
  -p 3000:3000 \
  -v /var/data/resourcex:/app/data \
  -v /var/uploads/resourcex:/app/public/uploads \
  --env-file .env.production \
  --restart unless-stopped \
  resourcex:latest
```

---

## 5. Reverse Proxy & SSL Configuration (Nginx)

```nginx
server {
    listen 80;
    server_name share.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name share.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/share.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/share.yourdomain.com/privkey.pem;

    # SSL hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Max upload size (aligned with 5MB app limit)
    client_max_body_size 6M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static uploaded files with caching
    location /uploads/ {
        alias /opt/resourcex/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 6. Database Backup & Maintenance Strategy

SQLite running in WAL (`Write-Ahead Logging`) mode allows zero-downtime, consistent online backups.

### Automated Daily Backup Script (`backup-db.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/resourcex"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_PATH="/opt/resourcex/data/resourcex.db"
TARGET="$BACKUP_DIR/resourcex_$TIMESTAMP.db"

mkdir -p "$BACKUP_DIR"

# Safe online backup using SQLite VACUUM INTO
sqlite3 "$DB_PATH" "VACUUM INTO '$TARGET';"

# Compress backup
gzip "$TARGET"

# Delete backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.db.gz" -mtime +30 -delete

echo "ResourceX Database Backup completed: $TARGET.gz"
```

Add to cron (`crontab -e`):
```cron
0 2 * * * /opt/resourcex/scripts/backup-db.sh >> /var/log/resourcex-backup.log 2>&1
```

---

## 7. Webhook & Razorpay Verification Setup

1. In the Razorpay Dashboard (under **Settings > Webhooks**):
   - Add endpoint URL: `https://share.yourdomain.com/api/webhooks/razorpay`
   - Active Events:
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
   - Set Secret: Matches `RAZORPAY_WEBHOOK_SECRET` in `.env.production`.
2. Test incoming webhook deliveries through the dashboard's "Send Test Webhook" feature.

---

## 8. Production Pre-Flight Checklist

- [ ] `JWT_SECRET` replaced with a fresh 64-character random string.
- [ ] Admin bootstrap credentials configured securely and rotated immediately after initial setup.
- [ ] Reverse proxy enforces HTTPS with HSTS headers.
- [ ] Persistent directory `/data` has proper read/write permissions for node process.
- [ ] Persistent directory `/public/uploads` has proper permissions.
- [ ] `node:sqlite` WAL mode confirmed (`data/resourcex.db-wal` present).
- [ ] Automated backup cron job verified.
- [ ] Razorpay webhook registered with matching secret.
- [ ] Smoke tests run against staging environment prior to DNS cutover.

