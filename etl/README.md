# ETL Scripts

This directory contains Extract-Transform-Load (ETL) scripts that process Excel workbooks and generate JSON data files for the Meridian Universal Dashboard.

## Scripts Overview

### Core ETL Scripts

#### `read_dashboard.py`
**Purpose:** Main ETL script that extracts market data from Excel workbooks and generates dashboard JSON.

**What it extracts:**
- Sovereign Yields (domestic & USD denominated) - Rows 15-33
- Corporate Yields (AAA to High Yield) - Rows 39-44
- FX Rates (currency pairs with changes) - Rows 50-53
- Central Bank Rates (policy rates) - Rows 92-95
- Credit Ratings (sovereign ratings & yields) - Rows 220-241

**Output:** `../storage/dashboard.json`

**Usage:**
```bash
cd etl
python read_dashboard.py
```

**Important Notes:**
- Reads Excel files in **read-only mode** (no macros executed)
- Cell positions are hard-coded - if Excel layout changes, update row/column numbers
- Uses openpyxl library for Excel file reading

---

#### `extract_usa_historical.py`
**Purpose:** Extracts 3-month historical yield data for USA maturities.

**What it extracts:**
- Date headers from USA sheet (last 90 days of actual data)
- 13 maturities: 1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y
- Only includes dates where 10Y yield has non-null value
- Filters out future dates

**Data Source:** Rows 31-44 of USA sheet

**Output:** `../storage/usa_historical_yields.json`

**Usage:**
```bash
cd etl
python extract_usa_historical.py
```

**Important Notes:**
- Validates data before including (must have 10Y yield)
- Time range: Last 90 days only
- Cell positions are hard-coded

---

### Excel Automation (Windows Only)

#### `excel_com_interface.py`
**Purpose:** Utility module for Excel COM automation via win32com.

**Capabilities:**
- Opens Excel workbooks via COM
- Executes macros programmatically
- Performs refresh and recalculation operations
- Manages Excel application lifecycle

**Platform:** **Windows Only** - COM automation is Windows-specific

**Important Notes:**
- **Cannot be used on Azure App Service Linux**
- Excel must be closed before running COM operations
- Requires `pywin32` package (Windows only)
- Used by backend API for `/api/excel/refresh` endpoint (disabled for cloud deployment)

**Usage:**
```python
from excel_com_interface import ExcelCOMInterface

with ExcelCOMInterface(excel_file_path) as excel_com:
    excel_com.refresh_all()
    excel_com.calculate_all()
```

---

### Report Generation

#### `pdf_generator.py`
**Purpose:** Generates PDF reports from market data.

**Capabilities:**
- Creates formatted PDF documents
- Includes charts and tables
- Outputs to `../storage/` directory

**Usage:**
```bash
cd etl
python pdf_generator.py
```

---

## Data Flow

```
Excel Files (data/excel/)
    ↓
[ETL Scripts - Read Only Mode]
    ↓
JSON Files (storage/)
    ↓
[Flask API] serves to [React Frontend]
```

## File Structure

```
etl/
├── read_dashboard.py          # Main market data ETL
├── extract_usa_historical.py  # USA historical yields ETL
├── excel_com_interface.py     # COM automation utilities (Windows only)
├── pdf_generator.py            # PDF report generation
└── README.md                   # This file
```

## Requirements

**Python Packages:**
```
pandas>=2.1.4
openpyxl>=3.1.2
pywin32>=306  # Windows only, for COM automation
```

**For Development:**
```bash
pip install -r ../backend/requirements/base.txt
```

## Important Constraints

### Read-Only Mode
- ETL scripts **NEVER** modify Excel files
- Always open files in read-only mode
- Macros are **NOT** executed by ETL scripts
- Macro execution only via COM interface (Windows backend API)

### Hard-Coded Cell Positions
If Excel workbook layout changes, you must update:
- Row/column numbers in extraction methods
- Cell range mappings
- Sheet name references

**Example from `read_dashboard.py`:**
```python
# Sovereign Yields: Rows 15-33
sovereign_data = sheet[f'A15:G33']

# Corporate Yields: Rows 39-44
corporate_data = sheet[f'A39:C44']
```

### COM Automation Constraints
- **Windows only** - COM automation requires Windows OS
- Excel must be closed before running COM operations
- Cannot be used in Azure App Service Linux environment
- For cloud deployment, COM features must remain on local Windows machine

## Testing

After running ETL scripts, verify outputs:

```bash
# Check dashboard.json exists and has valid structure
ls -lh ../storage/dashboard.json

# Check USA historical yields
ls -lh ../storage/usa_historical_yields.json

# Validate JSON structure
python -m json.tool ../storage/dashboard.json > /dev/null && echo "Valid JSON"
```

## Troubleshooting

**Error: File not found**
- Check that Excel files exist in `../data/excel/`
- Verify file paths in script configuration

**Error: Missing data fields**
- Excel layout may have changed
- Review and update hard-coded cell positions
- Check that Excel file is the expected version

**Error: COM operation failed**
- Ensure Excel is not already open
- Verify you're on Windows OS
- Check that pywin32 is installed: `pip install pywin32`

**Invalid/Empty JSON output**
- Check Excel file data is populated
- Verify cell ranges contain expected data
- Review script logs for extraction errors

## See Also

- [CLAUDE.md](../CLAUDE.md) - Main project documentation
- [Backend API Documentation](../backend/README.md)
- [Data Storage Structure](../data/README.md)
