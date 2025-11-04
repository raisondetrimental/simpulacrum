#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CPMM Central Asia Border Crossing Points (BCP) Map Generator

This script processes CPMM BCP indicators and creates an interactive Folium map
showing Transit Friction Indicators (TFI) for Central Asia road border crossings.

Sections:
- Section 1: Load Excel data, tidy it, reshape to long format
- Section 2: Geocoding lookup (offline) - two-phase approach
- Section 3: Filter to Central Asia focus and prepare for mapping
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
import io

# Fix Windows console encoding issues
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ============================================================================
# SECTION 1: LOAD & TIDY DATA
# ============================================================================

def load_and_tidy_data(excel_path: str) -> pd.DataFrame:
    """
    Load CPMM BCP indicators from Excel and tidy the data.

    Steps:
    1. Read the Road sheet
    2. Rename columns to standardized names
    3. Extract corridor codes from BCP codes
    4. Reshape to long format with direction (Inbound/Outbound)
    5. Keep NaN values (no zero-filling)

    Args:
        excel_path: Path to CPMM_BCP_Indicators.xlsx

    Returns:
        Tidy DataFrame with columns: transport, country, corridor, bcp_code,
        bcp_name, direction, tfi1_h, tfi2_usd
    """
    print("=" * 70)
    print("SECTION 1: LOAD & TIDY DATA")
    print("=" * 70)

    # Check if file exists
    if not Path(excel_path).exists():
        print(f"ERROR: Excel file not found: {excel_path}")
        sys.exit(1)

    # Load the Road sheet
    print(f"\nLoading data from: {excel_path}")
    print("Sheet: CPMM_BCP_Indicators_Road")

    try:
        df = pd.read_excel(excel_path, sheet_name='CPMM_BCP_Indicators_Road')
        print(f"[OK] Loaded {len(df)} rows")
    except Exception as e:
        print(f"ERROR loading Excel file: {e}")
        sys.exit(1)

    # Display original columns
    print(f"\nOriginal columns: {list(df.columns)}")

    # Rename columns to standardized names
    print("\n1. Renaming columns to standard format...")
    column_mapping = {
        'Transport': 'transport',
        'Country': 'country',
        'BCP Code': 'bcp_code',
        'BCP Name': 'bcp_name',
        'tfi1_outbound_average': 'tfi1_out_h',
        'tfi1_inbound_average': 'tfi1_in_h',
        'tfi2_outbound_average': 'tfi2_out_usd',
        'tfi2_inbound_average': 'tfi2_in_usd'
    }

    df = df.rename(columns=column_mapping)
    print(f"[OK] Renamed columns: {list(df.columns)}")

    # Extract corridor code from BCP code (e.g., "P07" from "P07-2")
    print("\n2. Extracting corridor codes from BCP codes...")
    df['corridor'] = df['bcp_code'].str.extract(r'^([A-Z]\d+)', expand=False)
    print(f"[OK] Created corridor field from bcp_code")
    print(f"   Unique corridors: {df['corridor'].nunique()}")
    print(f"   Corridors: {sorted(df['corridor'].dropna().unique())}")

    # Reshape to long format
    print("\n3. Reshaping data to long format...")

    # Create separate DataFrames for Outbound and Inbound
    outbound = df[['transport', 'country', 'corridor', 'bcp_code', 'bcp_name', 'tfi1_out_h', 'tfi2_out_usd']].copy()
    outbound['direction'] = 'Outbound'
    outbound = outbound.rename(columns={'tfi1_out_h': 'tfi1_h', 'tfi2_out_usd': 'tfi2_usd'})

    inbound = df[['transport', 'country', 'corridor', 'bcp_code', 'bcp_name', 'tfi1_in_h', 'tfi2_in_usd']].copy()
    inbound['direction'] = 'Inbound'
    inbound = inbound.rename(columns={'tfi1_in_h': 'tfi1_h', 'tfi2_in_usd': 'tfi2_usd'})

    # Concatenate into long format
    tidy_df = pd.concat([outbound, inbound], ignore_index=True)

    # Reorder columns
    tidy_df = tidy_df[['transport', 'country', 'corridor', 'bcp_code', 'bcp_name',
                       'direction', 'tfi1_h', 'tfi2_usd']]

    print(f"[OK] Reshaped to long format: {len(tidy_df)} rows")
    print(f"   Columns: {list(tidy_df.columns)}")

    # Summary statistics
    print("\n4. Data summary:")
    print(f"   Unique BCPs: {tidy_df['bcp_code'].nunique()}")
    print(f"   Unique countries: {tidy_df['country'].nunique()}")
    print(f"   Countries: {sorted(tidy_df['country'].unique())}")
    print(f"   Directions: {tidy_df['direction'].unique()}")

    # Missing data summary
    print("\n5. Missing data analysis:")
    print(f"   TFI1 (hours) missing: {tidy_df['tfi1_h'].isna().sum()} / {len(tidy_df)} ({tidy_df['tfi1_h'].isna().sum()/len(tidy_df)*100:.1f}%)")
    print(f"   TFI2 (USD) missing: {tidy_df['tfi2_usd'].isna().sum()} / {len(tidy_df)} ({tidy_df['tfi2_usd'].isna().sum()/len(tidy_df)*100:.1f}%)")

    # TFI statistics (excluding NaN)
    print("\n6. TFI statistics (excluding missing values):")
    if tidy_df['tfi1_h'].notna().sum() > 0:
        print(f"   TFI1 (hours): min={tidy_df['tfi1_h'].min():.2f}, max={tidy_df['tfi1_h'].max():.2f}, median={tidy_df['tfi1_h'].median():.2f}")
    if tidy_df['tfi2_usd'].notna().sum() > 0:
        print(f"   TFI2 (USD): min={tidy_df['tfi2_usd'].min():.2f}, max={tidy_df['tfi2_usd'].max():.2f}, median={tidy_df['tfi2_usd'].median():.2f}")

    return tidy_df


