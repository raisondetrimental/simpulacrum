param([string]$ExcelFilePath)

Write-Host "Testing Excel automation..." -ForegroundColor Cyan
Write-Host "File: $ExcelFilePath"

if (-not (Test-Path $ExcelFilePath)) {
    Write-Host "ERROR: File not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Opening Excel..." -ForegroundColor Yellow

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    Write-Host "Opening workbook..." -ForegroundColor Yellow

    # Get absolute path and resolve any issues
    $resolvedPath = Resolve-Path $ExcelFilePath
    Write-Host "  Resolved path: $resolvedPath" -ForegroundColor Gray

    # Open with full parameters to handle OneDrive files
    $workbook = $excel.Workbooks.Open(
        $resolvedPath.Path,
        0,        # UpdateLinks
        $false,   # ReadOnly
        5,        # Format
        "",       # Password
        "",       # WriteResPassword
        $true,    # IgnoreReadOnlyRecommended
        1,        # Origin
        "",       # Delimiter
        $false,   # Editable
        $false,   # Notify
        0,        # Converter
        $true,    # AddToMru
        $false,   # Local
        0         # CorruptLoad
    )

    Write-Host "Refreshing data (this may take 30-60 seconds)..." -ForegroundColor Yellow
    $workbook.RefreshAll()

    # Give Excel time to start the refresh
    Start-Sleep -Seconds 3

    # Wait for async queries to complete (with retry logic)
    $maxRetries = 30
    $retryCount = 0
    $success = $false

    while ($retryCount -lt $maxRetries -and -not $success) {
        try {
            $excel.CalculateUntilAsyncQueriesDone()
            $success = $true
            Write-Host "  Refresh completed!" -ForegroundColor Green
        } catch {
            $retryCount++
            Write-Host "  Waiting for refresh... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }

    if (-not $success) {
        Write-Host "  Warning: Could not confirm refresh completion, but continuing..." -ForegroundColor Yellow
    }

    Write-Host "Saving..." -ForegroundColor Yellow
    $workbook.Save()

    Write-Host "SUCCESS! Data refreshed." -ForegroundColor Green

    $workbook.Close($false)
    $excel.Quit()

    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
