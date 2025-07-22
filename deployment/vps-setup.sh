#!/bin/bash

# NutriChef VPS Quick Setup Script
# Run this on your VPS after uploading your project files

set -e  # Exit on any error

echo "🍽️  NutriChef VPS Quick Setup Starting..."
echo "=============================================="

# Detect OS
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo "📋 Detected: Debian/Ubuntu system"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    echo "📋 Detected: RedHat/CentOS/RHEL system"
else
    echo "❌ Unsupported operating system"
    exit 1
fi

# Update system
echo "🔄 Updating system packages..."
if [ "$OS" = "debian" ]; then
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y python3 python3-pip nodejs npm git ufw
elif [ "$OS" = "redhat" ]; then
    sudo dnf update -y
    sudo dnf install -y python3 python3-pip nodejs npm git firewalld
    sudo systemctl start firewalld
    sudo systemctl enable firewalld
fi

echo "✅ System updated and dependencies installed"

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    cd backend
    pip3 install -r requirements.txt
    cd ..
    echo "✅ Python dependencies installed"
else
    echo "❌ backend/requirements.txt not found"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "frontend/package.json" ]; then
    cd frontend
    npm install
    echo "✅ Node.js dependencies installed"
    cd ..
else
    echo "❌ frontend/package.json not found"
    exit 1
fi

# Configure firewall
echo "🔥 Configuring firewall..."
if [ "$OS" = "debian" ]; then
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 5000/tcp  # Backend
    sudo ufw allow 5173/tcp  # Frontend
    sudo ufw --force enable
    echo "✅ UFW firewall configured"
elif [ "$OS" = "redhat" ]; then
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --permanent --add-port=5000/tcp
    sudo firewall-cmd --permanent --add-port=5173/tcp
    sudo firewall-cmd --reload
    echo "✅ Firewalld configured"
fi

# Get public IP
echo "🌐 Getting public IP address..."
PUBLIC_IP=$(curl -s ipinfo.io/ip || curl -s icanhazip.com || curl -s ifconfig.me)
if [ -n "$PUBLIC_IP" ]; then
    echo "✅ Your public IP: $PUBLIC_IP"
else
    echo "⚠️  Could not determine public IP"
    PUBLIC_IP="YOUR_VPS_IP"
fi

# Create systemd service files
echo "⚙️  Creating systemd services..."

# Backend service
sudo tee /etc/systemd/system/nutrichef-backend.service > /dev/null << EOF
[Unit]
Description=NutriChef Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/backend
Environment=FLASK_APP=app.py
Environment=FLASK_ENV=production
ExecStart=/usr/bin/python3 -m flask run --host=0.0.0.0 --port=5000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
sudo tee /etc/systemd/system/nutrichef-frontend.service > /dev/null << EOF
[Unit]
Description=NutriChef Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/frontend
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start services
sudo systemctl daemon-reload
sudo systemctl enable nutrichef-backend nutrichef-frontend
sudo systemctl start nutrichef-backend nutrichef-frontend

echo "✅ Systemd services created and started"

# Create management script
tee nutrichef-manage.sh > /dev/null << 'EOF'
#!/bin/bash

case "$1" in
    start)
        sudo systemctl start nutrichef-backend nutrichef-frontend
        echo "✅ NutriChef services started"
        ;;
    stop)
        sudo systemctl stop nutrichef-backend nutrichef-frontend
        echo "⏹️  NutriChef services stopped"
        ;;
    restart)
        sudo systemctl restart nutrichef-backend nutrichef-frontend
        echo "🔄 NutriChef services restarted"
        ;;
    status)
        echo "Backend status:"
        sudo systemctl status nutrichef-backend --no-pager
        echo ""
        echo "Frontend status:"
        sudo systemctl status nutrichef-frontend --no-pager
        ;;
    logs)
        echo "=== Backend Logs ==="
        sudo journalctl -u nutrichef-backend --no-pager -n 20
        echo ""
        echo "=== Frontend Logs ==="
        sudo journalctl -u nutrichef-frontend --no-pager -n 20
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

chmod +x nutrichef-manage.sh

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
if sudo systemctl is-active --quiet nutrichef-backend; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    echo "Check logs with: sudo journalctl -u nutrichef-backend"
fi

if sudo systemctl is-active --quiet nutrichef-frontend; then
    echo "✅ Frontend service is running"
else
    echo "❌ Frontend service failed to start"
    echo "Check logs with: sudo journalctl -u nutrichef-frontend"
fi

echo ""
echo "🎉 NutriChef VPS Setup Complete!"
echo "=================================="
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$PUBLIC_IP:5173"
echo "   Backend:  http://$PUBLIC_IP:5000"
echo ""
echo "⚙️  Management Commands:"
echo "   Start:    ./nutrichef-manage.sh start"
echo "   Stop:     ./nutrichef-manage.sh stop"
echo "   Restart:  ./nutrichef-manage.sh restart"
echo "   Status:   ./nutrichef-manage.sh status"
echo "   Logs:     ./nutrichef-manage.sh logs"
echo ""
echo "📋 Next Steps:"
echo "   1. Test the URLs above in your browser"
echo "   2. Consider setting up a domain name"
echo "   3. Set up SSL/HTTPS with certbot"
echo "   4. Configure nginx for better performance"
echo ""
echo "📚 For more details, see VPS_DEPLOYMENT_GUIDE.md"
echo ""
echo "🍽️  Enjoy your globally accessible NutriChef app! ✨"