def export_tidy_csv(tidy_df: pd.DataFrame, output_path: str):
    """Export tidy DataFrame to CSV."""
    print(f"\n7. Exporting tidy data to: {output_path}")
    tidy_df.to_csv(output_path, index=False)
    print(f"[OK] Saved {len(tidy_df)} rows to CSV")

    # Verify file size
    file_size = Path(output_path).stat().st_size
    print(f"   File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")


# ============================================================================
# SECTION 2: GEOCODING LOOKUP (OFFLINE)
# ============================================================================

def create_coords_skeleton(tidy_csv_path: str, coords_csv_path: str) -> bool:
    """
    Phase 2A: Create skeleton CSV with unique BCPs for manual geocoding.

    Args:
        tidy_csv_path: Path to cpmm_road_tidy.csv
        coords_csv_path: Path to create bcp_coords.csv

    Returns:
        True if skeleton created successfully
    """
    print("=" * 70)
    print("SECTION 2A: CREATE GEOCODING SKELETON")
    print("=" * 70)

    # Load tidy data
    print(f"\nLoading tidy data from: {tidy_csv_path}")
    try:
        tidy_df = pd.read_csv(tidy_csv_path)
        print(f"[OK] Loaded {len(tidy_df)} rows")
    except Exception as e:
        print(f"ERROR: Could not load tidy CSV: {e}")
        return False

    # Extract unique BCPs (bcp_code, bcp_name, country)
    print("\n1. Extracting unique BCPs...")
    unique_bcps = tidy_df[['bcp_code', 'bcp_name', 'country']].drop_duplicates()

    # Strip whitespace from BCP names
    unique_bcps['bcp_name'] = unique_bcps['bcp_name'].str.strip()

    # Sort by country then BCP code
    unique_bcps = unique_bcps.sort_values(['country', 'bcp_code']).reset_index(drop=True)

    print(f"[OK] Found {len(unique_bcps)} unique BCPs")
    print(f"   Countries: {unique_bcps['country'].nunique()}")

    # Create empty lat/lon columns
    print("\n2. Creating skeleton with empty lat/lon columns...")
    coords_skeleton = unique_bcps.copy()
    coords_skeleton['lat'] = ''
    coords_skeleton['lon'] = ''

    # Reorder columns
    coords_skeleton = coords_skeleton[['bcp_code', 'bcp_name', 'country', 'lat', 'lon']]

    # Export skeleton
    print(f"\n3. Exporting skeleton to: {coords_csv_path}")
    coords_skeleton.to_csv(coords_csv_path, index=False)
    print(f"[OK] Saved {len(coords_skeleton)} BCPs to skeleton CSV")

    # Show preview
    print("\n4. Preview (first 5 BCPs):")
    print(coords_skeleton.head().to_string(index=False))

    return True


def load_and_join_coords(tidy_csv_path: str, coords_csv_path: str) -> pd.DataFrame:
    """
    Phase 2B: Load coordinates and join to tidy data.

    Args:
        tidy_csv_path: Path to cpmm_road_tidy.csv
        coords_csv_path: Path to filled bcp_coords.csv

    Returns:
        DataFrame with coordinates joined
    """
    print("=" * 70)
    print("SECTION 2B: JOIN COORDINATES")
    print("=" * 70)

    # Load tidy data
    print(f"\nLoading tidy data from: {tidy_csv_path}")
    tidy_df = pd.read_csv(tidy_csv_path)
    print(f"[OK] Loaded {len(tidy_df)} rows")

    # Load coordinates
    print(f"\nLoading coordinates from: {coords_csv_path}")
    coords_df = pd.read_csv(coords_csv_path)
    print(f"[OK] Loaded {len(coords_df)} BCP coordinates")

    # Rename columns to standard names (handle different formats)
    column_mapping = {
        'BCP Name': 'bcp_name',
        'Country': 'country',
        'BCP Code': 'bcp_code',
        'Latitude (Decimal Degrees)': 'lat',
        'Longitude (Decimal Degrees)': 'lon',
        'Geospatial Context': 'geospatial_context'
    }

    # Apply mapping for any columns that exist
    coords_df = coords_df.rename(columns={k: v for k, v in column_mapping.items() if k in coords_df.columns})

    print(f"   Columns in coords file: {list(coords_df.columns)}")

    # Strip whitespace for better matching
    if 'bcp_name' in coords_df.columns:
        coords_df['bcp_name'] = coords_df['bcp_name'].str.strip()
    tidy_df['bcp_name'] = tidy_df['bcp_name'].str.strip()

    # Count how many have coordinates filled
    coords_filled = coords_df[(coords_df['lat'].notna()) & (coords_df['lon'].notna()) &
                               (coords_df['lat'] != '') & (coords_df['lon'] != '')]
    print(f"   BCPs with coordinates filled: {len(coords_filled)} / {len(coords_df)}")

    # Join on bcp_code (primary)
    print("\n1. Joining on bcp_code...")
    # Include geospatial_context if it exists in coords_df
    cols_to_merge = ['bcp_code', 'lat', 'lon']
    if 'geospatial_context' in coords_df.columns:
        cols_to_merge.append('geospatial_context')

    joined_df = tidy_df.merge(
        coords_df[cols_to_merge],
        on='bcp_code',
        how='left'
    )

    # Check for unmatched (fallback join on bcp_name + country)
    unmatched = joined_df[(joined_df['lat'].isna()) | (joined_df['lat'] == '')]
    if len(unmatched) > 0:
        print(f"   {len(unmatched)} rows not matched by bcp_code")
        print("   Attempting fallback join on bcp_name + country...")

        # Create composite key for fallback
        coords_df['name_country'] = coords_df['bcp_name'] + '|' + coords_df['country']
        unmatched_temp = unmatched.copy()
        unmatched_temp['name_country'] = unmatched_temp['bcp_name'] + '|' + unmatched_temp['country']

        # Merge fallback
        fallback_coords = coords_df[['name_country', 'lat', 'lon']].rename(
            columns={'lat': 'lat_fb', 'lon': 'lon_fb'}
        )
        unmatched_temp = unmatched_temp.merge(fallback_coords, on='name_country', how='left')

        # Fill missing coords with fallback
        for idx in unmatched.index:
            if idx in unmatched_temp.index:
                if pd.notna(unmatched_temp.loc[idx, 'lat_fb']) and unmatched_temp.loc[idx, 'lat_fb'] != '':
                    joined_df.loc[idx, 'lat'] = unmatched_temp.loc[idx, 'lat_fb']
                    joined_df.loc[idx, 'lon'] = unmatched_temp.loc[idx, 'lon_fb']

    print(f"[OK] Join complete: {len(joined_df)} rows")

    # Identify BCPs still missing coordinates
    print("\n2. Checking for missing coordinates...")
    still_missing = joined_df[(joined_df['lat'].isna()) | (joined_df['lat'] == '') |
                               (joined_df['lon'].isna()) | (joined_df['lon'] == '')]

    if len(still_missing) > 0:
        missing_bcps = still_missing[['bcp_code', 'bcp_name', 'country']].drop_duplicates()
        print(f"   WARNING: {len(missing_bcps)} BCPs still missing coordinates:")
        for _, row in missing_bcps.iterrows():
            print(f"     - {row['bcp_code']}: {row['bcp_name']} ({row['country']})")
        print(f"   These will be kept in tidy CSV but dropped from mapping.")
    else:
        print("   [OK] All BCPs have coordinates!")

    # Convert lat/lon to numeric (handling empty strings)
    joined_df['lat'] = pd.to_numeric(joined_df['lat'], errors='coerce')
    joined_df['lon'] = pd.to_numeric(joined_df['lon'], errors='coerce')

    return joined_df


