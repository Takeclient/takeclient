#!/bin/bash

# TakeClient CRM Quick Start Script
# This script helps you get started with the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root on your Hetzner server"
        exit 1
    fi
}

# Function to check if DNS is configured
check_dns() {
    print_status "Checking DNS configuration..."
    
    read -p "Enter your domain name (e.g., takeclient.com): " DOMAIN
    read -p "Enter your server IP address: " SERVER_IP
    
    print_status "Checking if $DOMAIN resolves to $SERVER_IP..."
    
    # Check main domain
    RESOLVED_IP=$(dig +short $DOMAIN @8.8.8.8 | tail -n1)
    if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
        print_success "$DOMAIN resolves correctly to $SERVER_IP"
    else
        print_error "$DOMAIN does not resolve to $SERVER_IP (resolves to: $RESOLVED_IP)"
        echo ""
        echo "Please configure these DNS records first:"
        echo "Type    Name                            Value"
        echo "A       $DOMAIN                         $SERVER_IP"
        echo "A       www.$DOMAIN                     $SERVER_IP"
        echo "A       app.$DOMAIN                     $SERVER_IP"
        echo "A       *.app.$DOMAIN                   $SERVER_IP"
        echo "A       administration.$DOMAIN          $SERVER_IP"  
        echo "A       api.$DOMAIN                     $SERVER_IP"
        echo ""
        echo "Wait for DNS propagation (5-30 minutes) then run this script again."
        exit 1
    fi
    
    # Check subdomain
    APP_RESOLVED_IP=$(dig +short app.$DOMAIN @8.8.8.8 | tail -n1)
    if [ "$APP_RESOLVED_IP" = "$SERVER_IP" ]; then
        print_success "app.$DOMAIN resolves correctly"
    else
        print_warning "app.$DOMAIN does not resolve correctly"
    fi
}

# Function to show prerequisites
show_prerequisites() {
    print_header "TakeClient CRM Deployment Prerequisites"
    echo ""
    echo "Before running the deployment, make sure you have:"
    echo ""
    echo "✅ Hetzner VPS running Ubuntu 22.04 LTS"
    echo "✅ Root SSH access to your server"
    echo "✅ Domain name registered (e.g., takeclient.com)"
    echo "✅ DNS records configured and propagated"
    echo "✅ Server IP address noted down"
    echo ""
    echo "Recommended Hetzner VPS specs:"
    echo "• CCX32: 8 vCPU, 32GB RAM, 240GB NVMe - €29.85/month"
    echo "• CCX22: 4 vCPU, 16GB RAM, 160GB NVMe - €13.85/month (budget)"
    echo ""
}

# Function to generate deployment commands
generate_commands() {
    print_header "Quick Deployment Commands"
    echo ""
    echo "Run these commands on your Hetzner server:"
    echo ""
    echo -e "${YELLOW}# 1. Clone the repository${NC}"
    echo "cd /root"
    echo "git clone https://github.com/your-username/your-crm-repo.git takeclient-deploy"
    echo "cd takeclient-deploy"
    echo ""
    echo -e "${YELLOW}# 2. Make deployment script executable${NC}"
    echo "chmod +x deployment/scripts/deploy.sh"
    echo ""
    echo -e "${YELLOW}# 3. Run the deployment${NC}"
    echo "./deployment/scripts/deploy.sh"
    echo ""
    print_warning "Make sure to update the Git repository URL above!"
}

# Function to show post-deployment steps
show_post_deployment() {
    print_header "After Deployment Steps"
    echo ""
    echo "1. Update environment variables:"
    echo "   nano /opt/takeclient/frontend/.env.production"
    echo "   nano /opt/takeclient/backend/.env"
    echo ""
    echo "2. Change default database password:"
    echo "   sudo -u postgres psql"
    echo "   ALTER USER takeclient_user WITH PASSWORD 'your_secure_password';"
    echo ""
    echo "3. Create admin user:"
    echo "   cd /opt/takeclient/frontend"
    echo "   npm run create-admin"
    echo ""
    echo "4. Test your domains:"
    echo "   Landing Page: https://$DOMAIN"
    echo "   CRM App: https://app.$DOMAIN"
    echo "   Admin Panel: https://administration.$DOMAIN"
    echo "   API: https://api.$DOMAIN/health"
    echo ""
}

