# VPS Deployment Files

This directory contains everything you need to deploy NutriChef to a VPS (Virtual Private Server) for global access.

## Files

### 📋 `VPS_DEPLOYMENT_GUIDE.md`
Complete step-by-step guide for deploying to various VPS providers:
- Ubuntu/Debian setup commands
- CentOS/RHEL setup commands  
- Nginx configuration for production
- SSL/HTTPS setup with Let's Encrypt
- Database configuration (PostgreSQL)
- Security best practices
- Monitoring and troubleshooting

### 🚀 `vps-setup.sh`
Automated setup script that:
- Installs all dependencies (Python, Node.js, etc.)
- Configures firewall (opens ports 5000, 5173)
- Creates systemd services for auto-startup
- Provides management commands
- Shows your public access URLs

### ⚙️ `main.py` (Updated)
Enhanced launcher with VPS deployment option:
- Option 3: VPS deployment guidance
- Shows VPS benefits and costs
- Links to deployment resources

## Quick VPS Deployment

### 1. Get a VPS
Choose from popular providers:
- **DigitalOcean**: $6-12/month, developer-friendly
- **Linode**: $5-10/month, excellent performance  
- **Vultr**: $6-12/month, global coverage
- **Hetzner**: $4-8/month, best price/performance (Europe)

### 2. Upload Project
```bash
# On your local machine
scp -r nutrichef/ user@your-vps-ip:/home/user/

# Or use git
ssh user@your-vps-ip
git clone https://github.com/yourusername/nutrichef.git
```

### 3. Run Setup Script
```bash
# On your VPS
cd nutrichef
chmod +x vps-setup.sh
./vps-setup.sh
```

### 4. Access Your App
After setup completes, your app will be available at:
- **Frontend**: `http://YOUR_VPS_IP:5173`
- **Backend**: `http://YOUR_VPS_IP:5000`

## Management Commands

The setup script creates a management script:

```bash
# Start services
./nutrichef-manage.sh start

# Stop services  
./nutrichef-manage.sh stop

# Restart services
./nutrichef-manage.sh restart

# Check status
./nutrichef-manage.sh status

# View logs
./nutrichef-manage.sh logs
```

## Benefits of VPS Deployment

### 🌍 **Global Access**
- Friends can access from anywhere
- No router configuration needed
- Professional hosting environment

### ⚡ **Better Performance**
- Dedicated resources
- SSD storage
- Fast network connections
- 99.9% uptime

### 🔒 **Enhanced Security**
- Dedicated IP address
- Professional firewall
- SSL/HTTPS support
- Regular security updates

### 📈 **Scalability**
- Easy to upgrade resources
- Load balancing options
- Database scaling
- CDN integration

## Production Considerations

### For Serious Deployment
1. **Use Nginx** for serving frontend (better performance)
2. **Enable HTTPS** with Let's Encrypt SSL certificates
3. **Use PostgreSQL** instead of SQLite for database
4. **Set up monitoring** with tools like htop, netdata
5. **Configure backups** for your data
6. **Use process managers** like PM2 or systemd

### Security Best Practices
1. **Change default SSH port**
2. **Disable root login**
3. **Use SSH keys** instead of passwords
4. **Install fail2ban** for intrusion prevention
5. **Keep system updated**
6. **Use strong passwords**

## Costs Comparison

| Provider | 1GB RAM | 2GB RAM | 4GB RAM |
|----------|---------|---------|---------|
| DigitalOcean | $6/mo | $12/mo | $24/mo |
| Linode | $5/mo | $10/mo | $20/mo |
| Vultr | $6/mo | $12/mo | $24/mo |
| Hetzner | $4/mo | $8/mo | $16/mo |

*Prices approximate and may vary*

## Support

- **Full Guide**: See `VPS_DEPLOYMENT_GUIDE.md`
- **Issues**: Check the troubleshooting section
- **Performance**: Monitor with `htop` and logs

---

**Ready to deploy globally? Choose option 3 in `python main.py`! 🚀🌍**