def filter_central_asia_focus(joined_df: pd.DataFrame) -> pd.DataFrame:
    """
    Filter to Central Asia focus countries and relevant neighbors.

    Keep:
    - Kazakhstan, Kyrgyz Republic, Tajikistan, Turkmenistan, Uzbekistan
    - Afghanistan, China, Mongolia if they share corridors with Central Asia

    Args:
        joined_df: DataFrame with coordinates joined

    Returns:
        Filtered DataFrame ready for mapping
    """
    print("=" * 70)
    print("SECTION 3: FILTER TO CENTRAL ASIA FOCUS")
    print("=" * 70)

    # Central Asia countries
    central_asia = ['Kazakhstan', 'Kyrgyz Republic', 'Tajikistan', 'Turkmenistan', 'Uzbekistan']
    neighbors = ['Afghanistan', 'Mongolia', "People's Republic of China"]

    print(f"\n1. Identifying Central Asia corridors...")
    # Get corridors that involve Central Asia countries
    ca_corridors = joined_df[joined_df['country'].isin(central_asia)]['corridor'].unique()
    print(f"[OK] Found {len(ca_corridors)} corridors involving Central Asia countries")
    print(f"   Corridors: {sorted(ca_corridors)}")

    print(f"\n2. Filtering data...")
    # Keep Central Asia countries
    filtered_df = joined_df[
        joined_df['country'].isin(central_asia) |
        # Also keep neighbors if they share corridors with Central Asia
        ((joined_df['country'].isin(neighbors)) & (joined_df['corridor'].isin(ca_corridors)))
    ].copy()

    print(f"[OK] Filtered to {len(filtered_df)} rows")
    print(f"   Unique BCPs: {filtered_df['bcp_code'].nunique()}")
    print(f"   Countries: {sorted(filtered_df['country'].unique())}")

    # Summary by country
    print(f"\n3. BCPs by country:")
    country_counts = filtered_df.groupby('country')['bcp_code'].nunique().sort_values(ascending=False)
    for country, count in country_counts.items():
        print(f"   {country}: {count} BCPs")

    return filtered_df


# ============================================================================
# SECTION 4: FOLIUM MAP RENDERING
# ============================================================================

def load_corridor_routes(excel_path: str) -> dict:
    """
    Load Middle Corridor routes from Excel file.

    Args:
        excel_path: Path to Middle_Corridor_Routes.xlsx

    Returns:
        Dictionary with route names and their data (coordinates + color)
    """
    print("\nLoading corridor routes from Excel...")

    if not Path(excel_path).exists():
        print(f"[WARN] Routes file not found: {excel_path}")
        return {}

    try:
        # Load all three sheets
        middle_corridor_1 = pd.read_excel(excel_path, sheet_name='Middle Corridor 1')
        middle_corridor_2 = pd.read_excel(excel_path, sheet_name='Middle Corridor 2')
        southern_corridor = pd.read_excel(excel_path, sheet_name='Southern Middle Corridor')

        # Remove rows with NaN coordinates
        middle_corridor_1 = middle_corridor_1.dropna(subset=['Latitude', 'Longitude'])
        middle_corridor_2 = middle_corridor_2.dropna(subset=['Latitude', 'Longitude'])
        southern_corridor = southern_corridor.dropna(subset=['Latitude', 'Longitude'])

        # Assign different colors to each route
        routes = {
            'Middle Corridor 1': {
                'coordinates': middle_corridor_1[['Latitude', 'Longitude']].values.tolist(),
                'color': '#2563eb'  # Blue
            },
            'Middle Corridor 2': {
                'coordinates': middle_corridor_2[['Latitude', 'Longitude']].values.tolist(),
                'color': '#10b981'  # Green
            },
            'Southern Middle Corridor': {
                'coordinates': southern_corridor[['Latitude', 'Longitude']].values.tolist(),
                'color': '#f59e0b'  # Orange
            }
        }

        print(f"[OK] Loaded 3 corridor routes:")
        print(f"   Middle Corridor 1: {len(routes['Middle Corridor 1']['coordinates'])} points (Blue)")
        print(f"   Middle Corridor 2: {len(routes['Middle Corridor 2']['coordinates'])} points (Green)")
        print(f"   Southern Middle Corridor: {len(routes['Southern Middle Corridor']['coordinates'])} points (Orange)")

        return routes
    except Exception as e:
        print(f"[ERROR] Failed to load routes: {e}")
        return {}


