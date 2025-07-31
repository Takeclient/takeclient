# 🚀 Complete TakeClient CRM Deployment Guide for Hetzner

## 📋 **Quick Summary - What We're Building**

Your CRM will be organized with professional subdomain structure:
- **`takeclient.com`** - Landing page for marketing
- **`app.takeclient.com`** - CRM application for users (supports tenant subdomains like `tenant1.app.takeclient.com`)
- **`administration.takeclient.com`** - Admin panel for platform management
- **`api.takeclient.com`** - Backend API services

**Single Server**: One Hetzner VPS handles everything with proper isolation and security.

---

## 🔧 **Step 1: Server Setup**

### 1.1 Order Hetzner Server
- **Recommended**: CCX32 (8 vCPU, 32GB RAM, 240GB NVMe) - €29.85/month
- **Budget Option**: CCX22 (4 vCPU, 16GB RAM, 160GB NVMe) - €13.85/month
- **OS**: Ubuntu 22.04 LTS
- **Location**: Choose closest to your users

### 1.2 Initial Server Access
```bash
# SSH into your server (use the IP provided by Hetzner)
ssh root@YOUR_SERVER_IP

# Update root password when prompted
# Note down your server IP address
```

---

## 🌐 **Step 2: DNS Configuration**

**⚠️ CRITICAL: Do this BEFORE running deployment script!**

### 2.1 Configure DNS Records
In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.), add these A records:

```
Type    Name                            Value               TTL
A       takeclient.com                  YOUR_SERVER_IP      300
A       www.takeclient.com              YOUR_SERVER_IP      300
A       app.takeclient.com              YOUR_SERVER_IP      300
A       *.app.takeclient.com            YOUR_SERVER_IP      300
A       administration.takeclient.com   YOUR_SERVER_IP      300
A       api.takeclient.com              YOUR_SERVER_IP      300
```

### 2.2 Verify DNS Propagation
```bash
# Wait 5-30 minutes, then test:
dig A takeclient.com
dig A app.takeclient.com
dig A administration.takeclient.com

# All should return YOUR_SERVER_IP
```

**📖 See `deployment/DNS_SETUP.md` for detailed DNS configuration guide.**

---

## 🏗️ **Step 3: Download Deployment Files**

### 3.1 Clone Repository on Server
```bash
# On your Hetzner server
cd /root
git clone https://github.com/your-username/your-crm-repo.git takeclient-deploy
cd takeclient-deploy
```

### 3.2 Make Deployment Script Executable
```bash
chmod +x deployment/scripts/deploy.sh
```

---

## 🚀 **Step 4: Run Automated Deployment**

### 4.1 Execute Deployment Script
```bash
# Run as root
./deployment/scripts/deploy.sh
```

The script will automatically:
1. ✅ Update system packages
2. ✅ Install Nginx, PostgreSQL, Redis, Node.js, Python
3. ✅ Configure firewall and security
4. ✅ Setup directory structure
5. ✅ Clone your repository
6. ✅ Install frontend and backend dependencies
7. ✅ Configure databases and environment variables
8. ✅ Setup SSL certificates
9. ✅ Configure Nginx with proper routing
10. ✅ Start all services with PM2 and systemd
11. ✅ Setup monitoring and backups

### 4.2 Monitor Deployment Progress
The script provides colored output:
- 🔵 **[INFO]** - Current step
- 🟢 **[SUCCESS]** - Completed step
- 🟡 **[WARNING]** - Attention needed
- 🔴 **[ERROR]** - Issue occurred

---

## 🔐 **Step 5: Security & API Configuration**

### 5.1 Update Environment Variables
After deployment, customize these files:

**Frontend Environment** (`/opt/takeclient/frontend/.env.production`):
```bash
# Edit production environment
nano /opt/takeclient/frontend/.env.production

# Update these values:
STRIPE_PUBLIC_KEY="pk_live_YOUR_REAL_STRIPE_KEY"
STRIPE_SECRET_KEY="sk_live_YOUR_REAL_STRIPE_SECRET"
OPENAI_API_KEY="sk-YOUR_REAL_OPENAI_KEY"
GOOGLE_ADS_CLIENT_ID="YOUR_GOOGLE_ADS_CLIENT_ID"
META_APP_ID="YOUR_META_APP_ID"
```

**Backend Environment** (`/opt/takeclient/backend/.env`):
```bash
# Edit backend environment
nano /opt/takeclient/backend/.env

# Update API keys and secrets
```

### 5.2 Change Default Database Password
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Change password
ALTER USER takeclient_user WITH PASSWORD 'your_secure_password_here';
\q

# Update password in environment files
sed -i 's/change_this_password_123!/your_secure_password_here/g' /opt/takeclient/frontend/.env.production
sed -i 's/change_this_password_123!/your_secure_password_here/g' /opt/takeclient/backend/.env
```

### 5.3 Restart Services After Configuration
```bash
# Restart all services
systemctl restart takeclient-backend
pm2 restart all
systemctl reload nginx
```

---

## ✅ **Step 6: Verification & Testing**

### 6.1 Check All Services
```bash
# Check service status
systemctl status nginx
systemctl status postgresql
systemctl status redis-server
systemctl status takeclient-backend

