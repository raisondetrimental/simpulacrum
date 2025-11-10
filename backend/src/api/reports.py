"""
Reports API endpoints
Generate various CSV and Excel reports for data export
"""
from flask import Blueprint, Response, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path
import csv
import io
from datetime import datetime

from ..utils.json_store import read_json_file

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')


@reports_bp.route('/country-preferences/csv', methods=['GET'])
@login_required
def export_country_preferences_csv():
    """
    Export country preferences matrix report
    Shows organizations and their selected countries

    Query Parameters:
        org_type: Filter by organization type (capital_partner, sponsor, counsel, agent)
        country: Filter by specific country

    Returns:
        CSV file with columns: Organization Name, Type, Countries
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])

        # Load organizations
        orgs_file = json_dir / 'organizations.json'
        organizations = read_json_file(orgs_file)

        # Load countries master for name mappings
        countries_file = json_dir / 'countries_master.json'
        countries_master = read_json_file(countries_file)

        # Create country ID to name mapping
        country_names = {c['id']: c['name'] for c in countries_master}

        # Get query parameters for filtering
        org_type_filter = request.args.get('org_type')
        country_filter = request.args.get('country')

        # Filter organizations
        filtered_orgs = []
        for org in organizations:
            # Apply org type filter
            if org_type_filter and org.get('organization_type') != org_type_filter:
                continue

            # Apply country filter
            if country_filter and country_filter not in org.get('countries', []):
                continue

            # Only include organizations with countries
            if org.get('countries'):
                filtered_orgs.append(org)

        # Prepare CSV rows
        rows = []
        for org in filtered_orgs:
            # Get country names (fallback to ID if not in master)
            country_ids = org.get('countries', [])
            country_display = ', '.join([
                country_names.get(c_id, c_id.capitalize())
                for c_id in country_ids
            ])

            rows.append({
                'Organization Name': org.get('name', 'Unknown'),
                'Type': org.get('organization_type', 'Unknown'),
                'Country/HQ': org.get('country', ''),
                'Countries': country_display,
                'Relationship': org.get('relationship', ''),
                'Starred': 'Yes' if org.get('starred') else 'No'
            })

        # Sort by organization type, then name
        rows.sort(key=lambda x: (x['Type'], x['Organization Name']))

        # Create CSV in memory
        output = io.StringIO()

        if rows:
            fieldnames = ['Organization Name', 'Type', 'Country/HQ', 'Countries', 'Relationship', 'Starred']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        else:
            # Write empty CSV with headers
            writer = csv.DictWriter(output, fieldnames=['Organization Name', 'Type', 'Countries'])
            writer.writeheader()

        # Create response
        csv_content = output.getvalue()

        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'country_preferences_{timestamp}.csv'

        if org_type_filter:
            filename = f'country_preferences_{org_type_filter}_{timestamp}.csv'
        if country_filter:
            filename = f'country_preferences_{country_filter}_{timestamp}.csv'

        response = Response(
            csv_content,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error exporting country preferences: {str(e)}'
        }), 500


@reports_bp.route('/country-preferences/matrix/csv', methods=['GET'])
@login_required
def export_country_matrix_csv():
    """
    Export country preferences as a matrix
    Columns: Organization Name, Type, Armenia, Mongolia, Türkiye, Uzbekistan, Vietnam
    Each country column shows Y/N based on whether organization selected it
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])

        # Load organizations
        orgs_file = json_dir / 'organizations.json'
        organizations = read_json_file(orgs_file)

        # Load countries master
        countries_file = json_dir / 'countries_master.json'
        countries_master = read_json_file(countries_file)

        # Sort countries by display_order
        countries_master.sort(key=lambda x: x.get('display_order', 999))
        active_countries = [c for c in countries_master if c.get('active', True)]

        # Prepare CSV rows
        rows = []
        for org in organizations:
            org_countries = org.get('countries', [])

            # Only include if org has countries preference data
            if org_countries or any(c['id'] in org.get('countries', []) for c in active_countries):
                row = {
                    'Organization Name': org.get('name', 'Unknown'),
                    'Type': org.get('organization_type', 'Unknown'),
                    'Country/HQ': org.get('country', ''),
                }

                # Add column for each active country
                for country in active_countries:
                    row[country['name']] = 'Y' if country['id'] in org_countries else 'N'

                rows.append(row)

        # Sort by organization type, then name
        rows.sort(key=lambda x: (x['Type'], x['Organization Name']))

        # Create CSV in memory
        output = io.StringIO()

        if rows:
            # Build fieldnames dynamically
            fieldnames = ['Organization Name', 'Type', 'Country/HQ'] + [c['name'] for c in active_countries]
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        else:
            # Write empty CSV with basic headers
            writer = csv.DictWriter(output, fieldnames=['Organization Name', 'Type'])
            writer.writeheader()

        # Create response
        csv_content = output.getvalue()

        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'country_preferences_matrix_{timestamp}.csv'

        response = Response(
            csv_content,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}'
            }
        )

        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error exporting country matrix: {str(e)}'
        }), 500


@reports_bp.route('/country-preferences/stats', methods=['GET'])
@login_required
def get_country_preferences_stats():
    """
    Get statistics about country preferences across all organizations
    """
    try:
        json_dir = Path(current_app.config['JSON_DIR'])

        # Load organizations
        orgs_file = json_dir / 'organizations.json'
        organizations = read_json_file(orgs_file)

        # Load countries master
        countries_file = json_dir / 'countries_master.json'
        countries_master = read_json_file(countries_file)

        # Initialize stats
        stats = {
            'total_organizations': len(organizations),
            'organizations_with_countries': 0,
            'by_type': {},
            'by_country': {}
        }

        # Initialize country stats
        for country in countries_master:
            stats['by_country'][country['id']] = {
                'name': country['name'],
                'count': 0,
                'by_type': {}
            }

        # Count organizations
        for org in organizations:
            org_type = org.get('organization_type', 'unknown')
            org_countries = org.get('countries', [])

            if org_countries:
                stats['organizations_with_countries'] += 1

                # Count by type
                if org_type not in stats['by_type']:
                    stats['by_type'][org_type] = 0
                stats['by_type'][org_type] += 1

                # Count by country
                for country_id in org_countries:
                    if country_id in stats['by_country']:
                        stats['by_country'][country_id]['count'] += 1

                        if org_type not in stats['by_country'][country_id]['by_type']:
                            stats['by_country'][country_id]['by_type'][org_type] = 0
                        stats['by_country'][country_id]['by_type'][org_type] += 1

        return jsonify({
            'success': True,
            'stats': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting country preferences stats: {str(e)}'
        }), 500