def create_folium_map(mapping_df: pd.DataFrame, output_html: str, routes: dict = None) -> bool:
    """
    Create interactive Folium map with toggleable TFI layers.

    Args:
        mapping_df: DataFrame with coordinates and TFI data
        output_html: Path to save HTML map

    Returns:
        True if map created successfully
    """
    try:
        import folium
        from branca.colormap import LinearColormap
    except ImportError:
        print("ERROR: folium and branca libraries required")
        print("Install with: pip install folium branca")
        return False

    print("=" * 70)
    print("SECTION 4: FOLIUM MAP RENDERING")
    print("=" * 70)

    # Initialize map centered on Central Asia
    print("\n1. Initializing map...")
    m = folium.Map(
        location=[44, 66],  # Central Asia center
        zoom_start=4,
        tiles='OpenStreetMap',
        control_scale=True
    )
    print("[OK] Map centered on Central Asia (44°N, 66°E)")

    # Create color scales
    print("\n2. Creating color scales...")
    # TFI1 (hours) - 0 to max
    tfi1_max = mapping_df['tfi1_h'].max()
    if pd.notna(tfi1_max):
        colormap_tfi1 = LinearColormap(
            colors=['green', 'yellow', 'red'],
            vmin=0,
            vmax=tfi1_max,
            caption='TFI1: Transit Time (hours)'
        )
        print(f"[OK] TFI1 color scale: 0-{tfi1_max:.1f} hours")
    else:
        colormap_tfi1 = None
        print("[WARN] No TFI1 data for color scale")

    # TFI2 (USD) - 0 to max
    tfi2_max = mapping_df['tfi2_usd'].max()
    if pd.notna(tfi2_max):
        colormap_tfi2 = LinearColormap(
            colors=['green', 'yellow', 'red'],
            vmin=0,
            vmax=tfi2_max,
            caption='TFI2: Economic Cost (USD)'
        )
        print(f"[OK] TFI2 color scale: 0-{tfi2_max:.1f} USD")
    else:
        colormap_tfi2 = None
        print("[WARN] No TFI2 data for color scale")

    # Create four layers as base layers (only one visible at a time)
    print("\n3. Creating exclusive layers (radio buttons)...")
    # We'll add these as base layers so only one can be selected at a time
    print("[OK] Created 4 exclusive layers")

    # Helper function to scale radius
    def scale_radius(value, min_val, max_val, min_radius=3, max_radius=15):
        """Scale value to marker radius."""
        if pd.isna(value) or max_val == min_val:
            return min_radius
        normalized = (value - min_val) / (max_val - min_val)
        return min_radius + normalized * (max_radius - min_radius)

    # Helper function to get color
    def get_color(value, colormap):
        """Get color from colormap."""
        if pd.isna(value) or colormap is None:
            return 'gray'
        return colormap(value)

    # Helper function to create popup HTML
    def create_popup_html(row):
        """Create HTML popup content for a BCP."""
        # Get data for both directions for this BCP
        bcp_data = mapping_df[mapping_df['bcp_code'] == row['bcp_code']]

        outbound_data = bcp_data[bcp_data['direction'] == 'Outbound'].iloc[0] if len(bcp_data[bcp_data['direction'] == 'Outbound']) > 0 else None
        inbound_data = bcp_data[bcp_data['direction'] == 'Inbound'].iloc[0] if len(bcp_data[bcp_data['direction'] == 'Inbound']) > 0 else None

        tfi1_out = outbound_data['tfi1_h'] if outbound_data is not None and pd.notna(outbound_data['tfi1_h']) else 'N/A'
        tfi1_in = inbound_data['tfi1_h'] if inbound_data is not None and pd.notna(inbound_data['tfi1_h']) else 'N/A'
        tfi2_out = outbound_data['tfi2_usd'] if outbound_data is not None and pd.notna(outbound_data['tfi2_usd']) else 'N/A'
        tfi2_in = inbound_data['tfi2_usd'] if inbound_data is not None and pd.notna(inbound_data['tfi2_usd']) else 'N/A'

        # Format numbers
        tfi1_out_str = f"{tfi1_out:.1f}h" if tfi1_out != 'N/A' else 'N/A'
        tfi1_in_str = f"{tfi1_in:.1f}h" if tfi1_in != 'N/A' else 'N/A'
        tfi2_out_str = f"${tfi2_out:.0f}" if tfi2_out != 'N/A' else 'N/A'
        tfi2_in_str = f"${tfi2_in:.0f}" if tfi2_in != 'N/A' else 'N/A'

        # Get geospatial context if available
        geospatial_context = row.get('geospatial_context', None)
        geospatial_html = ""
        if geospatial_context and pd.notna(geospatial_context):
            geospatial_html = f'<p style="margin: 5px 0; color: #7f8c8d;"><strong>Type:</strong> {geospatial_context}</p>'

        html = f"""
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">{row['bcp_name']}</h4>
            <p style="margin: 5px 0; color: #7f8c8d;"><strong>Country:</strong> {row['country']}</p>
            {geospatial_html}
            <p style="margin: 5px 0; color: #7f8c8d;"><strong>Corridor:</strong> {row['corridor']}</p>
            <p style="margin: 5px 0; color: #7f8c8d;"><strong>BCP Code:</strong> {row['bcp_code']}</p>
            <hr style="margin: 10px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #ecf0f1;">
                    <th style="padding: 5px; text-align: left;">Direction</th>
                    <th style="padding: 5px; text-align: right;">TFI1 (hours)</th>
                    <th style="padding: 5px; text-align: right;">TFI2 (USD)</th>
                </tr>
                <tr>
                    <td style="padding: 5px;"><strong>Outbound</strong></td>
                    <td style="padding: 5px; text-align: right;">{tfi1_out_str}</td>
                    <td style="padding: 5px; text-align: right;">{tfi2_out_str}</td>
                </tr>
                <tr style="background-color: #ecf0f1;">
                    <td style="padding: 5px;"><strong>Inbound</strong></td>
                    <td style="padding: 5px; text-align: right;">{tfi1_in_str}</td>
                    <td style="padding: 5px; text-align: right;">{tfi2_in_str}</td>
                </tr>
            </table>
        </div>
        """
        return html

    # Get unique BCPs (to avoid duplicates for Outbound/Inbound)
    unique_bcps = mapping_df.drop_duplicates(subset=['bcp_code'])

    # Calculate scaling ranges
    tfi1_min = mapping_df['tfi1_h'].min() if mapping_df['tfi1_h'].notna().any() else 0
    tfi1_max_scale = mapping_df['tfi1_h'].max() if mapping_df['tfi1_h'].notna().any() else 1
    tfi2_min = mapping_df['tfi2_usd'].min() if mapping_df['tfi2_usd'].notna().any() else 0
    tfi2_max_scale = mapping_df['tfi2_usd'].max() if mapping_df['tfi2_usd'].notna().any() else 1

    # Add corridor routes if available (these will be behind BCP markers)
    route_layers = {}
    if routes:
        print("\n3. Adding corridor routes to map...")

        # Helper function to smooth route with spline interpolation
        def smooth_route(coordinates, num_points=100):
            """Smooth route using cubic spline interpolation."""
            if len(coordinates) < 4:
                return coordinates

            try:
                from scipy import interpolate
                import numpy as np

                # Extract lats and lons
                lats = [coord[0] for coord in coordinates]
                lons = [coord[1] for coord in coordinates]

                # Create parameter t for interpolation
                t = np.linspace(0, 1, len(coordinates))
                t_smooth = np.linspace(0, 1, num_points)

                # Cubic spline interpolation
                lat_spline = interpolate.CubicSpline(t, lats, bc_type='natural')
                lon_spline = interpolate.CubicSpline(t, lons, bc_type='natural')

                # Generate smooth coordinates
                smooth_lats = lat_spline(t_smooth)
                smooth_lons = lon_spline(t_smooth)

                return [[lat, lon] for lat, lon in zip(smooth_lats, smooth_lons)]
            except ImportError:
                print("   [WARN] scipy not available, using basic smoothing")
                return coordinates

        for route_name, route_data in routes.items():
            # Create feature group for this route
            route_layer = folium.FeatureGroup(name=route_name, show=False)

            # Extract coordinates and color
            coordinates = route_data['coordinates']
            color = route_data['color']

            # Smooth the route coordinates
            smooth_coords = smooth_route(coordinates, num_points=150)

            # Add polyline with smooth rendering
            folium.PolyLine(
                locations=smooth_coords,
                color=color,
                weight=3,
                opacity=0.7,
                smooth_factor=2.0,
                tooltip=route_name
            ).add_to(route_layer)

            # Add the route layer to map
            route_layer.add_to(m)
            route_layers[route_name] = route_layer
            print(f"   [OK] Added {route_name} ({len(coordinates)} points → {len(smooth_coords)} interpolated)")

    # Create layers as LayerGroups (to use as base layers)
    layer_tfi1_out = folium.FeatureGroup(name='TFI1 Outbound (hours)')
    layer_tfi1_in = folium.FeatureGroup(name='TFI1 Inbound (hours)')
    layer_tfi2_out = folium.FeatureGroup(name='TFI2 Outbound (USD)')
    layer_tfi2_in = folium.FeatureGroup(name='TFI2 Inbound (USD)')

    # Add markers for each layer
    print("\n4. Adding markers to layers...")
    markers_added = {'tfi1_out': 0, 'tfi1_in': 0, 'tfi2_out': 0, 'tfi2_in': 0}

    for _, bcp_row in unique_bcps.iterrows():
        lat, lon = bcp_row['lat'], bcp_row['lon']

        # Create popup HTML (same for all layers but need separate popup objects)
        popup_html = create_popup_html(bcp_row)

        # Create tooltip
        tooltip = f"{bcp_row['bcp_name']} ({bcp_row['country']})"

        # Get data for both directions
        bcp_data = mapping_df[mapping_df['bcp_code'] == bcp_row['bcp_code']]
        outbound = bcp_data[bcp_data['direction'] == 'Outbound'].iloc[0] if len(bcp_data[bcp_data['direction'] == 'Outbound']) > 0 else None
        inbound = bcp_data[bcp_data['direction'] == 'Inbound'].iloc[0] if len(bcp_data[bcp_data['direction'] == 'Inbound']) > 0 else None

        # TFI1 Outbound
        if outbound is not None and pd.notna(outbound['tfi1_h']):
            folium.CircleMarker(
                location=[lat, lon],
                radius=scale_radius(outbound['tfi1_h'], tfi1_min, tfi1_max_scale),
                popup=folium.Popup(popup_html, max_width=300),
                tooltip=tooltip,
                color=get_color(outbound['tfi1_h'], colormap_tfi1),
                fill=True,
                fillColor=get_color(outbound['tfi1_h'], colormap_tfi1),
                fillOpacity=0.7
            ).add_to(layer_tfi1_out)
            markers_added['tfi1_out'] += 1

        # TFI1 Inbound
        if inbound is not None and pd.notna(inbound['tfi1_h']):
            folium.CircleMarker(
                location=[lat, lon],
                radius=scale_radius(inbound['tfi1_h'], tfi1_min, tfi1_max_scale),
                popup=folium.Popup(popup_html, max_width=300),
                tooltip=tooltip,
                color=get_color(inbound['tfi1_h'], colormap_tfi1),
                fill=True,
                fillColor=get_color(inbound['tfi1_h'], colormap_tfi1),
                fillOpacity=0.7
            ).add_to(layer_tfi1_in)
            markers_added['tfi1_in'] += 1

        # TFI2 Outbound
        if outbound is not None and pd.notna(outbound['tfi2_usd']):
            folium.CircleMarker(
                location=[lat, lon],
                radius=scale_radius(outbound['tfi2_usd'], tfi2_min, tfi2_max_scale),
                popup=folium.Popup(popup_html, max_width=300),
                tooltip=tooltip,
                color=get_color(outbound['tfi2_usd'], colormap_tfi2),
                fill=True,
                fillColor=get_color(outbound['tfi2_usd'], colormap_tfi2),
                fillOpacity=0.7
            ).add_to(layer_tfi2_out)
            markers_added['tfi2_out'] += 1

        # TFI2 Inbound
        if inbound is not None and pd.notna(inbound['tfi2_usd']):
            folium.CircleMarker(
                location=[lat, lon],
                radius=scale_radius(inbound['tfi2_usd'], tfi2_min, tfi2_max_scale),
                popup=folium.Popup(popup_html, max_width=300),
                tooltip=tooltip,
                color=get_color(inbound['tfi2_usd'], colormap_tfi2),
                fill=True,
                fillColor=get_color(inbound['tfi2_usd'], colormap_tfi2),
                fillOpacity=0.7
            ).add_to(layer_tfi2_in)
            markers_added['tfi2_in'] += 1

    print(f"[OK] Markers added:")
    print(f"   TFI1 Outbound: {markers_added['tfi1_out']}")
    print(f"   TFI1 Inbound: {markers_added['tfi1_in']}")
    print(f"   TFI2 Outbound: {markers_added['tfi2_out']}")
    print(f"   TFI2 Inbound: {markers_added['tfi2_in']}")

    # Add only the first layer to map by default (others will be available via radio buttons)
    print("\n5. Adding layers to map with exclusive selection...")
    layer_tfi1_out.add_to(m)

    # Add the other layers to map (but hidden initially)
    layer_tfi1_in.add_to(m)
    layer_tfi2_out.add_to(m)
    layer_tfi2_in.add_to(m)

    # Add layer control without base layer tiles
    # This will only show the data layers as overlays (we'll convert them to radio behavior with JS)
    layer_control = folium.LayerControl(
        position='topright',
        collapsed=False,
        autoZIndex=True,
        hideSingleBase=True  # This hides the base layer (OpenStreetMap) from the control
    )
    layer_control.add_to(m)
    print("[OK] Layer control added (exclusive selection)")

    # Add color legends - positioning at top center via custom CSS
    if colormap_tfi1 is not None:
        colormap_tfi1.caption = 'TFI1: Transit Time (hours)'
        m.add_child(colormap_tfi1)
    if colormap_tfi2 is not None:
        colormap_tfi2.caption = 'TFI2: Economic Cost (USD)'
        m.add_child(colormap_tfi2)

    # Add custom CSS for clean, minimalist UI with transparency
    custom_css = """
    <style>
    /* Modern minimalist styling with transparency */
    * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
    }

    /* Hide base layer section in layer control */
    .leaflet-control-layers-base {
        display: none !important;
    }

    /* Hide the separator between base and overlay if it exists */
    .leaflet-control-layers-separator {
        display: none !important;
    }

    /* Color legends - transparent with better typography */
    .legend.leaflet-control {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 10px !important;
        padding: 14px 18px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
        font-size: 13px !important;
        max-width: none !important;
        width: auto !important;
    }

    /* Position first legend at top left */
    .legend.leaflet-control:nth-of-type(1) {
        position: fixed !important;
        top: 15px !important;
        left: 15px !important;
        z-index: 1000 !important;
        margin: 0 !important;
    }

    /* Position second legend below first */
    .legend.leaflet-control:nth-of-type(2) {
        position: fixed !important;
        top: 90px !important;
        left: 15px !important;
        z-index: 1000 !important;
        margin: 0 !important;
    }

    /* Style legend caption */
    .legend .caption {
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #1a1a1a !important;
        margin-bottom: 10px !important;
        letter-spacing: -0.01em !important;
    }

    /* Style legend scale */
    .legend .scale {
        margin-top: 6px !important;
    }

    .legend svg {
        display: block !important;
        max-width: 100% !important;
        height: auto !important;
    }

    /* Layer control - minimal transparent design */
    .leaflet-control-layers {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 10px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
    }

    .leaflet-control-layers-expanded {
        padding: 14px 18px !important;
        min-width: 180px !important;
    }

    /* Layer control labels - better typography */
    .leaflet-control-layers-overlays label {
        font-size: 14px !important;
        font-weight: 500 !important;
        line-height: 1.8 !important;
        padding: 4px 0 !important;
        color: #1a1a1a !important;
        cursor: pointer !important;
        transition: opacity 0.2s ease !important;
        display: flex !important;
        align-items: center !important;
    }

    .leaflet-control-layers-overlays label:hover {
        opacity: 0.7 !important;
    }

    /* Checkboxes */
    .leaflet-control-layers-selector {
        margin-right: 10px !important;
        width: 16px !important;
        height: 16px !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
    }

    /* Layer control toggle button */
    .leaflet-control-layers-toggle {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        width: 44px !important;
        height: 44px !important;
        border-radius: 10px !important;
    }

    /* Popup styling - clean and minimal */
    .leaflet-popup-content-wrapper {
        background: rgba(255, 255, 255, 0.92) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border-radius: 10px !important;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }

    .leaflet-popup-content {
        margin: 18px 20px !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
    }

    .leaflet-popup-tip {
        background: rgba(255, 255, 255, 0.92) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
    }

    /* Ensure unchecked layers appear dimmed */
    .leaflet-control-layers-selector:not(:checked) + span {
        opacity: 0.5 !important;
    }

    /* Zoom control - match the aesthetic */
    .leaflet-control-zoom {
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 10px !important;
        overflow: hidden !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
    }

    .leaflet-control-zoom a {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        color: #1a1a1a !important;
        font-size: 20px !important;
        width: 38px !important;
        height: 38px !important;
        line-height: 38px !important;
        border: none !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
        transition: all 0.2s ease !important;
    }

    .leaflet-control-zoom a:last-child {
        border-bottom: none !important;
    }

    .leaflet-control-zoom a:hover {
        background: rgba(255, 255, 255, 0.95) !important;
    }

    /* Attribution - minimal */
    .leaflet-control-attribution {
        background: rgba(255, 255, 255, 0.7) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        font-size: 11px !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }
    </style>

    <script>
    // Custom JavaScript to manage layer controls
    document.addEventListener('DOMContentLoaded', function() {
        // Get all layer checkboxes
        const layerInputs = document.querySelectorAll('.leaflet-control-layers-overlays input[type="checkbox"]');

        // Separate TFI layers from route layers
        const tfiLayers = [];
        const routeLayers = [];

        layerInputs.forEach(input => {
            const label = input.nextSibling.textContent.trim();
            if (label.startsWith('TFI')) {
                tfiLayers.push(input);
            } else {
                routeLayers.push(input);
            }
        });

        // Apply radio button behavior to TFI layers only
        tfiLayers.forEach(input => {
            input.addEventListener('change', function() {
                if (this.checked) {
                    // Uncheck all other TFI checkboxes
                    tfiLayers.forEach(otherInput => {
                        if (otherInput !== this) {
                            otherInput.checked = false;
                            // Trigger click to hide the layer
                            otherInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    });
                }
            });
        });

        // Route layers work as normal checkboxes (no special behavior needed)

        // Ensure only first TFI layer is checked on load, routes unchecked
        if (tfiLayers.length > 0) {
            tfiLayers[0].checked = true;
            for (let i = 1; i < tfiLayers.length; i++) {
                tfiLayers[i].checked = false;
            }
        }
        routeLayers.forEach(input => {
            input.checked = false;
        });
    });
    </script>
    """
    m.get_root().html.add_child(folium.Element(custom_css))

    # Save map
    print(f"\n6. Saving map to: {output_html}")
    m.save(output_html)
    print(f"[OK] Map saved successfully")

    # Check file size
    file_size = Path(output_html).stat().st_size
    print(f"   File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")

    return True


