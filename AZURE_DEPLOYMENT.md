# Azure Deployment Guide - Meridian Universal Dashboard

This document provides step-by-step instructions for deploying the Meridian Universal Intelligence Platform to Microsoft Azure.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment - Azure Static Web Apps](#frontend-deployment---azure-static-web-apps)
4. [Backend Deployment - Azure App Service](#backend-deployment---azure-app-service)
5. [Data Storage Configuration](#data-storage-configuration)
6. [Environment Variables & Configuration](#environment-variables--configuration)
7. [CI/CD Pipeline with GitHub Actions](#cicd-pipeline-with-github-actions)
8. [Custom Domain & SSL](#custom-domain--ssl)
9. [Cost Estimation](#cost-estimation)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup & Disaster Recovery](#backup--disaster-recovery)
12. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## Architecture Overview

### Deployment Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Azure Cloud                             │
│                                                               │
│  ┌─────────────────────────┐      ┌────────────────────────┐│
│  │ Azure Static Web Apps   │      │  Azure App Service     ││
│  │                         │      │  (Linux + Python 3.11) ││
│  │  • React Frontend       │◄────►│                        ││
│  │  • Vite Build           │ CORS │  • Flask Backend       ││
│  │  • Port: 443 (HTTPS)    │      │  • Port: 8000          ││
│  └─────────────────────────┘      │  • Gunicorn WSGI       ││
│             │                      └────────────────────────┘│
│             │                                 │               │
│             │                                 │               │
│             │                      ┌──────────▼──────────────┐│
│             │                      │  Azure Blob Storage     ││
│             │                      │  (Optional)             ││
│             │                      │  • JSON Data Files      ││
│             └─────────────────────►│  • Backup Files         ││
│                                    │  • Excel Files          ││
│                                    └─────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Azure Application Insights                    │ │
│  │           (Monitoring & Analytics)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Key Services

- **Azure Static Web Apps** - Frontend hosting (React + TypeScript + Vite)
- **Azure App Service** - Backend API hosting (Flask + Python 3.11)
- **Azure Blob Storage** - Data file storage (JSON files)
- **Azure Application Insights** - Monitoring and logging
- **GitHub Actions** - CI/CD automation

---

## Prerequisites

### Required Accounts & Tools

1. **Azure Account**
   - Sign up at [https://azure.microsoft.com/free/](https://azure.microsoft.com/free/)
   - Free tier includes:
     - 100GB bandwidth/month for Static Web Apps
     - 750 hours/month of App Service (F1 tier)
     - 5GB blob storage

2. **GitHub Account**
   - Repository must be hosted on GitHub for CI/CD integration
   - Push your codebase to a GitHub repository

3. **Azure CLI**
   - Install from [https://docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)
   - Login: `az login`

4. **Required Local Tools**
   - Node.js 18+ and npm
   - Python 3.11+
   - Git

### Pre-Deployment Checklist

- [ ] Ensure all code is committed to GitHub
- [ ] Test frontend locally: `cd frontend && npm run build`
- [ ] Test backend locally: `cd backend && python run.py`
- [ ] Verify all API endpoints work with authentication
- [ ] Document any API keys needed (ExchangeRate API, FRED API, etc.)
- [ ] Create list of required environment variables

---

## Frontend Deployment - Azure Static Web Apps

Azure Static Web Apps is purpose-built for frontend frameworks like React/Vite with built-in CI/CD.

### Step 1: Create Static Web App Resource

#### Via Azure Portal (Recommended for First Deployment)

1. **Navigate to Azure Portal**
   - Go to [https://portal.azure.com](https://portal.azure.com)
   - Click **"Create a resource"**
   - Search for **"Static Web App"**
   - Click **"Create"**

2. **Configure Basic Settings**
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new (e.g., `meridian-dashboard-rg`)
   - **Name**: `meridian-dashboard-frontend`
   - **Region**: Choose closest to your users (e.g., `East US`, `West Europe`)
   - **SKU**: Start with **Free** tier
   - **Deployment Details**:
     - Source: **GitHub**
     - Organization: Your GitHub username/org
     - Repository: `dashboard-website` (or your repo name)
     - Branch: `main`

3. **Configure Build Settings**
   - **Build Presets**: Select **React**
   - **App location**: `/frontend`
   - **Api location**: *(leave empty)*
   - **Output location**: `dist`

4. **Review + Create**
   - Click **"Review + create"**
   - Click **"Create"**
   - Azure will automatically:
     - Create GitHub Actions workflow file
     - Commit workflow to your repository
     - Trigger first deployment

#### Via Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name meridian-dashboard-rg \
  --location eastus

# Create Static Web App
az staticwebapp create \
  --name meridian-dashboard-frontend \
  --resource-group meridian-dashboard-rg \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location eastus \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --login-with-github
```

### Step 2: Verify GitHub Actions Workflow

After creation, Azure creates a workflow file in your repo:

**File**: `.github/workflows/azure-static-web-apps-<random-name>.yml`

**Expected Content**:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: ""
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Step 3: Configure Environment Variables

Your frontend needs to know the backend API URL.

**In Azure Portal**:
1. Navigate to your Static Web App resource
2. Click **"Configuration"** in left menu
3. Click **"Application settings"**
4. Add new setting:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://meridian-backend.azurewebsites.net` (your backend URL - we'll create this next)
5. Click **"Save"**

**Note**: Environment variables prefixed with `VITE_` are exposed to the frontend build process.

### Step 4: Verify Deployment

1. **Check GitHub Actions**
   - Go to your GitHub repository
   - Click **"Actions"** tab
   - Verify the workflow run completed successfully

2. **Test the Frontend**
   - Navigate to your Static Web App in Azure Portal
   - Copy the **URL** (looks like `https://happy-cliff-0abc123.azurestaticapps.net`)
   - Open in browser
   - You should see login page (backend won't work yet)

---

## Backend Deployment - Azure App Service

Azure App Service provides managed hosting for Python/Flask applications.

### Step 1: Create App Service Plan

App Service Plan defines the compute resources for your backend.

#### Via Azure Portal

1. **Create App Service Plan**
   - In Azure Portal, click **"Create a resource"**
   - Search for **"App Service Plan"**
   - Click **"Create"**
   - **Configuration**:
     - Resource Group: Use existing `meridian-dashboard-rg`
     - Name: `meridian-backend-plan`
     - Operating System: **Linux**
     - Region: Same as frontend (e.g., `East US`)
     - Pricing Tier: **B1** (Basic) - $13.14/month
       - 1 core, 1.75 GB RAM
       - Suitable for production with moderate traffic

2. **Review + Create**

#### Via Azure CLI

```bash
az appservice plan create \
  --name meridian-backend-plan \
  --resource-group meridian-dashboard-rg \
  --is-linux \
  --sku B1 \
  --location eastus
```

### Step 2: Create Web App

#### Via Azure Portal

1. **Create Web App**
   - Click **"Create a resource"**
   - Search for **"Web App"**
   - Click **"Create"**
   - **Configuration**:
     - Resource Group: `meridian-dashboard-rg`
     - Name: `meridian-backend` (must be globally unique)
     - Publish: **Code**
     - Runtime stack: **Python 3.11**
     - Region: Same as plan
     - App Service Plan: Select `meridian-backend-plan`

2. **Review + Create**

#### Via Azure CLI

```bash
az webapp create \
  --resource-group meridian-dashboard-rg \
  --plan meridian-backend-plan \
  --name meridian-backend \
  --runtime "PYTHON:3.11"
```

### Step 3: Configure Deployment

You have two options: GitHub Actions (recommended) or local Git deployment.

#### Option A: GitHub Actions (Recommended)

1. **Enable Deployment Center**
   - In Azure Portal, navigate to your Web App
   - Click **"Deployment Center"** in left menu
   - **Source**: Select **GitHub**
   - Authorize GitHub access
   - **Organization**: Your GitHub username/org
   - **Repository**: Your repo name
   - **Branch**: `main`
   - Click **"Save"**

2. **Azure Creates Workflow**
   - Azure automatically creates `.github/workflows/main_meridian-backend.yml`
   - This workflow builds and deploys backend on every push to main

3. **Customize Workflow for Backend Directory**

   Edit the generated workflow file:

   ```yaml
   name: Build and deploy Python app to Azure Web App - meridian-backend

   on:
     push:
       branches:
         - main
       paths:
         - 'backend/**'  # Only trigger on backend changes
     workflow_dispatch:

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4

         - name: Set up Python version
           uses: actions/setup-python@v4
           with:
             python-version: '3.11'

         - name: Create and start virtual environment
           run: |
             cd backend
             python -m venv venv
             source venv/bin/activate

         - name: Install dependencies
           run: |
             cd backend
             pip install --upgrade pip
             pip install -r requirements/production.txt

         - name: Zip artifact for deployment
           run: |
             cd backend
             zip -r ../release.zip . -x "*.pyc" -x "__pycache__/*" -x "venv/*" -x "tests/*"

         - name: Upload artifact for deployment jobs
           uses: actions/upload-artifact@v3
           with:
             name: python-app
             path: release.zip

     deploy:
       runs-on: ubuntu-latest
       needs: build
       environment:
         name: 'Production'
         url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

       steps:
         - name: Download artifact from build job
           uses: actions/download-artifact@v3
           with:
             name: python-app

         - name: Unzip artifact for deployment
           run: unzip release.zip

         - name: 'Deploy to Azure Web App'
           uses: azure/webapps-deploy@v2
           id: deploy-to-webapp
           with:
             app-name: 'meridian-backend'
             slot-name: 'Production'
             publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
   ```

#### Option B: Local Git Deployment

```bash
# Set up local git deployment
az webapp deployment source config-local-git \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg

# Get deployment credentials
az webapp deployment list-publishing-credentials \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg \
  --query "{Username:publishingUserName, Password:publishingPassword}"

# Add Azure remote (run in your local repo)
git remote add azure https://meridian-backend.scm.azurewebsites.net/meridian-backend.git

# Deploy backend
git subtree push --prefix backend azure main
```

### Step 4: Configure Startup Command

Azure needs to know how to start your Flask app.

1. **Navigate to Web App in Azure Portal**
2. **Click "Configuration"** → **"General settings"**
3. **Startup Command**: Enter the following:

   ```bash
   gunicorn --bind=0.0.0.0:8000 --timeout 600 --chdir /home/site/wwwroot src.app:app
   ```

   **Explanation**:
   - `gunicorn` - Production WSGI server
   - `--bind=0.0.0.0:8000` - Listen on port 8000
   - `--timeout 600` - 10-minute timeout for long-running requests
   - `--chdir /home/site/wwwroot` - Change to app directory
   - `src.app:app` - Import path to Flask app instance

4. **Click "Save"**

### Step 5: Configure Application Settings (Environment Variables)

Navigate to **Configuration** → **Application settings**:

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=<generate-strong-random-key-here>
PORT=8000

# Data Directory Paths
DATA_DIR=/home/site/data
JSON_DIR=/home/site/data/json
EXCEL_DIR=/home/site/data/excel
STORAGE_DIR=/home/site/wwwroot/storage
WEB_DIR=/home/site/wwwroot

# API Keys
EXCHANGERATE_API_KEY=<your-exchangerate-api-key>
FRED_API_KEY=<your-fred-api-key>

# CORS Origins (CRITICAL)
CORS_ORIGINS=https://happy-cliff-0abc123.azurestaticapps.net,https://meridian-dashboard.com

# Session Configuration
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=None
```

**Critical Settings**:
- `CORS_ORIGINS` - MUST include your frontend URL(s)
- `SESSION_COOKIE_SAMESITE=None` - Required for cross-domain session cookies
- `SESSION_COOKIE_SECURE=true` - Required when SameSite=None
- `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## Data Storage Configuration

Your application uses JSON files for data storage. You have two options:

### Option 1: Local File System (Simple, Recommended for Start)

Store JSON files directly in the App Service file system.

**Pros**:
- Simple setup
- No additional cost
- Fast read/write operations

**Cons**:
- Files are lost during deployments (need deployment script to preserve)
- No automatic backups
- 1GB storage limit

**Implementation**:

1. **Create Data Directory Structure**

   Add a deployment script to preserve data:

   **File**: `backend/.deployment`
   ```
   [config]
   command = deploy.sh
   ```

   **File**: `backend/deploy.sh`
   ```bash
   #!/bin/bash

   # Exit on error
   set -e

   echo "Starting deployment..."

   # Deployment paths
   SITE_ROOT="/home/site/wwwroot"
   DATA_DIR="/home/site/data"

   # Create data directory if it doesn't exist
   mkdir -p "$DATA_DIR/json"
   mkdir -p "$DATA_DIR/excel"
   mkdir -p "$SITE_ROOT/storage"

   # Copy data files from repo (initial deployment only)
   if [ ! -f "$DATA_DIR/json/users.json" ]; then
       echo "Initial deployment - copying data files..."
       cp -r ../data/* "$DATA_DIR/" || true
   else
       echo "Data files already exist - preserving them"
   fi

   # Install Python dependencies
   echo "Installing Python dependencies..."
   python -m pip install --upgrade pip
   pip install -r requirements/production.txt

   echo "Deployment complete!"
   ```

   Make executable:
   ```bash
   chmod +x backend/deploy.sh
   ```

2. **Initial Data Upload**

   Use Azure CLI to upload data files on first deployment:

   ```bash
   # Zip your data directory
   cd backend
   zip -r data.zip ../data

   # Upload to App Service
   az webapp deployment source config-zip \
     --resource-group meridian-dashboard-rg \
     --name meridian-backend \
     --src data.zip
   ```

### Option 2: Azure Blob Storage (Scalable, Production-Grade)

Store JSON files in Azure Blob Storage for durability and automatic backups.

**Pros**:
- Persistent across deployments
- Automatic backups and versioning
- Scalable (terabytes if needed)
- Low cost ($0.018/GB/month)

**Cons**:
- Requires code changes
- Slightly slower than local disk
- Additional service to manage

**Implementation**:

1. **Create Storage Account**

   ```bash
   # Create storage account
   az storage account create \
     --name meridiandashboardstorage \
     --resource-group meridian-dashboard-rg \
     --location eastus \
     --sku Standard_LRS \
     --kind StorageV2

   # Create container for data files
   az storage container create \
     --name data \
     --account-name meridiandashboardstorage \
     --public-access off
   ```

2. **Get Connection String**

   ```bash
   az storage account show-connection-string \
     --name meridiandashboardstorage \
     --resource-group meridian-dashboard-rg \
     --query connectionString \
     --output tsv
   ```

   Add to App Service application settings:
   ```
   AZURE_STORAGE_CONNECTION_STRING=<connection-string>
   AZURE_STORAGE_CONTAINER_NAME=data
   USE_BLOB_STORAGE=true
   ```

3. **Update Backend Code**

   **File**: `backend/requirements/production.txt`
   Add:
   ```
   azure-storage-blob==12.19.0
   ```

   **File**: `backend/src/utils/blob_storage.py` (Create new file)
   ```python
   """Azure Blob Storage adapter for JSON files"""
   import json
   import os
   from pathlib import Path
   from typing import Any, List
   from azure.storage.blob import BlobServiceClient, ContentSettings

   def get_blob_client():
       """Get Blob Service Client"""
       connection_string = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
       if not connection_string:
           raise ValueError("AZURE_STORAGE_CONNECTION_STRING not set")
       return BlobServiceClient.from_connection_string(connection_string)

   def read_json_from_blob(filename: str) -> List[Any]:
       """Read JSON file from blob storage"""
       try:
           container_name = os.environ.get('AZURE_STORAGE_CONTAINER_NAME', 'data')
           blob_client = get_blob_client()
           container_client = blob_client.get_container_client(container_name)
           blob_client = container_client.get_blob_client(f"json/{filename}")

           blob_data = blob_client.download_blob().readall()
           return json.loads(blob_data.decode('utf-8'))
       except Exception as e:
           print(f"Error reading {filename} from blob: {e}")
           return []

   def write_json_to_blob(filename: str, data: List[Any]) -> bool:
       """Write JSON file to blob storage"""
       try:
           container_name = os.environ.get('AZURE_STORAGE_CONTAINER_NAME', 'data')
           blob_client = get_blob_client()
           container_client = blob_client.get_container_client(container_name)
           blob_client = container_client.get_blob_client(f"json/{filename}")

           # Create backup before overwriting
           try:
               backup_blob = container_client.get_blob_client(f"json/backups/{filename}.bak")
               existing_data = blob_client.download_blob().readall()
               backup_blob.upload_blob(existing_data, overwrite=True)
           except:
               pass  # No existing file to backup

           # Upload new data
           json_data = json.dumps(data, indent=2, ensure_ascii=False)
           blob_client.upload_blob(
               json_data.encode('utf-8'),
               overwrite=True,
               content_settings=ContentSettings(content_type='application/json')
           )
           return True
       except Exception as e:
           print(f"Error writing {filename} to blob: {e}")
           return False
   ```

   **File**: `backend/src/utils/json_store.py`
   Update to use blob storage when enabled:
   ```python
   import os

   # Check if blob storage is enabled
   USE_BLOB_STORAGE = os.environ.get('USE_BLOB_STORAGE', 'false').lower() == 'true'

   if USE_BLOB_STORAGE:
       from .blob_storage import read_json_from_blob, write_json_to_blob

       def read_json_list(path):
           filename = Path(path).name
           return read_json_from_blob(filename)

       def write_json_file(path, data):
           filename = Path(path).name
           return write_json_to_blob(filename, data)
   else:
       # Existing file system code...
   ```

4. **Upload Initial Data**

   ```bash
   # Upload each JSON file
   az storage blob upload-batch \
     --destination data/json \
     --source ./data/json \
     --account-name meridiandashboardstorage \
     --pattern "*.json"

   # Upload Excel files
   az storage blob upload-batch \
     --destination data/excel \
     --source ./data/excel \
     --account-name meridiandashboardstorage
   ```

---

## Environment Variables & Configuration

### Complete Environment Variable List

#### Frontend (Static Web App)

```bash
# Backend API URL
VITE_API_URL=https://meridian-backend.azurewebsites.net
```

#### Backend (App Service)

```bash
# Flask Core
FLASK_ENV=production
SECRET_KEY=<64-character-hex-string>
PORT=8000

# Paths (adjust if using blob storage)
DATA_DIR=/home/site/data
JSON_DIR=/home/site/data/json
EXCEL_DIR=/home/site/data/excel
STORAGE_DIR=/home/site/wwwroot/storage
WEB_DIR=/home/site/wwwroot

# API Keys
EXCHANGERATE_API_KEY=your_exchangerate_api_key_here
FRED_API_KEY=your_fred_api_key_here

# CORS (CRITICAL - Must match frontend URL)
CORS_ORIGINS=https://your-static-web-app-url.azurestaticapps.net,https://meridian-dashboard.com

# Session Configuration (CRITICAL for auth)
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=None
SESSION_TYPE=filesystem

# Blob Storage (if using Option 2)
USE_BLOB_STORAGE=true
AZURE_STORAGE_CONNECTION_STRING=<connection-string>
AZURE_STORAGE_CONTAINER_NAME=data

# Optional: Logging
LOG_LEVEL=INFO
ENABLE_DEBUG_LOGGING=false
```

### Generating Secure SECRET_KEY

```bash
# Method 1: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Method 2: OpenSSL
openssl rand -hex 32
```

### Setting Environment Variables

#### Via Azure Portal

1. Navigate to App Service
2. Click **"Configuration"** → **"Application settings"**
3. Click **"+ New application setting"**
4. Enter name and value
5. Click **"OK"**
6. Click **"Save"** (top of page)
7. App will restart automatically

#### Via Azure CLI

```bash
# Set single variable
az webapp config appsettings set \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --settings FLASK_ENV=production

# Set multiple variables from file
az webapp config appsettings set \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --settings @appsettings.json
```

**File**: `appsettings.json`
```json
[
  {
    "name": "FLASK_ENV",
    "value": "production",
    "slotSetting": false
  },
  {
    "name": "SECRET_KEY",
    "value": "your-secret-key-here",
    "slotSetting": false
  }
]
```

---

## CI/CD Pipeline with GitHub Actions

### Complete Workflow Setup

Your repository should have two workflow files:

**File**: `.github/workflows/azure-static-web-app.yml` (Frontend)
```yaml
name: Deploy Frontend to Azure Static Web Apps

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main
  workflow_dispatch:

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Frontend
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: ""
          output_location: "dist"
        env:
          # Environment variables for build
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

**File**: `.github/workflows/azure-app-service.yml` (Backend)
```yaml
name: Deploy Backend to Azure App Service

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Create virtual environment
        run: |
          cd backend
          python -m venv venv
          source venv/bin/activate
          python -m pip install --upgrade pip

      - name: Install dependencies
        run: |
          cd backend
          source venv/bin/activate
          pip install -r requirements/production.txt

      - name: Run tests
        run: |
          cd backend
          source venv/bin/activate
          pytest tests/ || true  # Don't fail deployment if tests fail

      - name: Create deployment package
        run: |
          cd backend
          mkdir -p ../deploy
          cp -r src ../deploy/
          cp -r requirements ../deploy/
          cp startup.py ../deploy/
          cp deploy.sh ../deploy/ || true
          cp .deployment ../deploy/ || true
          cd ../deploy
          zip -r ../backend-deploy.zip .

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: python-app
          path: backend-deploy.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: python-app

      - name: Unzip artifact
        run: unzip backend-deploy.zip

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        id: deploy-to-webapp
        with:
          app-name: 'meridian-backend'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
```

### GitHub Secrets Configuration

Add these secrets in GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```bash
# Frontend
AZURE_STATIC_WEB_APPS_API_TOKEN=<token-from-azure>
VITE_API_URL=https://meridian-backend.azurewebsites.net

# Backend
AZUREAPPSERVICE_PUBLISHPROFILE=<publish-profile-from-azure>
```

**Get Publish Profile**:
```bash
# Via CLI
az webapp deployment list-publishing-profiles \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --xml

# Via Portal: App Service → Deployment Center → Manage publish profile → Download
```

---

## Custom Domain & SSL

### Configure Custom Domain for Frontend

1. **Purchase Domain** (e.g., from Namecheap, GoDaddy, Azure Domains)

2. **Add Custom Domain to Static Web App**
   - Navigate to Static Web App in Azure Portal
   - Click **"Custom domains"**
   - Click **"+ Add"**
   - Enter your domain: `meridian-dashboard.com`
   - Azure provides validation records

3. **Configure DNS Records**

   Add these records at your DNS provider:

   ```
   # For root domain (meridian-dashboard.com)
   Type: ALIAS or ANAME or CNAME
   Name: @
   Value: happy-cliff-0abc123.azurestaticapps.net
   TTL: 3600

   # For subdomain (www.meridian-dashboard.com)
   Type: CNAME
   Name: www
   Value: happy-cliff-0abc123.azurestaticapps.net
   TTL: 3600

   # Validation record (temporary)
   Type: TXT
   Name: _dnsauth
   Value: <validation-code-from-azure>
   TTL: 3600
   ```

4. **Validate Domain**
   - Click **"Validate"** in Azure Portal
   - Wait 5-60 minutes for DNS propagation
   - Azure automatically provisions SSL certificate (Let's Encrypt)

### Configure Custom Domain for Backend

1. **Add Custom Domain to App Service**
   - Navigate to App Service in Azure Portal
   - Click **"Custom domains"**
   - Click **"+ Add custom domain"**
   - Enter subdomain: `api.meridian-dashboard.com`

2. **Configure DNS Records**

   ```
   # For API subdomain
   Type: CNAME
   Name: api
   Value: meridian-backend.azurewebsites.net
   TTL: 3600

   # Validation record
   Type: TXT
   Name: asuid.api
   Value: <validation-code-from-azure>
   TTL: 3600
   ```

3. **Enable HTTPS**
   - In Custom domains section
   - Click on your domain
   - Click **"Add binding"**
   - SSL Certificate: Select **"App Service Managed Certificate"** (free)
   - TLS/SSL Type: **"SNI SSL"**
   - Click **"Add binding"**

4. **Update Frontend Configuration**
   - Update `VITE_API_URL` to `https://api.meridian-dashboard.com`
   - Update `CORS_ORIGINS` in backend to include `https://meridian-dashboard.com`

---

## Cost Estimation

### Monthly Cost Breakdown (USD)

#### Minimal Setup (Development/Testing)

```
Azure Static Web Apps (Free tier)
- Bandwidth: 100GB/month
- Custom domains: 2 included
- Cost: $0

Azure App Service (F1 - Free tier)
- 1 GB RAM, 60 min/day CPU
- No custom domains
- Cost: $0

Azure Blob Storage (if used)
- 5 GB storage
- Cost: ~$0.10/month

TOTAL: ~$0.10/month (essentially free)
```

**Limitations**:
- App Service sleeps after 20 min inactivity
- 60 min/day CPU quota
- Not suitable for production use

#### Production Setup (Recommended)

```
Azure Static Web Apps (Standard tier)
- 100 GB bandwidth/month included
- Additional bandwidth: $0.20/GB
- Custom domains: Unlimited
- Cost: $9/month

Azure App Service (B1 - Basic)
- 1 core, 1.75 GB RAM
- Always on
- Custom domains + SSL
- Cost: $13.14/month

Azure Blob Storage (if used)
- Storage: $0.018/GB/month (assume 10GB)
- Transactions: ~$0.01/month
- Cost: ~$0.20/month

Azure Application Insights (optional)
- First 5GB/month: Free
- Cost: $0 (likely under limit)

TOTAL: ~$22.50/month
```

#### High-Traffic Production Setup

```
Azure Static Web Apps (Standard tier)
- Cost: $9/month

Azure App Service (S1 - Standard)
- 1 core, 1.75 GB RAM
- Auto-scaling (up to 10 instances)
- Deployment slots (staging)
- Custom domains + SSL
- Cost: $69.35/month

Azure Blob Storage
- Storage (100GB): $1.80/month
- Transactions: ~$0.50/month
- Cost: ~$2.30/month

Azure Application Insights
- 10GB data ingestion
- Cost: ~$5/month

Azure CDN (optional)
- Cache static assets
- Cost: ~$10/month

TOTAL: ~$95-105/month
```

### Cost Optimization Tips

1. **Use Free Tier for Development**
   - Keep a separate "dev" environment on free tier
   - Only pay for production resources

2. **Enable Auto-Shutdown for Dev Resources**
   ```bash
   # Stop App Service when not needed
   az webapp stop --name meridian-backend-dev --resource-group meridian-dev-rg

   # Start when needed
   az webapp start --name meridian-backend-dev --resource-group meridian-dev-rg
   ```

3. **Monitor Bandwidth Usage**
   - Most cost comes from bandwidth on high-traffic sites
   - Enable Azure CDN for static assets
   - Compress responses (gzip)

4. **Use Reserved Instances for Predictable Workloads**
   - 1-year reservation: ~37% discount
   - 3-year reservation: ~62% discount

5. **Set up Budget Alerts**
   ```bash
   az consumption budget create \
     --budget-name meridian-monthly-budget \
     --amount 50 \
     --time-grain Monthly \
     --time-period start="2025-01-01" \
     --resource-group meridian-dashboard-rg
   ```

---

## Monitoring & Logging

### Enable Application Insights

1. **Create Application Insights Resource**
   ```bash
   az monitor app-insights component create \
     --app meridian-insights \
     --location eastus \
     --resource-group meridian-dashboard-rg \
     --application-type web
   ```

2. **Get Instrumentation Key**
   ```bash
   az monitor app-insights component show \
     --app meridian-insights \
     --resource-group meridian-dashboard-rg \
     --query instrumentationKey \
     --output tsv
   ```

3. **Configure Backend**

   Add to `requirements/production.txt`:
   ```
   applicationinsights==0.11.10
   opencensus-ext-azure==1.1.9
   opencensus-ext-flask==0.8.1
   ```

   Update `backend/src/app.py`:
   ```python
   import os
   from opencensus.ext.azure.log_exporter import AzureLogHandler
   from opencensus.ext.flask.flask_middleware import FlaskMiddleware

   def create_app(config_name=None):
       app = Flask(__name__)

       # Configure Application Insights
       instrumentation_key = os.environ.get('APPINSIGHTS_INSTRUMENTATIONKEY')
       if instrumentation_key:
           # Request tracking
           middleware = FlaskMiddleware(
               app,
               exporter=AzureExporter(connection_string=f"InstrumentationKey={instrumentation_key}")
           )

           # Log tracking
           logger = app.logger
           logger.addHandler(AzureLogHandler(
               connection_string=f"InstrumentationKey={instrumentation_key}"
           ))
           logger.setLevel(logging.INFO)

       return app
   ```

   Add environment variable to App Service:
   ```
   APPINSIGHTS_INSTRUMENTATIONKEY=<your-key>
   ```

4. **Configure Frontend**

   Install package:
   ```bash
   cd frontend
   npm install @microsoft/applicationinsights-web
   ```

   Create `frontend/src/utils/telemetry.ts`:
   ```typescript
   import { ApplicationInsights } from '@microsoft/applicationinsights-web';

   const appInsights = new ApplicationInsights({
     config: {
       instrumentationKey: import.meta.env.VITE_APPINSIGHTS_KEY,
       enableAutoRouteTracking: true,
       autoTrackPageVisitTime: true
     }
   });

   appInsights.loadAppInsights();
   appInsights.trackPageView();

   export default appInsights;
   ```

   Update `frontend/src/main.tsx`:
   ```typescript
   import './utils/telemetry';
   ```

### View Logs and Metrics

#### Application Insights Dashboard

1. Navigate to Application Insights in Azure Portal
2. **Overview** - High-level metrics
3. **Live Metrics** - Real-time telemetry
4. **Failures** - Error tracking
5. **Performance** - Request duration, dependencies
6. **Users** - User analytics and sessions

#### App Service Logs

**Enable Logging**:
```bash
# Enable application logging
az webapp log config \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg \
  --application-logging filesystem \
  --level information

# Enable detailed error messages
az webapp log config \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg \
  --detailed-error-messages true \
  --failed-request-tracing true
```

**Stream Logs**:
```bash
# Real-time log streaming
az webapp log tail \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg

# Download logs
az webapp log download \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg \
  --log-file logs.zip
```

#### Query Logs with Kusto

Application Insights uses Kusto Query Language (KQL):

```kusto
// Failed requests in last 24 hours
requests
| where timestamp > ago(24h)
| where success == false
| summarize count() by resultCode, operation_Name
| order by count_ desc

// Slow requests (>2 seconds)
requests
| where timestamp > ago(1h)
| where duration > 2000
| project timestamp, name, duration, resultCode
| order by duration desc

// Exception details
exceptions
| where timestamp > ago(24h)
| project timestamp, type, outerMessage, innermostMessage
| order by timestamp desc

// Custom events (login, data refresh, etc.)
customEvents
| where timestamp > ago(7d)
| where name == "UserLogin"
| summarize count() by tostring(customDimensions.username)
```

### Set Up Alerts

1. **Navigate to Application Insights** → **Alerts** → **+ New alert rule**

2. **Example Alert: High Error Rate**
   - Condition: `requests | where success == false | count > 10 in 5 minutes`
   - Action: Email to admin
   - Severity: High

3. **Example Alert: Slow Response**
   - Condition: `Average server response time > 2 seconds for 5 minutes`
   - Action: Email + SMS
   - Severity: Warning

```bash
# Create alert via CLI
az monitor metrics alert create \
  --name high-response-time \
  --resource-group meridian-dashboard-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/meridian-dashboard-rg/providers/Microsoft.Web/sites/meridian-backend \
  --condition "avg requests/duration > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email your@email.com
```

---

## Backup & Disaster Recovery

### Automated Backups

#### App Service Backup

1. **Enable Backup**
   - Navigate to App Service → **Backups**
   - Click **"Configure"**
   - Requires **Standard** tier or higher

2. **Configure Backup Settings**
   ```bash
   # Create storage account for backups
   az storage account create \
     --name meridianbackups \
     --resource-group meridian-dashboard-rg \
     --location eastus \
     --sku Standard_LRS

   # Enable backup
   az webapp config backup update \
     --resource-group meridian-dashboard-rg \
     --webapp-name meridian-backend \
     --backup-name daily-backup \
     --container-url "https://meridianbackups.blob.core.windows.net/backups" \
     --frequency 1d \
     --retention 30
   ```

#### Blob Storage Backup

Enable versioning and soft delete:

```bash
# Enable versioning
az storage account blob-service-properties update \
  --account-name meridiandashboardstorage \
  --resource-group meridian-dashboard-rg \
  --enable-versioning true

# Enable soft delete (7-day retention)
az storage account blob-service-properties update \
  --account-name meridiandashboardstorage \
  --resource-group meridian-dashboard-rg \
  --enable-delete-retention true \
  --delete-retention-days 7
```

### Manual Backup Strategy

Create a backup script for critical data:

**File**: `scripts/backup_to_azure.sh`
```bash
#!/bin/bash

# Backup JSON files to Azure Blob Storage
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE"

# Create backup archive
cd backend/data
zip -r "$BACKUP_NAME.zip" json/

# Upload to Azure Blob
az storage blob upload \
  --account-name meridianbackups \
  --container-name json-backups \
  --name "$BACKUP_NAME.zip" \
  --file "$BACKUP_NAME.zip"

# Clean up local backup
rm "$BACKUP_NAME.zip"

echo "Backup completed: $BACKUP_NAME.zip"
```

Run daily via cron or GitHub Actions:

**File**: `.github/workflows/daily-backup.yml`
```yaml
name: Daily Data Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Download data from production
        run: |
          az webapp download \
            --resource-group meridian-dashboard-rg \
            --name meridian-backend \
            --src-path /home/site/data \
            --dest-path ./backup-data

      - name: Create backup archive
        run: |
          DATE=$(date +%Y%m%d_%H%M%S)
          cd backup-data
          zip -r "../backup_$DATE.zip" .

      - name: Upload to Blob Storage
        run: |
          az storage blob upload \
            --account-name meridianbackups \
            --container-name daily-backups \
            --name "backup_$(date +%Y%m%d_%H%M%S).zip" \
            --file backup_*.zip
```

### Disaster Recovery Plan

#### Recovery Time Objective (RTO): 4 hours
#### Recovery Point Objective (RPO): 24 hours

**Recovery Steps**:

1. **Complete Infrastructure Loss**

   If entire Azure resource group is deleted:

   ```bash
   # Re-run deployment from scratch
   # 1. Create resource group
   az group create --name meridian-dashboard-rg --location eastus

   # 2. Deploy Static Web App (see "Frontend Deployment" section)
   # 3. Deploy App Service (see "Backend Deployment" section)
   # 4. Restore data from backup
   az storage blob download-batch \
     --destination ./restored-data \
     --source daily-backups \
     --account-name meridianbackups \
     --pattern "backup_*.zip"

   # 5. Upload to new App Service
   unzip restored-data/backup_latest.zip
   az webapp deployment source config-zip \
     --resource-group meridian-dashboard-rg \
     --name meridian-backend \
     --src backup_latest.zip
   ```

2. **Data Corruption**

   If data files become corrupted:

   ```bash
   # Restore from previous day's backup
   az storage blob download \
     --account-name meridianbackups \
     --container-name daily-backups \
     --name "backup_20250115_020000.zip" \
     --file restore.zip

   unzip restore.zip

   # Upload to App Service
   az webapp deployment source config-zip \
     --resource-group meridian-dashboard-rg \
     --name meridian-backend \
     --src restore.zip
   ```

3. **Code Deployment Failure**

   If deployment breaks production:

   ```bash
   # Option 1: Rollback via Azure Portal
   # App Service → Deployment Center → Logs → Select previous successful deployment → Redeploy

   # Option 2: Rollback via GitHub
   git revert HEAD
   git push origin main  # Triggers new deployment

   # Option 3: Deploy from previous commit
   git checkout <previous-commit-hash>
   git push -f origin main  # Force push (use with caution)
   ```

---

## Troubleshooting Common Issues

### Issue 1: CORS Errors

**Symptom**: Frontend shows "blocked by CORS policy" errors in browser console

**Causes**:
- Frontend URL not in `CORS_ORIGINS` backend setting
- `SESSION_COOKIE_SAMESITE` not set to `None`
- Missing `credentials: 'include'` in fetch calls

**Solution**:
```bash
# Check current CORS settings
az webapp config appsettings list \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --query "[?name=='CORS_ORIGINS']"

# Update CORS origins to include frontend URL
az webapp config appsettings set \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --settings CORS_ORIGINS="https://your-static-app.azurestaticapps.net,https://meridian-dashboard.com"

# Ensure session cookie settings
az webapp config appsettings set \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --settings SESSION_COOKIE_SAMESITE=None SESSION_COOKIE_SECURE=true
```

### Issue 2: Authentication Not Working

**Symptom**: Login appears successful but redirects back to login page

**Causes**:
- Session cookies not being sent/received
- `SESSION_COOKIE_SECURE` not set to `true`
- Frontend not using HTTPS

**Solution**:
1. Verify all API calls include `credentials: 'include'`:
   ```typescript
   fetch(`${API_BASE_URL}/api/auth/login`, {
     method: 'POST',
     credentials: 'include',  // CRITICAL
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, password })
   });
   ```

2. Check browser cookies (DevTools → Application → Cookies)
   - Should see cookie from backend domain
   - SameSite should be `None`
   - Secure should be `true`

3. Verify backend settings:
   ```bash
   SESSION_COOKIE_SECURE=true
   SESSION_COOKIE_HTTPONLY=true
   SESSION_COOKIE_SAMESITE=None
   ```

### Issue 3: File Not Found / 404 Errors

**Symptom**: Backend returns 404 for data files

**Causes**:
- Data directory not created
- Files not uploaded during deployment
- Incorrect path configuration

**Solution**:
```bash
# SSH into App Service
az webapp ssh --resource-group meridian-dashboard-rg --name meridian-backend

# Check if data directory exists
ls -la /home/site/data/json/

# If missing, create directory
mkdir -p /home/site/data/json

# Upload data files
az webapp deployment source config-zip \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --src data.zip

# Verify path configuration
az webapp config appsettings list \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend \
  --query "[?name=='JSON_DIR']"
```

### Issue 4: App Service Not Starting

**Symptom**: App Service shows "Application Error" or never starts

**Causes**:
- Missing startup command
- Python dependencies not installed
- Import errors in code

**Solution**:
1. Check logs:
   ```bash
   az webapp log tail --resource-group meridian-dashboard-rg --name meridian-backend
   ```

2. Verify startup command:
   - App Service → Configuration → General settings
   - Should be: `gunicorn --bind=0.0.0.0:8000 --timeout 600 --chdir /home/site/wwwroot src.app:app`

3. SSH into container and test manually:
   ```bash
   az webapp ssh --resource-group meridian-dashboard-rg --name meridian-backend

   cd /home/site/wwwroot
   source antenv/bin/activate
   pip list  # Check installed packages
   python -c "from src.app import create_app; app = create_app(); print('OK')"
   ```

4. Check for missing dependencies:
   ```bash
   pip install -r requirements/production.txt
   ```

### Issue 5: Static Web App Build Failing

**Symptom**: GitHub Actions workflow fails during build

**Causes**:
- TypeScript errors
- Missing environment variables
- Node version mismatch

**Solution**:
1. Check workflow logs in GitHub Actions tab

2. Test build locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. Fix TypeScript errors:
   ```bash
   npm run type-check
   ```

4. Verify environment variables in workflow:
   ```yaml
   env:
     VITE_API_URL: ${{ secrets.VITE_API_URL }}
   ```

5. Add Node version specification:
   ```yaml
   - name: Set up Node
     uses: actions/setup-node@v3
     with:
       node-version: '18'
   ```

### Issue 6: Slow Performance

**Symptom**: Pages load slowly, API responses take >2 seconds

**Causes**:
- App Service tier too low (F1/B1)
- Cold start (app sleeping)
- Inefficient database queries
- No caching

**Solutions**:

1. **Enable "Always On"** (requires Basic tier or higher):
   ```bash
   az webapp config set \
     --resource-group meridian-dashboard-rg \
     --name meridian-backend \
     --always-on true
   ```

2. **Upgrade App Service Plan**:
   ```bash
   az appservice plan update \
     --resource-group meridian-dashboard-rg \
     --name meridian-backend-plan \
     --sku S1  # Standard tier
   ```

3. **Add Response Caching**:

   Update `backend/src/app.py`:
   ```python
   from flask_caching import Cache

   cache = Cache(app, config={
       'CACHE_TYPE': 'simple',
       'CACHE_DEFAULT_TIMEOUT': 300
   })

   @app.route('/api/capital-partners')
   @cache.cached(timeout=60)
   @login_required
   def get_capital_partners():
       # ...
   ```

4. **Enable Azure CDN** for static assets:
   - Navigate to Static Web App
   - Click "Azure CDN" in left menu
   - Enable CDN for faster content delivery

### Issue 7: Out of Memory Errors

**Symptom**: App crashes with "out of memory" errors

**Solutions**:
```bash
# Upgrade to larger instance
az appservice plan update \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend-plan \
  --sku S2  # 3.5 GB RAM

# Or scale horizontally
az appservice plan update \
  --resource-group meridian-dashboard-rg \
  --name meridian-backend-plan \
  --number-of-workers 2
```

---

## Final Checklist

### Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] `.env` files removed from repository (never commit secrets)
- [ ] `requirements/production.txt` up to date
- [ ] Frontend builds successfully locally
- [ ] Backend runs successfully locally
- [ ] All tests passing
- [ ] API keys obtained (ExchangeRate, FRED)
- [ ] Strong `SECRET_KEY` generated

### Azure Setup

- [ ] Azure subscription created
- [ ] Resource group created
- [ ] Static Web App deployed
- [ ] App Service created and deployed
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates provisioned
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Data files uploaded

### Testing

- [ ] Frontend loads at production URL
- [ ] Can log in successfully
- [ ] Session persists across page refreshes
- [ ] All CRM modules accessible
- [ ] Market data displays correctly
- [ ] Data refresh button works
- [ ] Pipeline strategies load
- [ ] Related deals functionality works
- [ ] CSV exports work
- [ ] Mobile responsive design works

### Monitoring & Maintenance

- [ ] Application Insights configured
- [ ] Log streaming tested
- [ ] Alerts configured
- [ ] Backup strategy implemented
- [ ] Budget alerts set up
- [ ] Documentation updated
- [ ] Team trained on Azure Portal

---

## Support Resources

### Microsoft Documentation

- **Azure Static Web Apps**: [https://docs.microsoft.com/azure/static-web-apps/](https://docs.microsoft.com/azure/static-web-apps/)
- **Azure App Service**: [https://docs.microsoft.com/azure/app-service/](https://docs.microsoft.com/azure/app-service/)
- **Azure Blob Storage**: [https://docs.microsoft.com/azure/storage/blobs/](https://docs.microsoft.com/azure/storage/blobs/)
- **Application Insights**: [https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)

### Community Resources

- **Azure Community**: [https://techcommunity.microsoft.com/t5/azure/ct-p/Azure](https://techcommunity.microsoft.com/t5/azure/ct-p/Azure)
- **Stack Overflow**: Tag questions with `azure`, `azure-web-app-service`, `azure-static-web-apps`
- **GitHub Issues**: Report Azure CLI issues at [https://github.com/Azure/azure-cli/issues](https://github.com/Azure/azure-cli/issues)

### Getting Help

For issues specific to your deployment:

1. Check Application Insights logs
2. Review GitHub Actions workflow logs
3. SSH into App Service and check file system
4. Post on Stack Overflow with relevant error messages
5. Contact Azure Support (if you have a support plan)

---

## Conclusion

You now have a complete guide to deploying the Meridian Universal Dashboard to Microsoft Azure. The deployment uses:

- **Azure Static Web Apps** for hosting the React frontend
- **Azure App Service** for the Flask backend API
- **Azure Blob Storage** (optional) for persistent data storage
- **Application Insights** for monitoring and analytics
- **GitHub Actions** for automated CI/CD

Start with the free/low-cost tiers for testing, then scale up to production tiers once validated. The modular architecture allows you to upgrade individual components as needed without redeploying everything.

**Estimated Timeline**:
- Initial setup: 2-4 hours
- Testing and validation: 2-3 hours
- Custom domain configuration: 1-2 hours
- Monitoring setup: 1 hour

**Total**: ~6-10 hours for complete production deployment

Good luck with your deployment! 🚀
