# Meridian Dashboard - Backend API

Flask-based REST API for the Meridian Universal Dashboard, providing endpoints for market data, CRM management, investment matching, and deal pipeline tracking.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── api/              # Route blueprints
│   │   ├── auth.py       # Authentication routes
│   │   ├── capital_partners.py  # Liquidity module (partners, teams, contacts)
│   │   ├── counsel.py    # Counsel module (legal advisors, counsel contacts)
│   │   ├── deals.py      # Deal pipeline routes
│   │   ├── excel.py      # Excel data & legacy routes
│   │   ├── investment.py # Investment strategies & matching
│   │   └── sponsors.py   # Sponsors module (corporates, sponsor contacts)
│   ├── models/           # Data models
│   │   └── user.py       # User authentication model
│   ├── services/         # Business logic
│   │   ├── deal_pipeline.py       # Deal management
│   │   ├── investment_matching.py # Investment matching engine
│   │   └── investment_profiles.py # Profile building
│   ├── utils/            # Utilities
│   │   └── json_store.py # JSON file operations
│   ├── config.py         # Configuration management
│   └── app.py            # Flask app factory
├── requirements/         # Split requirements
│   ├── base.txt         # Core dependencies
│   ├── dev.txt          # Development tools
│   ├── prod.txt         # Production (gunicorn)
│   └── test.txt         # Testing dependencies
├── tests/               # Test suite (to be added)
├── .env.example         # Environment variables template
├── startup.py           # Azure App Service entry point
└── README.md            # This file
```

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements/dev.txt

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# FLASK_ENV=development
# SECRET_KEY=your-secret-key

# Run development server
python -m src.app

# Alternative: Use Flask CLI
export FLASK_APP=src.app:app
export FLASK_ENV=development
flask run --port 5000
```

### Production Deployment

```bash
# Install production dependencies
pip install -r requirements/prod.txt

# Set environment variables
export FLASK_ENV=production
export SECRET_KEY=your-production-secret-key
export PORT=8000

# Run with Gunicorn
gunicorn --bind 0.0.0.0:8000 --timeout 600 src.app:app
```

### Azure App Service

```bash
# Uses startup.py as entry point
# Configure startup command in Azure:
gunicorn --bind=0.0.0.0:8000 --timeout 600 startup:app
```

## 📋 API Modules

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check authentication status

### Capital Partners (Liquidity Module)
- Capital Partners: `/api/capital-partners` (GET, POST, PUT, DELETE)
- Teams: `/api/teams` (GET, POST, PUT, DELETE)
- Contacts: `/api/contacts-new` (GET, POST, PUT, DELETE)
- Meeting Notes: `/api/meeting-notes` (POST)
- Reminders: `/api/meeting-notes/reminders` (GET)

### Sponsors Module
- Corporates: `/api/corporates` (GET, POST, PUT, DELETE)
- Sponsor Contacts: `/api/sponsor-contacts` (GET, POST, PUT, DELETE)
- Sponsor Meetings: `/api/sponsor-meetings` (POST)
- Sponsor Reminders: `/api/sponsor-meetings/reminders` (GET)

### Counsel Module
- Legal Advisors: `/api/legal-advisors` (GET, POST, PUT, DELETE)
- Counsel Contacts: `/api/counsel-contacts` (GET, POST, PUT, DELETE)
- Counsel Meetings: `/api/counsel-meetings` (POST)
- Counsel Reminders: `/api/counsel-meetings/reminders` (GET)

### Investment & Deals
- Investment Strategies: `/api/investment-strategies` (GET, POST)
- Investment Profiles: `/api/investment-profiles` (GET)
- Investment Matches: `/api/investment-matches` (POST)
- Deal Pipeline: `/api/deals` (GET)
- Deal Generation: `/api/deals/generate` (POST)
- Deal Actions: `/api/deals/<id>/action` (POST)
- Deal Stage Updates: `/api/deals/<id>/stage` (PUT)

