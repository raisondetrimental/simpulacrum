#!/bin/bash
# Start both backend and frontend development servers

echo "🚀 Starting Meridian Universal Dashboard Development Servers"
echo ""

# Check if backend is already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Backend already running on port 5000"
else
    echo "Starting backend server on http://127.0.0.1:5000"
    cd backend && python src/app.py &
    BACKEND_PID=$!
fi

# Check if frontend is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Frontend already running on port 5173"
else
    echo "Starting frontend server on http://localhost:5173"
    cd frontend && npm run dev &
    FRONTEND_PID=$!
fi

echo ""
echo "✅ Development servers started!"
echo "   Backend:  http://127.0.0.1:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
