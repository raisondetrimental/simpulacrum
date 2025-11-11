#!/usr/bin/env python3
"""
Fetch Central Bank Policy Rates from BIS SDMX API
and append new dates to backend/data/json/Markets/Policy_Rates.json

Incremental updates: Only adds dates not already in the JSON file.
First run: Fetches ~600 observations. Subsequent runs: Fetch last 14 days.

Countries included:
US (USA), GB (UK), KR (South Korea), AU (Australia),
UZ (Uzbekistan), AM (Armenia), XM (Euro Area)
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
import requests

# ----------------------------
# Configuration
# ----------------------------
COUNTRIES = {
    "US": "USA",
    "GB": "UK",
    "KR": "South Korea",
    "AU": "Australia",
    "TR": "Türkiye",
    "XM": "Euro Area"
}

# Output path (relative to project root)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "backend" / "data" / "json" / "Markets"
OUT_FILE = OUT_DIR / "Policy_Rates.json"

# BIS SDMX v2 endpoint
BIS_URL = "https://stats.bis.org/api/v2/data/dataflow/BIS/WS_CBPOL/1.0/D.US+GB+KR+AU+TR+XM"

# ----------------------------
# Determine observations to fetch based on file existence
# ----------------------------
OUT_DIR.mkdir(parents=True, exist_ok=True)

if OUT_FILE.exists():
    # File exists: Fetch last 14 days for incremental update
    last_n_obs = 14
    print("Existing file found. Fetching last 14 observations for incremental update.")
else:
    # First run: Fetch ~600 observations (about 2 years of business days)
    last_n_obs = 600
    print("First run. Fetching last 600 observations to populate dataset.")

# ----------------------------
# Fetch data from BIS SDMX
# ----------------------------
params = {
    "format": "sdmx-json",
    "lastNObservations": str(last_n_obs)
}

print(f"Fetching from BIS SDMX API: {BIS_URL}")
print(f"Parameters: {params}")

try:
    r = requests.get(BIS_URL, params=params, timeout=60)
    r.raise_for_status()
    payload = r.json()
except requests.RequestException as e:
    print(f"Error fetching data from BIS: {e}")
    exit(1)

# ----------------------------
# Parse SDMX-JSON v2 structure
# ----------------------------
try:
    # Navigate to data.dataSets
    data_wrapper = payload.get("data", {})
    datasets = data_wrapper.get("dataSets", [])
    if not datasets:
        print("No datasets found in response")
        exit(1)

    dataset = datasets[0]
    series = dataset.get("series", {})

    # Get structure for dimension mappings
    structure = data_wrapper.get("structure", {})
    dimensions = structure.get("dimensions", {})
    series_dims = dimensions.get("series", [])
    obs_dims = dimensions.get("observation", [])

    # Find REF_AREA dimension in series dimensions
    ref_area_dim = None
    ref_area_position = None
    for idx, dim in enumerate(series_dims):
        if dim.get("id") == "REF_AREA":
            ref_area_dim = dim
            ref_area_position = idx  # Position in the key (e.g., 0 or 1)
            break

    if not ref_area_dim:
        print("REF_AREA dimension not found")
        exit(1)

    # Build mapping of dimension index to country code
    ref_area_values = {i: v["id"] for i, v in enumerate(ref_area_dim.get("values", []))}
    print(f"REF_AREA is at position {ref_area_position} in series key")
    print(f"Countries available: {list(ref_area_values.values())}")

    # Get time dimension from observation dimensions
    time_dim = None
    for dim in obs_dims:
        if dim.get("id") == "TIME_PERIOD":
            time_dim = dim
            break

    if not time_dim:
        print("TIME_PERIOD dimension not found")
        exit(1)

    time_values = {i: v["id"] for i, v in enumerate(time_dim.get("values", []))}

    # Extract observations organized by (country, date)
    all_observations = {}  # {(country, date): rate}

    for series_key, series_data in series.items():
        # Parse series key (e.g., "0:1" where format is freq:ref_area)
        key_parts = series_key.split(":")
        if len(key_parts) != len(series_dims):
            continue

        # Get REF_AREA index from the key based on its position
        ref_area_key_idx = int(key_parts[ref_area_position])
        country_code = ref_area_values.get(ref_area_key_idx)

        if country_code not in COUNTRIES:
            continue

        # Get observations for this series
        observations = series_data.get("observations", {})

        for time_idx_str, obs_data in observations.items():
            # Get the observation value
            if isinstance(obs_data, list) and len(obs_data) > 0:
                rate_value = obs_data[0]
            else:
                continue

            # Get the date from time dimension values
            time_idx = int(time_idx_str)
            date = time_values.get(time_idx)

            if not date:
                continue

            # Validate and store
            try:
                rate = float(rate_value)
                # Check for NaN and convert to None
                import math
                if math.isnan(rate):
                    continue  # Skip NaN values
                all_observations[(country_code, date)] = rate
            except (ValueError, TypeError):
                continue

except Exception as e:
    print(f"Error parsing SDMX response: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print(f"Parsed {len(all_observations)} observations from BIS")

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
# Organize data by date, then by country
# ----------------------------
# Collect all unique dates from new observations
new_dates_dict = {}  # {date: {country: rate}}

for (country, date), rate in all_observations.items():
    if date not in existing_dates:
        if date not in new_dates_dict:
            new_dates_dict[date] = {}
        new_dates_dict[date][country] = rate

if not new_dates_dict:
    print("No new dates to add. Data is up to date.")
    exit(0)

new_dates = sorted(new_dates_dict.keys())
print(f"Found {len(new_dates)} new date(s) to add: {', '.join(new_dates[:5])}{' ...' if len(new_dates) > 5 else ''}")

# Build rows for NEW dates only
new_rows = []
for date in new_dates:
    row = {"date": date}
    for country_code in COUNTRIES.keys():
        row[country_code] = new_dates_dict[date].get(country_code, None)
    new_rows.append(row)

# Merge existing and new data, then sort by date
all_rows = existing_data + new_rows
all_rows.sort(key=lambda x: x["date"])

# ----------------------------
# Build metadata and write JSON
# ----------------------------
output = {
    "meta": {
        "source": "BIS",
        "endpoint": BIS_URL,
        "dataset": "CBPOL (Central Bank Policy Rates)",
        "countries": COUNTRIES,
        "generated_utc": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "notes": "Central bank policy rates (%). Missing days are None, typically weekends or holidays. Data accumulated incrementally.",
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
