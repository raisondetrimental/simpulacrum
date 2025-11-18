# Turkey Sovereign Yield Curve - Automated Fetching System

## Overview

This system automatically fetches Turkey's sovereign yield curve data from worldgovernmentbonds.com using a hybrid approach:
- **Automated web scraping** using Playwright (headless browser)
- **Manual overrides** for data points that can't be automatically extracted
- **Intelligent data cleaning** to filter out policy rates and suspicious values

## Files

### Scripts
- `backend/scripts/fetch_turkey_yield_curve.py` - Main fetching script with automated scraping and data cleaning

### Data Files
- `backend/data/json/Markets/Turkey_Yield_Curve.json` - Generated yield curve data (used by dashboard)
- `backend/data/json/Markets/Turkey_Yield_Curve_Manual.json` - Manual override file for supplemental data

### API Endpoints
- `GET /api/turkey-yield-curve` - Fetch current yield curve data
- `POST /api/refresh/turkey-yield-curve` - Trigger automated data refresh

### Frontend
- `frontend/src/pages/markets/TurkeyYieldCurvePage.tsx` - Yield curve visualization page
- `frontend/src/services/marketsService.ts` - API service functions

## How It Works

### 1. Automated Scraping

The script uses Playwright to:
1. Launch a headless Chromium browser
2. Navigate to https://www.worldgovernmentbonds.com/country/turkey/
3. Wait for JavaScript-rendered content to load
4. Extract yield data from multiple page elements
5. Parse and validate the extracted data

### 2. Data Cleaning

The script automatically:
- **Detects suspicious repeated values** (e.g., policy rate appearing across all maturities)
- **Filters out duplicates** that are likely not bond yields
- **Validates yield ranges** (must be between 0% and 200%)
- **Marks questionable data** as null with explanatory notes

### 3. Manual Overrides

The `Turkey_Yield_Curve_Manual.json` file allows you to:
- **Supplement automated data** with manually entered yields
- **Override automated values** that are incorrect
- **Add maturities** not found by the scraper

**Example:**
```json
{
  "maturity": "3M",
  "yield": 35.107,
  "comment": "From website table - 3 months"
}
```

Set `yield` to `null` to use automated data instead.

### 4. Merge Logic

The system merges data with this priority:
1. **Manual override** (if not null) → Highest priority
2. **Automated scraping** → Used if no manual override
3. **Null** → If both failed or data filtered out

## Running the Script

### Manual Execution

```bash
cd backend
python scripts/fetch_turkey_yield_curve.py
```

### Via API (from dashboard)

Click the "Refresh Data" button on the yield curve page, which calls:
```
POST /api/refresh/turkey-yield-curve
```

### Scheduled Execution (Recommended)

Set up a scheduled task to run daily:

**Windows Task Scheduler:**
```
Program: python
Arguments: scripts/fetch_turkey_yield_curve.py
Start in: C:\Users\...\Dashboard Website\backend
Trigger: Daily at 8:00 AM
```

**Linux/Mac cron:**
```bash
0 8 * * * cd /path/to/backend && python scripts/fetch_turkey_yield_curve.py
```

## Updating Manual Override Data

When worldgovernmentbonds.com updates their data:

1. Visit https://www.worldgovernmentbonds.com/country/turkey/
2. Note the yields from the "Residual Maturity" table
3. Edit `backend/data/json/Markets/Turkey_Yield_Curve_Manual.json`
4. Update the `yield` values for each maturity
5. Update the `last_manual_update` date
6. Run the script to regenerate the final data file

**Example Table Data (as of Nov 14, 2025):**
```
3 months:  35.107%
6 months:  36.098%
9 months:  37.854%
2 years:   40.110%
3 years:   37.715%
5 years:   33.960%
10 years:  30.510%
```

## Current Data Status

As of the last run:
- **3M, 6M, 9M, 2Y, 3Y, 5Y**: Manual overrides from website table
- **10Y**: Automated scraping (30.51%)
- **1M**: Automated but likely policy rate (14.0%) - may need manual override
- **1Y, 7Y, 15Y, 20Y, 30Y**: Filtered out or not available

## Troubleshooting

### Script Fails to Find Data

**Symptom:** Script runs but finds 0 or very few data points

**Solutions:**
1. Check if website structure has changed
2. Increase wait time in script (currently 8 seconds)
3. Save HTML for debugging (uncomment line 121 in script)
4. Add missing data to manual override file

### Playwright Not Installed

**Symptom:** "Playwright not installed" error

**Solution:**
```bash
pip install playwright
playwright install chromium
```

### Browser Launch Fails

**Symptom:** "Failed to launch browser" error

**Solutions:**
- Check antivirus/firewall settings
- Run with `headless=False` for debugging
- Try different browser: `p.firefox.launch()` or `p.webkit.launch()`

### Policy Rate Contamination

**Symptom:** All maturities show the same yield (e.g., 14%)

**This is expected and handled automatically:**
- The script detects when >50% of values are identical
- Filters out the repeated value as likely policy rate
- Manual overrides take priority

## Dependencies

```
beautifulsoup4==4.12.2
playwright==1.40.0
lxml==4.9.3
```

Install with:
```bash
pip install -r backend/requirements/base.txt
playwright install chromium
```

## Architecture Notes

### Why Hybrid Approach?

worldgovernmentbonds.com uses JavaScript to load data dynamically, and:
- Not all maturities are consistently available
- Table structure may change over time
- Some yields may be placeholders or policy rates
- Manual verification ensures data quality

### Frontend Integration

The dashboard page:
- Fetches data from `/api/turkey-yield-curve`
- Filters out null yields for visualization
- Shows line chart using Recharts
- Displays data table with all maturities
- Provides key insights (1Y, 5Y, 10Y yields)
- Analyzes yield curve shape (normal/inverted/flat)

## Future Enhancements

Potential improvements:
1. **Alternative data sources** - Bloomberg API, Investing.com API
2. **Interpolation** - Calculate missing maturities from available data
3. **Historical tracking** - Store yield curve snapshots over time
4. **Alerting** - Notify when yields change significantly
5. **Super admin UI** - Manual entry form in dashboard
6. **API integration** - Direct API access if available

## Links

- Data Source: https://www.worldgovernmentbonds.com/country/turkey/
- Frontend Page: `/dashboard/turkiye/yield-curve`
- API Documentation: See `backend/src/api/data.py`

## Support

For issues or questions:
- Check this README first
- Review script output for error messages
- Examine backup files in `data/json/Markets/*.bak`
- Contact system administrator

---

**Last Updated:** November 14, 2025
**Script Version:** 1.0
**Status:** Production Ready
