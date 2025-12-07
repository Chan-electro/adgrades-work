# AdGrades Work - DigitalOcean Droplet Deployment Guide

Complete guide to deploy AdGrades Work on a single DigitalOcean Droplet with SQLite, Nginx, and SSL.

---

## Prerequisites

- A DigitalOcean Droplet (Ubuntu 22.04 or 24.04 recommended)
- A domain name pointed to your Droplet IP (optional, but needed for SSL)
- SSH access to your Droplet

---

## Architecture

```
┌─────────────────────────────────────┐
│   DigitalOcean Droplet              │
│   ├── Next.js App (PM2)      :3000  │
│   ├── SQLite Database (file)        │
│   └── Nginx (Reverse Proxy)  :80/443│
└─────────────────────────────────────┘
```

---

## Step 1: Initial Droplet Setup

### 1.1 Connect to your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### 1.2 Update System Packages

```bash
apt update && apt upgrade -y
```

### 1.3 Create a Deploy User (Recommended)

```bash
# Create user
adduser deploy
# Add to sudo group
usermod -aG sudo deploy

# Setup SSH for deploy user (optional but recommended)
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.4 Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## Step 2: Install Required Software

### 2.1 Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node -v   # Should show v20.x.x
npm -v    # Should show 10.x.x
```

### 2.2 Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 2.3 Install Nginx

```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

### 2.4 Install Build Tools

Required for native modules like `bcrypt` and `better-sqlite3`:

```bash
apt install -y build-essential python3 git
```

---

## Step 3: Deploy the Application

### 3.1 Switch to Deploy User

```bash
su - deploy
```

### 3.2 Clone the Repository

```bash
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/Chan-electro/adgrades-work.git adgrades
cd adgrades
```

### 3.3 Create Data & Backup Directories

```bash
mkdir -p data
mkdir -p ~/backups
```

### 3.4 Create Environment File

```bash
nano .env
```

Add the following content (replace with your actual values):

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="file:./data/production.db"

# ============================================
# AUTHENTICATION
# ============================================
# Generate USER1_HASH with: node scripts/generate-password-hash.js
USER1_ID=admin
USER1_HASH=$2b$10$YOUR_BCRYPT_HASH_HERE

# Session secret (generate with: openssl rand -base64 48)
SESSION_SECRET=your-super-secret-session-key-at-least-32-chars

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_URL=https://yourdomain.com
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-key

# ============================================
# GOOGLE OAUTH (Optional)
# ============================================
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# ============================================
# PRODUCTION
# ============================================
NODE_ENV=production
```

### 3.5 Generate Password Hash

```bash
# First install dependencies
npm ci

# Generate a password hash
node scripts/generate-password-hash.js
# Enter your desired password when prompted
# Copy the output hash and paste into .env as USER1_HASH
```

### 3.6 Build and Start Application

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates SQLite database)
npx prisma migrate deploy

# Build the Next.js application
npm run build

# Start with PM2
pm2 start npm --name "adgrades" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot (run the command it outputs)
pm2 startup
```

---

## Step 4: Configure Nginx Reverse Proxy

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/adgrades
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # If no domain, use: server_name _;

    # Increase max body size for file uploads
    client_max_body_size 50M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
```

### 4.2 Enable the Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/adgrades /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4.3 Setup SSL with Let's Encrypt (If you have a domain)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot auto-renewal is set up automatically
# Test renewal with:
sudo certbot renew --dry-run
```

---

## Step 5: Database Backups

> ⚠️ **IMPORTANT**: SQLite is a file-based database. Regular backups are essential!

### 5.1 Manual Backup

```bash
cp ~/apps/adgrades/data/production.db ~/backups/production_$(date +%Y%m%d_%H%M%S).db
```

### 5.2 Automated Daily Backup (Cron)

```bash
# Edit crontab
crontab -e
```

Add this line (backs up at 2 AM daily):

```cron
0 2 * * * cp /home/deploy/apps/adgrades/data/production.db /home/deploy/backups/production_$(date +\%Y\%m\%d).db 2>&1 | logger -t adgrades-backup
```

### 5.3 Backup Cleanup (Keep last 30 days)

Add this to crontab to clean old backups:

```cron
0 3 * * * find /home/deploy/backups -name "production_*.db" -mtime +30 -delete
```

### 5.4 (Optional) Cloud Backups with Litestream

For real-time backups to DigitalOcean Spaces or S3:

```bash
# Install Litestream
wget https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.deb
sudo dpkg -i litestream-v0.3.13-linux-amd64.deb

