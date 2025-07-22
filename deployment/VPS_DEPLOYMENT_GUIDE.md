# NutriChef VPS Deployment Guide

## Overview
Deploy your NutriChef application to a VPS (Virtual Private Server) for global access without router configuration. This guide covers Ubuntu/Debian and CentOS/RHEL servers.

## Prerequisites
- VPS with public IP address
- SSH access to your VPS
- Basic Linux command line knowledge
- Domain name (optional but recommended)

## Quick VPS Setup Commands

### For Ubuntu/Debian VPS:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip nodejs npm git ufw

# Clone your project (or upload files)
git clone https://github.com/YourUsername/nutrichef.git
cd nutrichef

# Install Python dependencies
cd backend
pip3 install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 5000  # Backend
sudo ufw allow 5173  # Frontend (dev) or 80/443 for production
sudo ufw enable

# Start services
python3 main.py
```

### For CentOS/RHEL/AlmaLinux VPS:
```bash
# Update system
sudo dnf update -y

# Install dependencies
sudo dnf install -y python3 python3-pip nodejs npm git firewalld

# Start firewall service
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Clone your project
git clone https://github.com/YourUsername/nutrichef.git
cd nutrichef

# Install dependencies (same as Ubuntu)
cd backend && pip3 install -r requirements.txt && cd ..
cd frontend && npm install && npm run build && cd ..

# Configure firewall
sudo firewall-cmd --permanent --add-port=22/tcp    # SSH
sudo firewall-cmd --permanent --add-port=5000/tcp  # Backend
sudo firewall-cmd --permanent --add-port=5173/tcp  # Frontend
sudo firewall-cmd --reload

# Start services
python3 main.py
```

## VPS-Specific Configuration

### 1. Environment Variables
Create a `.env` file in your backend directory:
```bash
# backend/.env
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=your-secret-key-here
DATABASE_URL=your-database-url
```

### 2. Update Backend for Production
Edit `backend/app.py` to use environment variables:
```python
import os
from dotenv import load_dotenv

load_dotenv()

