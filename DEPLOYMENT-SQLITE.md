# AdGrades Work - SQLite-Compatible Deployment Platforms

This guide covers platforms where you can deploy this project **with SQLite** (no database migration required).

---

## Platform Comparison

| Platform | SQLite Support | Free Tier | Ease of Setup | Best For |
|----------|---------------|-----------|---------------|----------|
| **Fly.io** | ✅ Volumes | 3 VMs free | ⭐⭐⭐⭐ | Production, global edge |
| **Railway** | ✅ Volumes | $5 free/month | ⭐⭐⭐⭐⭐ | Easiest setup |
| **Render** | ✅ Persistent Disk | Limited free | ⭐⭐⭐⭐ | Simple deployments |
| **DigitalOcean Droplet** | ✅ Full control | $4/month | ⭐⭐⭐ | Full control, VPS |
| **Hetzner Cloud** | ✅ Full control | €3.79/month | ⭐⭐⭐ | Best price/performance |
| **AWS Lightsail** | ✅ Full control | $3.50/month | ⭐⭐⭐ | AWS ecosystem |

---

## Option 1: Railway (Easiest) ⭐ Recommended

Railway is the easiest platform for deploying Next.js with SQLite.

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `Chan-electro/adgrades-work`

### Step 3: Add Persistent Volume

SQLite needs persistent storage:

1. Click on your service
2. Go to **Settings > Volumes**
3. Click **"Add Volume"**
4. Mount path: `/app/data`
5. Click **"Add"**

### Step 4: Update DATABASE_URL

In Railway, the app runs in `/app`, so update the path:

1. Go to **Variables** tab
2. Add:

```env
DATABASE_URL=file:/app/data/production.db
USER1_ID=admin
USER1_HASH=$2b$10$YOUR_HASH_HERE
SESSION_SECRET=your-64-char-secret
NEXTAUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=https://your-app.up.railway.app
NODE_ENV=production
```

### Step 5: Update Prisma for Railway

Create/update `prisma/schema.prisma` output path (optional):

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 6: Deploy

Railway auto-deploys when you push to GitHub. Or click **"Deploy"** in the dashboard.

### Railway Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# View logs
railway logs
```

### Pricing

- **Free Tier**: $5/month credit (enough for small apps)
- **Hobby**: $5/month
- **Pro**: $20/month

---

## Option 2: Fly.io (Best for Production)

Fly.io runs your app in containers with persistent volumes, perfect for SQLite.

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Or using curl
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login/Signup

```bash
fly auth signup
# or
fly auth login
```

### Step 3: Initialize Fly App

```bash
cd /path/to/adgrades-w
fly launch
```

When prompted:
- App name: `adgrades-work` (or your choice)
- Region: Choose closest to you
- PostgreSQL: **No** (we're using SQLite)
- Redis: **No**
- Deploy now: **No** (we need to configure first)

### Step 4: Create `fly.toml`

This file is created by `fly launch`. Update it:

```toml
app = "adgrades-work"
primary_region = "sin"  # Singapore, change to your region

[build]

[env]
  NODE_ENV = "production"
  DATABASE_URL = "file:/data/production.db"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[mounts]]
  source = "adgrades_data"
  destination = "/data"
```

### Step 5: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create data directory for SQLite
RUN mkdir -p /data

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT=3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

### Step 6: Update next.config.js for Standalone

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Step 7: Create Volume

```bash
fly volumes create adgrades_data --size 1 --region sin
```

### Step 8: Set Secrets

```bash
fly secrets set USER1_ID=admin
fly secrets set USER1_HASH='$2b$10$YOUR_HASH_HERE'
fly secrets set SESSION_SECRET=your-64-char-secret
fly secrets set NEXTAUTH_SECRET=your-32-char-secret
fly secrets set NEXTAUTH_URL=https://adgrades-work.fly.dev
```

### Step 9: Deploy

```bash
fly deploy
```

### Step 10: Open Your App

```bash
fly open
```

### Fly.io Commands

```bash
fly status           # Check app status
fly logs             # View logs
fly ssh console      # SSH into container
fly volumes list     # List volumes
fly scale count 1    # Scale to specific count
```

### Pricing

- **Free Tier**: 3 shared VMs, 160GB outbound transfer
- **Pay-as-you-go**: ~$2-5/month for small apps

---

## Option 3: Render

Render supports persistent disks for SQLite.

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Web Service

1. Click **"New +"** > **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Name**: adgrades-work
   - **Region**: Closest to you
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`

