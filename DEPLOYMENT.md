# Deployment Guide for Ride Pool Application

This guide provides simple steps to deploy your Ride Pool application to Render (backend) and Vercel (frontend) without creating any configuration files.

## Prerequisites

1. GitHub account
2. Render account (render.com)
3. Vercel account (vercel.com)
4. MongoDB Atlas account with database created

## Backend Deployment on Render

### Step 1: Prepare Your Code

Ensure your backend code is in a GitHub repository. The structure should look like:
```
backend/
├── src/
├── package.json
├── tsconfig.json
└── .env (for local testing only, don't commit to GitHub)
```

### Step 2: Set Up Environment Variables

When deploying to Render, you'll need to configure these environment variables:

```
MONGODB_URI=mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=your_secure_random_jwt_secret_here
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
GEOAPIFY_API_KEY=your_geoapify_api_key
```

### Step 3: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `ride-pool-backend`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add the environment variables from Step 2
6. Click "Create Web Service"

### Step 4: Note Your Backend URL

After deployment, Render will provide a URL like:
```
https://ride-pool-backend.onrender.com
```

Save this URL for frontend configuration.

## Frontend Deployment on Vercel

### Step 1: Update API URLs

Before deploying, update your frontend code to use the Render backend URL instead of localhost:

In your frontend codebase, find and replace:
- `http://localhost:5000` → `https://your-render-backend.onrender.com`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework: `Create React App`
   - Root directory: `/frontend` (if your frontend is in a subdirectory)
5. Click "Deploy"

### Step 3: Set Environment Variables (if needed)

For most cases, no environment variables are needed for the frontend since you've hardcoded the API URLs.

## Post-Deployment Configuration

### Update CORS Settings (if needed)

If you encounter CORS issues, update your backend CORS configuration in `src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### Test Your Deployment

1. Visit your Vercel frontend URL
2. Try logging in to verify the connection to your Render backend
3. Check that all features work (map, chat, groups, etc.)

## Environment Variables Summary

### Render Backend Variables:
```
MONGODB_URI=mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=your_secure_random_jwt_secret_here
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
GEOAPIFY_API_KEY=your_geoapify_api_key
```

### Vercel Frontend:
No special environment variables needed if you've updated the API URLs in code.

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**:
   - Check that your MongoDB URI is correct
   - Ensure MongoDB Atlas network access allows Render IPs
   - Verify database user credentials

2. **CORS Errors**:
   - Update the FRONTEND_URL environment variable
   - Check CORS configuration in backend

3. **API Calls Failing**:
   - Verify all localhost URLs have been replaced with Render URLs
   - Check browser console for specific error messages

4. **Application Not Starting**:
   - Check Render logs for error messages
   - Ensure all required environment variables are set

### Checking Render Logs:

1. Go to your Render dashboard
2. Click on your web service
3. Click "Logs" tab to view real-time logs

## Important Notes

- Render free tier may have cold starts (first request is slow)
- Vercel deployments are automatically available at `https://your-project.vercel.app`
- Render deployments are available at `https://your-app.onrender.com`
- Make sure your MongoDB database is accessible from Render (most cloud MongoDB services work fine)

## Updating Deployments

To update your deployments after making code changes:

1. **Backend (Render)**: Push changes to GitHub - Render will auto-deploy
2. **Frontend (Vercel)**: Push changes to GitHub - Vercel will auto-deploy

Monitor the deployment process in each platform's dashboard to ensure successful deployment.