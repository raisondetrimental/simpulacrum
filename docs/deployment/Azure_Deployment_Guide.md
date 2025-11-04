# Azure Deployment Guide - Meridian Universal Dashboard

## Overview

This guide will walk you through deploying your Markets Dashboard web application to Microsoft Azure using your free trial. We'll deploy the **React frontend** and **Flask backend API** as separate Azure services.

**What we're deploying:**
- Frontend (React/Vite app) → Azure Static Web Apps
- Backend (Flask API) → Azure App Service (Linux)
- Data files (JSON) → Azure Blob Storage

**What we're NOT deploying (for now):**
- Excel COM automation (Windows-specific, requires Windows VM - skipped for now)
- PDF generation (can be added later)

---

## Architecture After Deployment

```
Azure Static Web App (Frontend)
  ↓ API calls
Azure App Service (Flask Backend)
  ↓ reads/writes
Azure Blob Storage (JSON data files)
```

---

## Prerequisites

✅ Azure free trial account (you have this)
✅ Git installed on your computer
✅ Node.js and npm installed
✅ Python 3.9+ installed
✅ Visual Studio Code (recommended)

---

## Part 1: Prepare Your Application for Azure

### Step 1.1: Create Azure-specific configuration files

**Create `.azure/config` in project root:**
```
[defaults]
group = meridian-dashboard-rg
location = eastus
web = meridian-dashboard-frontend
```

**Create `web/.env.production`:**
```bash
VITE_API_URL=https://meridian-dashboard-api.azurewebsites.net
```

**Create `api/requirements.txt` (if not exists):**
```
flask==3.0.0
flask-cors==4.0.0
pandas==2.1.4
openpyxl==3.1.2
numpy==1.26.2
```

**Create `api/startup.py` (Azure entry point):**
```python
#!/usr/bin/env python3
"""
Azure App Service startup script for Flask API
"""
import os
from excel_api import app

if __name__ == "__main__":
    # Azure App Service expects app to run on port 8000
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

**Create `api/.deployment`:**
```
[config]
command = bash deploy.sh
```

**Create `api/deploy.sh`:**
```bash
#!/bin/bash
set -e

echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Deployment complete"
```

### Step 1.2: Update Flask API for Azure

**Edit `api/excel_api.py`** - Update CORS and file paths:

```python
# At the top of excel_api.py, update CORS configuration:
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://*.azurestaticapps.net",  # Azure Static Web Apps
            "https://meridian-dashboard-frontend.azurestaticapps.net"
        ]
    }
})

# Update file paths to use environment variables:
import os

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get('DATA_DIR', os.path.join(BASE_DIR, '..', 'data'))
JSON_DIR = os.path.join(DATA_DIR, 'json')

# Update all file path references:
def get_capital_partners_path():
    return os.path.join(JSON_DIR, 'capital_partners.json')

def get_teams_path():
    return os.path.join(JSON_DIR, 'teams.json')

# ... apply to all JSON file paths
```

### Step 1.3: Build Frontend for Production

**Update `web/src/config.ts`** (create if doesn't exist):
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Use this in your API calls:
// fetch(`${API_BASE_URL}/api/capital-partners`)
```

**Update API calls in frontend** - Replace hardcoded `http://127.0.0.1:5000` with:
```typescript
import { API_BASE_URL } from '../config';

// Example in useDashboardData hook:
const response = await fetch(`${API_BASE_URL}/api/institutions`);
```

---

## Part 2: Deploy Backend (Flask API)

### Step 2.1: Install Azure CLI

**Windows:**
```powershell
# Download and run MSI installer from:
# https://aka.ms/installazurecliwindows
```

**Verify installation:**
```bash
az --version
```

### Step 2.2: Login to Azure

```bash
az login
```

This will open a browser window - sign in with your Azure account.

### Step 2.3: Create Resource Group

```bash
# Create a resource group (container for all your Azure resources)
az group create \
  --name meridian-dashboard-rg \
  --location eastus
```

### Step 2.4: Create Azure Storage Account (for JSON data files)

```bash
# Create storage account
az storage account create \
  --name meridiandashdata \
  --resource-group meridian-dashboard-rg \
  --location eastus \
  --sku Standard_LRS

# Get storage account key
az storage account keys list \
  --account-name meridiandashdata \
  --resource-group meridian-dashboard-rg \
  --query "[0].value" -o tsv
```

**Save the storage account key** - you'll need it later.

### Step 2.5: Create Blob Container for JSON files

```bash
# Create container for JSON data
az storage container create \
  --name dashboarddata \
  --account-name meridiandashdata \
  --public-access blob
```

### Step 2.6: Upload JSON Data Files

```bash
# Navigate to your project
cd "C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website"

# Upload all JSON files
az storage blob upload-batch \
  --account-name meridiandashdata \
  --destination dashboarddata \
  --source "data/json" \
  --pattern "*.json"

# Upload dashboard.json from web/public
az storage blob upload \
  --account-name meridiandashdata \
  --container-name dashboarddata \
  --name dashboard.json \
  --file "web/public/dashboard.json"
```

