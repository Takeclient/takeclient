#!/bin/bash

# Complete TakeClient CRM Deployment Script
# Server: 188.245.230.119
# This script will connect to your server and deploy everything

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Server configuration
SERVER_IP="188.245.230.119"
SERVER_USER="39TnHVrLECXEUEHaRWkhT"
SERVER_PASS="39TnHVrLECXEUEHaRWkhT"
DOMAIN="takeclient.com"

# Function to print colored output
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

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

# Function to upload repository to server
upload_to_server() {
    print_header "Uploading CRM to Server"
    
    # Create deployment package
    print_status "Creating deployment package..."
    tar -czf crm-deploy.tar.gz \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        --exclude=backend/venv \
        --exclude=backend/__pycache__ \
        .
    
    print_success "Package created: crm-deploy.tar.gz"
    
    # Upload to server
    print_status "Uploading to server..."
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no crm-deploy.tar.gz "$SERVER_USER@$SERVER_IP:/root/"
    
    print_success "Upload completed"
    
    # Clean up local package
    rm crm-deploy.tar.gz
}

# Function to run commands on server
run_on_server() {
    local command="$1"
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$command"
}

# Function to deploy on server
deploy_on_server() {
    print_header "Deploying on Server"
    
    # Create the deployment script on server
    print_status "Creating deployment script on server..."
    
    run_on_server "cat > /root/deploy-crm.sh << 'EOF'
#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e \"\${BLUE}[INFO]\${NC} \$1\"
}

print_success() {
    echo -e \"\${GREEN}[SUCCESS]\${NC} \$1\"
}

print_error() {
    echo -e \"\${RED}[ERROR]\${NC} \$1\"
}

# Configuration
APP_DIR=\"/opt/takeclient\"
DOMAIN=\"takeclient.com\"
SERVER_IP=\"188.245.230.119\"

print_status \"Starting TakeClient CRM deployment...\"