# Configure Litestream
sudo nano /etc/litestream.yml
```

See [Litestream documentation](https://litestream.io/) for configuration details.

---

## Step 6: Deployment Updates

### 6.1 Create Deploy Script

```bash
nano ~/apps/adgrades/deploy.sh
```

```bash
#!/bin/bash
set -e

APP_DIR="/home/deploy/apps/adgrades"
BACKUP_DIR="/home/deploy/backups"

cd $APP_DIR

echo "=========================================="
echo "AdGrades Deployment - $(date)"
echo "=========================================="

echo ""
echo "📦 Backing up database..."
cp data/production.db $BACKUP_DIR/production_pre_deploy_$(date +%Y%m%d_%H%M%S).db

echo ""
echo "📥 Pulling latest changes..."
git pull origin main

echo ""
echo "📚 Installing dependencies..."
npm ci

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗃️  Running database migrations..."
npx prisma migrate deploy

echo ""
echo "🏗️  Building application..."
npm run build

echo ""
echo "🔄 Restarting application..."
pm2 reload adgrades

echo ""
echo "✅ Deployment complete!"
echo "=========================================="
pm2 status
```

```bash
chmod +x ~/apps/adgrades/deploy.sh
```

### 6.2 Deploy Updates

```bash
cd ~/apps/adgrades
./deploy.sh
```

---

## Quick Reference Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs adgrades` | View live logs |
| `pm2 logs adgrades --lines 100` | View last 100 log lines |
| `pm2 restart adgrades` | Restart application |
| `pm2 reload adgrades` | Zero-downtime reload |
| `pm2 stop adgrades` | Stop application |
| `pm2 monit` | Real-time monitoring dashboard |
| `./deploy.sh` | Deploy latest updates |
| `sqlite3 data/production.db` | Access database directly |
| `sudo nginx -t` | Test Nginx config |
| `sudo systemctl reload nginx` | Reload Nginx |
| `sudo certbot renew` | Renew SSL certificates |

---

## Monitoring & Logs

### Application Logs

```bash
# Live logs
pm2 logs adgrades

# Last 200 lines
pm2 logs adgrades --lines 200

# Clear logs
pm2 flush
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Resources

```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU and memory per process
htop
```

---

## Troubleshooting

### App Won't Start

```bash
# Check logs
pm2 logs adgrades --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart from scratch
pm2 delete adgrades
pm2 start npm --name "adgrades" -- start
```

### Database Locked Errors

SQLite can have issues with concurrent writes:

```bash
# Ensure single instance (don't use PM2 cluster mode with SQLite)
pm2 delete adgrades
pm2 start npm --name "adgrades" -i 1 -- start
```

### Permission Denied

```bash
sudo chown -R deploy:deploy ~/apps/adgrades
chmod -R 755 ~/apps/adgrades
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart everything
pm2 restart adgrades
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

---

## Security Recommendations

1. **Keep system updated**: `sudo apt update && sudo apt upgrade -y`
2. **Use SSH keys only**: Disable password authentication in `/etc/ssh/sshd_config`
3. **Regular backups**: Automate database backups to external storage
4. **Monitor logs**: Setup log monitoring/alerts
5. **Fail2ban**: Install to prevent brute-force attacks
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

---

## Calendly Integration (Optional)

If you're using the Calendly scheduling feature, add these to your `.env`:

```env
# ============================================
# CALENDLY (Optional - for Scheduler feature)
# ============================================
CALENDLY_CLIENT_ID=your-calendly-client-id
CALENDLY_CLIENT_SECRET=your-calendly-client-secret
CALENDLY_REDIRECT_URI=https://yourdomain.com/api/auth/calendly/callback
```

To get Calendly credentials:
1. Go to [Calendly Developer Portal](https://developer.calendly.com/)
2. Create an OAuth application
3. Set redirect URI to: `https://yourdomain.com/api/auth/calendly/callback`

---

## Alternative Deployment Options

This repository includes guides for other deployment platforms:

| Guide | Platform | Database |
|-------|----------|----------|
| `DEPLOYMENT.md` (this file) | DigitalOcean Droplet | SQLite |
| `DEPLOYMENT-VERCEL.md` | Vercel | PostgreSQL (Neon) |
| `DEPLOYMENT-SQLITE.md` | Railway, Fly.io, Render | SQLite |

---

## Useful Links

- [Repository](https://github.com/Chan-electro/adgrades-work)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt/Certbot](https://certbot.eff.org/)
- [Litestream (SQLite Replication)](https://litestream.io/)
- [DigitalOcean Community Tutorials](https://www.digitalocean.com/community/tutorials)
- [Calendly Developer Portal](https://developer.calendly.com/)