### Excel & Legacy
- Health Check: `/api/health` (GET)
- USA Historical Yields: `/api/historical-yields/usa` (GET)
- Institutions (Legacy): `/api/institutions` (GET, POST)
- Contacts (Legacy): `/api/contacts` (GET, POST)

## 🛠️ Development

### Running Tests

```bash
# Install test dependencies
pip install -r requirements/test.txt

# Run tests with pytest
pytest

# Run with coverage
pytest --cov=src --cov-report=html
```

### Code Quality

```bash
# Format code with Black
black src/

# Lint with Flake8
flake8 src/

# Type checking with MyPy
mypy src/
```

## 🔧 Configuration

Configuration is managed through environment variables and the `src/config.py` file.

### Environment Variables

```bash
FLASK_ENV=development          # Environment (development, production, test)
SECRET_KEY=your-secret-key     # Flask secret key (CHANGE IN PRODUCTION!)
PORT=5000                      # Server port

# Data directories
DATA_DIR=./data
EXCEL_DIR=./data/excel
JSON_DIR=./data/json
WEB_DIR=./web/public
```

### Configuration Classes

- `DevelopmentConfig` - Debug enabled, local paths
- `ProductionConfig` - Debug disabled, Azure paths, secure cookies
- `TestConfig` - Testing mode, temporary paths

## 📁 Data Storage

The API uses JSON files for data storage:

```
../data/json/
├── capital_partners.json     # Liquidity: Capital partners
├── teams.json                # Liquidity: Investment teams
├── contacts.json             # Liquidity: Contacts
├── corporates.json           # Sponsors: Corporate sponsors
├── sponsor_contacts.json     # Sponsors: Sponsor contacts
├── legal_advisors.json       # Counsel: Legal advisory firms
├── counsel_contacts.json     # Counsel: Lawyer contacts
├── investment_strategies.json # Saved investment strategies
├── investment_profiles.json  # Generated matching profiles
├── deal_pipeline.json        # Deal pipeline tracking
└── users.json                # User accounts
```

All JSON operations include automatic `.bak` backup file creation.

## 🔐 Authentication

- Session-based authentication using Flask-Login
- Password hashing with bcrypt
- Secure cookie configuration (production)
- Protected routes use `@login_required` decorator

## 🌐 CORS Configuration

CORS is enabled for local development:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `http://localhost:3001`

Update `src/config.py` to add Azure URLs for production deployment.

## 📦 Dependencies

### Core (base.txt)
- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - CORS handling
- Flask-Login 0.6.3 - Authentication
- bcrypt 4.1.2 - Password hashing
- pandas 2.1.4 - Data manipulation
- openpyxl 3.1.2 - Excel reading
- numpy 1.26.2 - Numerical operations

### Production (prod.txt)
- gunicorn 21.2.0 - WSGI server

### Development (dev.txt)
- pytest - Testing framework
- black - Code formatting
- flake8 - Linting
- mypy - Type checking
- ipython - Interactive shell

## 🚨 Important Notes

### Excel COM Automation
Excel COM automation (Windows only) is **not available** in this restructured backend. COM operations require Windows environment and are not supported on Azure Linux. For production:
- Keep COM operations on local Windows machine
- Generate JSON data locally and upload to cloud storage
- Backend API serves pre-generated JSON data

### Data File Paths
All file paths use configuration variables. Ensure environment variables are set correctly for your deployment environment.

### Migration from Old Structure
This backend replaces the monolithic `api/excel_api.py`. The old file is preserved for reference but should not be used in production.

## 📚 Additional Resources

- [API Endpoints Reference](../docs/API_ENDPOINTS_REFERENCE.md)
- [Azure Deployment Guide](../docs/Azure_Deployment_Guide.md)
- [Deal Pipeline Documentation](../docs/deal_pipeline_implementation.md)
- [Main Project README](../README.md)