def create_summary_csv(mapping_df: pd.DataFrame, output_csv: str):
    """
    Create summary CSV with per-country median TFI values and BCP counts.

    Args:
        mapping_df: DataFrame with TFI data
        output_csv: Path to save summary CSV
    """
    print("\n7. Creating summary statistics CSV...")

    # Group by country and direction
    summary_data = []

    for country in mapping_df['country'].unique():
        country_data = mapping_df[mapping_df['country'] == country]

        for direction in ['Outbound', 'Inbound']:
            dir_data = country_data[country_data['direction'] == direction]

            summary_data.append({
                'country': country,
                'direction': direction,
                'bcp_count': dir_data['bcp_code'].nunique(),
                'tfi1_median_h': dir_data['tfi1_h'].median(),
                'tfi2_median_usd': dir_data['tfi2_usd'].median(),
                'tfi1_min_h': dir_data['tfi1_h'].min(),
                'tfi1_max_h': dir_data['tfi1_h'].max(),
                'tfi2_min_usd': dir_data['tfi2_usd'].min(),
                'tfi2_max_usd': dir_data['tfi2_usd'].max()
            })

    summary_df = pd.DataFrame(summary_data)
    summary_df = summary_df.sort_values(['country', 'direction'])

    # Save
    summary_df.to_csv(output_csv, index=False)
    print(f"[OK] Summary saved to: {output_csv}")
    print(f"   {len(summary_df)} rows (countries x directions)")


