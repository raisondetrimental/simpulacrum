# CBonds Automation Scripts - Quick Start Guide

## What These Scripts Do

These PowerShell scripts automate the process of:
1. Opening your Excel file with CBonds add-in
2. Refreshing all data (CBonds pulls latest market data)
3. Running ETL pipeline to extract data to JSON
4. (Optional) Uploading to Azure for cloud deployment

## Prerequisites

✅ **Before you start, make sure you have:**

1. **Excel installed** on your Windows PC
2. **CBonds add-in installed** in Excel
3. **Python 3.9+** installed
4. **Your CBonds Excel workbook** ready

## Step-by-Step Setup

### Step 1: Find Your CBonds Excel File

First, locate your CBonds Excel workbook. It's probably in one of these locations:
- Your Downloads folder
- Documents folder
- Desktop
- `data/excel/` folder

**Note the full path**, for example:
```
C:\Users\Cameron Thomas\Documents\CBonds-Markets-2025.xlsx
```

### Step 2: Test Excel Automation

Open PowerShell and run the test script:

```powershell
# Navigate to scripts folder
cd "C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website\scripts"

# Run test script (replace with YOUR Excel file path)
.\test_excel_refresh.ps1 -ExcelFilePath "C:\Users\Cameron Thomas\Documents\CBonds-Markets.xlsx"
```

**What should happen:**
- ✅ Excel opens in background (invisible)
- ✅ CBonds refreshes all data
- ✅ Excel saves and closes
- ✅ You see green checkmarks ✓

**If it fails:**
- ❌ Make sure Excel is NOT already open
- ❌ Check CBonds add-in is installed (open Excel manually → File → Options → Add-ins)
- ❌ Verify file path is correct

### Step 3: Verify Data Refreshed

Open your Excel file manually and check if the data is fresh:
1. Open the Excel file
2. Look at the dates/timestamps in the data
3. Compare with previous version

If data looks good, proceed to Step 4!

### Step 4: Test Full Automation (without Azure upload)

Now test the full script that includes ETL:

```powershell
# Make sure your Excel file path is correct
.\update_cbonds_data.ps1 -ExcelFilePath "C:\Users\Cameron Thomas\Documents\CBonds-Markets.xlsx"
```

**What should happen:**
1. ✅ Excel opens and refreshes data
2. ✅ ETL pipeline runs (extracts data)
3. ✅ JSON files created in `storage/` folder
4. ✅ Log file created in `logs/` folder

**Check the results:**
```powershell
# View the log
Get-Content ..\logs\cbonds-update-*.log -Tail 20

# Check if JSON files were created
dir ..\storage\dashboard.json
dir ..\storage\usa_historical_yields.json
```

### Step 5: Set Up Daily Automation

Once everything works, schedule it to run daily:

#### Option A: Simple Scheduled Task (Recommended)

1. Open **Task Scheduler** (`Win + R`, type `taskschd.msc`)

2. Click **"Create Basic Task"**

3. Fill in:
   - **Name:** CBonds Daily Update
   - **Description:** Updates CBonds market data daily
   - **Trigger:** Daily at 7:00 AM
   - **Action:** Start a program
   - **Program:** `powershell.exe`
   - **Arguments:**
     ```
     -ExecutionPolicy Bypass -File "C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website\scripts\update_cbonds_data.ps1" -ExcelFilePath "C:\Users\YOUR\PATH\TO\EXCEL.xlsx"
     ```

4. **Important Settings:**
   - ☑️ Run whether user is logged on or not
   - ☑️ Wake the computer to run this task
   - ☑️ Run with highest privileges

#### Option B: Import XML Configuration

1. Edit `task_scheduler_setup.xml` and update the Excel file path (line 52-53)

2. Open Task Scheduler (`taskschd.msc`)

3. **Action** → **Import Task**

4. Select `task_scheduler_setup.xml`

5. Review settings and click **OK**

### Step 6: Test Scheduled Task

Don't wait for tomorrow! Test it now:

1. Open Task Scheduler
2. Find your task: "CBonds Daily Update"
3. Right-click → **Run**
4. Check the logs folder for results

## Common Issues & Solutions

### Issue: "Excel is already running"

**Solution:** Close all Excel windows before running the script

```powershell
# Force close Excel if stuck
Get-Process excel -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Issue: "Execution policy" error

**Solution:** Allow PowerShell scripts to run

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "CBonds data not updating"

**Solutions:**
1. Open Excel manually and try "Refresh All" (Data → Refresh All)
2. Check CBonds add-in is loaded (File → Options → Add-ins)
3. Verify CBonds license is active
4. Check internet connectivity

### Issue: "ETL script fails"

**Solution:** Make sure Python and dependencies are installed

```powershell
# Check Python is installed
python --version

