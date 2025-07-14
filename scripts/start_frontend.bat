@echo off
title NutriChef Frontend Server
echo Starting NutriChef Frontend Server...
echo Frontend will be available at: http://localhost:5173
echo Frontend will also be accessible externally on port 5173
echo.
cd /d "%~dp0..\frontend"
npm run dev
echo.
echo Frontend server stopped.
pause