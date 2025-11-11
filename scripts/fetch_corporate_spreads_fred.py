#!/usr/bin/env python3
"""
Fetch ICE BofA US Corporate Bond Spreads (OAS) from FRED
and append new dates to backend/data/json/Markets/Corporate_Spreads.json

Incremental updates: Only adds dates not already in the JSON file.
First run: Fetches last 90 days. Subsequent runs: Fetch last 14 days.

Series included (basis points, Option-Adjusted Spreads):
Global HY BAMLH0A0HYM2OAS, Global IG BAMLC0A0CMOAS,
EM Corporate BAMLEMCBHYHYLCRPIUSOAS, EM Asia BAMLEMRACRPIUSOAS,
EM EMEA BAMLEMERCRPIUSOAS, EM LatAm BAMLEMLCRPIUSOAS
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
    "BAMLH0A0HYM2": "global_hy",
    "BAMLC0A0CM": "global_ig",
    "BAMLEMHBHYCRPIOAS": "em_corporate",
    "BAMLEMRACRPIASIAOAS": "em_asia",
    "BAMLEMRECRPIEMEAOAS": "em_emea",
    "BAMLEMRLCRPILAOAS": "em_latam",
}

# Output path (relative to project root)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "backend" / "data" / "json" / "Markets"
OUT_FILE = OUT_DIR / "Corporate_Spreads.json"

# FRED endpoint
FRED_URL = "https://api.stlouisfed.org/fred/series/observations"

# ----------------------------
# Determine date window based on file existence
# ----------------------------
today = datetime.now().date()
OUT_DIR.mkdir(parents=True, exist_ok=True)

if OUT_FILE.exists():
    # File exists: Fetch last 14 days for incremental update
    start_date = today - timedelta(days=14)
    print("Existing file found. Fetching last 14 days for incremental update.")
else:
    # First run: Fetch last 120 days (90 day target + buffer)
    start_date = today - timedelta(days=120)
    print("First run. Fetching last 120 days to populate initial 90-day dataset.")

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

# On first run, also filter to last 90 days
if not OUT_FILE.exists() or len(existing_data) == 0:
    last_90_cutoff = today - timedelta(days=90)
    new_dates = [d for d in new_dates if datetime.strptime(d, "%Y-%m-%d").date() >= last_90_cutoff]
    print(f"First run: Filtering to last 90 days")

if not new_dates:
    print("No new dates to add. Data is up to date.")
    exit(0)

print(f"Found {len(new_dates)} new date(s) to add: {', '.join(new_dates[:5])}{' ...' if len(new_dates) > 5 else ''}")

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
        "notes": "ICE BofA US Corporate Bond Option-Adjusted Spreads (basis points). Missing days are None, typically weekends or holidays. Data accumulated incrementally.",
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
