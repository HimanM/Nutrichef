#!/usr/bin/env python3
"""
NutriChef Local Demo Launcher
============================

A beautiful CLI interface for launching the NutriChef application locally.
This script starts both the Flask backend and React frontend servers.
"""

import os
import sys
import time
import signal
import subprocess
import threading
import webbrowser
from pathlib import Path
import platform

# Color codes for beautiful CLI output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class NutriChefDemo:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent  # Go up to project root from scripts folder
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.backend_process = None
        self.frontend_process = None
        self.is_running = False
        self.firewall_rules_added = False
        
    def print_banner(self):
        """Display the NutriChef banner"""
        banner = f"""
{Colors.HEADER}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════════════════════╗
║                            🍽️  NutriChef Demo 🍽️                             ║
║                        Local Development Environment                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
{Colors.ENDC}
{Colors.OKCYAN}Welcome to NutriChef - Your AI-Powered Nutrition Companion!{Colors.ENDC}

{Colors.OKBLUE}This demo will start both services:{Colors.ENDC}
  🔧 Backend API (Flask)  → http://localhost:5000
  🎨 Frontend (React)     → http://localhost:5173

{Colors.WARNING}Press Ctrl+C at any time to stop all services gracefully.{Colors.ENDC}
"""
        print(banner)

    def check_requirements(self):
        """Check if required directories and files exist"""
        print(f"{Colors.OKCYAN}🔍 Checking requirements...{Colors.ENDC}")
        
        issues = []
        
        # Check directories
        if not self.backend_dir.exists():
            issues.append("❌ Backend directory not found")
        else:
            print(f"  ✅ Backend directory found")
            
        if not self.frontend_dir.exists():
            issues.append("❌ Frontend directory not found")
        else:
            print(f"  ✅ Frontend directory found")
            
        # Check key files
        if not (self.backend_dir / "app.py").exists():
            issues.append("❌ Backend app.py not found")
        else:
            print(f"  ✅ Backend app.py found")
            
        if not (self.frontend_dir / "package.json").exists():
            issues.append("❌ Frontend package.json not found")
        else:
            print(f"  ✅ Frontend package.json found")
            
        # Check for Python
        try:
            result = subprocess.run(["python", "--version"], capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print(f"  ✅ Python found: {result.stdout.strip()}")
            else:
                issues.append("❌ Python not found or not working")
        except FileNotFoundError:
            issues.append("❌ Python not found in PATH")
            
        # Check for Node.js
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print(f"  ✅ Node.js found: {result.stdout.strip()}")
            else:
                issues.append("❌ Node.js not found or not working")
        except FileNotFoundError:
            issues.append("❌ Node.js not found in PATH")
            
        # Check for npm
        try:
            # Try npm command with shell=True for Windows compatibility
            result = subprocess.run(["npm", "--version"], capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print(f"  ✅ npm found: {result.stdout.strip()}")
            else:
                issues.append("❌ npm not found or not working")
        except FileNotFoundError:
            # Try alternative npm detection
            try:
                result = subprocess.run(["npm.cmd", "--version"], capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"  ✅ npm found: {result.stdout.strip()}")
                else:
                    issues.append("❌ npm not found in PATH")
            except FileNotFoundError:
                issues.append("❌ npm not found in PATH")
        
        if issues:
            print(f"\n{Colors.FAIL}❌ Issues found:{Colors.ENDC}")
            for issue in issues:
                print(f"  {issue}")
            print(f"\n{Colors.WARNING}Please resolve these issues before continuing.{Colors.ENDC}")
            return False
            
        print(f"\n{Colors.OKGREEN}✅ All requirements satisfied!{Colors.ENDC}")
        return True

    def is_admin(self):
        """Check if the script is running with administrator privileges"""
        try:
            return os.getuid() == 0
        except AttributeError:
            # Windows
            import ctypes
            try:
                return ctypes.windll.shell32.IsUserAnAdmin()
            except:
                return False

    def open_firewall_ports(self):
        """Open Windows firewall ports for external access"""
        if platform.system() != "Windows":
            print(f"  ℹ️  Firewall management is only supported on Windows")
            return True
            
        print(f"\n{Colors.OKCYAN}🔥 Opening firewall ports for external access...{Colors.ENDC}")
        
        try:
            # Open port 5173 for Vite frontend
            result1 = subprocess.run([
                "netsh", "advfirewall", "firewall", "add", "rule",
                "name=NutriChef-Frontend-5173",
                "dir=in", "action=allow", "protocol=TCP", "localport=5173"
            ], capture_output=True, text=True, shell=True)
            
            # Open port 5000 for Flask backend
            result2 = subprocess.run([
                "netsh", "advfirewall", "firewall", "add", "rule",
                "name=NutriChef-Backend-5000",
                "dir=in", "action=allow", "protocol=TCP", "localport=5000"
            ], capture_output=True, text=True, shell=True)
            
            if result1.returncode == 0 and result2.returncode == 0:
                print(f"  ✅ Firewall ports opened successfully!")
                print(f"    • Port 5173 (Frontend) - Open")
                print(f"    • Port 5000 (Backend) - Open")
                self.firewall_rules_added = True
                
                # Get local IP address
                try:
                    import socket
                    # Try multiple methods to get the correct IP
                    local_ip = None
                    
                    # Method 1: Connect to a remote address to determine local IP
                    try:
                        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                            s.connect(("8.8.8.8", 80))
                            local_ip = s.getsockname()[0]
                    except:
                        pass
                    
                    # Method 2: Fallback to hostname resolution
                    if not local_ip:
                        hostname = socket.gethostname()
                        local_ip = socket.gethostbyname(hostname)
                    
                    print(f"  🌐 Your friends can access the app at:")
                    print(f"    • Frontend: {Colors.UNDERLINE}http://{local_ip}:5173{Colors.ENDC}")
                    print(f"    • Backend API: {Colors.UNDERLINE}http://{local_ip}:5000{Colors.ENDC}")
                    print(f"  💡 This should match the 'Network' URL shown by Vite")
                except Exception as e:
                    print(f"  ⚠️  Could not determine local IP: {e}")
                    print(f"  💡 Check the Vite output for the 'Network' URL to share with friends")
                    print(f"  💡 Or find your IP with: ipconfig")
                
                return True
            else:
                if "already exists" in result1.stderr or "already exists" in result2.stderr:
                    print(f"  ℹ️  Firewall rules already exist")
                    self.firewall_rules_added = False  # Don't remove rules we didn't create
                    return True
                else:
                    print(f"  ❌ Failed to open firewall ports")
                    if result1.stderr:
                        print(f"    Frontend error: {result1.stderr}")
                    if result2.stderr:
                        print(f"    Backend error: {result2.stderr}")
                    return False
                    
        except Exception as e:
            print(f"  ❌ Error managing firewall: {e}")
            print(f"  💡 You may need to run as Administrator to modify firewall settings")
            return False

    def show_vps_deployment_guide(self):
        """Show VPS deployment instructions"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}🌍 VPS Deployment Guide{Colors.ENDC}")
        print(f"""
{Colors.OKCYAN}VPS deployment allows global access without router configuration!{Colors.ENDC}

{Colors.OKGREEN}📋 Quick Steps:{Colors.ENDC}
  1. Get a VPS from DigitalOcean, Linode, Vultr, etc.
  2. Upload your NutriChef project to the VPS
  3. Run the automated setup script
  4. Access your app from anywhere!

{Colors.OKBLUE}🔧 VPS Setup Commands:{Colors.ENDC}
  # On your VPS, run:
  cd /path/to/nutrichef
  chmod +x vps-setup.sh
  ./vps-setup.sh

{Colors.OKCYAN}📦 What the script does:{Colors.ENDC}
  ✅ Installs all dependencies (Python, Node.js, etc.)
  ✅ Configures firewall (ports 5000, 5173)
  ✅ Creates systemd services for auto-startup
  ✅ Provides management commands
  ✅ Shows your public access URLs

{Colors.OKGREEN}🌐 After setup, your app will be accessible at:{Colors.ENDC}
  Frontend: http://YOUR_VPS_IP:5173
  Backend:  http://YOUR_VPS_IP:5000

{Colors.WARNING}💰 VPS Costs (approximate):{Colors.ENDC}
  • DigitalOcean: $6-12/month
  • Linode: $5-10/month  
  • Vultr: $6-12/month
  • Hetzner: $4-8/month (Europe)

{Colors.OKCYAN}📚 Detailed guides available:{Colors.ENDC}
  • VPS_DEPLOYMENT_GUIDE.md - Complete setup instructions
  • vps-setup.sh - Automated setup script

{Colors.OKGREEN}✨ Benefits of VPS deployment:{Colors.ENDC}
  🌍 Global access from any device
  🔒 No router configuration needed
  ⚡ Better performance than home hosting
  📈 Easy to scale up resources
  🛡️  Professional hosting environment

{Colors.WARNING}Want to continue with local development instead?{Colors.ENDC}
""")
        
        choice = input(f"{Colors.OKCYAN}Continue with local development? (y/N): {Colors.ENDC}").lower().strip()
        if choice in ['y', 'yes']:
            return False  # Continue with local development
        else:
            print(f"\n{Colors.OKGREEN}Happy VPS deployment! 🚀{Colors.ENDC}")
            print(f"{Colors.OKCYAN}Check the VPS_DEPLOYMENT_GUIDE.md for detailed instructions.{Colors.ENDC}")
            return True  # Exit

    def show_vps_deployment_guide(self):
        """Show VPS deployment instructions"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}🌍 VPS Deployment Guide{Colors.ENDC}")
        print(f"""
{Colors.OKCYAN}VPS deployment allows global access without router configuration!{Colors.ENDC}

{Colors.OKGREEN}� Quick Steps:{Colors.ENDC}
  1. Get a VPS from DigitalOcean, Linode, Vultr, etc.
  2. Upload your NutriChef project to the VPS
  3. Run the automated setup script
  4. Access your app from anywhere!

{Colors.OKBLUE}🔧 VPS Setup Commands:{Colors.ENDC}
  # On your VPS, run:
  cd /path/to/nutrichef
  chmod +x vps-setup.sh
  ./vps-setup.sh

{Colors.OKCYAN}📦 What the script does:{Colors.ENDC}
  ✅ Installs all dependencies (Python, Node.js, etc.)
  ✅ Configures firewall (ports 5000, 5173)
  ✅ Creates systemd services for auto-startup
  ✅ Provides management commands
  ✅ Shows your public access URLs

{Colors.OKGREEN}🌐 After setup, your app will be accessible at:{Colors.ENDC}
  Frontend: http://YOUR_VPS_IP:5173
  Backend:  http://YOUR_VPS_IP:5000

{Colors.WARNING}💰 VPS Costs (approximate):{Colors.ENDC}
  • DigitalOcean: $6-12/month
  • Linode: $5-10/month  
  • Vultr: $6-12/month
  • Hetzner: $4-8/month (Europe)

{Colors.OKCYAN}📚 Detailed guides available:{Colors.ENDC}
  • VPS_DEPLOYMENT_GUIDE.md - Complete setup instructions
  • vps-setup.sh - Automated setup script

{Colors.OKGREEN}✨ Benefits of VPS deployment:{Colors.ENDC}
  🌍 Global access from any device
  🔒 No router configuration needed
  ⚡ Better performance than home hosting
  📈 Easy to scale up resources
  🛡️  Professional hosting environment

{Colors.WARNING}Want to continue with local development instead?{Colors.ENDC}
""")
        
        choice = input(f"{Colors.OKCYAN}Continue with local development? (y/N): {Colors.ENDC}").lower().strip()
        if choice in ['y', 'yes']:
            return False  # Continue with local development
        else:
            print(f"\n{Colors.OKGREEN}Happy VPS deployment! 🚀{Colors.ENDC}")
            print(f"{Colors.OKCYAN}Check the VPS_DEPLOYMENT_GUIDE.md for detailed instructions.{Colors.ENDC}")
            return True  # Exit

    def close_firewall_ports(self):
        """Close Windows firewall ports that were opened by this script"""
        if not self.firewall_rules_added or platform.system() != "Windows":
            return
            
        print(f"  🔥 Closing firewall ports...")
        
        try:
            # Remove the firewall rules we created
            result1 = subprocess.run([
                "netsh", "advfirewall", "firewall", "delete", "rule",
                "name=NutriChef-Frontend-5173"
            ], capture_output=True, text=True, shell=True)
            
            result2 = subprocess.run([
                "netsh", "advfirewall", "firewall", "delete", "rule",
                "name=NutriChef-Backend-5000"
            ], capture_output=True, text=True, shell=True)
            
            if result1.returncode == 0 and result2.returncode == 0:
                print(f"  ✅ Firewall ports closed successfully!")
            else:
                print(f"  ⚠️  Some firewall rules may not have been removed")
                
        except Exception as e:
            print(f"  ⚠️  Error closing firewall ports: {e}")

    def get_public_ip(self):
        """Get the public IP address"""
        try:
            import urllib.request
            import json
            
            # Try multiple services to get public IP
            services = [
                "https://api.ipify.org?format=json",
                "https://httpbin.org/ip",
                "https://api.myip.com"
            ]
            
            for service in services:
                try:
                    with urllib.request.urlopen(service, timeout=5) as response:
                        data = json.loads(response.read().decode())
                        if 'ip' in data:
                            return data['ip']
                        elif 'origin' in data:
                            return data['origin']
                except:
                    continue
                    
            return None
        except Exception:
            return None

    def setup_public_access(self):
        """Setup public internet access"""
        print(f"\n{Colors.WARNING}🌍 Setting up PUBLIC INTERNET access...{Colors.ENDC}")
        print(f"{Colors.WARNING}⚠️  SECURITY WARNING: This will expose your app to the internet!{Colors.ENDC}")
        
        confirm = input(f"\n{Colors.FAIL}Are you sure you want to expose your app to the internet? (yes/NO): {Colors.ENDC}")
        if confirm.lower() != "yes":
            print(f"  ℹ️  Public access cancelled. Switching to local network access.")
            return self.open_firewall_ports()
        
        # Open firewall ports first
        if not self.open_firewall_ports():
            print(f"  ❌ Failed to open firewall ports")
            return False
        
        # Get public IP
        print(f"  🔍 Getting your public IP address...")
        public_ip = self.get_public_ip()
        
        if public_ip:
            print(f"  ✅ Your public IP: {Colors.BOLD}{public_ip}{Colors.ENDC}")
            
            # Get local IP for router configuration
            try:
                import socket
                with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                    s.connect(("8.8.8.8", 80))
                    local_ip = s.getsockname()[0]
            except:
                local_ip = "YOUR_LOCAL_IP"
            
            print(f"\n{Colors.WARNING}🔧 ROUTER CONFIGURATION REQUIRED:{Colors.ENDC}")
            print(f"  You need to configure port forwarding in your router:")
            print(f"    • Port 5173 → {Colors.BOLD}{local_ip}:5173{Colors.ENDC} (Frontend)")
            print(f"    • Port 5000 → {Colors.BOLD}{local_ip}:5000{Colors.ENDC} (Backend)")
            print(f"")
            print(f"  📋 Router setup steps:")
            print(f"    1. Open your router admin panel (usually http://192.168.1.1)")
            print(f"    2. Find 'Port Forwarding' or 'Virtual Servers' section")
            print(f"    3. Add two rules:")
            print(f"       - External Port 5173 → Internal {local_ip}:5173")
            print(f"       - External Port 5000 → Internal {local_ip}:5000")
            print(f"    4. Enable the rules and save")
            print(f"")
            print(f"  🌐 After router setup, share these URLs:")
            print(f"    • Frontend: {Colors.UNDERLINE}http://{public_ip}:5173{Colors.ENDC}")
            print(f"    • Backend API: {Colors.UNDERLINE}http://{public_ip}:5000{Colors.ENDC}")
            print(f"")
            print(f"  {Colors.FAIL}⚠️  SECURITY RISKS:{Colors.ENDC}")
            print(f"    • Your app will be accessible by ANYONE on the internet")
            print(f"    • No authentication or encryption by default")
            print(f"    • Consider this for temporary demos only")
            print(f"    • Monitor your router logs for suspicious activity")
            print(f"")
            return True
        else:
            print(f"  ❌ Could not determine public IP address")
            print(f"  💡 You can find it manually at: https://whatismyipaddress.com/")
            return False

    def install_dependencies(self):
        """Install backend and frontend dependencies"""
        print(f"\n{Colors.OKCYAN}📦 Installing dependencies...{Colors.ENDC}")
        
        # Install backend dependencies
        print(f"  🐍 Installing Python dependencies...")
        try:
            result = subprocess.run(
                ["pip", "install", "-r", "requirements.txt"],
                cwd=self.backend_dir,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print(f"    ✅ Backend dependencies installed")
            else:
                print(f"    ⚠️  Backend dependencies installation had warnings")
                if result.stderr:
                    print(f"    {result.stderr[:200]}...")
        except Exception as e:
            print(f"    ❌ Failed to install backend dependencies: {e}")
            
        # Install frontend dependencies
        print(f"  📦 Installing Node.js dependencies...")
        try:
            result = subprocess.run(
                ["npm", "install"],
                cwd=self.frontend_dir,
                capture_output=True,
                text=True,
                shell=True
            )
            if result.returncode == 0:
                print(f"    ✅ Frontend dependencies installed")
            else:
                print(f"    ⚠️  Frontend dependencies installation had warnings")
        except Exception as e:
            print(f"    ❌ Failed to install frontend dependencies: {e}")

    def start_backend(self):
        """Start the Flask backend server in a separate terminal"""
        print(f"\n{Colors.OKBLUE}🔧 Starting Backend Server in separate terminal...{Colors.ENDC}")
        try:
            # Create a batch file to run the Flask server
            batch_content = f"""@echo off
title NutriChef Backend Server
echo Starting NutriChef Backend Server...
echo Backend will be available at: http://localhost:5000
echo Backend will also be accessible externally on port 5000
echo.
cd /d "{self.backend_dir}"
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=1
flask run --host=0.0.0.0 --port=5000
echo.
echo Backend server stopped.
pause"""
            
            batch_file = self.root_dir / "start_backend.bat"
            with open(batch_file, 'w') as f:
                f.write(batch_content)
            
            # Start the backend in a new terminal window
            self.backend_process = subprocess.Popen(
                ["cmd", "/c", "start", "cmd", "/k", str(batch_file)],
                shell=True
            )
            
            # Wait a bit and check if the process started
            time.sleep(2)
            print(f"  ✅ Backend terminal opened!")
            print(f"  🌐 Backend URL: {Colors.UNDERLINE}http://localhost:5000{Colors.ENDC}")
            print(f"  📱 Check the new terminal window for Flask output")
            
            # Wait a bit more for Flask to start
            print(f"  ⏳ Waiting for Flask server to start...")
            time.sleep(8)
            
            return True
                
        except Exception as e:
            print(f"  ❌ Failed to start backend: {e}")
            return False

    def start_frontend(self):
        """Start the React frontend server in a separate terminal"""
        print(f"\n{Colors.OKBLUE}🎨 Starting Frontend Server in separate terminal...{Colors.ENDC}")
        try:
            # Create a batch file to run the frontend server
            batch_content = f"""@echo off
title NutriChef Frontend Server
echo Starting NutriChef Frontend Server...
echo Frontend will be available at: http://localhost:5173
echo Frontend will also be accessible externally on port 5173
echo.
cd /d "{self.frontend_dir}"
npm run dev
echo.
echo Frontend server stopped.
pause"""
            
            batch_file = self.root_dir / "start_frontend.bat"
            with open(batch_file, 'w') as f:
                f.write(batch_content)
            
            # Start the frontend in a new terminal window
            self.frontend_process = subprocess.Popen(
                ["cmd", "/c", "start", "cmd", "/k", str(batch_file)],
                shell=True
            )
            
            # Wait a bit and check if the process started
            time.sleep(2)
            print(f"  ✅ Frontend terminal opened!")
            print(f"  🌐 Frontend URL: {Colors.UNDERLINE}http://localhost:5173{Colors.ENDC}")
            print(f"  📱 Check the new terminal window for Vite output")
            
            # Wait a bit more for Vite to start
            print(f"  ⏳ Waiting for Vite server to start...")
            time.sleep(8)
            
            return True
                
        except Exception as e:
            print(f"  ❌ Failed to start frontend: {e}")
            return False

    def open_browser(self):
        """Open the application in the default browser"""
        print(f"\n{Colors.OKCYAN}🌐 Opening application in browser...{Colors.ENDC}")
        try:
            webbrowser.open("http://localhost:5173")
            print(f"  ✅ Browser opened!")
        except Exception as e:
            print(f"  ⚠️  Could not open browser automatically: {e}")
            print(f"  📝 Please manually open: http://localhost:5173")

    def show_status(self):
        """Show the current status of both servers"""
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}🚀 NutriChef Demo is now running!{Colors.ENDC}")
        print(f"""
{Colors.OKCYAN}📊 Service Status:{Colors.ENDC}
  🔧 Backend API:  🟢 Running in separate terminal
  🎨 Frontend:     🟢 Running in separate terminal

{Colors.OKCYAN}🌐 Access URLs:{Colors.ENDC}
  Frontend: {Colors.UNDERLINE}http://localhost:5173{Colors.ENDC}
  Backend:  {Colors.UNDERLINE}http://localhost:5000{Colors.ENDC}

{Colors.OKCYAN}📱 Terminal Windows:{Colors.ENDC}
  • Backend terminal: Shows Flask server logs and errors
  • Frontend terminal: Shows Vite development server output
  • Main terminal: This launcher and status information

{Colors.WARNING}💡 Tips:{Colors.ENDC}
  • Check the separate terminal windows for detailed logs
  • The frontend will automatically reload when you make changes
  • The backend runs in debug mode for development
  • Press {Colors.BOLD}Ctrl+C{Colors.ENDC} in this terminal to stop the launcher
  • Close the terminal windows manually to stop the servers

{Colors.OKGREEN}Enjoy exploring NutriChef! 🍽️✨{Colors.ENDC}
""")

    def shutdown(self):
        """Gracefully shutdown all services"""
        print(f"\n{Colors.WARNING}🛑 Shutting down NutriChef Demo...{Colors.ENDC}")
        
        print(f"  📱 Please close the terminal windows manually to stop the servers:")
        print(f"    • Backend terminal (Flask server)")
        print(f"    • Frontend terminal (Vite server)")
        
        # Close firewall ports
        self.close_firewall_ports()
        
        # Clean up batch files
        try:
            backend_batch = self.root_dir / "start_backend.bat"
            if backend_batch.exists():
                backend_batch.unlink()
                
            frontend_batch = self.root_dir / "start_frontend.bat"
            if frontend_batch.exists():
                frontend_batch.unlink()
                
            print(f"  🧹 Temporary files cleaned up")
        except Exception as e:
            print(f"  ⚠️  Could not clean up temporary files: {e}")
                
        self.is_running = False
        print(f"\n{Colors.OKGREEN}✅ NutriChef Demo launcher stopped!{Colors.ENDC}")
        print(f"{Colors.OKCYAN}Remember to close the server terminal windows to fully stop the services.{Colors.ENDC}")
        print(f"{Colors.OKCYAN}Thank you for using NutriChef! 🍽️{Colors.ENDC}")

    def signal_handler(self, signum, frame):
        """Handle Ctrl+C gracefully"""
        if self.is_running:
            self.shutdown()
        sys.exit(0)

    def wait_for_user_input(self):
        """Wait for user to press Enter or Ctrl+C"""
        print(f"\n{Colors.OKCYAN}Press Enter to check server status, or Ctrl+C to exit the launcher...{Colors.ENDC}")
        while self.is_running:
            try:
                input()
                # Check if servers are still accessible
                print(f"\n{Colors.OKCYAN}🔍 Checking server status...{Colors.ENDC}")
                try:
                    import urllib.request
                    urllib.request.urlopen("http://localhost:5000", timeout=3)
                    print(f"  ✅ Backend server is responding")
                except:
                    print(f"  ❌ Backend server is not responding")
                    
                try:
                    urllib.request.urlopen("http://localhost:5173", timeout=3)
                    print(f"  ✅ Frontend server is responding")
                except:
                    print(f"  ❌ Frontend server is not responding")
                    
                print(f"\n{Colors.OKCYAN}Press Enter to check again, or Ctrl+C to exit...{Colors.ENDC}")
            except KeyboardInterrupt:
                break

    def run(self):
        """Main entry point to run the demo"""
        # Set up signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        try:
            self.print_banner()
            
            if not self.check_requirements():
                return False
                
            # Ask user if they want to install dependencies
            install_deps = input(f"\n{Colors.OKCYAN}Install/update dependencies? (y/N): {Colors.ENDC}").lower().strip()
            if install_deps in ['y', 'yes']:
                self.install_dependencies()
            
            # Ask user if they want to enable external access
            print(f"\n{Colors.OKCYAN}Choose deployment type:{Colors.ENDC}")
            print(f"  1. Local network only (friends on same WiFi)")
            print(f"  2. Public internet access (requires router setup)")
            print(f"  3. VPS deployment (upload to server)")
            print(f"  4. No external access (localhost only)")
            
            access_choice = input(f"Enter choice (1/2/3/4): ").strip()
            
            if access_choice == "1":
                if not self.open_firewall_ports():
                    print(f"{Colors.WARNING}⚠️  Continuing without external access...{Colors.ENDC}")
                    print(f"{Colors.WARNING}💡 To enable external access, run this script as Administrator{Colors.ENDC}")
                    print(f"{Colors.WARNING}   Or manually open ports 5173 and 5000 in Windows Firewall{Colors.ENDC}")
            elif access_choice == "2":
                if not self.setup_public_access():
                    print(f"{Colors.WARNING}⚠️  Continuing with local network access only...{Colors.ENDC}")
            elif access_choice == "3":
                self.show_vps_deployment_guide()
                return True  # Exit after showing guide
            else:
                print(f"  ℹ️  External access disabled. Only local access (localhost) will work.")
            
            # Start backend
            if not self.start_backend():
                print(f"\n{Colors.FAIL}❌ Failed to start backend. Please check for errors above.{Colors.ENDC}")
                return False
                
            # Start frontend
            if not self.start_frontend():
                print(f"\n{Colors.FAIL}❌ Failed to start frontend. Please check for errors above.{Colors.ENDC}")
                self.shutdown()
                return False
            
            self.is_running = True
            
            # Open browser
            time.sleep(2)
            self.open_browser()
            
            # Show status
            self.show_status()
            
            # Wait for user input or Ctrl+C
            self.wait_for_user_input()
                
        except Exception as e:
            print(f"\n{Colors.FAIL}❌ Unexpected error: {e}{Colors.ENDC}")
        finally:
            if self.is_running:
                self.shutdown()

def main():
    """Main function"""
    demo = NutriChefDemo()
    demo.run()

if __name__ == "__main__":
    main()
