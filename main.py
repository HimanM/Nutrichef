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
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.backend_process = None
        self.frontend_process = None
        self.is_running = False
        
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
