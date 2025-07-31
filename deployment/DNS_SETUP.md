# DNS Configuration Guide for TakeClient CRM

## 🌐 Required DNS Records

Once you have your Hetzner server IP address, configure these DNS records in your domain registrar's DNS management panel:

### A Records (IPv4)
```
Type    Name                            Value               TTL
A       takeclient.com                  YOUR_SERVER_IP      300
A       www.takeclient.com              YOUR_SERVER_IP      300
A       app.takeclient.com              YOUR_SERVER_IP      300
A       *.app.takeclient.com            YOUR_SERVER_IP      300
A       administration.takeclient.com   YOUR_SERVER_IP      300
A       api.takeclient.com              YOUR_SERVER_IP      300
A       *.takeclient.com                YOUR_SERVER_IP      300
```

### AAAA Records (IPv6) - Optional but Recommended
```
Type    Name                            Value               TTL
AAAA    takeclient.com                  YOUR_SERVER_IPv6    300
AAAA    www.takeclient.com              YOUR_SERVER_IPv6    300
AAAA    app.takeclient.com              YOUR_SERVER_IPv6    300
AAAA    *.app.takeclient.com            YOUR_SERVER_IPv6    300
AAAA    administration.takeclient.com   YOUR_SERVER_IPv6    300
AAAA    api.takeclient.com              YOUR_SERVER_IPv6    300
```

### Additional DNS Records for Security and Performance

#### MX Records (Email)
```
Type    Name                Value                       Priority    TTL
MX      takeclient.com      mail.takeclient.com         10          300
```

#### TXT Records (Security)
```
Type    Name                Value                                           TTL
TXT     takeclient.com      "v=spf1 include:_spf.google.com ~all"         300
TXT     _dmarc              "v=DMARC1; p=quarantine; rua=mailto:admin@takeclient.com"  300
```

## 🔧 Popular DNS Providers Configuration

### Cloudflare
1. Login to Cloudflare Dashboard
2. Select your domain
3. Go to DNS section
4. Add each record with "Proxy status" OFF (gray cloud) initially
5. After SSL setup, you can enable proxy (orange cloud) for additional features

### Namecheap
1. Login to Namecheap account
2. Go to Domain List → Manage
3. Go to Advanced DNS tab
4. Add each A record individually
5. Save changes

### GoDaddy
1. Login to GoDaddy account
2. Go to My Products → DNS
3. Select your domain
4. Add records in DNS Management
5. Save changes

### Route 53 (AWS)
1. Login to AWS Console
2. Go to Route 53 → Hosted Zones
3. Select your domain
4. Create Record Set for each entry
5. Save changes

## ⚡ Verification Steps

### 1. DNS Propagation Check
```bash
# Check A records
dig A takeclient.com
dig A app.takeclient.com
dig A administration.takeclient.com
dig A api.takeclient.com

# Check wildcard subdomain
dig A test.app.takeclient.com

# Online tools
# https://dnschecker.org/
# https://www.whatsmydns.net/
```

### 2. Test Domain Resolution
```bash
# Test all domains resolve to your server
nslookup takeclient.com
nslookup app.takeclient.com
nslookup administration.takeclient.com
nslookup api.takeclient.com
```

### 3. Verify Wildcard Support
```bash
# Test tenant subdomains
dig A tenant1.app.takeclient.com
dig A tenant2.app.takeclient.com
```

## 🚀 Deployment Order

### Step 1: Configure DNS First
- Set all A records pointing to your server IP
- Wait for DNS propagation (5-60 minutes)

### Step 2: Run Deployment Script
- Only run the deployment script AFTER DNS is working
- SSL certificates require valid DNS resolution

### Step 3: Test Everything
- Verify all domains are accessible
- Check SSL certificates are valid
- Test tenant subdomain creation

## 🔒 SSL Certificate Requirements

### Let's Encrypt Limitations
- **Rate Limits**: 50 certificates per registered domain per week
- **Wildcard Certificates**: Require DNS-01 challenge
- **Multiple Domains**: Can include multiple domains in one certificate

### Recommended SSL Strategy
```bash
# Main domain certificate
certbot certonly --nginx -d takeclient.com -d www.takeclient.com

# App domain with wildcard for tenants
certbot certonly --nginx -d app.takeclient.com -d *.app.takeclient.com

# Admin domain
certbot certonly --nginx -d administration.takeclient.com

# API domain
certbot certonly --nginx -d api.takeclient.com
```

## 🏥 Troubleshooting Common Issues

### DNS Not Propagating
- Check TTL values (lower = faster propagation)
- Use different DNS checkers
- Clear local DNS cache: `sudo systemctl flush-dns`

### Wildcard Subdomain Issues
- Ensure `*.app.takeclient.com` points to server IP
- Test with specific tenant subdomains
- Check Nginx configuration for wildcard handling

### SSL Certificate Failures
```bash
# Check if domain resolves to server
curl -I http://takeclient.com

# Test SSL certificate manually
openssl s_client -connect takeclient.com:443

# Check certificate details
certbot certificates
```

### Common DNS Mistakes
1. **Missing Wildcard Record**: `*.app.takeclient.com` is required for tenant subdomains
2. **Wrong IP Address**: Double-check your Hetzner server IP
3. **TTL Too High**: Use 300 seconds during setup
4. **Proxy Enabled**: Disable CDN/proxy during initial setup

## 📋 DNS Configuration Checklist

- [ ] `takeclient.com` → Server IP
- [ ] `www.takeclient.com` → Server IP  
- [ ] `app.takeclient.com` → Server IP
- [ ] `*.app.takeclient.com` → Server IP (Wildcard)
- [ ] `administration.takeclient.com` → Server IP
- [ ] `api.takeclient.com` → Server IP
- [ ] DNS propagation verified (use dnschecker.org)
- [ ] All domains ping successfully
- [ ] Wildcard subdomain tested
- [ ] Ready to run deployment script

## 🎯 Performance Optimization

### After Deployment (Optional)
1. **Enable Cloudflare Proxy** for:
   - Main landing page (`takeclient.com`)
   - Static assets caching
   - DDoS protection

2. **Keep Direct DNS** for:
   - Admin panel (`administration.takeclient.com`)
   - API endpoints (`api.takeclient.com`)
   - Tenant subdomains (for SSL certificate management)

### Monitoring DNS Health
```bash
# Create monitoring script
#!/bin/bash
domains=("takeclient.com" "app.takeclient.com" "administration.takeclient.com" "api.takeclient.com")

for domain in "${domains[@]}"; do
    if dig +short $domain | grep -q "YOUR_SERVER_IP"; then
        echo "✅ $domain resolves correctly"
    else
        echo "❌ $domain DNS issue"
    fi
done
```

## 📞 Support

If you encounter DNS issues:
1. Check your domain registrar's DNS management panel
2. Wait for propagation (up to 48 hours in rare cases)
3. Use multiple DNS checking tools
4. Contact your domain registrar support if needed

**Note**: DNS configuration must be completed BEFORE running the deployment script, as SSL certificate generation requires valid DNS resolution. 