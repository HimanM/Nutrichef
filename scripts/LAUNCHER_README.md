# NutriChef Local Demo Launcher

A beautiful CLI interface for launching the NutriChef application locally for demonstration purposes.

## 🚀 Quick Start

### Option 1: Using Python Script (Recommended)
```bash
python main.py
```

### Option 2: Using Batch File (Windows)
```cmd
start_demo.bat
```

## 🎯 What it does

The demo launcher automatically:

1. **🔍 Checks Requirements**
   - Verifies Python, Node.js, and npm are installed
   - Checks for required project files and directories

2. **📦 Installs Dependencies** (optional)
   - Backend: `pip install -r requirements.txt`
   - Frontend: `npm install`

3. **🔧 Starts Backend Server**
   - Runs Flask development server on `http://localhost:5000`
   - Uses proper Flask environment variables
   - Enables debug mode for development

4. **🎨 Starts Frontend Server**
   - Runs Vite development server on `http://localhost:5173`
   - Enables hot reload for development

5. **🌐 Opens Browser**
   - Automatically opens the application in your default browser
   - Points to the frontend URL

6. **📊 Monitors Services**
   - Continuously monitors both servers
   - Provides status updates
   - Handles graceful shutdown

## 🎨 Features

- **Beautiful CLI Interface**: Colorful output with emojis and clear status messages
- **Graceful Shutdown**: Press `Ctrl+C` to stop all services cleanly
- **Health Monitoring**: Automatically detects if services stop unexpectedly
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Error Handling**: Comprehensive error checking and user-friendly messages

## 📋 Prerequisites

Make sure you have the following installed:

- **Python 3.7+** with pip
- **Node.js 16+** with npm
- **Flask** and other backend dependencies
- **Vite** and other frontend dependencies

## 🔧 Configuration

The launcher uses these default settings:

- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`
- **Environment**: Development mode with debug enabled

## 🛑 Stopping the Demo

To stop all services:

1. Press `Ctrl+C` in the terminal
2. Wait for graceful shutdown confirmation
3. All processes will be terminated cleanly

## 🔍 Troubleshooting

### Common Issues

**"Python not found"**
- Ensure Python is installed and added to PATH
- Try `python3` instead of `python` on some systems

**"Node.js not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Ensure npm is included in the installation

**"Backend failed to start"**
- Check if port 5000 is already in use
- Verify all Python dependencies are installed
- Check for any error messages in the output

**"Frontend failed to start"**
- Check if port 5173 is already in use
- Verify all npm dependencies are installed
- Try running `npm install` manually in the frontend directory

### Getting Help

If you encounter issues:

1. Check the terminal output for specific error messages
2. Ensure all dependencies are properly installed
3. Verify that both backend and frontend directories exist
4. Make sure you're running the script from the root project directory

## 🎯 Development

The launcher is designed for local development and demonstration. For production deployment, use proper deployment tools and configurations.

## 📝 Notes

- The backend runs in debug mode for development convenience
- The frontend uses Vite's development server with hot reload
- Both services will automatically restart on file changes
- The browser will open automatically to the frontend URL

Enjoy exploring NutriChef! 🍽️✨