# Install dependencies if needed
cd ..\etl
pip install -r requirements.txt
```

### Issue: "Script runs but JSON files are empty"

**Solution:** Check the Excel file structure matches what ETL expects

```powershell
# View ETL logs
python read_dashboard.py

# Check what sheets exist in your Excel file
```

## All Scripts in This Directory

### PowerShell Scripts (Windows)

- **`test_excel_refresh.ps1`** - Simple test script (just refresh Excel)
- **`update_cbonds_data.ps1`** - Full automation script (refresh + ETL + upload)
- **`simple_test.ps1`** - Basic Excel COM test script

### Python Scripts

- **`cleanup_old_backups.py`** - Automated backup cleanup utility (deletes .bak files >30 days)
- **`build_cpmm_map.py`** - Builds CPMM map visualization (purpose: map generation)
- **`migrate_to_new_structure.py`** - Historical migration from institutions_LEGACY to new structure (completed, kept for reference)

### Shell Scripts (Linux/Mac)

- **`dev-start.sh`** - Development environment startup script
- **`etl-run.sh`** - Run ETL pipeline
- **`setup-local.sh`** - Local development setup

### Configuration Files

- **`task_scheduler_setup.xml`** - Windows Task Scheduler configuration template
- **`README.md`** - This file!

---

## Utility Scripts

### cleanup_old_backups.py

**Purpose:** Automatically delete old .bak backup files from `data/json/` to prevent disk space accumulation.

**Usage:**
```bash
# Delete backups older than 30 days (default)
python scripts/cleanup_old_backups.py

# Delete backups older than 60 days
python scripts/cleanup_old_backups.py --days 60

# Dry run (show what would be deleted)
python scripts/cleanup_old_backups.py --dry-run
```

**When to use:**
- Run monthly to clean up old backups
- Before disk space issues occur
- As part of regular maintenance

**Note:** The JSON store creates automatic `.bak` files on every write. This script prevents accumulation.

---

### build_cpmm_map.py

**Purpose:** Generates CPMM (Capital Partners Market Map) visualization.

**Usage:**
```bash
python scripts/build_cpmm_map.py
```

**Output:** Map visualization files (exact output location TBD - check script for details)

---

### migrate_to_new_structure.py

**Purpose:** Historical migration script that converted `institutions_LEGACY.json` to the new hierarchical CRM structure.

**Status:** **Migration completed** - Script kept for historical reference only

**Do not run** unless you need to understand the migration logic. All data has already been migrated.

## Logs and Troubleshooting

**View recent logs:**
```powershell
# Show last log file
Get-Content ..\logs\cbonds-update-*.log | Select-Object -Last 50

# List all log files
dir ..\logs\cbonds-*.log
```

**Common log messages:**

✅ **Success:**
```
[2025-01-13 07:00:00] === CBonds Data Update Started ===
[2025-01-13 07:00:05] Excel COM interface initialized successfully
[2025-01-13 07:00:10] Data refresh completed
[2025-01-13 07:00:15] ETL pipeline completed successfully
[2025-01-13 07:00:20] === CBonds Data Update Completed Successfully ===
```

❌ **Failure:**
```
[2025-01-13 07:00:00] ERROR: Excel file not found: C:\...
[2025-01-13 07:00:00] ERROR: Failed to initialize Excel COM
```

## Next Steps: Azure Deployment

Once local automation works well, you can deploy to Azure:

1. Set up Azure Blob Storage (see `docs/CBONDS_AZURE_DEPLOYMENT.md`)
2. Add `-UploadToAzure` flag to upload JSON files
3. Deploy Flask backend to Azure App Service
4. Deploy React frontend to Azure Static Web Apps

**Cost:** ~$14/month for full cloud deployment

## Questions?

Check the detailed documentation:
- `docs/CBONDS_AZURE_DEPLOYMENT.md` - Complete Azure deployment guide
- `CLAUDE.md` - Project architecture and development guide

## Quick Reference

**Test Excel refresh only:**
```powershell
.\test_excel_refresh.ps1 -ExcelFilePath "C:\path\to\excel.xlsx"
```

**Run full automation (local only):**
```powershell
.\update_cbonds_data.ps1 -ExcelFilePath "C:\path\to\excel.xlsx"
```

**Run with Azure upload:**
```powershell
.\update_cbonds_data.ps1 -ExcelFilePath "C:\path\to\excel.xlsx" -UploadToAzure
```

**View logs:**
```powershell
Get-Content ..\logs\cbonds-update-*.log -Tail 30
```

**Check generated JSON:**
```powershell
Get-Content ..\storage\dashboard.json
```
