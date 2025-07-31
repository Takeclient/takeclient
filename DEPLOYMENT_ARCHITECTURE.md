# CRM Production Deployment Architecture on Hetzner

## 🏗️ Server Architecture

### Single Server Setup (Recommended Start)
```
Hetzner VPS (CCX32: 8 vCPU, 32GB RAM, 240GB NVMe)
├── Nginx (Reverse Proxy & SSL)
├── Next.js Application (Port 3000)
├── Python FastAPI Backend (Port 8000)
├── PostgreSQL Database (Port 5432)
├── Redis Cache (Port 6379)
└── PM2 Process Manager
```

## 🌐 Domain Structure

### Primary Domains Configuration
- **`takeclient.com`** → Landing Page (Static/Marketing Site)
- **`app.takeclient.com`** → CRM Application (User Dashboard)
- **`administration.takeclient.com`** → Admin Panel (/admin & /super-admin)

### Subdomain Routing
- **`*.app.takeclient.com`** → Tenant Subdomains (Auto-generated)
- **`api.takeclient.com`** → API Endpoints (Backend)

## 📂 Directory Structure on Server

```
/opt/takeclient/
├── frontend/                 # Next.js Application
│   ├── .next/
│   ├── public/
│   └── package.json
├── backend/                  # Python FastAPI
│   ├── app/
│   ├── requirements.txt
│   └── venv/
├── landing/                  # Landing Page (Optional Static)
├── nginx/                    # Nginx Configuration
│   ├── sites-available/
│   └── ssl/
├── scripts/                  # Deployment Scripts
├── logs/                     # Application Logs
└── backups/                  # Database Backups
```

## 🔧 Infrastructure Components

### 1. Nginx Configuration
```nginx
# Main configuration for all domains
server {
    server_name takeclient.com www.takeclient.com;
    location / {
        # Landing page - serve from Next.js
        proxy_pass http://localhost:3000;
    }
}

server {
    server_name app.takeclient.com *.app.takeclient.com;
    location / {
        # CRM Application
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name administration.takeclient.com;
    location / {
        # Admin Panel
        proxy_pass http://localhost:3000;
        # Additional security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
    }
}

server {
    server_name api.takeclient.com;
    location / {
        # Python FastAPI Backend
        proxy_pass http://localhost:8000;
    }
}
```

### 2. SSL Configuration
- Let's Encrypt SSL certificates for all domains
- Auto-renewal setup with certbot
- HTTP to HTTPS redirect

### 3. Database Setup
- PostgreSQL 15+ with optimized configuration
- Regular automated backups
- Connection pooling with PgBouncer

### 4. Process Management
- PM2 for Next.js application
- Systemd service for FastAPI backend
- Redis for caching and session management

## 🚀 Deployment Steps

### Phase 1: Server Setup
1. **Initial Server Configuration**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install essential packages
   apt install -y nginx postgresql redis-server certbot python3-certbot-nginx
   apt install -y nodejs npm python3 python3-pip python3-venv
   ```

2. **Install PM2 and Process Tools**
   ```bash
   npm install -g pm2
   pm2 startup
   ```

### Phase 2: Application Deployment
1. **Clone and Setup Applications**
2. **Database Configuration**
3. **Environment Variables Setup**
4. **SSL Certificate Generation**
5. **Nginx Configuration**

### Phase 3: Domain Configuration
1. **DNS Records Setup**
   ```
   A     takeclient.com                    → SERVER_IP
   A     *.takeclient.com                  → SERVER_IP
   A     app.takeclient.com                → SERVER_IP
   A     *.app.takeclient.com              → SERVER_IP
   A     administration.takeclient.com     → SERVER_IP
   A     api.takeclient.com                → SERVER_IP
   ```

## 🔒 Security Measures

### Firewall Configuration
```bash
# UFW Firewall Rules
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw deny 3000/tcp    # Block direct Next.js access
ufw deny 8000/tcp    # Block direct FastAPI access
ufw enable
```

### Additional Security
- SSH key-only authentication
- Fail2ban for brute force protection
- Regular security updates
- Database access restrictions

## 📊 Monitoring & Maintenance

### Monitoring Stack
- PM2 monitoring for process health
- Nginx access/error logs
- PostgreSQL slow query logs
- Redis monitoring
- Disk space and memory monitoring

### Backup Strategy
- Daily database backups to Hetzner Storage Box
- Weekly full system snapshots
- Code repository backups (Git)

## 🔄 Scaling Strategy

### When to Scale (Upgrade Path)
1. **Current Setup**: Single VPS → Good for 0-1000 users
2. **Scale Up**: Larger VPS → Good for 1000-5000 users  
3. **Scale Out**: Multiple servers → 5000+ users

### Multi-Server Architecture (Future)
```
Load Balancer (CCX11)
├── App Server 1 (Next.js + FastAPI)
├── App Server 2 (Next.js + FastAPI)
├── Database Server (PostgreSQL)
├── Redis Server (Cache)
└── File Storage Server
```

## 💰 Cost Breakdown

### Single Server Setup
- **VPS**: €29.85/month (CCX32)
- **Backup Storage**: €3-5/month (100GB)
- **Domain**: €10-15/year
- **Total**: ~€35-40/month

### Benefits of Single Server Start
- ✅ Cost-effective
- ✅ Simple to manage
- ✅ Easy to backup
- ✅ Quick to deploy
- ✅ Suitable for early growth

## 🎯 Performance Optimizations

### Application Level
- Next.js optimizations (static generation)
- API response caching with Redis
- Database query optimization
- CDN for static assets (optional)

### Server Level
- Nginx gzip compression
- HTTP/2 enabled
- Connection pooling
- Memory and CPU monitoring

## 🔧 Maintenance Tasks

### Daily
- Monitor server resources
- Check application logs
- Verify backup completion

### Weekly
- Review security logs
- Update dependencies
- Performance monitoring

### Monthly
- Security updates
- Database maintenance
- Backup verification 