# Extract uploaded files
print_status \"Extracting application files...\"
cd /root
tar -xzf crm-deploy.tar.gz -C /tmp/
mkdir -p \$APP_DIR
cp -r /tmp/* \$APP_DIR/
cd \$APP_DIR

# Update system
print_status \"Updating system packages...\"
apt update && apt upgrade -y

# Install required packages
print_status \"Installing required packages...\"
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
apt install -y nginx postgresql postgresql-contrib redis-server
apt install -y python3 python3-pip python3-venv python3-dev
apt install -y git zip unzip htop fail2ban ufw jq netstat-nat

# Install Node.js 20
print_status \"Installing Node.js 20...\"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
print_status \"Installing PM2...\"
npm install -g pm2

# Install Certbot
print_status \"Installing Certbot...\"
apt install -y certbot python3-certbot-nginx

# Setup firewall
print_status \"Configuring firewall...\"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000/tcp
ufw deny 8000/tcp
ufw --force enable

# Setup fail2ban
print_status \"Configuring fail2ban...\"
cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
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
FAIL2BAN

systemctl enable fail2ban
systemctl restart fail2ban

# Setup PostgreSQL
print_status \"Configuring PostgreSQL...\"
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'PSQL'
CREATE DATABASE takeclient_crm;
CREATE USER takeclient_user WITH PASSWORD 'TakeClient2024!SecureDB';
GRANT ALL PRIVILEGES ON DATABASE takeclient_crm TO takeclient_user;
ALTER USER takeclient_user CREATEDB;
\q
PSQL

# Setup Redis
print_status \"Configuring Redis...\"
sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl start redis-server
systemctl enable redis-server

# Setup frontend
print_status \"Setting up frontend...\"
cd \$APP_DIR

# Install frontend dependencies
npm install

# Create production environment file
cat > .env.production << 'ENV'
# Database
DATABASE_URL=\"postgresql://takeclient_user:TakeClient2024!SecureDB@localhost:5432/takeclient_crm\"

# Next Auth
NEXTAUTH_URL=\"https://app.takeclient.com\"
NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"

# Stripe (update with your keys)
STRIPE_PUBLIC_KEY=\"pk_test_your_stripe_public_key\"
STRIPE_SECRET_KEY=\"sk_test_your_stripe_secret_key\"
STRIPE_WEBHOOK_SECRET=\"whsec_your_webhook_secret\"

# OpenAI (update with your key)
OPENAI_API_KEY=\"sk-your_openai_api_key\"

# Redis
REDIS_URL=\"redis://localhost:6379\"

# App URLs
NEXT_PUBLIC_APP_URL=\"https://app.takeclient.com\"
NEXT_PUBLIC_API_URL=\"https://api.takeclient.com\"

# Email (update with your SMTP)
SMTP_HOST=\"smtp.gmail.com\"
SMTP_PORT=\"587\"
SMTP_USER=\"your-email@gmail.com\"
SMTP_PASS=\"your-app-password\"

# Google Ads API (update with your credentials)
GOOGLE_ADS_CLIENT_ID=\"your_client_id\"
GOOGLE_ADS_CLIENT_SECRET=\"your_client_secret\"
GOOGLE_ADS_REFRESH_TOKEN=\"your_refresh_token\"
GOOGLE_ADS_DEVELOPER_TOKEN=\"your_developer_token\"

# Meta API (update with your credentials)
META_APP_ID=\"your_meta_app_id\"
META_APP_SECRET=\"your_meta_app_secret\"

# Encryption key for sensitive data
ENCRYPTION_KEY=\"$(openssl rand -hex 32)\"
ENV

# Generate Prisma client and setup database
print_status \"Setting up database...\"
npx prisma generate
npx prisma db push

# Build the application
print_status \"Building application...\"
npm run build

# Setup backend
print_status \"Setting up backend...\"
cd \$APP_DIR/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
if [ -f \"requirements.txt\" ]; then
    pip install -r requirements.txt
elif [ -f \"pyproject.toml\" ]; then
    pip install -e .
fi

# Create backend environment file
cat > .env << 'BACKEND_ENV'
# Database
DATABASE_URL=\"postgresql://takeclient_user:TakeClient2024!SecureDB@localhost:5432/takeclient_crm\"

# API Configuration
API_HOST=\"0.0.0.0\"
API_PORT=\"8000\"
API_WORKERS=\"4\"

# Security
SECRET_KEY=\"$(openssl rand -base64 32)\"
ALGORITHM=\"HS256\"
ACCESS_TOKEN_EXPIRE_MINUTES=\"30\"

# OpenAI
OPENAI_API_KEY=\"sk-your_openai_api_key\"

# Redis
REDIS_URL=\"redis://localhost:6379\"

# External APIs
GOOGLE_ADS_CLIENT_ID=\"your_client_id\"
GOOGLE_ADS_CLIENT_SECRET=\"your_client_secret\"
META_APP_ID=\"your_meta_app_id\"
META_APP_SECRET=\"your_meta_app_secret\"
BACKEND_ENV

deactivate

# Setup Nginx
print_status \"Configuring Nginx...\"
cp \$APP_DIR/deployment/nginx/sites-available/takeclient.com /etc/nginx/sites-available/
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/takeclient.com /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Setup SSL certificates
print_status \"Setting up SSL certificates...\"
systemctl stop nginx

# Get certificates
certbot certonly --standalone -d takeclient.com -d www.takeclient.com --non-interactive --agree-tos --email admin@takeclient.com || true
certbot certonly --standalone -d app.takeclient.com --non-interactive --agree-tos --email admin@takeclient.com || true
certbot certonly --standalone -d administration.takeclient.com --non-interactive --agree-tos --email admin@takeclient.com || true
certbot certonly --standalone -d api.takeclient.com --non-interactive --agree-tos --email admin@takeclient.com || true

# Setup auto-renewal
echo \"0 12 * * * /usr/bin/certbot renew --quiet\" | crontab -

systemctl start nginx

# Setup PM2
print_status \"Setting up PM2...\"
cd \$APP_DIR

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'PM2_CONFIG'
module.exports = {
  apps: [
    {
      name: 'takeclient-frontend',
      cwd: '/opt/takeclient',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/opt/takeclient/logs/frontend-error.log',
      out_file: '/opt/takeclient/logs/frontend-out.log',
      log_file: '/opt/takeclient/logs/frontend-combined.log',
      time: true
    }
  ]
};
PM2_CONFIG

# Create logs directory
mkdir -p /opt/takeclient/logs

# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup backend service
print_status \"Setting up backend service...\"
cat > /etc/systemd/system/takeclient-backend.service << 'BACKEND_SERVICE'
[Unit]
Description=TakeClient FastAPI Backend
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/takeclient/backend
Environment=PATH=/opt/takeclient/backend/venv/bin
ExecStart=/opt/takeclient/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
BACKEND_SERVICE

systemctl daemon-reload
systemctl enable takeclient-backend
systemctl start takeclient-backend

# Setup monitoring
print_status \"Setting up monitoring...\"
mkdir -p /opt/takeclient/scripts

cat > /opt/takeclient/scripts/monitor.sh << 'MONITOR'
#!/bin/bash

LOG_FILE=\"/opt/takeclient/logs/monitor.log\"
DATE=\$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
    echo \"[\$DATE] \$1\" >> \$LOG_FILE
}

# Check services
services=(\"nginx\" \"postgresql\" \"redis-server\" \"takeclient-backend\")
for service in \"\${services[@]}\"; do
    if systemctl is-active --quiet \$service; then
        log_message \"\$service is running\"
    else
        log_message \"ERROR: \$service is not running\"
        systemctl restart \$service
    fi
done

# Check PM2 processes
pm2_status=\$(pm2 jlist | jq '.[0].pm2_env.status' 2>/dev/null || echo \"error\")
if [ \"\$pm2_status\" = '\"online\"' ]; then
    log_message \"PM2 frontend is running\"
else
    log_message \"ERROR: PM2 frontend is not running\"
    pm2 restart all
fi

# Check disk space
disk_usage=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$disk_usage -gt 85 ]; then
    log_message \"WARNING: Disk usage is at \${disk_usage}%\"
fi

# Check memory usage
memory_usage=\$(free | awk 'NR==2{printf \"%.0f\", \$3*100/\$2}')
if [ \$memory_usage -gt 85 ]; then
    log_message \"WARNING: Memory usage is at \${memory_usage}%\"
fi
MONITOR

chmod +x /opt/takeclient/scripts/monitor.sh

# Add monitoring to crontab
echo \"*/5 * * * * /opt/takeclient/scripts/monitor.sh\" | crontab -

