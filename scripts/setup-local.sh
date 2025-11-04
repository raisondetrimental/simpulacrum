#!/bin/bash
# First-time local development setup

echo "🔧 Meridian Universal Dashboard - Local Setup"
echo ""

# Check Python version
echo "Checking Python version..."
python --version
if [ $? -ne 0 ]; then
    echo "❌ Python not found. Please install Python 3.9+"
    exit 1
fi
echo ""

# Check Node.js version
echo "Checking Node.js version..."
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements/dev.txt
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
cd ..
echo ""

# Create storage directory if it doesn't exist
echo "📁 Setting up storage directory..."
mkdir -p storage/generated-reports storage/logs storage/uploads
echo "✅ Storage directory ready"
echo ""

# Run ETL to generate initial data
echo "📊 Running ETL to generate initial data..."
cd etl
python read_dashboard.py
python extract_usa_historical.py
cd ..
echo "✅ Initial data generated"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  make dev          - Start both backend and frontend"
echo "  make backend      - Start backend only"
echo "  make frontend     - Start frontend only"
echo ""
echo "Documentation:"
echo "  docs/development/LOCAL_DEVELOPMENT.md"