# Function to show troubleshooting
show_troubleshooting() {
    print_header "Common Issues & Solutions"
    echo ""
    echo "🔍 DNS Issues:"
    echo "   • Use dnschecker.org to verify DNS propagation"
    echo "   • Wait up to 48 hours for full propagation"
    echo "   • Check TTL values (use 300 for faster updates)"
    echo ""
    echo "🔍 SSL Certificate Issues:"
    echo "   • Ensure DNS resolves before running deployment"
    echo "   • Check: dig A yourdomain.com"
    echo "   • Test manually: curl -I http://yourdomain.com"
    echo ""
    echo "🔍 Service Issues:"
    echo "   • Check status: systemctl status nginx postgresql redis-server"
    echo "   • Check PM2: pm2 status"
    echo "   • View logs: tail -f /opt/takeclient/logs/*.log"
    echo ""
    echo "🔍 Application Issues:"
    echo "   • Check environment variables are correct"
    echo "   • Verify database connection"
    echo "   • Check firewall rules: ufw status"
    echo ""
}

# Main menu function
show_menu() {
    while true; do
        print_header "TakeClient CRM Quick Start Menu"
        echo ""
        echo "1. Show Prerequisites & Planning"
        echo "2. Check DNS Configuration"
        echo "3. Generate Deployment Commands"
        echo "4. Show Post-Deployment Steps"
        echo "5. Troubleshooting Guide"
        echo "6. Start Automated Deployment (if DNS ready)"
        echo "7. Exit"
        echo ""
        read -p "Select an option (1-7): " choice
        
        case $choice in
            1)
                show_prerequisites
                echo ""
                read -p "Press Enter to continue..."
                ;;
            2)
                check_dns
                echo ""
                read -p "Press Enter to continue..."
                ;;
            3)
                generate_commands
                echo ""
                read -p "Press Enter to continue..."
                ;;
            4)
                show_post_deployment
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                show_troubleshooting
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                print_status "Starting automated deployment..."
                if [ -f "deployment/scripts/deploy.sh" ]; then
                    chmod +x deployment/scripts/deploy.sh
                    ./deployment/scripts/deploy.sh
                else
                    print_error "Deployment script not found. Please clone the repository first."
                fi
                break
                ;;
            7)
                print_success "Goodbye! Good luck with your CRM deployment!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please select 1-7."
                ;;
        esac
    done
}

# Function to show welcome message
show_welcome() {
    clear
    print_header "Welcome to TakeClient CRM Deployment"
    echo ""
    echo "This script will help you deploy your CRM system on Hetzner with:"
    echo ""
    echo "🌐 Professional subdomain structure:"
    echo "   • takeclient.com - Landing page"
    echo "   • app.takeclient.com - CRM application"  
    echo "   • administration.takeclient.com - Admin panel"
    echo "   • api.takeclient.com - Backend API"
    echo ""
    echo "🔒 Production-ready features:"
    echo "   • SSL certificates for all domains"
    echo "   • Automated backups and monitoring"
    echo "   • Security hardening and firewall"
    echo "   • Multi-tenant architecture"
    echo ""
    echo "💰 Cost-effective single server deployment:"
    echo "   • ~€35/month total cost"
    echo "   • Supports 1000+ users"
    echo "   • Easy to scale up"
    echo ""
    read -p "Press Enter to continue..."
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "DEPLOYMENT_GUIDE.md" ] && [ ! -f "deployment/scripts/deploy.sh" ]; then
        print_warning "This doesn't appear to be the TakeClient CRM directory."
        print_status "Looking for deployment files..."
        
        # Try to find the deployment directory
        if [ -d "/root/takeclient-deploy" ]; then
            cd /root/takeclient-deploy
            print_success "Found deployment files in /root/takeclient-deploy"
        else
            print_error "Deployment files not found. Please clone the repository first:"
            echo ""
            echo "git clone https://github.com/your-username/your-crm-repo.git takeclient-deploy"
            echo "cd takeclient-deploy"
            echo "./quick-start.sh"
            exit 1
        fi
    fi
}

# Main execution
main() {
    check_directory
    show_welcome
    show_menu
}

# Run main function
main "$@" 