# Local Development Guide - Meridian Universal Dashboard

## Prerequisites

- **Python 3.9+** - Backend and ETL
- **Node.js 18+** - Frontend
- **Git** - Version control
- **Code Editor** - VS Code recommended

## Quick Start

### 1. First-Time Setup

Run the setup script:

```bash
./scripts/setup-local.sh
```

Or manually:

```bash
# Install backend dependencies
cd backend
pip install -r requirements/dev.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Run ETL to generate initial data
cd etl
python read_dashboard.py
python extract_usa_historical.py
cd ..
```

### 2. Start Development Servers

**Using Makefile (recommended):**

```bash
make dev          # Start both backend and frontend
make backend      # Start backend only
make frontend     # Start frontend only
```

**Using shell script:**

```bash
./scripts/dev-start.sh
```

**Manual start:**

```bash
# Terminal 1 - Backend
cd backend
python src/app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:5000
- **API Health Check**: http://127.0.0.1:5000/api/health

## Development Workflow

### Running ETL

Generate dashboard data from Excel files:

```bash
# Using Makefile
make etl                 # Run all ETL scripts
make etl-dashboard       # Dashboard data only
make etl-usa             # USA historical yields only

# Using shell script
./scripts/etl-run.sh

# Manual
cd etl
python read_dashboard.py
python extract_usa_historical.py
```

**Output files:**
- `storage/dashboard.json`
- `storage/usa_historical_yields.json`

### Project Structure

```
meridian-dashboard/
├── backend/                  # Flask backend
│   ├── src/
│   │   ├── api/             # API route modules
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   ├── config.py        # Configuration
│   │   └── app.py           # Flask app factory
│   ├── requirements/        # Dependencies by environment
│   └── startup.py           # Production entry point
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── config.ts        # Frontend config
│   └── public/              # Static assets
│
├── etl/                      # ETL scripts
│   ├── read_dashboard.py    # Main dashboard ETL
│   └── extract_usa_historical.py  # USA yields ETL
│
├── data/                     # Data files
│   ├── excel/               # Source Excel files
│   └── json/                # JSON databases (CRM)
│
├── storage/                  # Generated files (gitignored)
│   ├── dashboard.json
│   ├── usa_historical_yields.json
│   ├── generated-reports/
│   └── logs/
│
└── docs/                     # Documentation
```

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

**Data:**
- `GET /api/dashboard-data` - Dashboard JSON
- `GET /api/historical-yields/usa` - USA yields

**Capital Partners (Liquidity):**
- `GET /api/capital-partners` - List capital partners
- `POST /api/capital-partners` - Create capital partner
- `GET /api/teams` - List teams
- `GET /api/contacts-new` - List contacts

**Sponsors:**
- `GET /api/corporates` - List corporates
- `GET /api/sponsor-contacts` - List sponsor contacts

**Counsel:**
- `GET /api/legal-advisors` - List legal advisors
- `GET /api/counsel-contacts` - List counsel contacts

**Deals:**
- `GET /api/deals` - List deals
- `POST /api/deals/generate` - Generate deals from matches

See `docs/API_ENDPOINTS_REFERENCE.md` for full API documentation.

### Common Tasks

**Install dependencies:**
```bash
make install
```

**Clean build artifacts:**
```bash
make clean
```

**Format code (future):**
```bash
make format
```

**Run tests (future):**
```bash
make test
```

### Environment Variables

**Backend** (`backend/.env` - optional):
```bash
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATA_DIR=../data
STORAGE_DIR=../storage
```

**Frontend** (`frontend/.env.development`):
```bash
VITE_API_URL=http://127.0.0.1:5000
```

**Frontend** (`frontend/.env.production`):
```bash
VITE_API_URL=https://meridian-dashboard-backend.azurewebsites.net
```

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

**Module not found:**
```bash
cd backend
pip install -r requirements/dev.txt
```

**Database file not found:**
- Ensure `data/json/*.json` files exist
- Check paths in `backend/src/config.py`

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill process on port 5173
lsof -i :5173
kill -9 <PID>
```

**Dependencies out of date:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API calls failing:**
- Verify backend is running on http://127.0.0.1:5000
- Check CORS settings in `backend/src/config.py`
- Verify `VITE_API_URL` in frontend config

### ETL Issues

**Excel file not found:**
- Verify `data/excel/Markets Dashboard (Macro Enabled) (version 3).xlsm` exists
- Check path in ETL scripts

**Permission denied:**
- Close Excel if it's open
- Check file permissions

**Output file not created:**
- Verify `storage/` directory exists
- Check write permissions

## Development Tips

### Hot Reload

- **Backend**: Flask auto-reloads when you save Python files
- **Frontend**: Vite auto-reloads when you save React/TS files

### Debugging

**Backend:**
```python
# Add breakpoints in VS Code
# Or use print statements
print(f"Debug: {variable}")
```

**Frontend:**
```typescript
// Use browser DevTools
console.log('Debug:', variable);
```

### Testing API Endpoints

**Using curl:**
```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/dashboard-data
```

**Using Postman/Insomnia:**
- Import API endpoints
- Set base URL to `http://127.0.0.1:5000`

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

## Docker (Optional)

For containerized development:

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# Run ETL
docker-compose --profile etl run etl
```

See `infrastructure/docker/docker-compose.yml` for configuration.

## Next Steps

- Read `CLAUDE.md` for project overview
- Review `docs/API_ENDPOINTS_REFERENCE.md` for API details
- Check `docs/architecture/` for system design
- See `docs/deployment/` for deployment guides

## Need Help?

- Check existing documentation in `docs/`
- Review code comments
- Ask team members
