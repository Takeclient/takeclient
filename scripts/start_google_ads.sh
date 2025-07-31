#!/bin/bash

# Google Ads AI System - Quick Start Script
echo "🚀 Starting Google Ads AI System..."

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    if [ -z "$GOOGLE_ADS_CLIENT_ID" ]; then
        echo "❌ GOOGLE_ADS_CLIENT_ID not set"
        exit 1
    fi
    
    if [ -z "$GOOGLE_ADS_CLIENT_SECRET" ]; then
        echo "❌ GOOGLE_ADS_CLIENT_SECRET not set"
        exit 1
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "❌ OPENAI_API_KEY not set"
        exit 1
    fi
    
    echo "✅ Environment variables configured"
}

# Start backend server
start_backend() {
    echo "🔧 Starting backend server..."
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "venv" ]; then
        echo "📦 Creating virtual environment..."
        python -m venv venv
        source venv/bin/activate
        pip install -e .
        pip install google-ads google-auth google-auth-oauthlib google-auth-httplib2 protobuf grpcio
    else
        source venv/bin/activate
    fi
    
    # Start FastAPI server
    echo "🚀 Starting FastAPI server on port 8000..."
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    cd ..
}

# Start frontend server
start_frontend() {
    echo "🎨 Starting frontend server..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing npm dependencies..."
        npm install
    fi
    
    # Start Next.js server
    echo "🚀 Starting Next.js server on port 3000..."
    npm run dev &
    FRONTEND_PID=$!
}

# Wait for servers to start
wait_for_servers() {
    echo "⏳ Waiting for servers to start..."
    sleep 5
    
    # Check backend health
    if curl -s http://localhost:8000/docs > /dev/null; then
        echo "✅ Backend server is running"
    else
        echo "❌ Backend server failed to start"
        exit 1
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend server is running"
    else
        echo "❌ Frontend server failed to start"
        exit 1
    fi
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 Google Ads AI System is running!"
    echo ""
    echo "📊 Dashboard: http://localhost:3000/dashboard/ads/google"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo "🔧 Backend: http://localhost:8000"
    echo ""
    echo "🔑 Next Steps:"
    echo "1. Open the dashboard in your browser"
    echo "2. Click 'Connect Google Ads Account'"
    echo "3. Complete OAuth authentication"
    echo "4. Select your Google Ads customer account"
    echo "5. Start managing campaigns with AI assistance!"
    echo ""
    echo "📖 For detailed setup instructions, see GOOGLE_ADS_SETUP.md"
    echo ""
    echo "Press Ctrl+C to stop all servers"
}

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    check_env_vars
    start_backend
    start_frontend
    wait_for_servers
    show_access_info
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main 