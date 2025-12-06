# AdGrades Work - Production Deployment Guide (SQLite)

Deploy AdGrades Work to a single DigitalOcean droplet with SQLite.

---

## Architecture

```
┌─────────────────────────────────┐
│   Single Droplet                │
│   ├── Next.js App (PM2)         │
│   ├── SQLite Database (file)    │
│   └── Nginx (Reverse Proxy)     │
└─────────────────────────────────┘
```

---

## Part 1: Droplet Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node -v  # Should show v20.x
```

### Install PM2 & Nginx

```bash
npm install -g pm2
apt install nginx -y
systemctl enable nginx
```

### Install Build Tools (for bcrypt/better-sqlite3)

```bash
apt install -y build-essential python3
```

---

## Part 2: Deploy Application

```bash
# Switch to deploy user
su - deploy

# Clone repo
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/YOUR_USERNAME/adgrades-work.git adgrades
cd adgrades
```

### Create Environment File

```bash
nano .env
```

```env
# Database (SQLite - stays as file)
DATABASE_URL="file:./data/production.db"

# Auth
USER1_ID=admin
USER1_HASH=$2b$10$YOUR_BCRYPT_HASH
SESSION_SECRET=your-64-char-random-string

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Build & Run

```bash
# Create data directory for SQLite
mkdir -p data

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations (creates the SQLite DB)
npx prisma migrate deploy

# Build
npm run build

# Start with PM2
pm2 start npm --name "adgrades" -- start
pm2 save
pm2 startup  # Run the command it outputs
```

---

## Part 3: Nginx & SSL

```bash
sudo nano /etc/nginx/sites-available/adgrades
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/adgrades /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Part 4: SQLite Backups (Important!)

SQLite is a file — back it up regularly.

### Manual Backup

```bash
cp ~/apps/adgrades/data/production.db ~/backups/production_$(date +%Y%m%d).db
```

### Automated Daily Backup (Cron)

```bash
crontab -e
```

Add:
```cron
0 2 * * * cp /home/deploy/apps/adgrades/data/production.db /home/deploy/backups/production_$(date +\%Y\%m\%d).db
```

### (Optional) Litestream for Real-time Backups

[Litestream](https://litestream.io/) streams SQLite changes to S3/DigitalOcean Spaces.

---

## Part 5: Deployment Updates

Create `deploy.sh`:

```bash
#!/bin/bash
set -e
cd /home/deploy/apps/adgrades

echo "Backing up database..."
cp data/production.db data/production_backup_$(date +%Y%m%d_%H%M%S).db

echo "Pulling changes..."
git pull origin main

echo "Installing dependencies..."
npm ci

echo "Generating Prisma..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

echo "Building..."
npm run build

echo "Restarting..."
pm2 reload adgrades

echo "Done!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs adgrades` | View logs |
| `pm2 restart adgrades` | Restart app |
| `./deploy.sh` | Deploy updates |
| `sqlite3 data/production.db` | Access database |

---

## Troubleshooting

**App won't start**: `pm2 logs adgrades --lines 100`

**Database locked errors**: Ensure only one process writes at a time (PM2 cluster mode with SQLite can cause issues — use `instances: 1` if needed)

**Permission denied**: `sudo chown -R deploy:deploy ~/apps/adgrades`
