#!/usr/bin/env python3
"""
Fetch FX Rates from Yahoo Finance using yfinance
Stores 90 days of daily rates for USD vs 6 emerging market currencies

Incremental updates: First run fetches 90 days, subsequent runs fetch 7 days and append only new dates.
"""

import json
from pathlib import Path
from datetime import datetime
import yfinance as yf
import pandas as pd

# ----------------------------
# Configuration
# ----------------------------
CURRENCIES = {
    "VND": "Vietnamese Dong",
    "TRY": "Turkish Lira",
    "MNT": "Mongolian Tugrik",
    "UZS": "Uzbek Som",
    "AMD": "Armenian Dram",
    "GBP": "British Pound Sterling"
}

# Yahoo Finance tickers (USD as base)
TICKERS = {
    "VND": "USDVND=X",
    "TRY": "USDTRY=X",
    "MNT": "USDMNT=X",
    "UZS": "USDUZS=X",
    "AMD": "USDAMD=X",
    "GBP": "USDGBP=X"
}

# Output path
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "backend" / "data" / "json" / "Markets"
OUT_FILE = OUT_DIR / "FX_Rates_Yahoo.json"

# ----------------------------
# Determine fetch period based on file existence
# ----------------------------
OUT_DIR.mkdir(parents=True, exist_ok=True)

if OUT_FILE.exists():
    # File exists: Fetch last 7 days for incremental update
    fetch_period = "7d"
    print("Existing file found. Fetching last 7 days for incremental update.")
else:
    # First run: Fetch 90 days
    fetch_period = "90d"
    print("First run. Fetching last 90 days to populate dataset.")

# ----------------------------
# Fetch data from Yahoo Finance
# ----------------------------
print(f"Fetching FX rates from Yahoo Finance (period: {fetch_period})...")

try:
    # Download data for all tickers
    ticker_list = list(TICKERS.values())
    df = yf.download(
        " ".join(ticker_list),
        period=fetch_period,
        interval="1d",
        group_by="ticker",
        progress=False
    )

    if df.empty:
        print("Error: No data returned from Yahoo Finance")
        exit(1)

    print(f"Downloaded data for {len(ticker_list)} currency pairs")

except Exception as e:
    print(f"Error fetching data from Yahoo Finance: {e}")
    exit(1)

# ----------------------------
# Parse and organize data
# ----------------------------
# Collect all dates and rates
rates_by_date = {}

for currency, ticker in TICKERS.items():
    try:
        # Extract 'Close' prices for this ticker
        if len(ticker_list) == 1:
            # Single ticker: DataFrame has direct columns
            close_prices = df['Close']
        else:
            # Multiple tickers: DataFrame has multi-level columns
            close_prices = df[ticker]['Close']

        # Iterate through dates
        for date_idx, close_value in close_prices.items():
            # Convert pandas Timestamp to string date
            date_str = date_idx.strftime('%Y-%m-%d')

            # Skip NaN values
            if pd.isna(close_value):
                continue

            # Initialize date entry if not exists
            if date_str not in rates_by_date:
                rates_by_date[date_str] = {"date": date_str}

            # Add rate for this currency
            rates_by_date[date_str][currency] = round(float(close_value), 6)

    except Exception as e:
        print(f"Warning: Could not parse data for {currency} ({ticker}): {e}")
        continue

if not rates_by_date:
    print("Error: No valid data parsed from Yahoo Finance")
    exit(1)

print(f"Parsed {len(rates_by_date)} date(s) from Yahoo Finance")

# ----------------------------
# Read existing data if file exists
# ----------------------------
existing_data = []
existing_dates = set()

if OUT_FILE.exists():
    with open(OUT_FILE, 'r', encoding='utf-8') as f:
        existing_json = json.load(f)
        existing_data = existing_json.get('data', [])
        existing_dates = {row['date'] for row in existing_data}
    print(f"Loaded {len(existing_data)} existing rows from {OUT_FILE}")

