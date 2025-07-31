#!/bin/bash

# CRM Backend Startup Script
echo "🚀 Starting CRM Backend API..."

# Ensure we're in the backend directory
cd "$(dirname "$0")"

# Add uv to PATH
export PATH="$HOME/.local/bin:$PATH"

# Activate virtual environment
source .venv/bin/activate

# Set PYTHONPATH so Python can find the app module
export PYTHONPATH=.

# Start the FastAPI server
echo "📚 API Documentation will be available at: http://localhost:8000/docs"
echo "🏥 Health Check available at: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app/main.py 