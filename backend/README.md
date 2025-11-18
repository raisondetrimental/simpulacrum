# Backend API

Flask-based REST API for Meridian Universal Dashboard.

## Quick Start

```bash
# Install dependencies
pip install -r requirements/dev.txt

# Run development server
python run.py
# Runs on http://127.0.0.1:5000
```

## Essential Commands

```bash
# Development
python run.py                         # Start dev server (port 5000)

# Testing
pytest                                # Run all tests
pytest tests/test_api/                # Test specific module
pytest --cov=src --cov-report=html    # Coverage report

# Code quality
black src/                            # Format code
flake8 src/                           # Lint code
mypy src/                             # Type checking

# Production
gunicorn --bind 0.0.0.0:8000 --timeout 600 src.app:app
```

## Project Structure

```
backend/
├── src/
│   ├── api/              # 19 Flask blueprints (auth, CRM modules, admin, etc.)
│   ├── services/         # Business logic layer
│   ├── utils/            # Utilities (json_store, audit_logger, unified_dal)
│   ├── constants/        # Shared constants
│   ├── config.py         # Flask configuration (dev/prod/test)
│   └── app.py            # Flask application factory
│
├── data/
│   ├── json/             # JSON database files
│   │   ├── organizations.json        # ALL CRM organizations (unified)
│   │   ├── unified_contacts.json     # ALL contacts (unified)
│   │   ├── deals.json                # Deal pipeline
│   │   ├── users.json                # User accounts
│   │   ├── countries_master.json     # 90+ countries (investment prefs)
│   │   └── [18 other JSON files]
│   │
│   └── excel/            # Excel source files (legacy)
│
├── storage/              # Generated files (served to frontend)
├── tests/                # Test suite
├── migrations/           # Migration documentation
├── run.py                # Development entry point
├── startup.py            # Production entry point (Azure)
└── requirements/
    ├── dev.txt           # Development dependencies
    └── prod.txt          # Production dependencies
```

## Key Technologies

- **Flask 3.0.0** - Web framework with application factory pattern
- **Flask-Login 0.6.3** - Session-based authentication (NOT JWT)
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **bcrypt 4.1.2** - Password hashing
- **pandas 2.1.4** - Data manipulation
- **Gunicorn 21.2.0** - Production WSGI server

## Architecture Overview

### Application Factory Pattern

```python
# src/app.py
def create_app(config_name='development'):
    app = Flask(__name__)

    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)

    # Initialize extensions
    login_manager.init_app(app)
    CORS(app, supports_credentials=True)

    # Register 19 blueprints
    from .api import auth_bp, capital_partners_bp, ...
    app.register_blueprint(auth_bp)
    # ... more blueprints

    return app
```

### Unified Data Architecture

**CRITICAL**: All CRM data uses unified architecture:

- **`organizations.json`** - Single file for ALL organizations (capital partners, sponsors, counsel, agents)
- **`unified_contacts.json`** - Single file for ALL contacts across all modules
- **Discriminator field**: `organization_type` determines module type

```python
# Filter by organization type
from ..utils.unified_dal import get_all_organizations

partners = get_all_organizations("capital_partner")
sponsors = get_all_organizations("sponsor")
advisors = get_all_organizations("counsel")
agents = get_all_organizations("agent")
```

### JSON Storage with Automatic Backups

```python
from pathlib import Path
from ..utils.json_store import read_json_list, write_json_file

# Read
data = read_json_list(Path(json_dir) / 'organizations.json')

# Write (creates .bak file automatically)
write_json_file(Path(json_dir) / 'organizations.json', data)
```

## API Blueprints (19 total)

**Core CRM:**
- `auth.py` - Login, logout, auth status
- `capital_partners.py` - Liquidity module
- `sponsors.py` - Sponsors module
- `counsel.py` - Counsel module
- `agents.py` - Agents module

**Investment & Deals:**
- `investment.py` - Investment matching
- `deals.py` - Deal pipeline
- `deal_participants.py` - Deal participants

**Market Data:**
- `countries.py` - Country fundamentals (5 markets)
- `countries_master.py` - Countries master list (90+)
- `fx_rates.py` - FX rates
- `excel.py` - Legacy Excel data
- `data.py` - Serve static JSON files

**Administration:**
- `users.py` - User management (admin only)
- `profile.py` - User profile
- `admin.py` - Super admin portal (13+ features)
- `playbook.py` - Playbook manager
- `reports.py` - CSV exports

**Collaboration:**
- `whiteboard.py` - Team posts with threading

## Configuration

Three environments in `src/config.py`:

```python
# Development (default)
DevelopmentConfig:
    DEBUG = True
    PORT = 5000
    CORS_ORIGINS = ["http://localhost:5173", ...]

# Production
ProductionConfig:
    DEBUG = False
    PORT = 8000
    CORS_ORIGINS = [Azure Static Web App URL]

# Testing
TestConfig:
    TESTING = True
```

## Authentication

- **Session-based** with Flask-Login (NOT JWT)
- **Password hashing** with bcrypt
- **Three access levels**: Standard, Admin, Super Admin
- **Protected routes** use `@login_required` decorator

```python
from flask_login import login_required, current_user

@bp.route('/protected', methods=['GET'])
@login_required
def protected_endpoint():
    if not current_user.is_super_admin:
        return jsonify({"success": False}), 403
    # Logic here
```

## Important Notes

1. **Unified CRM**: Don't look for separate `capital_partners.json` or `corporates.json` - all in `organizations.json`
2. **Organization Types**: Use `"capital_partner"`, `"sponsor"`, `"counsel"`, `"agent"` (exact strings)
3. **Countries Systems**: Two separate systems - master (90+ for prefs) vs fundamentals (5 with market data)
4. **Automatic Backups**: Every write creates `.bak` file
5. **Relative Imports**: Use relative imports (`from ..utils import`)

## Testing

```bash
# Run all tests
pytest

# Test specific module
pytest tests/test_api/test_capital_partners.py

# With coverage
pytest --cov=src --cov-report=html

# View coverage report
open htmlcov/index.html
```

## Deployment

**Azure App Service (Linux):**
- Entry point: `startup.py`
- Command: `gunicorn --bind=0.0.0.0:8000 --timeout 600 startup:app`
- Environment variables: `FLASK_ENV=production`, `SECRET_KEY`, `PORT=8000`

## Common Patterns

See [CLAUDE.md](../CLAUDE.md) for:
- Adding new API endpoints
- CSV export pattern
- Form handling
- Meeting notes pattern
- Investment matching
- And much more...

## Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Complete project guide (START HERE)
- **[API Reference](../docs/reference/API_ENDPOINTS_REFERENCE.md)** - All endpoints
- **[Data Model](../docs/reference/DATA_MODEL_DIAGRAM.md)** - Database schema
- **[Migrations](migrations/README.md)** - Migration history

---

**For complete architecture, patterns, and development workflows, see [CLAUDE.md](../CLAUDE.md)**
