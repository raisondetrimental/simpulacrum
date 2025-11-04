# Backend Restructure Migration Guide

## Overview

The Meridian Dashboard backend has been restructured from a monolithic `api/excel_api.py` file into a modular, industry-standard architecture.

## What Changed

### Before (Old Structure)
```
api/
├── excel_api.py (3365 lines - monolithic)
├── deal_pipeline.py
├── investment_matching.py
├── investment_profiles.py
├── requirements.txt
└── startup.py
```

### After (New Structure)
```
backend/
├── src/
│   ├── api/                    # Route blueprints (modular)
│   │   ├── auth.py
│   │   ├── capital_partners.py
│   │   ├── counsel.py
│   │   ├── deals.py
│   │   ├── excel.py
│   │   ├── investment.py
│   │   └── sponsors.py
│   ├── models/                 # Data models
│   │   └── user.py
│   ├── services/               # Business logic
│   │   ├── deal_pipeline.py
│   │   ├── investment_matching.py
│   │   └── investment_profiles.py
│   ├── utils/                  # Utilities
│   │   └── json_store.py
│   ├── config.py              # Configuration
│   └── app.py                 # Flask app factory
├── requirements/              # Split dependencies
│   ├── base.txt
│   ├── dev.txt
│   ├── prod.txt
│   └── test.txt
├── run.py                     # Development runner
├── startup.py                 # Azure entry point
└── README.md
```

## Migration Steps

### For Development

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements/dev.txt
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Start the server:**
   ```bash
   # Option 1: Using run.py
   python run.py

   # Option 2: Using Flask CLI
   export FLASK_APP=src.app:app
   export FLASK_ENV=development
   flask run --port 5000
   ```

### For Production

1. **Install production dependencies:**
   ```bash
   pip install -r requirements/prod.txt
   ```

2. **Set environment variables:**
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-production-secret-key
   export PORT=8000
   ```

3. **Run with Gunicorn:**
   ```bash
   gunicorn --bind 0.0.0.0:8000 --timeout 600 src.app:app
   ```

### For Azure Deployment

1. **Update startup command:**
   ```bash
   gunicorn --bind=0.0.0.0:8000 --timeout 600 startup:app
   ```

2. **Update deployment files if needed** - The new `startup.py` imports from `src.app`

## API Endpoint Changes

**Good news:** All API endpoints remain the same! No changes required to frontend code.

### Endpoints Tested & Working
- ✅ `/api/health` - Health check
- ✅ `/api/auth/status` - Authentication status
- ✅ `/api/capital-partners` - Capital partners CRUD
- ✅ `/api/corporates` - Corporates CRUD
- ✅ `/api/legal-advisors` - Legal advisors CRUD
- ✅ `/api/investment-strategies` - Investment strategies
- ✅ `/api/deals/pipeline` - Deal pipeline
- ✅ All other endpoints (65 total routes registered)

## Import Changes

If you have any custom scripts that import from the old structure, update imports:

### Old Imports
```python
# From api/excel_api.py
from excel_api import app

# From api/deal_pipeline.py
from deal_pipeline import generate_deals_from_matches
```

### New Imports
```python
# From backend/src/app.py
from src.app import app

# From backend/src/services/deal_pipeline.py
from src.services.deal_pipeline import generate_deals_from_matches
```

## Configuration Changes

### Old Configuration (Hardcoded in excel_api.py)
```python
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = Path(os.environ.get('DATA_DIR', BASE_DIR / 'data'))
```

### New Configuration (Centralized in config.py)
```python
from src.config import get_config

config = get_config('development')
data_dir = config.DATA_DIR
```

## Benefits of New Structure

1. **Modularity** - Each module is self-contained and focused
2. **Testability** - Easier to write unit tests for individual modules
3. **Maintainability** - Changes are isolated to specific files
4. **Scalability** - Easy to add new modules/routes
5. **Standards** - Follows Flask best practices (blueprints, app factory)
6. **Configuration** - Environment-based config management
7. **Dependencies** - Split requirements for dev/prod/test

## Backward Compatibility

The old `api/` directory is preserved for reference. However:

- ⚠️ **Do not run both servers simultaneously** (port conflict)
- ⚠️ **Update any custom scripts** to use new import paths
- ⚠️ **Frontend requires no changes** - all endpoints remain the same

## Troubleshooting

### Import Errors
```python
ModuleNotFoundError: No module named 'src'
```
**Solution:** Ensure you're running from the `backend/` directory or add it to PYTHONPATH:
```bash
cd backend
python run.py
```

### Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:** Stop the old API server or use a different port:
```bash
# Stop old server
pkill -f excel_api.py

# Or use different port
flask run --port 5001
```

### Configuration Not Found
```
KeyError: 'DATA_DIR'
```
**Solution:** Ensure environment variables are set or use .env file:
```bash
cp .env.example .env
# Edit .env with correct paths
```

## Testing

### Manual Testing
```bash
# Start server
python run.py

# Test endpoints
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/auth/status
curl http://127.0.0.1:5000/api/capital-partners
```

### Automated Testing (Future)
```bash
# Install test dependencies
pip install -r requirements/test.txt

# Run tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html
```

## Rollback Plan

If you need to revert to the old structure temporarily:

1. Stop the new backend server
2. Start the old server:
   ```bash
   cd api
   python excel_api.py
   ```

The old code is still available in `api/excel_api.py` (not deleted).

## Next Steps

### Recommended Phase 2 Improvements
1. Add unit tests for all modules
2. Add integration tests for API endpoints
3. Add API documentation (Swagger/OpenAPI)
4. Add logging middleware
5. Add request validation (marshmallow/pydantic)
6. Add database migration system (if moving from JSON to SQL)

## Questions?

Refer to:
- `backend/README.md` - Full backend documentation
- `backend/src/config.py` - Configuration options
- `docs/API_ENDPOINTS_REFERENCE.md` - API endpoint documentation
