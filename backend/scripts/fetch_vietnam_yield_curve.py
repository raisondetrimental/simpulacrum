"""
Script to fetch Vietnam sovereign yield curve data from worldgovernmentbonds.com

This script uses Playwright to scrape the complete "Residual Maturity" table
with all columns including yields, changes, prices, and capital growth.

Data source: https://www.worldgovernmentbonds.com/country/vietnam/

Run: python scripts/fetch_vietnam_yield_curve.py
"""

import json
import re
import time
from datetime import datetime
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import get_config

try:
    from playwright.sync_api import sync_playwright
    from bs4 import BeautifulSoup
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("WARNING: Playwright not installed. Install with: pip install playwright && playwright install chromium")


def parse_percentage(text):
    """Parse percentage string like '2.983%' to float"""
    if not text:
        return None
    text = text.strip().replace('%', '').replace(',', '.')
    try:
        return float(text)
    except:
        return None


def parse_basis_points(text):
    """Parse basis points like '+9.1 bp' or '-74.4 bp' to float"""
    if not text:
        return None
    text = text.strip().replace('bp', '').replace(',', '.').strip()
    try:
        return float(text)
    except:
        return None


def parse_date(text):
    """Parse date string like '17 Nov' to standardized format"""
    if not text:
        return None
    text = text.strip()
    # For now, just return the text as-is
    # Could enhance to convert to full date
    return text


def parse_maturity_to_years(maturity_text):
    """Parse maturity text like '1 year', '2 years' to years as float"""
    if not maturity_text:
        return None

    maturity_text = maturity_text.strip().lower()

    # Match patterns like "1 year" or "2 years"
    month_match = re.search(r'(\d+)\s*months?', maturity_text)
    year_match = re.search(r'(\d+)\s*years?', maturity_text)

    if month_match:
        months = int(month_match.group(1))
        return round(months / 12, 3)
    elif year_match:
        years = int(year_match.group(1))
        return float(years)

    return None


def extract_yield_curve_table(soup):
    """
    Extract the complete Residual Maturity table from the page

    Returns list of dicts with all table data
    """
    print(">> Searching for Residual Maturity table...")

    yield_curve_data = []

    # Find all tables on the page
    tables = soup.find_all('table')

    for table_idx, table in enumerate(tables):
        # Look for table that contains "Residual Maturity" header
        table_text = table.get_text()

        if 'Residual' not in table_text and 'Maturity' not in table_text:
            continue

        print(f">> Found potential yield curve table (table #{table_idx + 1})")

        rows = table.find_all('tr')

        # Skip header rows (first 1-2 rows typically)
        data_rows = []
        for row_idx, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            if len(cells) < 5:  # Skip rows with too few columns
                continue

            # Check if this is a header row
            row_text = row.get_text().lower()
            if 'residual' in row_text or 'annualized' in row_text or 'constant' in row_text or 'maturity' in row_text:
                continue  # Skip header rows

            data_rows.append((row_idx, cells))

        print(f">> Found {len(data_rows)} data rows in table")

        # Process each data row
        for row_idx, cells in data_rows:
            # Expected structure (13 columns with flag and empty spacer):
            # 0: Flag icon column
            # 1: Maturity text
            # 2: Yield Last
            # 3: Yield Chg 1M
            # 4: Yield Chg 6M
            # 5: Yield Chg 12M
            # 6: Empty spacer column
            # 7: Price Last
            # 8: Price Chg 1M
            # 9: Price Chg 6M
            # 10: Price Chg 12M
            # 11: Capital Growth
            # 12: Last Update

            if len(cells) < 12:
                print(f">> Row {row_idx}: Only {len(cells)} columns, skipping")
                continue

            # Column 1 contains the maturity (column 0 is flag icon)
            maturity_text = cells[1].get_text(strip=True)

            # Parse maturity to check if it's valid
            years = parse_maturity_to_years(maturity_text)
            if years is None:
                print(f">> Row {row_idx}: Could not parse maturity '{maturity_text}', skipping")
                continue

            # Create standardized maturity label
            if years < 1:
                months = int(years * 12)
                maturity_label = f"{months}M"
            else:
                maturity_label = f"{int(years)}Y"

            # Extract all data (flag at 0, maturity at 1, data starts at 2)
            row_data = {
                'maturity': maturity_label,
                'maturity_text': maturity_text,
                'maturity_years': years,
                'yield': {
                    'last': parse_percentage(cells[2].get_text(strip=True)),
                    'chg_1m': parse_basis_points(cells[3].get_text(strip=True)),
                    'chg_6m': parse_basis_points(cells[4].get_text(strip=True)),
                    'chg_12m': parse_basis_points(cells[5].get_text(strip=True))
                },
                'price': {
                    'last': parse_percentage(cells[7].get_text(strip=True)) if len(cells) > 7 else None,
                    'chg_1m': parse_percentage(cells[8].get_text(strip=True)) if len(cells) > 8 else None,
                    'chg_6m': parse_percentage(cells[9].get_text(strip=True)) if len(cells) > 9 else None,
                    'chg_12m': parse_percentage(cells[10].get_text(strip=True)) if len(cells) > 10 else None
                },
                'capital_growth': parse_percentage(cells[11].get_text(strip=True).replace(',', '.')) if len(cells) > 11 else None,
                'last_update': parse_date(cells[12].get_text(strip=True)) if len(cells) > 12 else None
            }

            # Validate that we got at least the yield
            if row_data['yield']['last'] is not None:
                yield_curve_data.append(row_data)
                print(f">> Extracted: {maturity_label} = {row_data['yield']['last']}%")
            else:
                print(f">> Row {row_idx}: No valid yield found, skipping")

        # If we found data in this table, stop looking
        if yield_curve_data:
            break

    return yield_curve_data


