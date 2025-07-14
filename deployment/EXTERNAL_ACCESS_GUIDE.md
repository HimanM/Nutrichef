# NutriChef External Access Setup Guide

## Overview
Your NutriChef project supports two types of external sharing:
1. **Local Network Access** - Friends on the same WiFi/LAN
2. **Public Internet Access** - Friends anywhere on the internet (requires router setup)

The `main.py` launcher automatically handles both configurations.

## Access Types

### Option 1: Local Network Access (Recommended)
- **Who can access**: Friends connected to your WiFi/LAN
- **Setup**: Automatic firewall configuration
- **Security**: Safer, limited to local network
- **Requirements**: Same WiFi network

### Option 2: Public Internet Access (Advanced)
- **Who can access**: Anyone on the internet with your public IP
- **Setup**: Router port forwarding required
- **Security**: Higher risk, requires careful management
- **Requirements**: Router configuration skills

⚠️ **For public internet access, see `PUBLIC_ACCESS_GUIDE.md` for detailed instructions.**

## How It Works

### Automatic Setup
When you run `python main.py`, you'll be prompted:
```
Enable external access for friends? This will open firewall ports. (y/N):
```

If you choose **Yes**:
- The script opens Windows Firewall ports 5173 (frontend) and 5000 (backend)
- Both servers are configured to accept external connections
- You get the IP addresses your friends can use
- When you exit, the firewall ports are automatically closed

### Configuration Changes Made
1. **Vite Config Updated** (`frontend/vite.config.js`):
   - Added `host: '0.0.0.0'` to allow external connections
   - Explicitly set `port: 5173`

2. **Flask Backend**:
   - Already configured with `--host=0.0.0.0` for external access

3. **Firewall Management**:
   - Automatically opens ports when starting with external access
   - Automatically closes ports when shutting down

## Usage Options

### Option 1: Run Normally (Recommended)
```bash
python main.py
```
Choose "y" when prompted for external access. If firewall rules fail, you'll get instructions to run as admin.

### Option 2: Run as Administrator (For Automatic Firewall)
```bash
run_as_admin.bat
```
This batch file automatically requests admin privileges and runs the launcher.

### Option 3: Manual Firewall Setup
If you prefer to manage firewall rules manually:

1. **Open Command Prompt as Administrator**
2. **Add firewall rules:**
   ```cmd
   netsh advfirewall firewall add rule name="NutriChef-Frontend" dir=in action=allow protocol=TCP localport=5173
   netsh advfirewall firewall add rule name="NutriChef-Backend" dir=in action=allow protocol=TCP localport=5000
   ```
3. **Run the application:**
   ```bash
   python main.py
   ```
4. **Remove rules when done:**
   ```cmd
   netsh advfirewall firewall delete rule name="NutriChef-Frontend"
   netsh advfirewall firewall delete rule name="NutriChef-Backend"
   ```

## Sharing with Friends

When external access is enabled, you'll see output like:
```
🌐 Your friends can access the app at:
  • Frontend: http://192.168.1.100:5173
  • Backend API: http://192.168.1.100:5000
```

Share the **Frontend URL** with your friends. They can open it in their web browser to use your NutriChef application.

## Troubleshooting

### "Failed to open firewall ports"
- **Solution**: Run as Administrator using `run_as_admin.bat`
- **Alternative**: Manually add firewall rules (see Option 3 above)

### Friends can't connect
1. **Check Windows Firewall**: Ensure ports 5173 and 5000 are open
2. **Check Router**: Some routers block inter-device communication
3. **Check Network**: Ensure friends are on the same network (WiFi/LAN)
4. **Find Your IP**: Run `ipconfig` to verify your local IP address

### Backend API calls fail from external
- Ensure both frontend (5173) and backend (5000) ports are open
- The Vite dev server proxies API calls to the backend

## Security Notes

- **Local Network Only**: This setup only works on your local network (home/office WiFi)
- **Temporary Access**: Firewall ports are automatically closed when you stop the application
- **Development Only**: This is for development/demo purposes, not production deployment

## Network Requirements

- **Same Network**: Your friends must be connected to the same WiFi/LAN as you
- **No VPN Issues**: VPNs might interfere with local network access
- **Router Settings**: Some routers have "client isolation" that blocks device-to-device communication

Enjoy sharing NutriChef with your friends! 🍽️✨