### Step 2.7: Create App Service Plan (Linux)

```bash
# Create Linux-based App Service Plan (free tier for trial)
az appservice plan create \
  --name meridian-dashboard-plan \
  --resource-group meridian-dashboard-rg \
  --location eastus \
  --is-linux \
  --sku B1
```

**Note:** B1 is the cheapest paid tier ($13/month). Free tier (F1) doesn't support Python 3.9+. If you want free, use F1 with Python 3.8.

### Step 2.8: Create Web App for Flask API

```bash
# Create web app
az webapp create \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg \
  --plan meridian-dashboard-plan \
  --runtime "PYTHON:3.11"
```

### Step 2.9: Configure Web App Settings

```bash
# Set startup file
az webapp config set \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg \
  --startup-file "startup.py"

# Set environment variables
az webapp config appsettings set \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg \
  --settings \
    DATA_DIR="/home/data" \
    AZURE_STORAGE_ACCOUNT="meridiandashdata" \
    AZURE_STORAGE_KEY="<YOUR_STORAGE_KEY_FROM_STEP_2.4>"
```

Replace `<YOUR_STORAGE_KEY_FROM_STEP_2.4>` with the actual key.

### Step 2.10: Deploy Flask API Code

**Option A: Deploy via Local Git**

```bash
# Get deployment credentials
az webapp deployment user set \
  --user-name meridian-deploy \
  --password "YourSecurePassword123!"

# Configure local git deployment
az webapp deployment source config-local-git \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg

# This will output a Git URL like:
# https://meridian-deploy@meridian-dashboard-api.scm.azurewebsites.net/meridian-dashboard-api.git
```

**In your project, create git remote and push:**

```bash
cd api

# Initialize git if not already
git init

# Add Azure remote
git remote add azure https://meridian-deploy@meridian-dashboard-api.scm.azurewebsites.net/meridian-dashboard-api.git

# Commit and push
git add .
git commit -m "Initial Azure deployment"
git push azure master
```

**Option B: Deploy via ZIP**

```bash
cd api

# Create deployment package
7z a -tzip deploy.zip * -xr!__pycache__ -xr!*.pyc

# Deploy
az webapp deployment source config-zip \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg \
  --src deploy.zip
```

### Step 2.11: Verify Backend Deployment

```bash
# Open in browser
az webapp browse \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg
```

Visit: `https://meridian-dashboard-api.azurewebsites.net/api/health`

You should see the health check response.

---

## Part 3: Deploy Frontend (React App)

### Step 3.1: Install Azure Static Web Apps CLI

```bash
npm install -g @azure/static-web-apps-cli
```

### Step 3.2: Build Frontend

```bash
cd web

# Install dependencies
npm install

# Build for production
npm run build
```

This creates `web/dist/` folder with compiled app.

### Step 3.3: Create Static Web App

**Via Azure Portal (Easier for beginners):**

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"
5. Fill in:
   - **Subscription:** Your free trial subscription
   - **Resource Group:** meridian-dashboard-rg
   - **Name:** meridian-dashboard-frontend
   - **Region:** East US 2
   - **Deployment source:** Other (we'll upload manually)
6. Click "Review + Create" → "Create"

### Step 3.4: Get Deployment Token

```bash
# Get deployment token from Azure
az staticwebapp secrets list \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --query "properties.apiKey" -o tsv
```

**Save this token** - you'll need it for deployment.

### Step 3.5: Deploy Frontend Build

**Option A: Using Azure CLI**

```bash
cd web

# Deploy using SWA CLI
swa deploy ./dist \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN> \
  --app-name meridian-dashboard-frontend
```

**Option B: Using GitHub Actions (Recommended for continuous deployment)**

1. **Push your code to GitHub:**

```bash
# In project root
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/meridian-dashboard.git
git push -u origin main
```

2. **Configure GitHub deployment in Azure Portal:**
   - Go to Static Web App → "Deployment" → "Configure"
   - Connect to GitHub repository
   - Set build configuration:
     - **App location:** `/web`
     - **API location:** (leave empty)
     - **Output location:** `dist`

Azure will automatically create a GitHub Actions workflow.

### Step 3.6: Configure API URL in Static Web App

```bash
# Update environment variable
az staticwebapp appsettings set \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --setting-names VITE_API_URL=https://meridian-dashboard-api.azurewebsites.net
```

### Step 3.7: Verify Frontend Deployment

```bash
# Get the URL
az staticwebapp show \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --query "defaultHostname" -o tsv
```

Visit: `https://<generated-url>.azurestaticapps.net`

---

## Part 4: Connect Frontend to Backend

### Step 4.1: Update CORS in Backend

**Edit `api/excel_api.py`** and add your Static Web App URL to allowed origins:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://*.azurestaticapps.net",
            "https://meridian-dashboard-frontend-<your-hash>.azurestaticapps.net"
        ]
    }
})
```

Redeploy backend:
```bash
cd api
git add excel_api.py
git commit -m "Update CORS for production"
git push azure master
```

### Step 4.2: Test End-to-End

1. Open your Static Web App URL
2. Navigate to different pages (Sovereign Yields, FX Markets, etc.)
3. Check browser console for errors
4. Verify data loads from backend API

---

## Part 5: Update Data (Manual Upload Method)

Since Excel COM automation won't work on Azure (requires Windows VM), you'll update data manually:

### Step 5.1: Generate New JSON Locally

```bash
# On your local Windows machine
cd etl
python read_dashboard.py
python extract_usa_historical.py
```

### Step 5.2: Upload Updated JSON to Azure

```bash
# Upload dashboard.json
az storage blob upload \
  --account-name meridiandashdata \
  --container-name dashboarddata \
  --name dashboard.json \
  --file "../web/public/dashboard.json" \
  --overwrite