def display_qa_stats(mapping_df: pd.DataFrame):
    """
    Display QA statistics: counts and top-5 slow/expensive BCPs.

    Args:
        mapping_df: DataFrame with TFI data
    """
    print("\n8. QA Statistics:")
    print("=" * 70)

    total_bcps = mapping_df['bcp_code'].nunique()
    total_rows = len(mapping_df)

    print(f"\nBCPs plotted: {total_bcps}")
    print(f"Total data points: {total_rows} (includes both directions)")

    # Missing data
    tfi1_missing = mapping_df['tfi1_h'].isna().sum()
    tfi2_missing = mapping_df['tfi2_usd'].isna().sum()
    print(f"\nMissing TFI1 data: {tfi1_missing} / {total_rows} ({tfi1_missing/total_rows*100:.1f}%)")
    print(f"Missing TFI2 data: {tfi2_missing} / {total_rows} ({tfi2_missing/total_rows*100:.1f}%)")

    # Top-5 slowest (TFI1 - hours)
    print("\nTop-5 SLOWEST BCPs (TFI1 - Transit Time):")
    top_slow = mapping_df.nlargest(5, 'tfi1_h')[['bcp_code', 'bcp_name', 'country', 'direction', 'tfi1_h']]
    for idx, row in top_slow.iterrows():
        print(f"  {row['tfi1_h']:.1f}h - {row['bcp_name']} ({row['country']}) - {row['direction']}")

    # Top-5 most expensive (TFI2 - USD)
    print("\nTop-5 MOST EXPENSIVE BCPs (TFI2 - Economic Cost):")
    top_expensive = mapping_df.nlargest(5, 'tfi2_usd')[['bcp_code', 'bcp_name', 'country', 'direction', 'tfi2_usd']]
    for idx, row in top_expensive.iterrows():
        print(f"  ${row['tfi2_usd']:.0f} - {row['bcp_name']} ({row['country']}) - {row['direction']}")

    print("=" * 70)