# Check PM2 processes
pm2 status

# Check ports are listening
netstat -tlnp | grep -E ':80|:443|:3000|:8000'
```

### 6.2 Test All Domains
1. **Landing Page**: https://takeclient.com
2. **CRM App**: https://app.takeclient.com
3. **Admin Panel**: https://administration.takeclient.com
4. **API Health**: https://api.takeclient.com/health

### 6.3 SSL Certificate Verification
```bash
# Check SSL certificates
certbot certificates

# Test SSL grades
# Use: https://www.ssllabs.com/ssltest/
```

---

## 👥 **Step 7: Create Admin User & Initial Setup**

### 7.1 Create Super Admin
```bash
cd /opt/takeclient/frontend
npm run create-admin

# Follow prompts to create super admin user
```

### 7.2 Access Admin Panel
1. Go to: https://administration.takeclient.com
2. Login with admin credentials
3. Configure platform settings
4. Create initial subscription plans

### 7.3 Test Tenant Creation
1. Register a test tenant at: https://app.takeclient.com
2. Verify subdomain works: https://tenant-slug.app.takeclient.com

---

## 📊 **Step 8: Monitoring & Maintenance**

### 8.1 View Logs
```bash
# Application logs
tail -f /opt/takeclient/logs/frontend-combined.log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u takeclient-backend -f
```

### 8.2 Backup Status
```bash
# Check backups
ls -la /opt/takeclient/backups/

# Manual backup
/opt/takeclient/scripts/backup.sh
```

### 8.3 Monitor System Resources
```bash
# Check system resources
htop
df -h
free -h

# Check service health
/opt/takeclient/scripts/monitor.sh
```

---

## 🔄 **Deployment Updates & Maintenance**

### Update Application Code
```bash
cd /opt/takeclient/source
git pull origin main

# Update frontend
cd /opt/takeclient/frontend
npm install
npm run build
pm2 restart takeclient-frontend

# Update backend
cd /opt/takeclient/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
systemctl restart takeclient-backend
```

### SSL Certificate Renewal (Automatic)
```bash
# Test renewal
certbot renew --dry-run

# Manual renewal if needed
certbot renew --force-renewal
systemctl reload nginx
```

---

## 🚨 **Troubleshooting Common Issues**

### Issue 1: SSL Certificate Failure
```bash
# Check DNS is working
dig A takeclient.com

# Manual certificate generation
systemctl stop nginx
certbot certonly --standalone -d takeclient.com -d www.takeclient.com
systemctl start nginx
```

### Issue 2: Application Not Loading
```bash
# Check service status
pm2 status
systemctl status takeclient-backend

# Check logs for errors
pm2 logs
journalctl -u takeclient-backend -n 50
```

### Issue 3: Database Connection Issues
```bash
# Test database connection
sudo -u postgres psql -d takeclient_crm -c "\dt"

# Reset database if needed
cd /opt/takeclient/frontend
npx prisma db push --force-reset
```

### Issue 4: Domain Not Resolving
```bash
# Check DNS propagation
dig A takeclient.com @8.8.8.8
dig A takeclient.com @1.1.1.1

# Use online DNS checker: https://dnschecker.org/
```

---

## 💰 **Cost Summary**

### Monthly Costs
- **Hetzner CCX32**: €29.85/month
- **Storage Backup**: €3-5/month
- **Domain Registration**: €1-2/month
- **Total**: ~€35-40/month

### When to Scale
- **0-1,000 users**: Single CCX32 server ✅
- **1,000-5,000 users**: Upgrade to larger VPS
- **5,000+ users**: Consider multi-server architecture

---

## 🎯 **Performance Optimization Tips**

### After Deployment
1. **Enable Cloudflare** for landing page caching
2. **Configure Redis** for session management
3. **Optimize Database** queries and indexing
4. **Monitor Performance** with built-in monitoring

### Resource Usage Expected
- **RAM**: 8-16GB (depends on user count)
- **CPU**: 4-8 cores (depends on AI agent usage)
- **Storage**: 50-100GB (depends on data volume)
- **Bandwidth**: 1-5TB/month (depends on usage)

---

## 📞 **Support & Next Steps**

### After Successful Deployment
1. ✅ Configure payment processing (Stripe)
2. ✅ Set up email services (SMTP)
3. ✅ Configure API integrations (Google Ads, Meta)
4. ✅ Customize branding and landing page
5. ✅ Set up monitoring alerts
6. ✅ Plan backup strategy to external storage

### Getting Help
- Check logs first: `/opt/takeclient/logs/`
- Review Nginx config: `/etc/nginx/sites-available/takeclient.com`
- Test DNS: Use online DNS checkers
- Monitor resources: `htop`, `df -h`, `free -h`

---

## 🎉 **Congratulations!**

Your professional CRM system is now deployed with:
- ✅ Professional subdomain structure
- ✅ SSL certificates for all domains  
- ✅ Automated backups and monitoring
- ✅ Production-ready security
- ✅ Scalable architecture
- ✅ Multi-tenant support

**Your CRM is ready for users!** 🚀

Start promoting your landing page and onboarding your first customers. 