# Troubleshooting Guide

This document provides solutions for common issues you might encounter when running the Campus Cab Pool application.

## 1. Google Maps API Issues

### 1.1 InvalidKey Warning
**Error Message**: `Google Maps JavaScript API warning: InvalidKey`

**Solution**:
1. Get a valid Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the required APIs:
   - Maps JavaScript API
   - Places API
3. Add your API key to `frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
4. Restart both frontend and backend servers

### 1.2 Cannot Read Properties of Undefined Error
**Error Message**: `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'gJ')`

**Solution**:
This error typically occurs when Google Maps fails to load properly. Follow these steps:
1. Verify your Google Maps API key is valid and properly configured
2. Check browser console for additional error messages
3. Ensure you have a stable internet connection
4. Clear browser cache and refresh the page

## 2. Environment Configuration

### 2.1 Missing Environment Variables
If you see warnings about missing API keys:

1. Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Update the values in both `.env` files with your actual keys

### 2.2 Geoapify API Key
The Geoapify API key is already configured in the backend `.env` file. If you want to use a different key:

1. Get your Geoapify API key from [geoapify.com](https://www.geoapify.com/)
2. Update `backend/.env`:
   ```
   GEOAPIFY_API_KEY=your_geoapify_api_key_here
   ```

## 3. Server Issues

### 3.1 Port Conflicts
If you see port conflict errors:

1. Change the frontend port in `frontend/vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       port: 5174, // Change to another available port
     }
   })
   ```

2. Change the backend port in `backend/.env`:
   ```
   PORT=5001
   ```

### 3.2 Database Connection Issues
If the backend fails to connect to MongoDB:

1. Ensure MongoDB is running locally or update the connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/campus_cab_pool
   ```

2. For MongoDB Atlas, use:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_cab_pool
   ```

## 4. Running the Application

### 4.1 Start Backend Server
```bash
cd backend
npm run dev
```

### 4.2 Start Frontend Server
```bash
cd frontend
npm run dev
```

### 4.3 Access the Application
Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

## 5. Testing the Pool Matching Feature

1. Register a new account
2. Log in to the application
3. Go to "Find Pool" page
4. Enter:
   - Pickup location (e.g., "Connaught Place, New Delhi")
   - Drop location (e.g., "South Extension, New Delhi")
   - Date and time
   - Gender preference (optional)
5. Click "Find Matches"
6. View matching results with distance and time similarities

## 6. Testing Location Tracking

1. Create or join a group
2. Go to the group detail page
3. Click "Start Tracking" in the Location Tracking section
4. Allow location access when prompted
5. View your location on the map and see routes to other group members

## 7. Common Development Issues

### 7.1 TypeScript Errors
If you encounter TypeScript errors:

1. Ensure all dependencies are installed:
   ```bash
   cd frontend && npm install
   cd backend && npm install
   ```

2. Check for type definition issues and install missing types:
   ```bash
   npm install --save-dev @types/node @types/express
   ```

### 7.2 CORS Issues
If you see CORS errors:

1. Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL:
   ```
   FRONTEND_URL=http://localhost:5173
   ```

2. Check the CORS configuration in `backend/src/config/development.config.ts`

## 8. Debugging Tips

### 8.1 Check Browser Console
Open browser developer tools (F12) and check:
- Console tab for errors
- Network tab for failed API requests
- Elements tab to inspect UI components

### 8.2 Check Server Logs
Monitor backend server logs for:
- Database connection status
- API request handling
- Error messages

### 8.3 Verify API Endpoints
Test API endpoints using tools like Postman or curl:
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 9. Need Help?

If you continue to experience issues:

1. Check the browser console and server logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure all required APIs are enabled for your Google Maps key
4. Confirm MongoDB is running and accessible
5. Review the setup documentation in `README.md`

For additional support, please provide:
- Exact error messages
- Browser console output
- Server logs
- Steps to reproduce the issue