# Upload usa historical yields
az storage blob upload \
  --account-name meridiandashdata \
  --container-name dashboarddata \
  --name usa_historical_yields.json \
  --file "../web/public/usa_historical_yields.json" \
  --overwrite

# Upload CRM data files
az storage blob upload-batch \
  --account-name meridiandashdata \
  --destination dashboarddata \
  --source "../data/json" \
  --pattern "*.json" \
  --overwrite
```

### Step 5.3: Restart Backend (to reload data)

```bash
az webapp restart \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg
```

---

## Part 6: Monitoring and Troubleshooting

### Check Backend Logs

```bash
# Stream live logs
az webapp log tail \
  --name meridian-dashboard-api \
  --resource-group meridian-dashboard-rg
```

### Check Frontend Logs

```bash
# View Static Web App logs in Azure Portal:
# Static Web App → Monitoring → Logs
```

### Common Issues

**Issue 1: API returns 404**
- Check that Flask routes start with `/api/`
- Verify API URL in frontend config
- Check CORS settings

**Issue 2: Data not loading**
- Verify JSON files uploaded to Blob Storage
- Check storage account key in App Service settings
- Restart backend after uploading new data

**Issue 3: Build fails**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check build logs in Azure Portal

---

## Part 7: Estimated Costs (Free Trial Period)

**During free trial (1 month):**
- Static Web Apps: 100 GB bandwidth free/month
- App Service B1: $13/month (~$0.43/day)
- Blob Storage: ~$0.02/month (for small JSON files)
- **Total: ~$13/month** (covered by $200 free credit)

**After free trial:**
- Keep using free tier services where possible
- Consider scaling down to F1 App Service Plan (free)
- Blob Storage costs remain negligible

---

## Part 8: Next Steps (Future Enhancements)

### Step 8.1: Add Custom Domain (Optional)

```bash
# Map custom domain
az staticwebapp hostname set \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --hostname dashboard.meridianuniversal.com
```

### Step 8.2: Enable HTTPS (Automatic)

Azure automatically provisions SSL certificates for Static Web Apps.

### Step 8.3: Add Excel Automation (Future)

**Option A: Azure VM (Windows)**
- Deploy Windows Server 2022 VM
- Install Excel + Python
- Run ETL scripts via scheduled tasks
- Upload results to Blob Storage

**Option B: Azure Functions**
- Create Python Azure Function
- Trigger on schedule (daily/hourly)
- Use API-based data sources (CBonds, Fixer.io, etc.) instead of Excel

---

## Quick Reference Commands

### Deploy Backend Updates
```bash
cd api
git add .
git commit -m "Update message"
git push azure master
```

### Deploy Frontend Updates
```bash
cd web
npm run build
swa deploy ./dist --deployment-token <TOKEN> --app-name meridian-dashboard-frontend
```

### Upload New Data
```bash
az storage blob upload-batch \
  --account-name meridiandashdata \
  --destination dashboarddata \
  --source "data/json" \
  --pattern "*.json" \
  --overwrite
```

### Restart Services
```bash
# Restart backend
az webapp restart --name meridian-dashboard-api --resource-group meridian-dashboard-rg

# No need to restart frontend (static files)
```

---

## Summary

**What you've deployed:**
1. ✅ React frontend → Azure Static Web Apps
2. ✅ Flask backend → Azure App Service (Linux)
3. ✅ JSON data → Azure Blob Storage

**What's NOT deployed (yet):**
1. ❌ Excel COM automation (requires Windows VM)
2. ❌ PDF generation (can be added later)

**Your live URLs:**
- Frontend: `https://meridian-dashboard-frontend-<hash>.azurestaticapps.net`
- Backend API: `https://meridian-dashboard-api.azurewebsites.net`

**Monthly Cost:** ~$13 (covered by free trial credits)

---

## Support Resources

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Author:** Claude Code for Meridian Universal
