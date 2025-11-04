# Meridian Universal Dashboard - Makefile
# Common development commands

.PHONY: help install backend frontend dev etl-dashboard etl-usa etl clean

help:
	@echo "Meridian Universal Dashboard - Available Commands"
	@echo ""
	@echo "  make install        - Install all dependencies (backend + frontend)"
	@echo "  make backend        - Start backend development server"
	@echo "  make frontend       - Start frontend development server"
	@echo "  make dev            - Start both backend and frontend"
	@echo "  make etl-dashboard  - Run dashboard ETL (generate dashboard.json)"
	@echo "  make etl-usa        - Run USA historical yields ETL"
	@echo "  make etl            - Run both ETL scripts"
	@echo "  make clean          - Clean build artifacts and caches"
	@echo ""

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements/dev.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

backend:
	@echo "Starting backend server on http://127.0.0.1:5000"
	cd backend && python src/app.py

frontend:
	@echo "Starting frontend server on http://localhost:5173"
	cd frontend && npm run dev

dev:
	@echo "Starting both backend and frontend servers..."
	@echo "Backend: http://127.0.0.1:5000"
	@echo "Frontend: http://localhost:5173"
	@make -j2 backend frontend

etl-dashboard:
	@echo "Running dashboard ETL..."
	cd etl && python read_dashboard.py

etl-usa:
	@echo "Running USA historical yields ETL..."
	cd etl && python extract_usa_historical.py

etl: etl-dashboard etl-usa
	@echo "All ETL scripts completed!"

clean:
	@echo "Cleaning build artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	cd frontend && rm -rf dist node_modules/.vite 2>/dev/null || true
	@echo "Clean complete!"
