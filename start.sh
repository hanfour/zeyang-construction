#!/bin/bash

echo "🚀 Starting ZeYang Development Environment..."

# MySQL credentials
MYSQL_USER="root"
MYSQL_PASS="123456"

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null
then
    echo "❌ MySQL is not running. Please start MySQL first."
    echo "   On macOS: brew services start mysql"
    echo "   On Linux: sudo systemctl start mysql"
    exit 1
fi

echo "✅ MySQL is running"

# Check if database exists
if ! mysql -u $MYSQL_USER -p$MYSQL_PASS -e "USE ZeYang" 2>/dev/null; then
    echo "📦 Creating database..."
    mysql -u $MYSQL_USER -p$MYSQL_PASS < database/init.sql
    echo "✅ Database created"
else
    echo "✅ Database exists"
fi

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Install root dependencies for concurrently
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Start the application
echo "🎯 Starting backend and frontend..."
echo "   Backend: http://localhost:5001"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:5001/api-docs"
echo ""
echo "   Default admin login:"
echo "   Username: admin"
echo "   Password: admin123456"
echo ""
echo "Press Ctrl+C to stop the servers."

npm run dev