def fetch_yield_curve_playwright():
    """
    Fetch Vietnam yield curve data using Playwright (headless browser)

    Returns dict with complete table data or None if failed
    """
    if not PLAYWRIGHT_AVAILABLE:
        print("ERROR: Playwright is not installed.")
        return None

    url = "https://www.worldgovernmentbonds.com/country/vietnam/"

    print(f">> Fetching data from {url}")
    print(">> Starting headless browser...")

    try:
        with sync_playwright() as p:
            # Launch browser (headless mode)
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Set longer timeout for slow connections
            page.set_default_timeout(30000)  # 30 seconds

            # Navigate to the page
            print(">> Loading page...")
            page.goto(url, wait_until="networkidle")

            # Wait for the yield curve data to load
            print(">> Waiting for data to load...")
            time.sleep(10)  # Wait for JavaScript to fully render

            # Try to wait for table elements
            try:
                page.wait_for_selector('table', timeout=10000)
            except:
                print(">> Note: Table selector not found, continuing anyway...")

            # Get the page content
            content = page.content()

            # Save HTML for debugging
            debug_file = Path('vietnam_page_debug.html')
            with open(debug_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f">> Saved page HTML to {debug_file} for debugging")

            browser.close()

            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'lxml')

            # Extract the complete table
            yields_data = extract_yield_curve_table(soup)

            if yields_data:
                # Sort by maturity years
                yields_data.sort(key=lambda x: x['maturity_years'])

                result = {
                    'last_updated': datetime.now().isoformat(),
                    'country': 'Vietnam',
                    'currency': 'VND',
                    'data_source': 'worldgovernmentbonds.com (automated - complete table)',
                    'url': url,
                    'yields': yields_data,
                    'notes': f'Automatically fetched complete Residual Maturity table from {url}'
                }

                print(f">> Successfully extracted {len(yields_data)} complete data rows")
                return result
            else:
                print(">> WARNING: No yield curve table found on page")
                print(">> Check vietnam_page_debug.html to see page structure")
                return None

    except Exception as e:
        print(f">> ERROR: Failed to fetch data: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def validate_yield_data(data):
    """
    Validate yield curve data

    Returns tuple (is_valid, error_message)
    """
    if not data:
        return False, "No data provided"

    if 'yields' not in data:
        return False, "Missing 'yields' key"

    if not isinstance(data['yields'], list):
        return False, "'yields' must be a list"

    if len(data['yields']) == 0:
        return False, "No yield data points found"

    # Check for reasonable yield values
    valid_count = 0
    for item in data['yields']:
        if 'yield' in item and item['yield'].get('last') is not None:
            yield_val = item['yield']['last']
            if not (0 <= yield_val <= 200):  # Sanity check
                return False, f"Unreasonable yield value: {yield_val}% for {item.get('maturity')}"
            valid_count += 1

    if valid_count == 0:
        return False, "No valid yield values found"

    return True, None


def save_yield_curve(data, config):
    """Save yield curve data to JSON file"""
    json_dir = Path(config.JSON_DIR)
    markets_dir = json_dir / 'Markets'
    markets_dir.mkdir(exist_ok=True)

    output_file = markets_dir / 'Vietnam_Yield_Curve.json'

    # Create backup if file exists
    if output_file.exists():
        backup_file = output_file.with_suffix('.json.bak')
        import shutil
        shutil.copy2(output_file, backup_file)
        print(f">> Created backup: {backup_file}")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f">> Yield curve data saved to: {output_file}")
    return output_file


