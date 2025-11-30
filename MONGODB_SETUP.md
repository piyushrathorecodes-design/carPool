# MongoDB Setup for Render Deployment

This document explains how to configure your MongoDB connection for deployment to Render.

## Current Configuration

The application is already set up to use environment variables for MongoDB configuration:

In `src/config/development.config.ts`:
```typescript
mongodb: {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_cab_pool',
  // ...
}
```

In `src/config/production.config.ts`:
```typescript
mongodb: {
  uri: process.env.MONGODB_URI_PROD || process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_cab_pool',
  // ...
}
```

## MongoDB Atlas Connection String

Your MongoDB Atlas connection string:
```
mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
```

## Render Deployment Configuration

When deploying to Render, you need to set the following environment variables:

1. Go to your Render dashboard
2. Navigate to your web service settings
3. In the "Environment Variables" section, add:

```
MONGODB_URI=mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
```

## Environment Variables for Production

For a complete production setup on Render, you should set these environment variables:

```
MONGODB_URI=mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Testing Locally

To test the MongoDB connection locally with your Atlas database:

1. Create a `.env` file in your backend directory:
```
MONGODB_URI=mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/tbs?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development
JWT_SECRET=your_local_jwt_secret
```

2. Run your backend:
```bash
cd backend
npm run dev
```

## Security Note

For production, make sure to:
1. Use a strong JWT secret
2. Restrict IP access in MongoDB Atlas to only Render's IP ranges
3. Enable MongoDB Atlas database user with appropriate permissions only

The application will automatically use the MongoDB URI from environment variables, so no code changes are needed.