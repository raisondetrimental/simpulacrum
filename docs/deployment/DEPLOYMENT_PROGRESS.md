# Azure Deployment Progress

## Completed Steps

### ✅ Step 1.1: Azure Configuration Files Created
- Created `.azure/config` with default resource group and location
- Created `web/.env.production` with Azure API URL placeholder
- Created `api/requirements.txt` with Flask dependencies
- Created `api/startup.py` as Azure App Service entry point
- Created `api/.deployment` and `api/deploy.sh` for deployment automation

### ✅ Step 1.2: Flask API Updated for Azure
- **File:** `api/excel_api.py`
- Updated CORS configuration to support Azure Static Web Apps domains
- Added environment variable support for file paths (`DATA_DIR`, `WEB_DIR`)
- Centralized all JSON file paths using `JSON_DIR` variable
- Maintains backward compatibility with local development

**Changes:**
```python
# CORS now supports Azure domains
CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://*.azurestaticapps.net",
            "https://meridian-dashboard-frontend.azurestaticapps.net"
        ]
    }
})

# Paths now use environment variables
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = Path(os.environ.get('DATA_DIR', BASE_DIR / 'data'))
WEB_DIR = Path(os.environ.get('WEB_DIR', BASE_DIR / 'web'))
JSON_DIR = DATA_DIR / "json"
```

### ✅ Step 1.3: Frontend Updated for Azure
- **Created:** `web/src/config.ts` - Central configuration for API URLs
- **Updated:** 35 component files with API URL imports
- **Total:** 125 hardcoded URLs replaced with environment-aware configuration

**Components Updated:**
- All CRM pages (Liquidity, Sponsors, Counsel)
- All form components
- Excel refresh controls
- Authentication context
- Dashboard pages
- Meeting notes pages
- Calendar and reminders

**Configuration:**
```typescript
// web/src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
```

**Usage in components:**
```typescript
import { API_BASE_URL } from '../config';

// API calls now use:
fetch(`${API_BASE_URL}/api/capital-partners`)
```

---

## Next Steps

### Step 2: Deploy Backend (Flask API to Azure)

**Prerequisites:**
1. Install Azure CLI: https://aka.ms/installazurecliwindows
2. Login: `az login`

**Deployment Steps:**
1. Create resource group
2. Create storage account for JSON data
3. Upload JSON files to Blob Storage
4. Create App Service Plan (Linux)
5. Create Web App for Flask API
6. Configure environment variables
7. Deploy code via Git or ZIP

**Commands ready in:** `docs/Azure_Deployment_Guide.md` (Section Part 2)

### Step 3: Deploy Frontend (React to Azure Static Web Apps)

**Prerequisites:**
1. Install Static Web Apps CLI: `npm install -g @azure/static-web-apps-cli`
2. Build frontend: `cd web && npm run build`

**Deployment Steps:**
1. Create Static Web App in Azure Portal
2. Get deployment token
3. Deploy build folder
4. Configure environment variables

**Commands ready in:** `docs/Azure_Deployment_Guide.md` (Section Part 3)

---

## Testing Locally Before Deployment

### Test Backend Changes
```bash
cd api
python excel_api.py
# Should start on http://127.0.0.1:5000
```

### Test Frontend Changes
```bash
cd web
npm run dev
# Should start on http://localhost:5173
# Verify all pages load correctly
# Check browser console for errors
```

### Verify Environment Variable Support
```bash
# Test with custom DATA_DIR
set DATA_DIR=C:\custom\path
python api/excel_api.py

# Test frontend with production API URL
set VITE_API_URL=https://meridian-dashboard-api.azurewebsites.net
npm run build
```

---

## Files Modified

### Created Files (6)
1. `.azure/config`
2. `web/.env.production`
3. `api/requirements.txt`
4. `api/startup.py`
5. `api/.deployment`
6. `api/deploy.sh`
7. `web/src/config.ts`

### Modified Files (36)
1. `api/excel_api.py` - CORS and path configuration
2. `web/src/components/ExcelRefreshControls.tsx`
3. 35 other frontend component files (full list in deployment script output)

---

## Cost Estimate

**Monthly costs after deployment:**
- Azure Static Web App: Free tier (100 GB bandwidth)
- Azure App Service (B1): ~$13/month
- Azure Blob Storage: ~$0.02/month
- **Total: ~$13/month**

**Free trial coverage:**
- $200 credit for 30 days covers all costs
- After trial: Can scale down to F1 tier (free) if needed

---

## Important Notes

1. **Excel COM automation will NOT work on Azure Linux** - requires Windows VM (future enhancement)
2. **JSON data must be manually uploaded** to Blob Storage after generating locally
3. **CORS is configured** for both localhost and Azure domains
4. **Environment variables** allow same code to run locally and on Azure
5. **All 125 API calls** are now environment-aware

---

**Last Updated:** October 2025
**Status:** Ready for Azure deployment (Steps 2 & 3)
