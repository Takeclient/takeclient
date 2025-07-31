#!/bin/bash

# Connect to your Hetzner server
# Server IP: 188.245.230.119
# User: 39TnHVrLECXEUEHaRWkhT
# Password: 39TnHVrLECXEUEHaRWkhT

echo "Connecting to your Hetzner server..."
echo "Server IP: 188.245.230.119"
echo "Username: 39TnHVrLECXEUEHaRWkhT"
echo ""
echo "After connecting, run these commands:"
echo "1. cd /root"
echo "2. git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git takeclient-deploy"
echo "3. cd takeclient-deploy"
echo "4. chmod +x quick-start.sh"
echo "5. ./quick-start.sh"
echo ""

# Connect to server
ssh 39TnHVrLECXEUEHaRWkhT@188.245.230.119