def save_historical_snapshot(data, config):
    """Save a daily historical snapshot"""
    json_dir = Path(config.JSON_DIR)
    history_dir = json_dir / 'Markets' / 'Vietnam_Yield_Curve_History'
    history_dir.mkdir(exist_ok=True)

    # Create filename with date
    today = datetime.now().strftime('%Y-%m-%d')
    history_file = history_dir / f'Vietnam_Yield_Curve_{today}.json'

    # Only save if file doesn't exist (one snapshot per day)
    if not history_file.exists():
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f">> Saved historical snapshot: {history_file}")
    else:
        print(f">> Historical snapshot for {today} already exists, skipping")

    return history_file


def main():
    """Main execution function"""
    print("=" * 70)
    print("Vietnam Sovereign Yield Curve Data Fetcher")
    print("Complete Table Extraction (AUTOMATED)")
    print("=" * 70)

    config = get_config()

    # Fetch from web scraping
    print("\n>> Attempting to fetch complete yield curve table from worldgovernmentbonds.com...")

    if not PLAYWRIGHT_AVAILABLE:
        print(">> ERROR: Playwright not available")
        print(">> Install with: pip install playwright && playwright install chromium")
        return 1

    scraped_data = fetch_yield_curve_playwright()

    if not scraped_data:
        print("\n" + "=" * 70)
        print("FAILED")
        print("=" * 70)
        print(">> Could not extract yield curve table")
        print(">> Check vietnam_page_debug.html to inspect page structure")
        print(">> Website may have changed structure")
        return 1

    # Validate the data
    is_valid, error_msg = validate_yield_data(scraped_data)

    if not is_valid:
        print(f">> Data validation: FAILED - {error_msg}")
        return 1

    print(">> Data validation: PASSED")

    # Save to main file
    print("\n>> Saving data...")
    output_file = save_yield_curve(scraped_data, config)

    # Save historical snapshot
    save_historical_snapshot(scraped_data, config)

    print("\n" + "=" * 70)
    print("SUCCESS!")
    print("=" * 70)
    print(f"Fetched {len(scraped_data['yields'])} complete data rows")
    print(f"Data source: {scraped_data['data_source']}")
    print(f"Last updated: {scraped_data['last_updated']}")
    print("\nComplete Data Summary:")
    print("-" * 70)

    for item in scraped_data['yields']:
        print(f"\n{item['maturity']:>4} ({item['maturity_text']}):")
        print(f"  Yield:          {item['yield']['last']:>7.3f}% " +
              f"(1M: {item['yield']['chg_1m']:>+7.1f}bp, " +
              f"6M: {item['yield']['chg_6m']:>+7.1f}bp, " +
              f"12M: {item['yield']['chg_12m']:>+7.1f}bp)")
        print(f"  Price:          {item['price']['last']:>7.2f}  " +
              f"(1M: {item['price']['chg_1m']:>+6.2f}%, " +
              f"6M: {item['price']['chg_6m']:>+6.2f}%, " +
              f"12M: {item['price']['chg_12m']:>+6.2f}%)")
        print(f"  Capital Growth: {item['capital_growth']:>7.3f}")
        print(f"  Last Update:    {item['last_update']}")

    return 0


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
