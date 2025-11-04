# CBonds Excel Add-in with Azure Deployment

## Architecture Overview

Since the CBonds Excel add-in requires Windows + Excel, we use a **hybrid architecture**:

```
┌─────────────────────────────┐
│   Local Windows Machine     │
│  (Your PC or Always-On PC)  │
│                             │
│  ┌──────────────────────┐  │
│  │  Excel + CBonds      │  │
│  │  Add-in              │  │
│  └──────────────────────┘  │
│           ↓                 │
│  ┌──────────────────────┐  │
│  │  Scheduled Task      │  │
│  │  (Daily 7:00 AM)     │  │
│  └──────────────────────┘  │
│           ↓                 │
│  ┌──────────────────────┐  │
│  │  PowerShell Script   │  │
│  │  1. Refresh CBonds   │  │
│  │  2. Run ETL          │  │
│  │  3. Upload to Azure  │  │
│  └──────────────────────┘  │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│      Azure Cloud            │
│                             │
│  ┌──────────────────────┐  │
│  │  Blob Storage        │  │
│  │  - dashboard.json    │  │
│  │  - usa_yields.json   │  │
│  └──────────────────────┘  │
│           ↓                 │
│  ┌──────────────────────┐  │
│  │  App Service         │  │
│  │  (Flask Backend)     │  │
│  └──────────────────────┘  │
│           ↓                 │
│  ┌──────────────────────┐  │
│  │  Static Web App      │  │
│  │  (React Frontend)    │  │
│  └──────────────────────┘  │
└─────────────────────────────┘
           ↓
        [Users]
```

## Deployment Options

### Option 1: Azure Blob Storage (Recommended)

**Pros:**
- ✅ Very low cost (~$0.02/GB/month)
- ✅ Fast CDN delivery
- ✅ Automatic versioning
- ✅ No compute costs

**Cons:**
- ⚠️ Requires scheduled task on local machine
- ⚠️ Local machine must be on when scheduled task runs

**Monthly Cost:** ~$13-15
- App Service B1: $13/month
- Static Web App: Free
- Blob Storage: <$1/month

### Option 2: Azure Windows VM

**Pros:**
- ✅ Fully automated (runs 24/7 in cloud)
- ✅ No local machine required
- ✅ Scheduled tasks run reliably

**Cons:**
- ❌ Expensive (~$70-150/month for B2ms)
- ❌ Requires Excel license on VM
- ❌ Requires CBonds license/subscription on VM

**Monthly Cost:** ~$85-165
- Windows VM B2ms: $70-150/month
- App Service: $13/month
- Static Web App: Free
- Blob Storage: <$1/month

### Option 3: Direct CBonds API Integration (Best if Available)

**Check if CBonds offers a REST API:**

```python
# Instead of Excel add-in, call CBonds API directly
import requests

response = requests.get(
    'https://api.cbonds.com/v1/bonds',
    headers={'Authorization': f'Bearer {API_KEY}'},
    params={'type': 'sovereign'}
)

data = response.json()
```

**Pros:**
- ✅ No Excel needed
- ✅ Fully cloud-native
- ✅ Real-time updates
- ✅ Lowest cost
- ✅ Most reliable

**Cons:**
- ⚠️ Requires CBonds API subscription (may cost more)
- ⚠️ Need to rewrite data extraction logic

**Monthly Cost:** ~$13 + CBonds API subscription
- App Service: $13/month
- Static Web App: Free

## Setup Instructions

### Prerequisites

1. **Local Windows Machine** (for Option 1):
   - Excel installed
   - CBonds add-in installed and licensed
   - Python 3.9+ installed
   - Azure CLI installed

2. **Azure Account**:
   - Active subscription
   - Resource group created

### Step 1: Set Up Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --name meridiandashboard \
  --resource-group meridian-dashboard-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create container for market data
az storage container create \
  --name marketdata \
  --account-name meridiandashboard \
  --public-access blob

# Get connection string
az storage account show-connection-string \
  --name meridiandashboard \
  --resource-group meridian-dashboard-rg
```

### Step 2: Configure Local Scheduled Task

1. **Test the PowerShell script manually:**
   ```powershell
   cd "C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website\scripts"

   # Test without upload
   .\update_cbonds_data.ps1

   # Test with Azure upload
   .\update_cbonds_data.ps1 -UploadToAzure
   ```

2. **Import Task Scheduler configuration:**
   ```powershell
   # Open Task Scheduler
   taskschd.msc

   # Import the XML file:
   # Action > Import Task > Select task_scheduler_setup.xml
   # Adjust the file paths to match your setup
   ```

3. **Set the schedule:**
   - Daily at 7:00 AM (after market close)
   - Or multiple times per day if needed

### Step 3: Update Backend to Use Blob Storage

**Option A: Direct Blob URLs (Public Access)**

Update `backend/src/config.py`:

```python
class ProductionConfig(Config):
    # ... existing config ...

    # Use Azure Blob Storage URLs
    AZURE_STORAGE_URL = 'https://meridiandashboard.blob.core.windows.net/marketdata'
```

Update `backend/src/api/data.py`:

```python
from flask import Blueprint, jsonify, redirect
from pathlib import Path

data_bp = Blueprint('data', __name__, url_prefix='/api')

