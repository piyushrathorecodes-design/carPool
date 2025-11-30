@echo off
echo Starting Campus Cab Pool Development Servers...

REM Start MongoDB (assuming it's installed as a service)
echo Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service not found or failed to start.
    echo Please ensure MongoDB is installed and running.
    echo You can start MongoDB manually with: mongod
    echo.
)

REM Start backend server in a new command prompt
echo Starting backend server...
start "Backend Server" /D "backend" npm run dev

REM Start frontend server in a new command prompt
echo Starting frontend server...
start "Frontend Server" /D "frontend" npm run dev

echo.
echo Development servers are starting...
echo.
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:5000
echo.
echo Press any key to exit this script (servers will continue running)...
pause >nul