# ----------------------------
# Merge: Add only new dates
# ----------------------------
new_rows = []
for date_str in sorted(rates_by_date.keys()):
    if date_str not in existing_dates:
        # Fill in None for missing currencies
        row = {"date": date_str}
        for currency in CURRENCIES.keys():
            row[currency] = rates_by_date[date_str].get(currency, None)
        new_rows.append(row)

if not new_rows:
    print("No new dates to add. Data is up to date.")
    exit(0)

print(f"Found {len(new_rows)} new date(s) to add")

# Merge and sort
all_rows = existing_data + new_rows
all_rows.sort(key=lambda x: x['date'])

# ----------------------------
# Build output JSON
# ----------------------------
output = {
    "meta": {
        "source": "Yahoo Finance via yfinance",
        "generated_utc": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total_days": len(all_rows),
        "date_range": {
            "start": all_rows[0]['date'] if all_rows else None,
            "end": all_rows[-1]['date'] if all_rows else None,
        },
        "currencies": CURRENCIES,
        "notes": "FX rates (USD as base) from Yahoo Finance. Data reflects trading days only (no weekends/holidays)."
    },
    "data": all_rows
}

# ----------------------------
# Write to file
# ----------------------------
with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Successfully added {len(new_rows)} new row(s)")
print(f"Total rows in file: {len(all_rows)}")
print(f"Date range: {output['meta']['date_range']['start']} to {output['meta']['date_range']['end']}")
print(f"Output written to: {OUT_FILE}")

# ----------------------------
# Fetch current MNT and AMD rates from ExchangeRate API
# ----------------------------
print("\n" + "=" * 60)
print("Fetching MNT and AMD from ExchangeRate API...")
print("=" * 60)

import requests
import os

# API configuration (from backend config or environment)
API_KEY = os.getenv('EXCHANGERATE_API_KEY', 'bd8b8e35ffa920b5832eb94c')
API_URL = f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD"

try:
    # Fetch current rates from ExchangeRate API
    response = requests.get(API_URL, timeout=10)
    response.raise_for_status()
    api_data = response.json()

    if api_data.get('result') == 'success':
        conversion_rates = api_data.get('conversion_rates', {})

        # Extract MNT and AMD rates
        mnt_rate = conversion_rates.get('MNT')
        amd_rate = conversion_rates.get('AMD')

        print(f"MNT rate: {mnt_rate}")
        print(f"AMD rate: {amd_rate}")

        # Update ExchangeRate history file
        EXCHANGERATE_HISTORY_FILE = PROJECT_ROOT / "backend" / "data" / "json" / "fx_rates_history.json"

        # Load existing history
        if EXCHANGERATE_HISTORY_FILE.exists():
            with open(EXCHANGERATE_HISTORY_FILE, 'r', encoding='utf-8') as f:
                history = json.load(f)
        else:
            history = []

        # Create new snapshot with all 6 currencies
        new_snapshot = {
            "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            "rates": {
                "VND": conversion_rates.get('VND'),
                "TRY": conversion_rates.get('TRY'),
                "MNT": mnt_rate,
                "UZS": conversion_rates.get('UZS'),
                "AMD": amd_rate,
                "GBP": conversion_rates.get('GBP')
            }
        }

        # Append new snapshot
        history.append(new_snapshot)

        # Keep only last 90 days of history (to match Yahoo period)
        # Assuming daily snapshots, keep last 90 entries
        if len(history) > 90:
            history = history[-90:]

        # Write back to file
        with open(EXCHANGERATE_HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)

        print(f"ExchangeRate history updated: {EXCHANGERATE_HISTORY_FILE}")
        print(f"Total snapshots in history: {len(history)}")
    else:
        print(f"ExchangeRate API error: {api_data.get('error-type', 'Unknown error')}")

except requests.exceptions.RequestException as e:
    print(f"Failed to fetch from ExchangeRate API: {str(e)}")
except Exception as e:
    print(f"Error updating ExchangeRate history: {str(e)}")

print("\n" + "=" * 60)
print("Refresh complete!")
print("=" * 60)