@data_bp.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """Redirect to Azure Blob Storage"""
    if current_app.config.get('ENV') == 'production':
        blob_url = f"{current_app.config['AZURE_STORAGE_URL']}/dashboard.json"
        return redirect(blob_url)
    else:
        # Local development - serve from storage/
        # ... existing local logic ...
```

**Option B: Backend Proxies Blob Storage (More Control)**

```python
import requests
from flask import current_app, jsonify

@data_bp.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """Fetch from blob storage and return"""
    try:
        if current_app.config.get('ENV') == 'production':
            blob_url = f"{current_app.config['AZURE_STORAGE_URL']}/dashboard.json"
            response = requests.get(blob_url, timeout=10)
            response.raise_for_status()
            return jsonify(response.json())
        else:
            # Local development
            # ... existing local logic ...
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to fetch data: {str(e)}"
        }), 500
```

### Step 4: Deploy Backend to Azure

```bash
cd backend

# Create deployment package
pip install -r requirements/prod.txt
zip -r deploy.zip . -x "*.pyc" -x "__pycache__/*" -x "venv/*" -x "tests/*"

# Deploy to App Service
az webapp deployment source config-zip \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg \
  --src deploy.zip

# Set environment variables
az webapp config appsettings set \
  --name meridian-backend \
  --resource-group meridian-dashboard-rg \
  --settings \
    FLASK_ENV=production \
    SECRET_KEY="your-secret-key" \
    AZURE_STORAGE_URL="https://meridiandashboard.blob.core.windows.net/marketdata"
```

### Step 5: Deploy Frontend to Azure

```bash
cd frontend

# Set production API URL
export VITE_API_URL=https://meridian-backend.azurewebsites.net

# Build
npm run build

# Deploy to Static Web App
az staticwebapp create \
  --name meridian-frontend \
  --resource-group meridian-dashboard-rg \
  --location eastus

# Get deployment token and deploy
az staticwebapp secrets list \
  --name meridian-frontend \
  --resource-group meridian-dashboard-rg

npm install -g @azure/static-web-apps-cli
swa deploy ./dist --deployment-token <your-token>
```

## Monitoring & Maintenance

### Check Scheduled Task Status

```powershell
# View task history
Get-ScheduledTask -TaskName "CBondsDataUpdate" | Get-ScheduledTaskInfo

# View logs
Get-Content "C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website\logs\cbonds-update-*.log" -Tail 50
```

### Check Azure Blob Storage

```bash
# List files in blob storage
az storage blob list \
  --account-name meridiandashboard \
  --container-name marketdata \
  --output table

# Check last modified time
az storage blob show \
  --account-name meridiandashboard \
  --container-name marketdata \
  --name dashboard.json \
  --query "properties.lastModified"
```

### Troubleshooting

**Issue: Scheduled task fails**
```powershell
# Check Windows Event Viewer
eventvwr.msc
# Look for Task Scheduler logs

# Test Excel automation manually
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $true
# Verify CBonds add-in is loaded
```

**Issue: CBonds data not updating**
- Check CBonds add-in license
- Verify internet connectivity
- Check if manual refresh in Excel works
- Review CBonds add-in logs/errors

**Issue: Azure upload fails**
- Verify Azure CLI authentication: `az login`
- Check storage account access keys
- Verify container exists and is accessible

## Cost Comparison

### Option 1: Hybrid (Local + Azure Blob)
- **Local Machine**: $0 (uses existing PC)
- **Azure App Service (B1)**: $13/month
- **Azure Static Web App**: Free
- **Azure Blob Storage**: <$1/month
- **Total**: ~$14/month

### Option 2: Full Azure (Windows VM)
- **Windows VM (B2ms)**: $70-150/month
- **Azure App Service (B1)**: $13/month
- **Azure Static Web App**: Free
- **Azure Blob Storage**: <$1/month
- **Excel License**: Included in Microsoft 365
- **CBonds VM License**: Check with CBonds
- **Total**: ~$85-165/month

### Option 3: Direct API Integration
- **Azure App Service (B1)**: $13/month
- **Azure Static Web App**: Free
- **CBonds API Subscription**: Variable (check with CBonds)
- **Total**: ~$13/month + API costs

## Recommendation

**For your situation, I recommend Option 1 (Hybrid):**

1. ✅ **Lowest cost** (~$14/month vs $85-165/month)
2. ✅ **Uses existing CBonds license** (already paying for it)
3. ✅ **Simple setup** (just schedule a task)
4. ✅ **Full control** over data refresh timing
5. ✅ **Reliable** (if your PC is on daily)

**Next Steps:**
1. Check if CBonds offers a REST API (Option 3 would be best)
2. If no API, use Option 1 (Hybrid)
3. If you need 24/7 automation without local PC, use Option 2 (Windows VM)

## Questions to Ask CBonds

Before finalizing architecture:

1. **Do you offer a REST API for programmatic access?**
   - If yes, this eliminates the need for Excel entirely

2. **What are the licensing terms for running Excel + CBonds on Azure VM?**
   - Can we use the same license?
   - Is there a cloud/server license?

3. **What's the data update frequency?**
   - Real-time?
   - Daily at specific time?
   - This determines if local scheduled task is sufficient

4. **Are there webhook/notification options?**
   - Can CBonds notify us when data updates?
   - Could trigger our ETL on-demand
