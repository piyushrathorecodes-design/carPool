#!/bin/bash

echo "Setting up Campus Cab Pool application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js (v14 or higher) and try again."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null
then
    echo "MongoDB is not installed. Please install MongoDB and try again."
    exit 1
fi

echo "Setting up backend..."
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_cab_pool
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
EOF
    echo "Created .env file with default configuration."
    echo "Please update the JWT_SECRET with a strong secret key for production use."
fi

echo "Building backend..."
npm run build

echo "Setting up frontend..."
cd ../frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

echo ""
echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start MongoDB: mongod"
echo "2. In backend directory: npm run dev"
echo "3. In frontend directory: npm run dev"
echo ""
echo "The application will be available at http://localhost:5173"