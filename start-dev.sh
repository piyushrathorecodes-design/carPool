#!/bin/bash

echo "Starting Campus Cab Pool Development Servers..."

# Start MongoDB (if installed as a service)
echo "Starting MongoDB..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start mongod
elif command -v service &> /dev/null; then
    sudo service mongod start
else
    echo "Please ensure MongoDB is installed and running."
    echo "You can start MongoDB manually with: mongod"
    echo ""
fi

# Function to start a server in the background
start_server() {
    local dir=$1
    local name=$2
    cd $dir
    echo "Starting $name server..."
    npm run dev > ../${name}.log 2>&1 &
    echo "$name server started with PID $!"
    cd ..
}

# Start backend server
start_server "backend" "Backend"

# Start frontend server
start_server "frontend" "Frontend"

echo ""
echo "Development servers are starting..."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:5000"
echo ""
echo "Logs are being written to backend.log and frontend.log"
echo ""
echo "To stop the servers, use: pkill -f 'npm run dev'"