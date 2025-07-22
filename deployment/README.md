# NutriChef Deployment Documentation

This directory contains all the deployment-related documentation and scripts for NutriChef.

## 📋 Available Guides

### VPS Deployment
- **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** - Complete guide for deploying NutriChef on a Virtual Private Server
- **[VPS_README.md](./VPS_README.md)** - Additional VPS setup information and tips
- **[vps-setup.sh](./vps-setup.sh)** - Automated VPS setup script for Linux servers

### Access Configuration
- **[EXTERNAL_ACCESS_GUIDE.md](./EXTERNAL_ACCESS_GUIDE.md)** - Instructions for making your application accessible from external networks
- **[PUBLIC_ACCESS_GUIDE.md](./PUBLIC_ACCESS_GUIDE.md)** - Guide for setting up public internet access

## 🐳 Docker Deployment

The `docker-compose.yml` file is located in the root directory and provides containerized deployment options.

## 🔧 Quick Setup

For a quick VPS setup on Ubuntu/Debian:
```bash
wget -O - https://raw.githubusercontent.com/HimanM/nutrichef/main/deployment/vps-setup.sh | bash
```

Or download and run the setup script:
```bash
curl -O https://raw.githubusercontent.com/HimanM/nutrichef/main/deployment/vps-setup.sh
chmod +x vps-setup.sh
./vps-setup.sh
```

## 📞 Support

If you encounter any issues during deployment, please refer to the troubleshooting sections in the individual guides or create an issue in the main repository.
