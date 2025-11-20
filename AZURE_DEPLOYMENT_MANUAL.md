# Manual Azure Deployment Guide

**Meridian Universal Dashboard - Azure Hosting Without CI/CD**

This guide provides step-by-step instructions for manually deploying the Meridian Universal Dashboard to Azure, building and deploying both frontend and backend without relying on CI/CD pipelines.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment (Azure Static Web Apps)](#frontend-deployment-azure-static-web-apps)
4. [Backend Deployment (Azure App Service)](#backend-deployment-azure-app-service)
5. [Data Files Setup](#data-files-setup)
6. [Configuration & Environment Variables](#configuration--environment-variables)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance & Updates](#maintenance--updates)

---

## Architecture Overview

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite → Azure Static Web Apps
- **Backend:** Flask 3.0 + Python 3.11 → Azure App Service (Linux)
- **Data:** JSON files stored on App Service filesystem
- **Authentication:** Flask-Login with session-based auth

**Azure Resources Required:**
1. **Azure Static Web App** - Hosts the React frontend
2. **Azure App Service (Linux, Python 3.11)** - Hosts the Flask backend
3. **Azure Storage Account** (Optional) - For data file backups

---

## Prerequisites

### Local Development Environment

**Required Software:**
- **Node.js 18+** and npm
- **Python 3.11+**
- **Git**
- **Azure CLI** (`az` command)
  - Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

**Azure Account:**
- Active Azure subscription
- Permissions to create App Services and Static Web Apps

**Verify Installations:**
```bash
node --version        # Should be 18.x or higher
npm --version
python --version      # Should be 3.11.x or higher
az --version          # Azure CLI
```

### Azure CLI Login

```bash
az login
# Follow browser authentication

# Verify subscription
az account show
az account list --output table

# Set default subscription if needed
az account set --subscription "Your Subscription Name"
```

---

## Frontend Deployment (Azure Static Web Apps)

### Step 1: Build Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Create production build
npm run build
```

**Output:** Production files in `frontend/dist/` directory

**Verify build:**
```bash
ls dist/
# Should contain: index.html, assets/, etc.
```

### Step 2: Create Azure Static Web App

**Option A: Via Azure Portal**

1. Go to https://portal.azure.com
2. Click **Create a resource** → Search for **Static Web App**
3. Click **Create**
4. Fill in details:
   - **Subscription:** Your subscription
   - **Resource Group:** Create new or select existing (e.g., `meridian-dashboard-rg`)
   - **Name:** `meridian-dashboard-frontend` (must be globally unique)
   - **Region:** Choose closest region (e.g., East US, West Europe)
   - **Plan type:** Free (for testing) or Standard (for production)
   - **Deployment details:** Select **Other** (we'll deploy manually)
5. Click **Review + create** → **Create**
6. Wait for deployment to complete

**Option B: Via Azure CLI**

```bash
# Create resource group (if needed)
az group create \
  --name meridian-dashboard-rg \
  --location eastus

# Create Static Web App
az staticwebapp create \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --location eastus \
  --sku Free
```

### Step 3: Get Deployment Token

**Via Azure Portal:**
1. Go to your Static Web App resource
2. Click **Overview** → **Manage deployment token**
3. Copy the token (save it securely)

**Via Azure CLI:**
```bash
az staticwebapp secrets list \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --query "properties.apiKey" -o tsv
```

### Step 4: Install SWA CLI (Static Web Apps CLI)

```bash
npm install -g @azure/static-web-apps-cli
```

### Step 5: Deploy Frontend Build

```bash
cd frontend

# Deploy using SWA CLI
swa deploy ./dist \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN> \
  --env production
```

**Alternative: Manual Upload via Azure Portal**

1. Go to your Static Web App resource
2. Click **Browse** to see current deployment
3. Use **Azure Storage Explorer** or Portal to upload files from `dist/` folder

### Step 6: Configure Frontend Environment

**Update Configuration File:**

```bash
cd frontend
```

Create `.env.production` file:
```bash
# Frontend environment variables
VITE_API_URL=https://meridian-dashboard-backend.azurewebsites.net
```

**Rebuild with production config:**
```bash
npm run build
```

**Redeploy:**
```bash
swa deploy ./dist \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN> \
  --env production
```

### Step 7: Get Frontend URL

```bash
# Get Static Web App URL
az staticwebapp show \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --query "defaultHostname" -o tsv
```

**Example URL:** `https://meridian-dashboard-frontend.azurestaticapps.net`

---

## Backend Deployment (Azure App Service)

### Step 1: Prepare Backend Files

**Create deployment directory:**
```bash
cd backend

# Ensure requirements.txt is up to date
pip freeze > requirements.txt
```

**Verify required files exist:**
- `backend/startup.py` - Entry point for Gunicorn
- `backend/requirements.txt` - Python dependencies
- `backend/src/` - Application code
- `backend/data/json/` - Data files

### Step 2: Create Azure App Service

**Option A: Via Azure Portal**

1. Go to https://portal.azure.com
2. Click **Create a resource** → **Web App**
3. Fill in details:
   - **Subscription:** Your subscription
   - **Resource Group:** `meridian-dashboard-rg` (same as frontend)
   - **Name:** `meridian-dashboard-backend` (must be globally unique)
   - **Publish:** Code
   - **Runtime stack:** Python 3.11
   - **Operating System:** Linux
   - **Region:** Same as frontend (e.g., East US)
   - **App Service Plan:** Create new (B1 Basic or higher recommended)
4. Click **Review + create** → **Create**

**Option B: Via Azure CLI**

```bash
# Create App Service Plan
az appservice plan create \
  --name meridian-dashboard-plan \
  --resource-group meridian-dashboard-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --plan meridian-dashboard-plan \
  --runtime "PYTHON:3.11"
```

### Step 3: Configure App Service Settings

**Set environment variables:**

```bash
az webapp config appsettings set \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --settings \
    FLASK_ENV=production \
    SECRET_KEY="<GENERATE_STRONG_SECRET_KEY>" \
    PORT=8000 \
    EXCHANGERATE_API_KEY="<YOUR_API_KEY>" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

**Generate a strong secret key:**
```python
# Run this Python command locally
python -c "import secrets; print(secrets.token_hex(32))"
```

**Configure startup command:**
```bash
az webapp config set \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --startup-file "gunicorn --bind=0.0.0.0:8000 --timeout 600 startup:app"
```

### Step 4: Enable Web Sockets (for sessions)

```bash
az webapp config set \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --web-sockets-enabled true
```

### Step 5: Deploy Backend Code

**Method 1: ZIP Deployment (Recommended)**

```bash
cd backend

# Create ZIP file (exclude virtual environments and cache)
# Windows:
tar -a -c -f deploy.zip --exclude=venv --exclude=__pycache__ --exclude=*.pyc --exclude=.pytest_cache --exclude=data/json/backups --exclude=*.bak *

# Linux/Mac:
zip -r deploy.zip . -x "venv/*" -x "__pycache__/*" -x "*.pyc" -x ".pytest_cache/*" -x "data/json/backups/*" -x "*.bak"

# Deploy ZIP
az webapp deployment source config-zip \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --src deploy.zip
```

**Method 2: Local Git Deployment**

```bash
# Get deployment credentials
az webapp deployment user set \
  --user-name <choose-username> \
  --password <choose-password>

# Get Git URL
az webapp deployment source config-local-git \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --query url -o tsv

# Add Azure as Git remote
cd backend
git init  # If not already a git repo
git remote add azure <GIT_URL_FROM_ABOVE>

# Commit and push
git add .
git commit -m "Initial deployment"
git push azure main
```

**Method 3: FTP Deployment**

```bash
# Get FTP credentials
az webapp deployment list-publishing-credentials \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --query "{ftpUrl: publishingUserName, username: publishingUserName, password: publishingPassword}"

# Use FTP client (FileZilla, WinSCP, etc.) to upload files to /home/site/wwwroot
```

### Step 6: Configure CORS

**Update backend configuration:**

1. Get your Static Web App URL from Step 7 of Frontend Deployment
2. Add to CORS origins in `backend/src/config.py`:

```python
class ProductionConfig:
    CORS_ORIGINS = [
        "https://meridian-dashboard-frontend.azurestaticapps.net"
    ]
```

**Or set via App Settings:**
```bash
az webapp cors add \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --allowed-origins "https://meridian-dashboard-frontend.azurestaticapps.net"
```

### Step 7: Restart App Service

```bash
az webapp restart \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg
```

### Step 8: Get Backend URL

```bash
az webapp show \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --query "defaultHostName" -o tsv
```

**Example URL:** `https://meridian-dashboard-backend.azurewebsites.net`

---

## Data Files Setup

### Option 1: Include in Deployment (Simple)

Data files in `backend/data/json/` are included in the ZIP deployment and persist on the App Service filesystem.

**Important Notes:**
- Azure App Service provides persistent storage at `/home/site/wwwroot`
- Data files will persist across restarts
- Backups should be scheduled separately

### Option 2: Azure File Share (Recommended for Production)

**Create Storage Account:**
```bash
az storage account create \
  --name meridiandashstorage \
  --resource-group meridian-dashboard-rg \
  --location eastus \
  --sku Standard_LRS
```

**Create File Share:**
```bash
az storage share create \
  --name data-files \
  --account-name meridiandashstorage
```

**Mount File Share to App Service:**
```bash
# Get storage key
STORAGE_KEY=$(az storage account keys list \
  --account-name meridiandashstorage \
  --resource-group meridian-dashboard-rg \
  --query "[0].value" -o tsv)

# Mount share
az webapp config storage-account add \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --custom-id DataFiles \
  --storage-type AzureFiles \
  --share-name data-files \
  --account-name meridiandashstorage \
  --access-key $STORAGE_KEY \
  --mount-path /home/site/data
```

**Upload data files to file share:**
```bash
# Using Azure CLI
az storage file upload-batch \
  --destination data-files \
  --source ./backend/data/json \
  --destination-path json \
  --account-name meridiandashstorage \
  --account-key $STORAGE_KEY
```

**Update config to use mounted path:**
```python
# backend/src/config.py
class ProductionConfig:
    DATA_DIR = Path('/home/site/data')
    JSON_DIR = DATA_DIR / 'json'
```

---

## Configuration & Environment Variables

### Backend App Settings Summary

**Required Environment Variables:**

```bash
FLASK_ENV=production
SECRET_KEY=<64-character-hex-string>
PORT=8000
EXCHANGERATE_API_KEY=<your-exchangerate-api-key>
```

**Optional Variables:**

```bash
# Paths (if using custom locations)
DATA_DIR=/home/site/data
WEB_DIR=/home/site/wwwroot

# Logging
LOG_LEVEL=INFO
```

**Set all variables at once:**
```bash
az webapp config appsettings set \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --settings \
    FLASK_ENV=production \
    SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')" \
    PORT=8000 \
    EXCHANGERATE_API_KEY="your-key-here" \
    LOG_LEVEL=INFO
```

### Frontend Configuration

**Update frontend config before build:**

```typescript
// frontend/src/config.ts
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://meridian-dashboard-backend.azurewebsites.net'
  : 'http://127.0.0.1:5000';
```

**Or use environment variable:**
```bash
# frontend/.env.production
VITE_API_URL=https://meridian-dashboard-backend.azurewebsites.net
```

---

## Post-Deployment Verification

### 1. Test Backend Health

```bash
# Test backend is running
curl https://meridian-dashboard-backend.azurewebsites.net/api/auth/status

# Expected response:
# {"authenticated": false}
```

### 2. Test Frontend Access

1. Open frontend URL in browser: `https://meridian-dashboard-frontend.azurestaticapps.net`
2. You should see the login page
3. Open browser DevTools → Network tab

### 3. Test Authentication

1. Log in with default credentials (set in `backend/data/json/users.json`)
2. Verify session is established
3. Check that API calls include `credentials: 'include'`

### 4. Test CORS

**In browser console:**
```javascript
fetch('https://meridian-dashboard-backend.azurewebsites.net/api/auth/status', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

**Expected:** No CORS errors, successful response

### 5. Monitor Logs

**Stream backend logs:**
```bash
az webapp log tail \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg
```

**Download logs:**
```bash
az webapp log download \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --log-file logs.zip
```

---

## Troubleshooting

### Common Issues

#### 1. "Application Error" on Backend

**Symptoms:** Backend URL shows generic error page

**Diagnosis:**
```bash
# Check application logs
az webapp log tail \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg

# Check deployment logs
az webapp log deployment show \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg
```

**Common Fixes:**
- Verify Python version is 3.11
- Check startup command is correct
- Ensure `requirements.txt` includes all dependencies
- Verify `startup.py` exists and is correct

#### 2. CORS Errors

**Symptoms:** Browser console shows CORS policy errors

**Fix:**
1. Verify frontend URL is in backend CORS_ORIGINS
2. Check CORS configuration in App Service
3. Ensure `supports_credentials=True` in Flask-CORS config

```bash
# Add CORS origin
az webapp cors add \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --allowed-origins "https://your-frontend-url.azurestaticapps.net"
```

#### 3. Session/Authentication Not Working

**Symptoms:** User gets logged out immediately, session doesn't persist

**Fixes:**
- Ensure `credentials: 'include'` in ALL frontend fetch calls
- Verify SECRET_KEY is set in App Settings
- Check cookies are allowed in browser
- Ensure frontend and backend use HTTPS (not mixed HTTP/HTTPS)

#### 4. JSON Files Not Found

**Symptoms:** Backend errors about missing data files

**Diagnosis:**
```bash
# SSH into App Service
az webapp ssh \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg

# Check file structure
ls -la /home/site/wwwroot/data/json/
```

**Fix:**
- Verify data files were included in deployment
- Check paths in `config.py` match actual file locations
- Ensure file permissions are correct

#### 5. Slow Performance

**Symptoms:** API responses are slow

**Fixes:**
- Upgrade App Service Plan to higher tier (B2, S1, etc.)
- Enable Application Insights for performance monitoring
- Optimize JSON file loading (use caching)

#### 6. Build Failures

**Symptoms:** Deployment succeeds but app doesn't work

**Fix:**
```bash
# Enable build automation
az webapp config appsettings set \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Redeploy
```

---

## Maintenance & Updates

### Update Frontend

```bash
cd frontend

# Make changes to code
# ...

# Rebuild
npm run build

# Redeploy
swa deploy ./dist \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN> \
  --env production
```

### Update Backend

```bash
cd backend

# Make changes to code
# ...

# Create new ZIP
zip -r deploy.zip . -x "venv/*" -x "__pycache__/*" -x "*.pyc"

# Deploy
az webapp deployment source config-zip \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --src deploy.zip

# Restart
az webapp restart \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg
```

### Backup Data Files

**Manual backup:**
```bash
# SSH into App Service
az webapp ssh \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg

# Create backup
cd /home/site/wwwroot/data/json
tar -czf backup-$(date +%Y%m%d).tar.gz *.json

# Exit and download
exit

# Download via FTP or Azure Portal
```

**Automated backup (if using Azure Files):**
```bash
# Download all files from file share
az storage file download-batch \
  --destination ./backup-$(date +%Y%m%d) \
  --source data-files \
  --account-name meridiandashstorage \
  --account-key $STORAGE_KEY
```

### Update Python Dependencies

```bash
cd backend

# Update requirements.txt
pip freeze > requirements.txt

# Redeploy (ZIP method)
zip -r deploy.zip . -x "venv/*"
az webapp deployment source config-zip \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --src deploy.zip

# Restart
az webapp restart \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg
```

### Monitor Application

**Enable Application Insights:**
```bash
# Create Application Insights
az monitor app-insights component create \
  --app meridian-dashboard-insights \
  --location eastus \
  --resource-group meridian-dashboard-rg \
  --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app meridian-dashboard-insights \
  --resource-group meridian-dashboard-rg \
  --query instrumentationKey -o tsv)

# Add to App Service
az webapp config appsettings set \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

---

## Cost Management

**Estimated Monthly Costs (USD):**

| Resource | Tier | Estimated Cost |
|----------|------|----------------|
| Static Web App | Free | $0 |
| App Service Plan | B1 Basic | ~$13 |
| Storage Account (if used) | Standard LRS | ~$1-5 |
| **Total** | | **~$14-18/month** |

**For production:**
- Static Web App Standard: ~$9/month
- App Service Plan S1: ~$70/month
- Total: ~$80/month

---

## Security Checklist

- [ ] Strong SECRET_KEY set (64+ characters)
- [ ] HTTPS enforced on both frontend and backend
- [ ] CORS configured with specific origins (not `*`)
- [ ] API keys stored in App Settings (not in code)
- [ ] Default user passwords changed
- [ ] Application Insights enabled for monitoring
- [ ] Regular backups scheduled for data files
- [ ] Resource locks enabled on production resources

---

## Quick Reference Commands

**Deploy Frontend:**
```bash
cd frontend && npm run build
swa deploy ./dist --deployment-token <TOKEN> --env production
```

**Deploy Backend:**
```bash
cd backend
zip -r deploy.zip . -x "venv/*" -x "__pycache__/*"
az webapp deployment source config-zip \
  --name meridian-dashboard-backend \
  --resource-group meridian-dashboard-rg \
  --src deploy.zip
az webapp restart --name meridian-dashboard-backend --resource-group meridian-dashboard-rg
```

**View Logs:**
```bash
az webapp log tail --name meridian-dashboard-backend --resource-group meridian-dashboard-rg
```

**SSH to Backend:**
```bash
az webapp ssh --name meridian-dashboard-backend --resource-group meridian-dashboard-rg
```

---

## Support & Resources

**Azure Documentation:**
- Static Web Apps: https://docs.microsoft.com/en-us/azure/static-web-apps/
- App Service: https://docs.microsoft.com/en-us/azure/app-service/
- Azure CLI: https://docs.microsoft.com/en-us/cli/azure/

**Project Documentation:**
- Main README: `README.md`
- Development Guide: `CLAUDE.md`
- Architecture: See CLAUDE.md sections

**Troubleshooting:**
- Check Azure Portal → Resource → Diagnose and solve problems
- Review Application Insights if enabled
- Check backend logs for Python exceptions
- Verify all environment variables are set

---

**Last Updated:** 2025-01-18
**Maintained By:** Cameron Thomas, Meridian Universal