# Use environment-specific settings
if os.getenv('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    # Add production-specific settings
```

### 3. Frontend Build for Production
```bash
cd frontend
npm run build
```

### 4. Serve Frontend with Nginx (Recommended)
```bash
# Install Nginx
sudo apt install nginx  # Ubuntu/Debian
# or
sudo dnf install nginx  # CentOS/RHEL

# Configure Nginx
sudo nano /etc/nginx/sites-available/nutrichef
```

Nginx configuration (`/etc/nginx/sites-available/nutrichef`):
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP

    # Serve frontend
    location / {
        root /path/to/nutrichef/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Flask
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy static files
    location /static {
        proxy_pass http://localhost:5000;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nutrichef /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Process Management with PM2

### Install PM2
```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File
Create `ecosystem.config.js` in your project root:
```javascript
module.exports = {
  apps: [
    {
      name: 'nutrichef-backend',
      script: 'backend/app.py',
      interpreter: 'python3',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py'
      },
      cwd: './backend'
    },
    {
      name: 'nutrichef-frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## SSL/HTTPS Setup (Recommended)

### Using Certbot (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# or
sudo dnf install certbot python3-certbot-nginx  # CentOS/RHEL

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## VPS Firewall Configuration

### Ubuntu/Debian (UFW)
```bash
# Reset firewall
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential services
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'  # HTTP + HTTPS
sudo ufw allow 5000/tcp      # Backend (if not using Nginx proxy)

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### CentOS/RHEL (Firewalld)
```bash
# Check firewall status
sudo firewall-cmd --state

# Allow services
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5000/tcp

# Reload firewall
sudo firewall-cmd --reload

# List active rules
sudo firewall-cmd --list-all
```

## VPS Provider Specific Notes

### DigitalOcean
- Droplets come with UFW disabled by default
- Cloud Firewalls available for additional security
- One-click apps available for common stacks

### AWS EC2
- Security Groups act as firewalls
- Inbound rules needed for ports 22, 80, 443, 5000
- Elastic IPs for static public addresses

### Linode
- Cloud Firewalls available
- Default firewall rules may block custom ports
- Longview for monitoring

### Vultr
- Firewall rules in control panel
- ISO mounting for custom setups
- Block storage for databases

### Hetzner
- Robot panel for dedicated servers
- Rescue system for troubleshooting
- Firewall templates available

## Database Setup

### SQLite (Simple)
- Already configured in your app
- File-based, no additional setup needed
- Good for small to medium traffic

### PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
# or
sudo dnf install postgresql postgresql-server postgresql-contrib  # CentOS/RHEL

# Initialize database (CentOS/RHEL only)
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE nutrichef;
CREATE USER nutrichef_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE nutrichef TO nutrichef_user;
\q

# Update backend configuration
# DATABASE_URL=postgresql://nutrichef_user:secure_password@localhost/nutrichef
```

## Monitoring and Logs

### View Application Logs
```bash
# PM2 logs
pm2 logs

# System logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# Install htop
sudo apt install htop  # Ubuntu/Debian
sudo dnf install htop  # CentOS/RHEL

# Monitor resources
htop
df -h          # Disk usage
free -h        # Memory usage
netstat -tlnp  # Network connections
```

## Security Best Practices

### 1. SSH Hardening
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# Port 2222                    # Change default port
# PermitRootLogin no          # Disable root login
# PasswordAuthentication no   # Use keys only
# AllowUsers yourusername     # Limit users

sudo systemctl restart ssh
```

### 2. Fail2Ban (Intrusion Prevention)
```bash
# Install Fail2Ban
sudo apt install fail2ban  # Ubuntu/Debian
sudo dnf install fail2ban  # CentOS/RHEL

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates
```bash
# Create update script
sudo nano /usr/local/bin/update-system.sh

#!/bin/bash
apt update && apt upgrade -y  # Ubuntu/Debian
# or
dnf update -y                 # CentOS/RHEL

# Make executable
sudo chmod +x /usr/local/bin/update-system.sh

# Add to crontab for weekly updates
sudo crontab -e
# Add: 0 3 * * 0 /usr/local/bin/update-system.sh
```

## Troubleshooting

### Common Issues

#### Port Access Issues
```bash
# Check if port is listening
sudo netstat -tlnp | grep :5000
sudo ss -tlnp | grep :5000

# Test port connectivity
curl http://localhost:5000
curl http://your-vps-ip:5000
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/nutrichef
chmod +x /path/to/nutrichef/main.py
```

#### Firewall Issues
```bash
# Temporarily disable firewall for testing
sudo ufw disable  # Ubuntu/Debian
sudo systemctl stop firewalld  # CentOS/RHEL

# Test your app, then re-enable with proper rules
```

### Performance Optimization

#### Frontend Optimization
```bash
# Build optimized frontend
cd frontend
npm run build

# Serve with Nginx for better performance
# (see Nginx configuration above)
```

#### Backend Optimization
```bash
# Use Gunicorn for production Flask
pip3 install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Domain Setup (Optional)

### 1. Point Domain to VPS
In your domain registrar, create an A record:
```
Type: A
Name: @ (or subdomain)
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

### 2. Update Nginx Configuration
Replace `your-domain.com` with your actual domain in the Nginx config.

### 3. Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## Cost Optimization

### Choosing VPS Size
- **Small Apps (1GB RAM)**: $5-10/month
- **Medium Apps (2GB RAM)**: $10-20/month
- **Large Apps (4GB+ RAM)**: $20+/month

### Popular VPS Providers
- **DigitalOcean**: Developer-friendly, good documentation
- **Linode**: Excellent performance, competitive pricing
- **Vultr**: Good global coverage, hourly billing
- **Hetzner**: Best price/performance ratio in Europe
- **AWS Lightsail**: Easy scaling, integration with AWS services

---

**Your NutriChef app will be accessible worldwide at `http://your-vps-ip:5173` or `https://your-domain.com`! 🌍🍽️**
