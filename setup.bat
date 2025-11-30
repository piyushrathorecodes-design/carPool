@echo off
echo Setting up Campus Cab Pool application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js (v14 or higher) and try again.
    pause
    exit /b 1
)

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed. Please install MongoDB and try again.
    pause
    exit /b 1
)

echo Setting up backend...
cd backend

REM Install backend dependencies
echo Installing backend dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    echo NODE_ENV=development > .env
    echo PORT=5000 >> .env
    echo MONGODB_URI=mongodb://localhost:27017/campus_cab_pool >> .env
    echo JWT_SECRET=your_jwt_secret_key_here >> .env
    echo JWT_EXPIRE=7d >> .env
    echo FRONTEND_URL=http://localhost:5173 >> .env
    echo Created .env file with default configuration.
    echo Please update the JWT_SECRET with a strong secret key for production use.
)

echo Building backend...
npm run build

echo Setting up frontend...
cd ..\frontend

REM Install frontend dependencies
echo Installing frontend dependencies...
npm install

echo.
echo Setup complete!
echo.
echo To run the application:
echo 1. Start MongoDB: mongod
echo 2. In backend directory: npm run dev
echo 3. In frontend directory: npm run dev
echo.
echo The application will be available at http://localhost:5173
echo.
pause