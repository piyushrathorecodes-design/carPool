# Running the Campus Cab Pool Application

## Prerequisites

Before running the application, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

### Automated Setup (Recommended)

#### For Unix/Linux/macOS:
```bash
./setup.sh
```

#### For Windows:
```cmd
setup.bat
```

### Manual Setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create .env file with the following content:
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus_cab_pool
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   
   npm run build
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system:
```bash
mongod
```

### Start Backend Server
```bash
cd backend
npm run dev
```

The backend server will start on port 5000 by default.

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend development server will start on port 5173 by default.

## Accessing the Application

Once both servers are running, open your browser and navigate to:
```
http://localhost:5173
```

## Development Workflow

### Backend Development
- Source code is in `backend/src/`
- Changes to TypeScript files will be automatically compiled
- The server will restart automatically when changes are detected

### Frontend Development
- Source code is in `frontend/src/`
- Changes will be hot-reloaded in the browser
- Vite provides fast refresh for React components

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be created in the `dist/` directory.

## Environment Variables

### Backend (.env)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRE`: JWT token expiration time
- `FRONTEND_URL`: Frontend application URL

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the PORT value in `.env` file
   - Or stop the process using the port

2. **MongoDB connection failed:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in `.env` file
   - Verify MongoDB installation

3. **JWT secret not set:**
   - Update JWT_SECRET in `.env` file with a strong secret key

4. **CORS errors:**
   - Check FRONTEND_URL in `.env` file
   - Ensure it matches your frontend URL

### Getting Help

If you encounter any issues not covered here:
1. Check the console logs for error messages
2. Verify all environment variables are correctly set
3. Ensure all dependencies are properly installed
4. Check that MongoDB is running and accessible

For additional support, refer to the documentation in [README.md](README.md) or [SUMMARY.md](SUMMARY.md).