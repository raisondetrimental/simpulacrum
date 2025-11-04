#Requires -Version 5.0
<#
.SYNOPSIS
    Automated daily update of CBonds market data to Azure

.DESCRIPTION
    1. Opens Excel with CBonds add-in
    2. Refreshes all data connections
    3. Runs ETL pipeline to extract data to JSON
    4. Uploads JSON files to Azure Blob Storage or App Service

.NOTES
    Schedule this script daily via Windows Task Scheduler
#>

param(
    [string]$ExcelFilePath = "",  # REQUIRED: Set this to your CBonds Excel file path
    [string]$ProjectRoot = "C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website",
    [string]$AzureStorageAccount = "meridiandashboard",
    [string]$AzureContainer = "marketdata",
    [switch]$UploadToAzure = $false
)

$ErrorActionPreference = "Stop"

# Validate Excel file path is provided
if ([string]::IsNullOrEmpty($ExcelFilePath)) {
    Write-Host "ERROR: Excel file path is required!"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\update_cbonds_data.ps1 -ExcelFilePath 'C:\Path\To\Your\Excel.xlsx'"
    Write-Host ""
    Write-Host "Example:"
    Write-Host "  .\update_cbonds_data.ps1 -ExcelFilePath 'C:\Users\Cameron Thomas\OneDrive - Meridian Universal\Documents\Dashboard Website\data\excel\CBonds-Markets.xlsx'"
    exit 1
}

# Create logs directory if it doesn't exist
$LogDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$LogFile = Join-Path $LogDir "cbonds-update-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

try {
    Write-Log "=== CBonds Data Update Started ==="
    Write-Log "Project Root: $ProjectRoot"
    Write-Log "Excel File: $ExcelFilePath"
    Write-Log "Upload to Azure: $UploadToAzure"

    # Validate Excel file exists
    if (-not (Test-Path $ExcelFilePath)) {
        throw "Excel file not found: $ExcelFilePath"
    }

    # Step 1: Open Excel and refresh CBonds data
    Write-Log "Opening Excel workbook: $ExcelFilePath"

    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    $workbook = $excel.Workbooks.Open($ExcelFilePath)

    Write-Log "Refreshing all data connections (CBonds add-in)..."

    # Refresh all data connections
    $workbook.RefreshAll()

    # Wait for refresh to complete
    $excel.CalculateUntilAsyncQueriesDone()

    Write-Log "Data refresh completed"

    # Save workbook
    Write-Log "Saving workbook..."
    $workbook.Save()

    # Close Excel
    Write-Log "Closing Excel..."
    $workbook.Close($false)
    $excel.Quit()

    # Release COM objects
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Log "Excel closed successfully"

    # Step 2: Run ETL pipeline
    Write-Log "Running ETL pipeline..."

    Push-Location (Join-Path $ProjectRoot "etl")

    # Activate Python virtual environment if it exists
    $venvPath = Join-Path $ProjectRoot "venv\Scripts\Activate.ps1"
    if (Test-Path $venvPath) {
        Write-Log "Activating virtual environment..."
        & $venvPath
    }

    # Run main dashboard ETL
    Write-Log "Extracting dashboard data..."
    & python read_dashboard.py

    if ($LASTEXITCODE -ne 0) {
        throw "Dashboard ETL failed with exit code $LASTEXITCODE"
    }

    # Run USA historical yields ETL
    Write-Log "Extracting USA historical yields..."
    & python extract_usa_historical.py

    if ($LASTEXITCODE -ne 0) {
        throw "USA historical yields ETL failed with exit code $LASTEXITCODE"
    }

    Pop-Location

    Write-Log "ETL pipeline completed successfully"

    # Step 3: Upload to Azure (if enabled)
    if ($UploadToAzure) {
        Write-Log "Uploading data to Azure..."

        $storageDir = Join-Path $ProjectRoot "storage"

        # Upload dashboard.json
        Write-Log "Uploading dashboard.json..."
        az storage blob upload `
            --account-name $AzureStorageAccount `
            --container-name $AzureContainer `
            --name "dashboard.json" `
            --file (Join-Path $storageDir "dashboard.json") `
            --overwrite

        # Upload usa_historical_yields.json
        Write-Log "Uploading usa_historical_yields.json..."
        az storage blob upload `
            --account-name $AzureStorageAccount `
            --container-name $AzureContainer `
            --name "usa_historical_yields.json" `
            --file (Join-Path $storageDir "usa_historical_yields.json") `
            --overwrite

        Write-Log "Azure upload completed successfully"
    } else {
        Write-Log "Azure upload skipped (use -UploadToAzure to enable)"
    }

    Write-Log "=== CBonds Data Update Completed Successfully ==="
    exit 0

} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    Write-Log $_.ScriptStackTrace

    # Cleanup Excel if still running
    try {
        if ($excel) {
            $excel.Quit()
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        }
    } catch {
        Write-Log "Warning: Failed to cleanup Excel"
    }

    Write-Log "=== CBonds Data Update Failed ==="
    exit 1
}