# Setup backup
print_status \"Setting up backup system...\"
cat > /opt/takeclient/scripts/backup.sh << 'BACKUP'
#!/bin/bash

BACKUP_DIR=\"/opt/takeclient/backups\"
DB_NAME=\"takeclient_crm\"
DB_USER=\"takeclient_user\"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Database backup
export PGPASSWORD=\"TakeClient2024!SecureDB\"
pg_dump -h localhost -U \$DB_USER \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Application backup
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz -C /opt/takeclient .next public

# Keep only last 7 days of backups
find \$BACKUP_DIR -name \"*.sql\" -mtime +7 -delete
find \$BACKUP_DIR -name \"*.tar.gz\" -mtime +7 -delete

echo \"Backup completed: \$DATE\"
BACKUP

chmod +x /opt/takeclient/scripts/backup.sh

# Schedule daily backups at 2 AM
echo \"0 2 * * * /opt/takeclient/scripts/backup.sh\" | crontab -l | { cat; echo \"0 2 * * * /opt/takeclient/scripts/backup.sh\"; } | crontab -

# Create admin user
print_status \"Creating admin user...\"
cd \$APP_DIR
npm run create-admin || echo \"Admin user creation will be done manually\"

# Final checks
print_status \"Performing final checks...\"

# Check all services
services=(\"nginx\" \"postgresql\" \"redis-server\" \"takeclient-backend\")
for service in \"\${services[@]}\"; do
    if systemctl is-active --quiet \$service; then
        print_success \"\$service is running\"
    else
        print_error \"\$service is not running\"
    fi
done

# Check PM2
pm2 status

# Check ports
netstat -tlnp | grep -E ':80|:443|:3000|:8000|:5432|:6379'

print_success \"🎉 TakeClient CRM deployed successfully!\"
echo \"\"
echo \"Your CRM is now available at:\"
echo \"  Landing Page: https://takeclient.com\"
echo \"  CRM App: https://app.takeclient.com\"
echo \"  Admin Panel: https://administration.takeclient.com\"
echo \"  API: https://api.takeclient.com\"
echo \"\"
echo \"Next steps:\"
echo \"  1. Update API keys in /opt/takeclient/.env.production\"
echo \"  2. Update backend API keys in /opt/takeclient/backend/.env\"
echo \"  3. Test all functionality\"
echo \"  4. Create your first tenant at https://app.takeclient.com\"

EOF"
    
    # Make the script executable and run it
    print_status "Running deployment on server..."
    run_on_server "chmod +x /root/deploy-crm.sh && /root/deploy-crm.sh"
}