### Step 3: Add Persistent Disk

1. Go to **Disks** section
2. Click **"Add Disk"**
3. Configure:
   - **Name**: sqlite-data
   - **Mount Path**: `/data`
   - **Size**: 1 GB

### Step 4: Add Environment Variables

```env
DATABASE_URL=file:/data/production.db
USER1_ID=admin
USER1_HASH=$2b$10$YOUR_HASH_HERE
SESSION_SECRET=your-64-char-secret
NEXTAUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=https://adgrades-work.onrender.com
NODE_ENV=production
```

### Step 5: Deploy

Click **"Create Web Service"**

### Pricing

- **Free Tier**: Limited (spins down after inactivity, no persistent disk on free)
- **Starter**: $7/month (includes 1GB disk)
- **Standard**: $25/month

> ⚠️ **Note**: Render free tier doesn't support persistent disks. You need at least the Starter plan for SQLite.

---

## Option 4: VPS (DigitalOcean, Hetzner, Linode, AWS)

Any VPS gives you full control and works perfectly with SQLite.

| Provider | Cheapest Plan | Location |
|----------|--------------|----------|
| [DigitalOcean](https://digitalocean.com) | $4/month | Global |
| [Hetzner](https://hetzner.com) | €3.79/month | EU, US |
| [Linode](https://linode.com) | $5/month | Global |
| [AWS Lightsail](https://aws.amazon.com/lightsail/) | $3.50/month | Global |
| [Vultr](https://vultr.com) | $2.50/month | Global |

See `DEPLOYMENT.md` for detailed DigitalOcean Droplet instructions. The process is similar for other VPS providers.

---

## Quick Comparison: Which to Choose?

### Choose **Railway** if:
- You want the easiest setup (5 minutes)
- You're prototyping or building an MVP
- You prefer GitHub-based deployments

### Choose **Fly.io** if:
- You want production-ready infrastructure
- You need global edge deployment
- You're comfortable with CLI tools

### Choose **Render** if:
- You want a middle ground
- You need automatic deploys from GitHub
- You're okay with the Starter plan cost

### Choose **VPS (DigitalOcean/Hetzner)** if:
- You want full control
- You need predictable pricing
- You're comfortable managing servers
- You need the best performance per dollar

---

## SQLite Best Practices for Production

### 1. Enable WAL Mode

Add this to your Prisma client initialization or create a migration:

```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA busy_timeout=5000;
```

### 2. Regular Backups

```bash
# Cron job for daily backup
0 2 * * * sqlite3 /data/production.db ".backup /backups/production_$(date +\%Y\%m\%d).db"
```

### 3. Use Litestream (Recommended)

[Litestream](https://litestream.io) continuously replicates SQLite to S3/cloud storage:

```yaml
# litestream.yml
dbs:
  - path: /data/production.db
    replicas:
      - url: s3://your-bucket/production.db
```

### 4. Single Instance Only

SQLite doesn't handle concurrent writes well. Always run **1 instance** of your app:

```bash
# Fly.io
fly scale count 1

# Railway
# Only 1 replica by default

# PM2 (VPS)
pm2 start npm --name "adgrades" -i 1 -- start
```

---

## Deploy Checklist

- [ ] Choose platform (Railway recommended for beginners)
- [ ] Create account and connect GitHub
- [ ] Add persistent volume/disk
- [ ] Set environment variables
- [ ] Update `DATABASE_URL` to use persistent path
- [ ] Generate password hash for `USER1_HASH`
- [ ] Deploy
- [ ] Update `NEXTAUTH_URL` with actual domain
- [ ] Setup backups
- [ ] Test login and features

---

## Useful Links

- [Repository](https://github.com/Chan-electro/adgrades-work)
- [Railway Docs](https://docs.railway.app/)
- [Fly.io Docs](https://fly.io/docs/)
- [Render Docs](https://render.com/docs)
- [Litestream (SQLite Backups)](https://litestream.io/)
- [SQLite Production Tips](https://www.sqlite.org/whentouse.html)
