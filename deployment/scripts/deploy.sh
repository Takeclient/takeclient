#!/bin/bash

# TakeClient CRM Deployment Script for Hetzner
# This script sets up the complete production environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"
APP_DIR="/opt/takeclient"
DOMAIN="takeclient.com"
APP_DOMAIN="app.takeclient.com"
ADMIN_DOMAIN="administration.takeclient.com"
API_DOMAIN="api.takeclient.com"
NODE_VERSION="20"
PYTHON_VERSION="3.11"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    print_success "System updated"
}

# Function to install required packages
install_packages() {
    print_status "Installing required packages..."
    
    # Essential packages
    apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
    
    # Nginx
    apt install -y nginx
    
    # PostgreSQL
    apt install -y postgresql postgresql-contrib
    
    # Redis
    apt install -y redis-server
    
    # Python and pip
    apt install -y python3 python3-pip python3-venv python3-dev
    
    # Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # PM2
    npm install -g pm2
    
    # Certbot for SSL
    apt install -y certbot python3-certbot-nginx
    
    # Additional tools
    apt install -y git zip unzip htop fail2ban ufw
    
    print_success "Packages installed"
}

# Function to setup directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p ${APP_DIR}/{frontend,backend,nginx,scripts,logs,backups}
    mkdir -p ${APP_DIR}/nginx/{sites-available,ssl}
    
    # Set proper permissions
    chown -R www-data:www-data ${APP_DIR}
    chmod -R 755 ${APP_DIR}
    
    print_success "Directories created"
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (change port if needed)
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Block direct access to application ports
    ufw deny 3000/tcp
    ufw deny 8000/tcp
    
    # Enable firewall
    ufw --force enable
    
    print_success "Firewall configured"
}

# Function to setup fail2ban
setup_fail2ban() {
    print_status "Configuring fail2ban..."
    
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 1800
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    
    print_success "Fail2ban configured"
}

# Function to setup PostgreSQL
setup_postgresql() {
    print_status "Configuring PostgreSQL..."
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE takeclient_crm;
CREATE USER takeclient_user WITH PASSWORD 'change_this_password_123!';
GRANT ALL PRIVILEGES ON DATABASE takeclient_crm TO takeclient_user;
ALTER USER takeclient_user CREATEDB;
\q
EOF

    print_success "PostgreSQL configured"
    print_warning "Please change the default database password in production!"
}

# Function to setup Redis
setup_redis() {
    print_status "Configuring Redis..."
    
    # Configure Redis
    sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    systemctl start redis-server
    systemctl enable redis-server
    
    print_success "Redis configured"
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository..."
    
    if [ ! -d "${APP_DIR}/source" ]; then
        read -p "Enter your Git repository URL: " REPO_URL
        git clone $REPO_URL ${APP_DIR}/source
    else
        print_warning "Repository already exists, pulling latest changes..."
        cd ${APP_DIR}/source
        git pull origin main || git pull origin master
    fi
    
    print_success "Repository cloned/updated"
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd ${APP_DIR}/source
    
    # Copy source to frontend directory
    cp -r . ${APP_DIR}/frontend/
    cd ${APP_DIR}/frontend
    
    # Install dependencies
    npm install
    
    # Create production environment file
    cat > .env.production << EOF
# Database
DATABASE_URL="postgresql://takeclient_user:change_this_password_123!@localhost:5432/takeclient_crm"

# Next Auth
NEXTAUTH_URL="https://${APP_DOMAIN}"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Stripe (configure with your keys)
STRIPE_PUBLIC_KEY="pk_live_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# OpenAI (configure with your key)
OPENAI_API_KEY="sk-your_openai_api_key"

# Redis
REDIS_URL="redis://localhost:6379"

# App URLs
NEXT_PUBLIC_APP_URL="https://${APP_DOMAIN}"
NEXT_PUBLIC_API_URL="https://${API_DOMAIN}"

# Email (configure with your SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Google Ads API (configure with your credentials)
GOOGLE_ADS_CLIENT_ID="your_client_id"
GOOGLE_ADS_CLIENT_SECRET="your_client_secret"
GOOGLE_ADS_REFRESH_TOKEN="your_refresh_token"
GOOGLE_ADS_DEVELOPER_TOKEN="your_developer_token"

# Meta API (configure with your credentials)
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
EOF

    # Generate Prisma client and push schema
    npx prisma generate
    npx prisma db push
    
    # Build the application
    npm run build
    
    print_success "Frontend setup completed"
}

# Function to setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd ${APP_DIR}/source/backend
    
    # Copy source to backend directory
    cp -r . ${APP_DIR}/backend/
    cd ${APP_DIR}/backend
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    pip install --upgrade pip
    pip install -r requirements.txt || pip install -e .
    
    # Create environment file
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://takeclient_user:change_this_password_123!@localhost:5432/takeclient_crm"

# API Configuration
API_HOST="0.0.0.0"
API_PORT="8000"
API_WORKERS="4"

# Security
SECRET_KEY="$(openssl rand -base64 32)"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="30"

# OpenAI
OPENAI_API_KEY="sk-your_openai_api_key"

# Redis
REDIS_URL="redis://localhost:6379"

# External APIs
GOOGLE_ADS_CLIENT_ID="your_client_id"
GOOGLE_ADS_CLIENT_SECRET="your_client_secret"
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
EOF

    deactivate
    
    print_success "Backend setup completed"
}