def main():
    """Main entry point with auto-detection for multi-phase processing."""
    # Get project paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / "data"

    # Configuration
    EXCEL_FILE = str(data_dir / "excel" / "CPMM_BCP_Indicators.xlsx")
    TIDY_CSV = str(data_dir / "csv" / "cpmm_road_tidy.csv")
    COORDS_CSV = str(data_dir / "csv" / "bcp_coords.csv")
    MAPPING_CSV = str(data_dir / "csv" / "cpmm_road_mapping.csv")

    # Check if tidy CSV exists
    if not Path(TIDY_CSV).exists():
        print("Tidy CSV not found. Running Section 1...")
        # Section 1: Load & Tidy Data
        tidy_df = load_and_tidy_data(EXCEL_FILE)
        export_tidy_csv(tidy_df, TIDY_CSV)

        print("\n" + "=" * 70)
        print("SECTION 1 COMPLETE")
        print("=" * 70)
        print(f"\nOutput file created: {TIDY_CSV}")
        print("\nNext: Re-run script to proceed to Section 2")
        return

    # Check if coords CSV exists
    if not Path(COORDS_CSV).exists():
        print("Coordinates CSV not found. Running Section 2A...")
        # Section 2A: Create skeleton
        success = create_coords_skeleton(TIDY_CSV, COORDS_CSV)

        if success:
            print("\n" + "=" * 70)
            print("SECTION 2A COMPLETE")
            print("=" * 70)
            print(f"\nSkeleton file created: {COORDS_CSV}")
            print("\n" + "!" * 70)
            print("MANUAL ACTION REQUIRED:")
            print("!" * 70)
            print("\nFill bcp_coords.csv lat/lon columns first (decimal degrees).")
            print("You can use tools like:")
            print("  - Google Maps (right-click -> coordinates)")
            print("  - OpenStreetMap Nominatim")
            print("  - Geocoding services")
            print("\nRe-run this script afterwards to continue to Section 2B.")
            print()
        return

    # Coords CSV exists - check if it has data filled
    print("Coordinates CSV found. Running Section 2B...")
    # Section 2B: Join coordinates
    joined_df = load_and_join_coords(TIDY_CSV, COORDS_CSV)

    # Section 3: Filter to Central Asia focus
    filtered_df = filter_central_asia_focus(joined_df)

    # Drop rows without coordinates for mapping
    mappable_df = filtered_df.dropna(subset=['lat', 'lon'])

    print(f"\n4. Preparing mapping data...")
    print(f"   Total filtered rows: {len(filtered_df)}")
    print(f"   Mappable rows (with coords): {len(mappable_df)}")
    print(f"   Dropped (no coords): {len(filtered_df) - len(mappable_df)}")

    # Export mapping data
    print(f"\n5. Exporting mapping data to: {MAPPING_CSV}")
    mappable_df.to_csv(MAPPING_CSV, index=False)
    print(f"[OK] Saved {len(mappable_df)} mappable rows")

    print("\n" + "=" * 70)
    print("SECTIONS 2 & 3 COMPLETE")
    print("=" * 70)
    print(f"\nOutput files:")
    print(f"  - {TIDY_CSV} (all data)")
    print(f"  - {COORDS_CSV} (geocoding reference)")
    print(f"  - {MAPPING_CSV} (filtered & mappable data)")
    print(f"\nMappable BCPs: {mappable_df['bcp_code'].nunique()}")

    # Check if we have enough data to create map
    if len(mappable_df) == 0:
        print("\n" + "!" * 70)
        print("WARNING: No mappable BCPs with coordinates!")
        print("!" * 70)
        print("Fill coordinates in bcp_coords.csv and re-run.")
        return

    # Section 4: Folium Map Rendering
    MAP_HTML = str(project_root / "output" / "cpmm_central_asia_road_map.html")
    SUMMARY_CSV = str(data_dir / "csv" / "cpmm_road_summary.csv")
    ROUTES_FILE = str(data_dir / "excel" / "Middle_Corridor_Routes.xlsx")

    # Load corridor routes
    corridor_routes = load_corridor_routes(ROUTES_FILE)

    map_success = create_folium_map(mappable_df, MAP_HTML, routes=corridor_routes)

    if map_success:
        # Create summary CSV
        create_summary_csv(mappable_df, SUMMARY_CSV)

        # Display QA stats
        display_qa_stats(mappable_df)

        print("\n" + "=" * 70)
        print("ALL SECTIONS COMPLETE!")
        print("=" * 70)
        print(f"\nFinal output files:")
        print(f"  - {MAP_HTML} (interactive map)")
        print(f"  - {SUMMARY_CSV} (summary statistics)")
        print(f"  - {MAPPING_CSV} (mapping data)")
        print(f"  - {TIDY_CSV} (complete tidy data)")
        print(f"\nOpen {MAP_HTML} in your browser to view the interactive map!")
        print()
    else:
        print("\nERROR: Map generation failed. Check dependencies.")
        print("Install required packages: pip install folium branca")
        print()


if __name__ == "__main__":
    main()