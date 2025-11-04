"""
Countries API Blueprint
Provides country fundamentals data endpoints
"""
import json
import csv
import io
from pathlib import Path
from io import BytesIO
from flask import Blueprint, jsonify, Response
from flask_login import login_required
from openpyxl import Workbook

bp = Blueprint('countries', __name__, url_prefix='/api/countries')

# Mapping of slugs to complete JSON filenames
COMPLETE_DATA_FILES = {
    'armenia': 'Armenia_complete.json',
    'mongolia': 'Mongolia_complete.json',
    'turkiye': 'Turkey_complete.json',
    'uzbekistan': 'Uzbekistan_complete.json',
    'vietnam': 'Vietnam_complete.json'
}


def get_country_data():
    """Load country fundamentals data from JSON file"""
    json_dir = Path(__file__).parent.parent.parent / 'data' / 'json'
    country_file = json_dir / 'country_fundamentals.json'

    try:
        with open(country_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def get_complete_country_data(slug):
    """Load complete country data from Country Json folder"""
    if slug not in COMPLETE_DATA_FILES:
        return None

    json_dir = Path(__file__).parent.parent.parent / 'data' / 'json' / 'Country Json'
    country_file = json_dir / COMPLETE_DATA_FILES[slug]

    try:
        with open(country_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return None


def extract_key_metrics_for_csv(complete_data):
    """Extract key macroeconomic metrics from complete data for CSV export"""
    metrics = []

    # Try to extract IMF Article IV data
    imf_data = complete_data.get('IMF_Article_IV', {})

    if imf_data:
        # GDP Growth metrics
        metrics.append({
            'Metric': 'Real GDP Growth (t-1)',
            'Value': imf_data.get('real_gdp_growth_t-1', 'N/A')
        })
        metrics.append({
            'Metric': 'Real GDP Growth (current)',
            'Value': imf_data.get('real_gdp_growth_t', 'N/A')
        })
        metrics.append({
            'Metric': 'Real GDP Growth (t+1)',
            'Value': imf_data.get('real_gdp_growth_t+1', 'N/A')
        })

        # Inflation
        metrics.append({
            'Metric': 'CPI Inflation (latest)',
            'Value': imf_data.get('cpi_eop_latest', 'N/A')
        })

        # Fiscal metrics
        metrics.append({
            'Metric': 'Overall Fiscal Balance (% GDP)',
            'Value': imf_data.get('overall_balance_gdp', 'N/A')
        })
        metrics.append({
            'Metric': 'Primary Fiscal Balance (% GDP)',
            'Value': imf_data.get('primary_balance_gdp', 'N/A')
        })
        metrics.append({
            'Metric': 'Public Debt (% GDP)',
            'Value': imf_data.get('public_debt_gdp', 'N/A')
        })

        # External metrics
        metrics.append({
            'Metric': 'Current Account (% GDP)',
            'Value': imf_data.get('current_account_gdp', 'N/A')
        })
        metrics.append({
            'Metric': 'Reserves (USD bn)',
            'Value': imf_data.get('reserves_usd_bn', 'N/A')
        })
        metrics.append({
            'Metric': 'Reserves (months of imports)',
            'Value': imf_data.get('reserves_months_imports', 'N/A')
        })

        # Financial sector
        metrics.append({
            'Metric': 'NPL Ratio',
            'Value': imf_data.get('npl_ratio', 'N/A')
        })
        metrics.append({
            'Metric': 'Capital Adequacy Ratio',
            'Value': imf_data.get('capital_adequacy', 'N/A')
        })

    return metrics


@bp.route('', methods=['GET'])
@login_required
def get_all_countries():
    """
    Get list of all countries with basic information

    Returns:
        JSON array of country objects with name, slug, capital, region
    """
    try:
        countries_data = get_country_data()

        # Return simplified list of countries
        countries_list = [
            {
                'name': data['name'],
                'slug': data['slug'],
                'capital': data['capital'],
                'region': data['region']
            }
            for slug, data in countries_data.items()
        ]

        return jsonify({
            'success': True,
            'data': countries_list,
            'count': len(countries_list)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading countries: {str(e)}'
        }), 500


@bp.route('/<slug>', methods=['GET'])
@login_required
def get_country_fundamentals(slug):
    """
    Get detailed fundamentals for a specific country

    Args:
        slug: Country slug (e.g., 'armenia', 'mongolia', 'turkiye')

    Returns:
        JSON object with complete country fundamentals data
    """
    try:
        countries_data = get_country_data()

        if slug not in countries_data:
            return jsonify({
                'success': False,
                'message': f'No data available for country: {slug}'
            }), 404

        return jsonify({
            'success': True,
            'data': countries_data[slug]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading country data: {str(e)}'
        }), 500


@bp.route('/<slug>/complete', methods=['GET'])
@login_required
def get_country_complete_data(slug):
    """
    Get comprehensive country data including IMF, EBRD/ADB, and IMI sections

    Args:
        slug: Country slug (e.g., 'armenia', 'mongolia', 'turkiye')

    Returns:
        JSON object with complete country data from *_complete.json files
    """
    try:
        complete_data = get_complete_country_data(slug)

        if complete_data is None:
            return jsonify({
                'success': False,
                'message': f'No complete data available for country: {slug}'
            }), 404

        return jsonify({
            'success': True,
            'data': complete_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading complete country data: {str(e)}'
        }), 500


@bp.route('/<slug>/export/csv', methods=['GET'])
@login_required
def export_country_csv(slug):
    """
    Export key country metrics to CSV

    Args:
        slug: Country slug (e.g., 'armenia', 'mongolia', 'turkiye')

    Returns:
        CSV file download with key macroeconomic metrics
    """
    try:
        complete_data = get_complete_country_data(slug)

        if complete_data is None:
            return jsonify({
                'success': False,
                'message': f'No data available for country: {slug}'
            }), 404

        # Extract key metrics
        metrics = extract_key_metrics_for_csv(complete_data)

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=['Metric', 'Value'])
        writer.writeheader()
        writer.writerows(metrics)

        # Get country name from fundamentals data
        fundamentals = get_country_data()
        country_name = fundamentals.get(slug, {}).get('name', slug.capitalize())

        # Create response
        csv_content = output.getvalue()
        response = Response(
            csv_content,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={slug}_key_metrics.csv'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error exporting country data: {str(e)}'
        }), 500


@bp.route('/<slug>/export/xlsx', methods=['GET'])
@login_required
def export_country_xlsx(slug):
    """
    Export key country metrics to XLSX

    Args:
        slug: Country slug (e.g., 'armenia', 'mongolia', 'turkiye')

    Returns:
        XLSX file download with key macroeconomic metrics
    """
    try:
        complete_data = get_complete_country_data(slug)

        if complete_data is None:
            return jsonify({
                'success': False,
                'message': f'No data available for country: {slug}'
            }), 404

        # Extract key metrics
        metrics = extract_key_metrics_for_csv(complete_data)

        # Create XLSX workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Key Metrics"

        # Add headers
        ws.append(['Metric', 'Value'])

        # Add data rows
        for metric in metrics:
            ws.append([metric['Metric'], metric['Value']])

        # Get country name from fundamentals data
        fundamentals = get_country_data()
        country_name = fundamentals.get(slug, {}).get('name', slug.capitalize())

        # Save to BytesIO buffer
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Create response
        response = Response(
            output.getvalue(),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={
                'Content-Disposition': f'attachment; filename={slug}_key_metrics.xlsx'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error exporting country data: {str(e)}'
        }), 500
