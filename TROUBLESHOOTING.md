# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to create account" / 404 Errors

**Problem**: When trying to create an account, you get a "Failed to load resource: the server responded with a status of 404 (Not Found)" error.

**Solution**:
1. Make sure the backend server is running:
   ```bash
   cd backend
   npm run dev
   ```
2. Check that you can access `http://localhost:5000` in your browser
3. Ensure the frontend is also running:
   ```bash
   cd frontend
   npm run dev
   ```
4. Verify that the proxy configuration in `vite.config.ts` is correct:
   ```javascript
   server: {
     port: 5173,
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         secure: false,
       }
     }
   }
   ```

### 2. MongoDB Connection Errors

**Problem**: The backend fails to start with MongoDB connection errors.

**Solution**:
1. Ensure MongoDB is installed and running on your system
2. Check your `.env` file in the backend directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/campus_cab_pool
   ```
3. Verify that MongoDB is accessible:
   ```bash
   mongo mongodb://localhost:27017
   ```

### 3. CORS Errors

**Problem**: Browser shows CORS errors when making API requests.

**Solution**:
1. Check that the CORS configuration in `backend/src/server.ts` is correct:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
   }));
   ```
2. Ensure both frontend and backend are running on the expected ports

### 4. JWT Secret Not Set

**Problem**: Authentication fails with "invalid token" errors.

**Solution**:
1. Check your `.env` file in the backend directory:
   ```
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```
2. Make sure to set a strong secret key for production use

### 5. Port Already in Use

**Problem**: Server fails to start with "port already in use" error.

**Solution**:
1. Change the PORT value in your `.env` file:
   ```
   PORT=5001
   ```
2. Or stop the process using the port:
   ```bash
   # On Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # On macOS/Linux
   lsof -i :5000
   kill -9 <PID>
   ```

### 6. Dependencies Not Installing

**Problem**: `npm install` fails with various errors.

**Solution**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules and package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Use a different npm registry if needed:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

## Debugging Steps

### 1. Check Server Logs
Always check the terminal/console output for error messages from both frontend and backend servers.

### 2. Browser Developer Tools
Use the Network tab in browser developer tools to inspect API requests and responses.

### 3. Test API Endpoints Directly
Use tools like Postman or curl to test API endpoints directly:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"1234567890"}'
```

### 4. Verify Environment Variables
Ensure all required environment variables are set in both `.env` files:
- Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT`, etc.
- Frontend: `VITE_API_BASE_URL`

## Need More Help?

If you're still experiencing issues:

1. Check the console logs for specific error messages
2. Verify all installation steps were completed
3. Ensure all required services (MongoDB, Node.js) are running
4. Review the setup instructions in README.md
5. Create an issue on the project repository if applicable

For immediate assistance, please provide:
- The exact error message
- Steps you've taken so far
- Your operating system
- Node.js and npm versions (`node --version` and `npm --version`)