#Requires -Version 5.0
<#
.SYNOPSIS
    Simple test script to verify Excel + CBonds automation works

.DESCRIPTION
    This script just:
    1. Opens your Excel file
    2. Refreshes all data connections (CBonds)
    3. Saves and closes

    Use this to test before running the full automation.

.EXAMPLE
    .\test_excel_refresh.ps1 -ExcelFilePath "C:\path\to\your\excel.xlsx"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ExcelFilePath
)

Write-Host "=== Excel Refresh Test ===" -ForegroundColor Cyan
Write-Host "Excel File: $ExcelFilePath" -ForegroundColor Yellow
Write-Host ""

# Validate file exists
if (-not (Test-Path $ExcelFilePath)) {
    Write-Host "ERROR: Excel file not found!" -ForegroundColor Red
    Write-Host "Path: $ExcelFilePath" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Excel file found âœ“" -ForegroundColor Green

try {
    # Create Excel COM object
    Write-Host "[2/5] Creating Excel application..." -ForegroundColor Yellow
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    Write-Host "[2/5] Excel application created âœ“" -ForegroundColor Green

    # Open workbook
    Write-Host "[3/5] Opening workbook..." -ForegroundColor Yellow
    $workbook = $excel.Workbooks.Open($ExcelFilePath)
    Write-Host "[3/5] Workbook opened âœ“" -ForegroundColor Green

    # Check for CBonds add-in
    Write-Host ""
    Write-Host "Checking for CBonds add-in..." -ForegroundColor Cyan
    $hasAddIn = $false
    foreach ($addIn in $excel.COMAddIns) {
        if ($addIn.Description -like "*cbonds*" -or $addIn.Description -like "*CBonds*") {
            Write-Host "  Found: $($addIn.Description)" -ForegroundColor Green
            $hasAddIn = $true
        }
    }
    if (-not $hasAddIn) {
        Write-Host "  Warning: CBonds add-in not detected in COM add-ins list" -ForegroundColor Yellow
        Write-Host "  This may be normal if CBonds uses a different installation method" -ForegroundColor Yellow
    }
    Write-Host ""

    # Refresh all data connections
    Write-Host "[4/5] Refreshing all data connections (CBonds will update)..." -ForegroundColor Yellow
    Write-Host "      This may take 30-60 seconds depending on data volume..." -ForegroundColor Gray

    $workbook.RefreshAll()

    # Wait for all queries to complete
    $excel.CalculateUntilAsyncQueriesDone()

    Write-Host "[4/5] Data refresh completed âœ“" -ForegroundColor Green

    # Save workbook
    Write-Host "[5/5] Saving workbook..." -ForegroundColor Yellow
    $workbook.Save()
    Write-Host "[5/5] Workbook saved âœ“" -ForegroundColor Green

    # Show worksheet info
    Write-Host ""
    Write-Host "Workbook Information:" -ForegroundColor Cyan
    Write-Host "  Worksheets: $($workbook.Worksheets.Count)" -ForegroundColor White
    foreach ($sheet in $workbook.Worksheets) {
        Write-Host "    - $($sheet.Name)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "=== Test Completed Successfully! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open Excel file manually to verify data was refreshed" -ForegroundColor White
    Write-Host "2. If data looks good, proceed with full automation script" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "=== Test Failed ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Excel is NOT already open" -ForegroundColor White
    Write-Host "2. Check if CBonds add-in is properly installed" -ForegroundColor White
    Write-Host "3. Try opening Excel manually and clicking 'Refresh All'" -ForegroundColor White
    Write-Host ""
    exit 1
} finally {
    # Always cleanup Excel
    if ($workbook) {
        $workbook.Close($false)
        Write-Host "Workbook closed" -ForegroundColor Gray
    }
    if ($excel) {
        $excel.Quit()
        Write-Host "Excel quit" -ForegroundColor Gray
    }

    # Release COM objects
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