# Function to setup Nginx
setup_nginx() {
    print_status "Configuring Nginx..."
    
    # Copy nginx configuration
    cp ${APP_DIR}/source/deployment/nginx/sites-available/takeclient.com /etc/nginx/sites-available/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Enable our site
    ln -sf /etc/nginx/sites-available/takeclient.com /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    print_success "Nginx configured"
}

# Function to setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Stop nginx temporarily
    systemctl stop nginx
    
    # Get certificates for all domains
    certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    certbot certonly --standalone -d ${APP_DOMAIN} -d *.${APP_DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    certbot certonly --standalone -d ${ADMIN_DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    certbot certonly --standalone -d ${API_DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    
    # Setup auto-renewal
    crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
    
    # Start nginx
    systemctl start nginx
    
    print_success "SSL certificates configured"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    # Create PM2 ecosystem file
    cat > ${APP_DIR}/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'takeclient-frontend',
      cwd: '${APP_DIR}/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '${APP_DIR}/logs/frontend-error.log',
      out_file: '${APP_DIR}/logs/frontend-out.log',
      log_file: '${APP_DIR}/logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

    # Start applications with PM2
    cd ${APP_DIR}
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_success "PM2 configured"
}

# Function to setup systemd service for backend
setup_backend_service() {
    print_status "Setting up backend service..."
    
    cat > /etc/systemd/system/takeclient-backend.service << EOF
[Unit]
Description=TakeClient FastAPI Backend
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=${APP_DIR}/backend
Environment=PATH=${APP_DIR}/backend/venv/bin
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable takeclient-backend
    systemctl start takeclient-backend
    
    print_success "Backend service configured"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring script
    cat > ${APP_DIR}/scripts/monitor.sh << 'EOF'
#!/bin/bash

# Monitor TakeClient CRM Services
LOG_FILE="/opt/takeclient/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_message() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# Check services
services=("nginx" "postgresql" "redis-server" "takeclient-backend")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        log_message "$service is running"
    else
        log_message "ERROR: $service is not running"
        systemctl restart $service
    fi
done

# Check PM2 processes
pm2_status=$(pm2 jlist | jq '.[0].pm2_env.status' 2>/dev/null || echo "error")
if [ "$pm2_status" = '"online"' ]; then
    log_message "PM2 frontend is running"
else
    log_message "ERROR: PM2 frontend is not running"
    pm2 restart all
fi

# Check disk space
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 85 ]; then
    log_message "WARNING: Disk usage is at ${disk_usage}%"
fi

# Check memory usage
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $memory_usage -gt 85 ]; then
    log_message "WARNING: Memory usage is at ${memory_usage}%"
fi
EOF

    chmod +x ${APP_DIR}/scripts/monitor.sh
    
    # Add to crontab for monitoring
    crontab -l 2>/dev/null | { cat; echo "*/5 * * * * ${APP_DIR}/scripts/monitor.sh"; } | crontab -
    
    print_success "Monitoring configured"
}

# Function to setup backup
setup_backup() {
    print_status "Setting up backup system..."
    
    cat > ${APP_DIR}/scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/takeclient/backups"
DB_NAME="takeclient_crm"
DB_USER="takeclient_user"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
export PGPASSWORD="change_this_password_123!"
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /opt/takeclient frontend backend

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

    chmod +x ${APP_DIR}/scripts/backup.sh
    
    # Schedule daily backups at 2 AM
    crontab -l 2>/dev/null | { cat; echo "0 2 * * * ${APP_DIR}/scripts/backup.sh"; } | crontab -
    
    print_success "Backup system configured"
}

# Function to create admin user
create_admin_user() {
    print_status "Creating admin user..."
    
    cd ${APP_DIR}/frontend
    npm run create-admin
    
    print_success "Admin user creation completed"
}

# Function to final checks
final_checks() {
    print_status "Performing final checks..."
    
    # Check all services
    services=("nginx" "postgresql" "redis-server" "takeclient-backend")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet $service; then
            print_success "$service is running"
        else
            print_error "$service is not running"
        fi
    done
    
    # Check PM2
    pm2 status
    
    # Check ports
    netstat -tlnp | grep -E ':80|:443|:3000|:8000|:5432|:6379'
    
    print_success "Deployment completed!"
}

# Main deployment function
main() {
    print_status "Starting TakeClient CRM deployment..."
    
    check_root
    update_system
    install_packages
    setup_directories
    setup_firewall
    setup_fail2ban
    setup_postgresql
    setup_redis
    clone_repository
    setup_frontend
    setup_backend
    setup_nginx
    setup_ssl
    setup_pm2
    setup_backend_service
    setup_monitoring
    setup_backup
    create_admin_user
    final_checks
    
    print_success "🎉 TakeClient CRM deployed successfully!"
    echo ""
    echo "Your CRM is now available at:"
    echo "  Landing Page: https://${DOMAIN}"
    echo "  CRM App: https://${APP_DOMAIN}"
    echo "  Admin Panel: https://${ADMIN_DOMAIN}"
    echo "  API: https://${API_DOMAIN}"
    echo ""
    echo "Don't forget to:"
    echo "  1. Update all API keys in environment files"
    echo "  2. Change database passwords"
    echo "  3. Configure DNS records"
    echo "  4. Test all functionality"
}

# Run main function
main "$@" 