@echo off
title NutriChef Backend Server
echo Starting NutriChef Backend Server...
echo Backend will be available at: http://localhost:5000
echo.
cd /d "D:\nutrichef\backend"
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=1
flask run --host=0.0.0.0 --port=5000
echo.
echo Backend server stopped.
pause