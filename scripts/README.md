# NutriChef Scripts and Utilities

This directory contains scripts and utilities for running and managing NutriChef locally.

## 📋 Available Scripts

### Demo Launcher
- **[main.py](./main.py)** - Python-based demo launcher with beautiful CLI interface
- **[LAUNCHER_README.md](./LAUNCHER_README.md)** - Detailed documentation for the demo launcher

### Windows Batch Files
- **[start_demo.bat](./start_demo.bat)** - Simple Windows batch file to start the demo
- **[start_backend.bat](./start_backend.bat)** - Start only the backend server
- **[start_frontend.bat](./start_frontend.bat)** - Start only the frontend server
- **[run_as_admin.bat](./run_as_admin.bat)** - Run scripts with administrator privileges

## 🚀 Quick Start

### Using Python Script (Recommended)
The Python script provides the best experience with colored output, error checking, and automatic browser opening:

```bash
python scripts/main.py
```

### Using Batch Files (Windows)
For Windows users who prefer batch files:

```cmd
scripts\start_demo.bat
```

## ✨ Features

The demo launcher automatically:
- ✅ Checks system requirements (Python, Node.js, npm)
- 📦 Installs dependencies if needed
- 🔧 Starts backend and frontend servers
- 🌐 Opens the application in your browser
- 📊 Monitors both services
- 🛑 Provides graceful shutdown with Ctrl+C

## 🔧 Requirements

- Python 3.9+ 
- Node.js and npm
- All project dependencies (automatically installed by the launcher)

## 📞 Support

For detailed usage instructions, see [LAUNCHER_README.md](./LAUNCHER_README.md) or refer to the main project documentation.