# Function to create GitHub repository and push code
setup_github() {
    print_header "Setting up GitHub Repository"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit - TakeClient CRM"
        
        print_warning "Please create a GitHub repository and run:"
        echo "git remote add origin https://github.com/YOUR_USERNAME/takeclient-crm.git"
        echo "git branch -M main"
        echo "git push -u origin main"
    else
        print_status "Git repository already exists"
        git add .
        git commit -m "Updated deployment configuration" || echo "No changes to commit"
        git push || echo "Please set up remote repository"
    fi
}

# Function to test DNS
test_dns() {
    print_header "Testing DNS Configuration"
    
    domains=("takeclient.com" "app.takeclient.com" "administration.takeclient.com" "api.takeclient.com")
    
    for domain in "${domains[@]}"; do
        resolved_ip=$(dig +short $domain @8.8.8.8 | tail -n1)
        if [ "$resolved_ip" = "$SERVER_IP" ]; then
            print_success "$domain resolves correctly to $SERVER_IP"
        else
            print_warning "$domain resolves to $resolved_ip (expected: $SERVER_IP)"
        fi
    done
}

# Function to show post-deployment instructions
show_instructions() {
    print_header "Post-Deployment Instructions"
    echo ""
    echo "🎉 Your TakeClient CRM has been deployed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update API keys on server:"
    echo "   ssh $SERVER_USER@$SERVER_IP"
    echo "   nano /opt/takeclient/.env.production"
    echo "   nano /opt/takeclient/backend/.env"
    echo ""
    echo "2. Restart services after updating keys:"
    echo "   systemctl restart takeclient-backend"
    echo "   pm2 restart all"
    echo ""
    echo "3. Test your domains:"
    echo "   Landing Page: https://takeclient.com"
    echo "   CRM App: https://app.takeclient.com"
    echo "   Admin Panel: https://administration.takeclient.com"
    echo "   API Health: https://api.takeclient.com/health"
    echo ""
    echo "4. Create your first admin user and tenant!"
    echo ""
    echo "📊 Monitoring:"
    echo "   Logs: ssh $SERVER_USER@$SERVER_IP 'tail -f /opt/takeclient/logs/*.log'"
    echo "   Status: ssh $SERVER_USER@$SERVER_IP 'pm2 status && systemctl status takeclient-backend'"
    echo ""
}

# Main execution
main() {
    print_header "TakeClient CRM Complete Deployment"
    
    # Check if sshpass is installed
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass is required but not installed."
        echo "Install it with: brew install hudochenkov/sshpass/sshpass (macOS) or apt-get install sshpass (Linux)"
        exit 1
    fi
    
    # Test DNS first
    test_dns
    
    # Upload and deploy
    upload_to_server
    deploy_on_server
    
    # Show final instructions
    show_instructions
    
    print_success "🚀 Deployment completed successfully!"
}

# Run main function
main "$@"