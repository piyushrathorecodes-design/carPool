# Complete Deployment Guide for Ride Pool Application

This guide provides step-by-step instructions for deploying both the frontend and backend of the Ride Pool application to production environments.

## Overview

The application consists of:
1. **Frontend**: React + TypeScript + Vite application
2. **Backend**: Node.js + Express + MongoDB application

## Prerequisites

1. Node.js >= 18.0.0
2. npm >= 9.0.0
3. MongoDB database (local or cloud)
4. Accounts for deployment platforms (Render for backend, Vercel for frontend)

## Backend Deployment (Deploy First)

### 1. Environment Configuration

Create a [.env] file in the backend directory with the following variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_secure_jwt_secret_here
FRONTEND_URL=https://your-frontend-domain.com
GEOAPIFY_API_KEY=86ddba99f19b4a509f47b4c94c073f80
```

### 2. Build the Backend

```bash
cd backend
npm install
npm run build
```

### 3. Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following configuration:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all variables from your .env file

### 4. Alternative Manual Deployment

```bash
cd backend
npm install
npm run build
npm start
```

## Frontend Deployment

### 1. Environment Configuration

Create a [.env] file in the frontend directory:

```
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_ENV=production
VITE_ENABLE_LOCATION_TRACKING=true
VITE_ENABLE_REALTIME_CHAT=true
VITE_ENABLE_FARE_CALCULATOR=true
```

### 2. Update Vite Configuration

Modify [vite.config.ts] to include base path configuration:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Change this if deploying to a subdirectory
  
  plugins: [react(), tailwindcss()],
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/geoapify': {
        target: 'https://api.geoapify.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/geoapify/, ''),
      }
    }
  }
})
```

### 3. Build the Frontend

```bash
cd frontend
npm install
npm run build
```

### 4. Deploy to Vercel

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the following configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add all variables from your .env file

### 5. Alternative Manual Deployment

After building, serve the [dist] directory using any static file server:

```bash
cd frontend
npm install -g serve
serve -s dist
```

## Fixes for Previously Identified Issues

### 1. Navigation Buttons on Landing Page

Fixed in [App.tsx]:
- Replaced HTML anchor tags with React Router Link components
- Added proper import for Link from 'react-router-dom'

### 2. TypeScript Compilation Errors

Fixed all TS6133 errors:
- Removed unused imports ([Dashboard], [Home])
- Removed unused variables ([mapLoaded], [poolRequestId], [profileResponse])
- Removed unused parameters ([e] in onError handler)

### 3. CORS Configuration

Backend CORS is configured to accept requests from the frontend domain:
- Development: [http://localhost:5173]
- Production: Configurable via [FRONTEND_URL] environment variable

## Testing Deployment

### 1. Verify Backend Health

Visit your backend URL:
```
https://your-backend-domain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running healthy",
  "timestamp": "...",
  "environment": "production",
  "database": "connected",
  "uptime": ...
}
```

### 2. Test Frontend Navigation

1. Visit your frontend URL
2. Click "Get Started" button - should navigate to [/login]
3. Click "Sign Up" button - should navigate to [/register]
4. Test other navigation links throughout the application

### 3. API Connectivity

1. Try to log in with valid credentials
2. Check browser developer tools Network tab for successful API calls
3. Verify no CORS errors in the console

## Common Deployment Issues and Solutions

### 1. Navigation Not Working

**Issue**: Buttons don't navigate to the correct pages
**Solution**: Ensure using [Link] components instead of [a] tags in React Router applications

### 2. Blank Page After Deployment

**Issue**: White screen with no content
**Solution**: 
- Check browser console for errors
- Verify [base] path in [vite.config.ts]
- Ensure all environment variables are set correctly

### 3. API Calls Failing

**Issue**: 404 or CORS errors for API requests
**Solution**:
- Verify backend URL in [VITE_API_BASE_URL]
- Check CORS configuration in backend
- Ensure backend is running and accessible

### 4. Environment Variables Not Loaded

**Issue**: Application not using environment variables
**Solution**:
- Prefix all frontend environment variables with [VITE_]
- Restart development server after changing environment variables
- Verify environment variables are set in deployment platform

## Post-Deployment Checklist

- [ ] Backend health check endpoint returns success
- [ ] Frontend loads without errors
- [ ] Navigation buttons work correctly
- [ ] User can register and login
- [ ] API calls reach backend successfully
- [ ] Maps and external services work
- [ ] Real-time features (chat, notifications) function
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## Maintenance

### Monitoring

1. Set up logging for both frontend and backend
2. Monitor error rates and response times
3. Set up alerts for critical failures

### Updates

1. Test changes in development environment first
2. Use version control for tracking changes
3. Deploy updates during low-traffic periods
4. Maintain backup of working versions

This guide should help you successfully deploy the Ride Pool application with all functionality working correctly.