# Production Deployment Guide

This guide will help you deploy the Campus Cab Pool application to a production environment.

## Prerequisites

1. Node.js (v16 or higher)
2. MongoDB (v4.4 or higher)
3. npm or yarn package manager
4. A server or cloud platform (AWS, Google Cloud, Azure, etc.)

## Backend Deployment

### 1. Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/campus_cab_pool

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Build the Application

```bash
npm run build
```

### 4. Start the Server

```bash
npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/server.js --name campus-cab-pool
```

## Frontend Deployment

### 1. Environment Setup

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Base URL
VITE_API_BASE_URL=https://your-api-domain.com

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Environment
VITE_APP_ENV=production
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Build the Application

```bash
npm run build
```

### 4. Deploy the Build

The build output will be in the `dist` folder. Deploy this folder to your web server or CDN.

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Configure database access and network access
4. Update your `MONGODB_URI_PROD` in the backend `.env` file

### Database Indexes

Make sure the following indexes are created in your MongoDB database:

```javascript
// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 }, { unique: true })
db.users.createIndex({ "frequentRoute.home.coordinates": "2dsphere" })
db.users.createIndex({ "frequentRoute.college.coordinates": "2dsphere" })
db.users.createIndex({ "liveLocation.coordinates": "2dsphere" })

// PoolRequests collection indexes
db.poolrequests.createIndex({ "pickupLocation.coordinates": "2dsphere" })
db.poolrequests.createIndex({ "dropLocation.coordinates": "2dsphere" })
db.poolrequests.createIndex({ "createdBy": 1 })
db.poolrequests.createIndex({ "status": 1 })

// Groups collection indexes
db.groups.createIndex({ "members": 1 })
db.groups.createIndex({ "status": 1 })

// ChatMessages collection indexes
db.chatmessages.createIndex({ "groupId": 1 })
db.chatmessages.createIndex({ "timestamp": 1 })
```

## Security Considerations

### 1. HTTPS
Always use HTTPS in production. You can get free SSL certificates from Let's Encrypt.

### 2. Environment Variables
Never commit `.env` files to version control. Use your deployment platform's environment variable management.

### 3. CORS Configuration
Make sure your `FRONTEND_URL` is properly configured to only allow your domain.

### 4. Rate Limiting
The application includes basic rate limiting. For production, consider using a more robust solution like Cloudflare or AWS WAF.

## Monitoring and Logging

### 1. Application Monitoring
Use tools like:
- New Relic
- Datadog
- Prometheus + Grafana

### 2. Log Management
Consider using:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- AWS CloudWatch

### 3. Error Tracking
- Sentry
- Rollbar
- Bugsnag

## Backup and Recovery

### 1. Database Backups
- Enable automated backups in MongoDB Atlas
- Regularly export critical data
- Test restore procedures

### 2. Code Backups
- Use version control (Git)
- Regular backups of the production environment
- Disaster recovery plan

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancers
- Implement caching (Redis)
- Use CDN for static assets

### 2. Database Scaling
- Use MongoDB sharding for large datasets
- Implement read replicas
- Optimize queries and indexes

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` configuration
   - Verify the frontend is making requests to the correct API URL

2. **Database Connection Issues**
   - Verify `MONGODB_URI_PROD` is correct
   - Check network connectivity
   - Ensure database user has proper permissions

3. **Geolocation Not Working**
   - Verify `GOOGLE_MAPS_API_KEY` is set and valid
   - Check Google Maps API billing is enabled

4. **Authentication Issues**
   - Verify `JWT_SECRET` is consistent across deployments
   - Check token expiration settings

### Support

For issues not covered in this guide, please:
1. Check the application logs
2. Review error messages
3. Consult the API documentation
4. Contact the development team