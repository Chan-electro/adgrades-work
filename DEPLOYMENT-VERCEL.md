# AdGrades Work - Vercel Deployment Guide

Deploy AdGrades Work to Vercel with a cloud database.

---

## ⚠️ Important: Database Consideration

**SQLite will NOT work on Vercel** because Vercel uses serverless functions that don't have persistent file storage. You need to switch to a cloud database.

### Recommended Options (Free Tiers Available):

| Provider | Database | Free Tier | Recommended For |
|----------|----------|-----------|-----------------|
| [Neon](https://neon.tech) | PostgreSQL | 512 MB | Best DX, generous free tier |
| [Supabase](https://supabase.com) | PostgreSQL | 500 MB | Full-featured, auth included |
| [PlanetScale](https://planetscale.com) | MySQL | 5 GB reads/mo | Scalability |
| [Turso](https://turso.tech) | LibSQL (SQLite-compatible) | 9 GB | SQLite syntax familiarity |

This guide uses **Neon PostgreSQL** (recommended for easiest setup).

---

## Step 1: Create a Neon Database

### 1.1 Sign Up for Neon

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (easiest)
3. Create a new project (e.g., "adgrades-work")

### 1.2 Get Connection String

1. In your Neon dashboard, go to **Connection Details**
2. Copy the **Connection string** (looks like):
   ```
   postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Update Prisma for PostgreSQL

### 2.1 Update `prisma/schema.prisma`

Change the datasource from SQLite to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Your models stay the same!
model Client {
  id           Int         @id @default(autoincrement())
  name         String
  email        String?
  phone        String?
  address      String?
  gstNumber    String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  agreements   Agreement[]
  invoices     Invoice[]
}

model Agreement {
  id          Int      @id @default(autoincrement())
  clientId    Int?
  clientName  String
  title       String
  content     String
  status      String   @default("draft")
  htmlContent String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  client      Client?  @relation(fields: [clientId], references: [id])
}

model Invoice {
  id          Int      @id @default(autoincrement())
  clientId    Int?
  clientName  String
  invoiceNo   String   @unique
  date        DateTime @default(now())
  dueDate     DateTime?
  items       String
  subtotal    Float
  tax         Float    @default(0)
  discount    Float    @default(0)
  total       Float
  status      String   @default("draft")
  notes       String?
  htmlContent String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  client      Client?  @relation(fields: [clientId], references: [id])
}
```

### 2.2 Create New Migration

```bash
# Delete old SQLite migrations (they won't work with PostgreSQL)
rm -rf prisma/migrations

# Create new PostgreSQL migration
npx prisma migrate dev --name init
```

### 2.3 Test Locally with Neon

Update your local `.env`:

```env
DATABASE_URL="postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

```bash
# Push schema to Neon
npx prisma db push

# Verify connection
npx prisma studio
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

#### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your repository: `Chan-electro/adgrades-work`
4. Click **Import**

#### 3.2 Configure Build Settings

Vercel auto-detects Next.js. Default settings should work:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` (or leave default) |
| Output Directory | `.next` (auto-detected) |
| Install Command | `npm install` |

#### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...` (from Neon) |
| `USER1_ID` | `admin` |
| `USER1_HASH` | `$2b$10$...` (your bcrypt hash) |
| `SESSION_SECRET` | Random 64+ char string |
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |

> **Tip**: Generate secrets with: `openssl rand -base64 48`

#### 3.4 Deploy

Click **"Deploy"** and wait for the build to complete!

---

### Option B: Deploy via Vercel CLI

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login to Vercel

```bash
vercel login
```

#### 3.3 Deploy

```bash
cd /path/to/adgrades-w

# First deployment (will prompt for configuration)
vercel

# For production deployment
vercel --prod
```

#### 3.4 Add Environment Variables

```bash
# Add each variable
vercel env add DATABASE_URL
vercel env add USER1_ID
vercel env add USER1_HASH
vercel env add SESSION_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

Or add them in the Vercel dashboard under **Settings > Environment Variables**.

---

## Step 4: Post-Deployment Setup

### 4.1 Update NEXTAUTH_URL

After first deployment, update `NEXTAUTH_URL` with your actual Vercel URL:

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update `NEXTAUTH_URL` to `https://your-project-name.vercel.app`
3. Redeploy: **Deployments > ... > Redeploy**

### 4.2 Add Custom Domain (Optional)

1. Go to **Settings > Domains**
2. Add your domain (e.g., `work.adgrades.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy

---

## Step 5: Prisma on Vercel

### 5.1 Add Postinstall Script

Ensure Prisma client is generated during build. In `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

### 5.2 Prisma Migrations on Vercel

Vercel doesn't run migrations automatically. Options:

**Option 1: Run migrations locally before deploying**
```bash
npx prisma migrate deploy
git add -A && git commit -m "Update schema"
git push  # Triggers Vercel redeploy
```

**Option 2: Use `prisma db push` for simple changes**
```bash
npx prisma db push
```

**Option 3: Add migration to build command** (Not recommended for production)
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `USER1_ID` | Login username | `admin` |
| `USER1_HASH` | Bcrypt password hash | `$2b$10$...` |
| `SESSION_SECRET` | Session encryption key | 64+ random chars |
| `NEXTAUTH_SECRET` | NextAuth.js secret | 32+ random chars |
| `NEXTAUTH_URL` | Full URL of your app | `https://app.vercel.app` |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | (Optional) Google OAuth | From Google Cloud Console |

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

### Manual Redeploy

```bash
# Via CLI
vercel --prod

# Or in Dashboard: Deployments > ... > Redeploy
```

---

## Monitoring & Logs

### View Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **"Logs"** tab (or specific deployment)

### Function Logs

```bash
vercel logs your-project-name.vercel.app
```

### Analytics (Pro Feature)

Enable in **Settings > Analytics** for performance insights.

---

## Troubleshooting

### Build Fails: Prisma Client Not Generated

Add to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Error

1. Check `DATABASE_URL` is correct in Vercel env vars
2. Ensure `?sslmode=require` is in the connection string for Neon
3. Check Neon dashboard for connection issues

### 500 Error on API Routes

```bash
# Check function logs
vercel logs --follow
```

### NEXTAUTH_URL Mismatch

Ensure `NEXTAUTH_URL` exactly matches your deployment URL (include `https://`).

### Prisma: "Migration not found"

Run migrations locally:
```bash
npx prisma migrate deploy
```

Then push changes:
```bash
git add -A && git commit -m "Update migrations"
git push
```

### Cold Start Delays

Serverless functions have cold starts. For faster response:
- Keep functions small
- Use Edge Runtime where possible
- Consider Vercel Pro for always-warm functions

---

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless Function executions
- Preview deployments

### Neon Free Tier Includes:
- 512 MB storage
- 1 compute endpoint
- Autoscaling to zero (saves costs)

### When to Upgrade:
- High traffic (>100k requests/month)
- Large database (>500 MB)
- Need team collaboration features

---

## Comparison: Vercel vs DigitalOcean Droplet

| Aspect | Vercel | DigitalOcean Droplet |
|--------|--------|---------------------|
| **Setup** | Minutes | 30-60 minutes |
| **Maintenance** | Zero | You manage server |
| **Cost (Low Traffic)** | Free | ~$6/month |
| **Cost (High Traffic)** | Can get expensive | Predictable |
| **Database** | External required | SQLite works |
| **Scaling** | Automatic | Manual |
| **Cold Starts** | Yes (serverless) | No |
| **Best For** | MVPs, side projects | Production, control |

---

## Quick Start Summary

```bash
# 1. Update Prisma to PostgreSQL
# Edit prisma/schema.prisma: provider = "postgresql"

# 2. Create Neon database and get connection string

# 3. Update .env with Neon DATABASE_URL

# 4. Reset migrations
rm -rf prisma/migrations
npx prisma migrate dev --name init

# 5. Push to GitHub
git add -A && git commit -m "Switch to PostgreSQL for Vercel"
git push

# 6. Deploy on Vercel
# - Import repo at vercel.com
# - Add environment variables
# - Deploy!
```

---

## Useful Links

- [Repository](https://github.com/Chan-electro/adgrades-work)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel + Next.js Guide](https://vercel.com/docs/frameworks/nextjs)
- [Prisma + Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)
