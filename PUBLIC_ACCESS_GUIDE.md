# NutriChef Public Internet Access Guide

## ⚠️ IMPORTANT SECURITY WARNING
**Exposing your development server to the public internet comes with significant security risks. This should only be used for temporary demos with trusted friends.**

## Overview
This guide explains how to make your NutriChef application accessible from anywhere on the internet using your public IP address.

## Quick Start

### Step 1: Run the Launcher
```bash
python main.py
```

### Step 2: Choose Public Access
When prompted, select option **2** for "Public internet access"

### Step 3: Configure Your Router
The script will provide your public IP and specific router configuration instructions.

## Router Configuration Details

### Find Your Router Admin Panel
1. Open a web browser
2. Navigate to one of these addresses:
   - `http://192.168.1.1` (most common)
   - `http://192.168.0.1`
   - `http://10.0.0.1`
   - Check your router label for the exact address

### Add Port Forwarding Rules
Look for these sections in your router admin:
- "Port Forwarding"
- "Virtual Servers"
- "NAT Forwarding"
- "Applications & Gaming"

Add these two rules:

#### Rule 1: Frontend (Vite)
- **Service Name**: NutriChef-Frontend
- **External Port**: 5173
- **Internal IP**: [Your local IP from the script output]
- **Internal Port**: 5173
- **Protocol**: TCP

#### Rule 2: Backend (Flask)
- **Service Name**: NutriChef-Backend
- **External Port**: 5000
- **Internal IP**: [Your local IP from the script output]
- **Internal Port**: 5000
- **Protocol**: TCP

### Router-Specific Guides

#### Netgear Routers
1. Go to "Dynamic DNS" or "Port Forwarding/Port Triggering"
2. Click "Add Custom Service"
3. Enter the port forwarding details

#### Linksys Routers
1. Go to "Smart Wi-Fi Tools" → "Port Range Forward"
2. Add new forwarding entries

#### TP-Link Routers
1. Go to "Advanced" → "NAT Forwarding" → "Virtual Servers"
2. Click "Add" to create new rules

#### ASUS Routers
1. Go to "WAN" → "Virtual Server/Port Forwarding"
2. Enable port forwarding and add rules

## Testing Your Setup

### Step 1: Verify Local Access
First, ensure the app works locally:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000/api/health` (if you have a health endpoint)

### Step 2: Test Public Access
From your phone (using mobile data, not WiFi):
- Frontend: `http://[YOUR_PUBLIC_IP]:5173`
- Backend: `http://[YOUR_PUBLIC_IP]:5000/api/health`

### Step 3: Share with Friends
Give friends these URLs:
- **Main App**: `http://[YOUR_PUBLIC_IP]:5173`

## Security Considerations

### 🚨 Major Risks
- **No Authentication**: Anyone with your IP can access the app
- **No Encryption**: Data is transmitted in plain text
- **Development Server**: Not hardened for production use
- **Potential Exploits**: Development servers may have vulnerabilities

### 🛡️ Mitigation Strategies
1. **Temporary Use Only**: Close ports when demo is finished
2. **Trusted Networks**: Only share with people you trust
3. **Monitor Access**: Check router logs for unusual activity
4. **Use Strong Router Password**: Ensure your router admin is secure
5. **Consider VPN**: Use a VPN service for more secure sharing

### 🔒 Better Alternatives
For longer-term sharing, consider:
- **Ngrok**: Secure tunneling service
- **Cloudflare Tunnel**: Free secure tunneling
- **Heroku/Vercel**: Deploy to cloud platforms
- **VPN**: Set up a VPN for secure access

## Troubleshooting

### Friends Can't Access
1. **Check Router Configuration**: Verify port forwarding rules
2. **Test from Mobile**: Use mobile data to test public access
3. **Check Firewall**: Ensure Windows Firewall allows the ports
4. **Verify Public IP**: Your IP might have changed (restart router)
5. **Router Restart**: Restart router after making changes

### App Not Loading
1. **Check Local Access**: Ensure app works on localhost first
2. **Verify Ports**: Both 5173 and 5000 must be forwarded
3. **Backend Connection**: Frontend needs to reach backend API

### Dynamic IP Issues
- Most home internet connections have dynamic IPs
- Your public IP may change periodically
- Consider using Dynamic DNS services if IP changes frequently

## Common Router Port Names
Different routers use different terminology:
- **Port Forwarding** (most common)
- **Virtual Servers**
- **NAT Forwarding**
- **Port Mapping**
- **Application Rules**
- **Gaming Mode**

## When You're Done

### Close Public Access
1. **Stop the Application**: Press Ctrl+C in the main.py terminal
2. **Remove Router Rules**: Delete the port forwarding rules from your router
3. **Verify Closure**: Test that the public URLs no longer work

### Clean Shutdown
The script automatically:
- Closes Windows Firewall ports
- Cleans up temporary files
- Provides reminder to close router ports

---

**Remember**: Public internet access should be used sparingly and only with people you trust. Always close the ports when your demo is finished! 🔒
