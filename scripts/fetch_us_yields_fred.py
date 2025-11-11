#!/usr/bin/env python3
"""
Fetch last week of US Treasury constant-maturity yields from FRED
and append new dates to backend/data/json/Markets/US_Yields.json

Incremental updates: Only adds dates not already in the JSON file.

Series included (percent p.a.):
1M DGS1MO, 3M DGS3MO, 6M DGS6MO, 1Y DGS1, 2Y DGS2, 3Y DGS3,
5Y DGS5, 7Y DGS7, 10Y DGS10, 20Y DGS20, 30Y DGS30
"""

import os
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import requests

# ----------------------------
# Configuration
# ----------------------------
API_KEY = os.getenv("FRED_API_KEY", "").strip()
if not API_KEY:
    raise RuntimeError("Set FRED_API_KEY environment variable with your FRED API key.")

SERIES = {
    "DGS1MO": "1_month",
    "DGS3MO": "3_month",
    "DGS6MO": "6_month",
    "DGS1": "1_year",
    "DGS2": "2_year",
    "DGS3": "3_year",
    "DGS5": "5_year",
    "DGS7": "7_year",
    "DGS10": "10_year",
    "DGS20": "20_year",
    "DGS30": "30_year",
}

# Output path (relative to project root)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "backend" / "data" / "json" / "Markets"
OUT_FILE = OUT_DIR / "US_Yields.json"

# FRED endpoint
FRED_URL = "https://api.stlouisfed.org/fred/series/observations"

# Date window: Fetch last 14 days (covers weekends/holidays)
today = datetime.now().date()
start_date = today - timedelta(days=14)
obs_start = start_date.strftime("%Y-%m-%d")

# ----------------------------
# Helper to fetch one series
# ----------------------------
def fetch_series(series_id: str) -> dict:
    params = {
        "series_id": series_id,
        "api_key": API_KEY,
        "file_type": "json",
        "observation_start": obs_start,
    }
    r = requests.get(FRED_URL, params=params, timeout=30)
    r.raise_for_status()
    payload = r.json()
    # Map date -> float value or None
    out = {}
    for obs in payload.get("observations", []):
        date = obs.get("date")
        val_raw = obs.get("value", "")
        try:
            val = float(val_raw)
        except ValueError:
            val = None
        out[date] = val
    return out

# ----------------------------
# Read existing data
# ----------------------------
existing_data = []
existing_dates = set()

OUT_DIR.mkdir(parents=True, exist_ok=True)

if OUT_FILE.exists():
    with open(OUT_FILE, "r", encoding="utf-8") as f:
        existing_json = json.load(f)
        existing_data = existing_json.get("data", [])
        existing_dates = {row["date"] for row in existing_data}
    print(f"Loaded {len(existing_data)} existing rows from {OUT_FILE}")
else:
    print(f"No existing file found. Creating new file at {OUT_FILE}")

# ----------------------------
# Fetch all series and merge by date
# ----------------------------
all_series_data = {}
for sid in SERIES:
    data = fetch_series(sid)
    all_series_data[sid] = data
    # Be polite to the API
    time.sleep(0.2)

# Collect all dates present across series
all_dates = set()
for d in all_series_data.values():
    all_dates.update(d.keys())

# Filter to only NEW dates not already in existing data
new_dates = sorted([d for d in all_dates if d not in existing_dates])

if not new_dates:
    print("No new dates to add. Data is up to date.")
    exit(0)

print(f"Found {len(new_dates)} new date(s) to add: {', '.join(new_dates)}")

# Build rows for NEW dates only
new_rows = []
for d in new_dates:
    row = {"date": d}
    for sid, label in SERIES.items():
        row[label] = all_series_data.get(sid, {}).get(d, None)
    new_rows.append(row)

# Merge existing and new data, then sort by date
all_rows = existing_data + new_rows
all_rows.sort(key=lambda x: x["date"])

# ----------------------------
# Build metadata and write JSON
# ----------------------------
output = {
    "meta": {
        "source": "FRED",
        "endpoint": FRED_URL,
        "series_ids": SERIES,
        "generated_utc": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "notes": "Values are percent per annum. Missing days are None, typically weekends or holidays. Data accumulated incrementally.",
        "total_days": len(all_rows),
        "date_range": {
            "start": all_rows[0]["date"] if all_rows else None,
            "end": all_rows[-1]["date"] if all_rows else None,
        }
    },
    "data": all_rows,
}

with open(OUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Successfully added {len(new_rows)} new row(s)")
print(f"Total rows in file: {len(all_rows)}")
print(f"Date range: {output['meta']['date_range']['start']} to {output['meta']['date_range']['end']}")
