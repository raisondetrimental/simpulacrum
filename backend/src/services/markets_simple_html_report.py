"""
Markets Weekly Report Generator - Simple HTML Version

Generates clean, table-based HTML reports without complex charting dependencies.
Focus on data presentation with simple, reliable formatting.
"""

from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
import json


class MarketsSimpleHTMLReportGenerator:
    """Generate simple, table-based weekly markets HTML reports"""

    def __init__(self, json_dir: Path):
        """Initialize report generator with path to market data JSON files"""
        self.json_dir = Path(json_dir)
        self.generated_at = datetime.now()

    def _load_market_data(self, filename: str) -> Dict[str, Any]:
        """Load market data from JSON file"""
        file_path = self.json_dir / filename
        if not file_path.exists():
            return {}

        with open(file_path, 'r') as f:
            return json.load(f)

    def _filter_to_recent(self, data: List[Dict], days: int = 30) -> List[Dict]:
        """Filter data to recent days"""
        if not data:
            return []

        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        filtered = [d for d in data if d.get('date', '') >= cutoff]
        return filtered[-5:] if len(filtered) > 5 else filtered  # Max 5 rows for tables

    def _filter_for_charts(self, data: List[Dict], days: int = 90) -> List[Dict]:
        """Filter data for charts (more data points)"""
        if not data:
            return []

        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        return [d for d in data if d.get('date', '') >= cutoff]

    def _format_number(self, value, decimals=2, suffix=''):
        """Format number with specified decimals"""
        if value is None:
            return 'N/A'
        return f"{value:.{decimals}f}{suffix}"

    def _format_date(self, date_str):
        """Format ISO date string"""
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', ''))
            return dt.strftime('%Y-%m-%d')
        except:
            return date_str

    def _generate_html(self) -> str:
        """Generate complete HTML report"""

        # Load all market data
        us_yields = self._load_market_data('Markets/US_Yields.json')
        corporate_bonds = self._load_market_data('Markets/Corporate_Bonds.json')
        corporate_spreads = self._load_market_data('Markets/Corporate_Spreads.json')
        corporate_yields = self._load_market_data('Markets/Corporate_Yields.json')
        policy_rates = self._load_market_data('Markets/Policy_Rates.json')
        fx_rates = self._load_market_data('Markets/FX_Rates_Yahoo.json')

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markets Weekly Report - {self.generated_at.strftime('%B %d, %Y')}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: Arial, sans-serif;
            line-height: 1.3;
            color: #000;
            background: white;
            padding: 10px;
            font-size: 10pt;
        }}

        .container {{
            max-width: 100%;
            margin: 0 auto;
            background: white;
            padding: 10px;
        }}

        .header {{
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000;
        }}

        h1 {{
            font-size: 18pt;
            font-weight: 700;
            color: #000;
            margin: 0 0 5px 0;
        }}

        .report-meta {{
            color: #333;
            font-size: 9pt;
            margin: 0;
        }}

        .report-meta p {{
            margin: 2px 0;
        }}

        .section {{
            margin: 15px 0;
            page-break-inside: avoid;
        }}

        .section-title {{
            font-size: 14pt;
            font-weight: 700;
            color: #000;
            margin: 10px 0 5px 0;
            padding-bottom: 3px;
            border-bottom: 1px solid #000;
        }}

        .section-meta {{
            color: #666;
            font-size: 8pt;
            margin: 0 0 8px 0;
        }}

        .data-grid {{
            display: none;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 9pt;
            background: white;
        }}

        thead {{
            background: #f0f0f0;
        }}

        th {{
            padding: 4px 6px;
            text-align: left;
            font-weight: 600;
            color: #000;
            border: 1px solid #ccc;
            white-space: nowrap;
            font-size: 9pt;
        }}

        td {{
            padding: 3px 6px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }}

        tbody tr:nth-child(even) {{
            background: #f8f8f8;
        }}

        .number {{
            text-align: right;
            font-family: 'Courier New', monospace;
        }}

        .no-data {{
            padding: 10px;
            text-align: center;
            color: #666;
            font-size: 9pt;
            margin: 5px 0;
        }}

        .print-button {{
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10pt;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }}

        .print-button:hover {{
            background: #1d4ed8;
        }}

        h3 {{
            font-size: 11pt;
            margin: 8px 0 5px 0;
            font-weight: 600;
        }}

        .chart-container {{
            height: 250px;
            margin: 10px 0;
            page-break-inside: avoid;
        }}

        canvas {{
            max-height: 250px;
        }}

        @media print {{
            body {{
                padding: 5px;
                font-size: 8pt;
            }}

            .container {{
                padding: 0;
            }}

            .print-button {{
                display: none;
            }}

            .section {{
                page-break-inside: avoid;
                margin: 10px 0;
            }}

            .section-title {{
                font-size: 11pt;
                margin: 8px 0 3px 0;
            }}

            table {{
                font-size: 7pt;
                margin: 5px 0;
            }}

            th, td {{
                padding: 2px 4px;
                font-size: 7pt;
            }}

            h3 {{
                font-size: 9pt;
                margin: 5px 0 3px 0;
            }}

            .chart-container {{
                height: 180px;
                margin: 5px 0;
            }}

            canvas {{
                max-height: 180px;
            }}

            @page {{
                margin: 0.5in;
                size: letter;
            }}
        }}
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>

    <div class="container">
        <div class="header">
            <h1>Markets Weekly Report</h1>
            <div class="report-meta">
                <p><strong>Generated:</strong> {self.generated_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>Data Period:</strong> Last 30 Days</p>
            </div>
        </div>

        {self._generate_us_yields_section(us_yields)}
        {self._generate_corporate_bonds_section(corporate_bonds)}
        {self._generate_corporate_spreads_section(corporate_spreads)}
        {self._generate_corporate_yields_section(corporate_yields)}
        {self._generate_policy_rates_section(policy_rates)}
        {self._generate_fx_markets_section(fx_rates)}

        <div style="margin-top: 20px; padding-top: 8px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 8pt;">
            <p style="margin: 0;">Markets Weekly Report | Meridian Universal | {self.generated_at.strftime('%Y')}</p>
        </div>
    </div>
</body>
</html>"""

        return html

    def _generate_us_yields_section(self, us_yields: Dict) -> str:
        """Generate US Treasury Yields section"""
        if not us_yields or not us_yields.get('data'):
            return f"""
        <div class="section">
            <h2 class="section-title">US Treasury Yields</h2>
            <div class="no-data">No data available</div>
        </div>"""

        metadata = us_yields.get('meta', {})
        data = us_yields.get('data', [])
        filtered_data = self._filter_to_recent(data, 30)
        chart_data = self._filter_for_charts(data, 90)

        if not filtered_data:
            return f"""
        <div class="section">
            <h2 class="section-title">US Treasury Yields</h2>
            <div class="no-data">No recent data available</div>
        </div>"""

        latest = filtered_data[-1]

        # Prepare chart data
        chart_dates = [d['date'] for d in chart_data]
        y2_data = [d.get('2_year') for d in chart_data]
        y10_data = [d.get('10_year') for d in chart_data]
        y30_data = [d.get('30_year') for d in chart_data]

        # Historical table (only 5 rows)
        table_rows = ""
        for entry in reversed(filtered_data):
            date = self._format_date(entry.get('date', ''))
            table_rows += f"""
            <tr>
                <td>{date}</td>
                <td class="number">{self._format_number(entry.get('1_month'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('3_month'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('6_month'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('1_year'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('2_year'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('5_year'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('10_year'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('30_year'), 2, '%')}</td>
            </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">US Treasury Yields</h2>
            <p class="section-meta">Source: {metadata.get('source', 'FRED')} | Latest: 2Y={self._format_number(latest.get('2_year'), 2, '%')}, 10Y={self._format_number(latest.get('10_year'), 2, '%')}, 30Y={self._format_number(latest.get('30_year'), 2, '%')}</p>

            <div class="chart-container">
                <canvas id="usYieldsChart"></canvas>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="number">1M</th>
                        <th class="number">3M</th>
                        <th class="number">6M</th>
                        <th class="number">1Y</th>
                        <th class="number">2Y</th>
                        <th class="number">5Y</th>
                        <th class="number">10Y</th>
                        <th class="number">30Y</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <script>
                const usYieldsCtx = document.getElementById('usYieldsChart');
                if (usYieldsCtx) {{
                    new Chart(usYieldsCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(chart_dates)},
                            datasets: [
                                {{
                                    label: '2Y',
                                    data: {json.dumps(y2_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: '10Y',
                                    data: {json.dumps(y10_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: '30Y',
                                    data: {json.dumps(y30_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top',
                                    labels: {{ font: {{ size: 9 }} }}
                                }},
                                title: {{
                                    display: true,
                                    text: '90-Day Trend',
                                    font: {{ size: 10, weight: 'bold' }}
                                }}
                            }},
                            scales: {{
                                x: {{
                                    display: false
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)',
                                        font: {{ size: 9 }}
                                    }},
                                    ticks: {{ font: {{ size: 8 }} }}
                                }}
                            }}
                        }}
                    }});
                }}
            </script>
        </div>"""

    def _generate_corporate_bonds_section(self, corporate_bonds: Dict) -> str:
        """Generate Corporate Bonds section"""
        if not corporate_bonds or not corporate_bonds.get('data'):
            return f"""
        <div class="section">
            <h2 class="section-title">Corporate Bonds</h2>
            <div class="no-data">No data available</div>
        </div>"""

        metadata = corporate_bonds.get('meta', {})
        data = corporate_bonds.get('data', [])
        filtered_data = self._filter_to_recent(data, 30)
        chart_data = self._filter_for_charts(data, 90)

        if not filtered_data:
            return f"""
        <div class="section">
            <h2 class="section-title">Corporate Bonds</h2>
            <div class="no-data">No recent data available</div>
        </div>"""

        latest = filtered_data[-1]

        # Prepare chart data
        chart_dates = [d['date'] for d in chart_data]
        aaa_data = [d.get('aaa') for d in chart_data]
        bbb_data = [d.get('bbb') for d in chart_data]
        hy_data = [d.get('high_yield') for d in chart_data]

        # Historical table
        table_rows = ""
        for entry in reversed(filtered_data):
            date = self._format_date(entry.get('date', ''))
            table_rows += f"""
            <tr>
                <td>{date}</td>
                <td class="number">{self._format_number(entry.get('aaa'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('aa'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('a'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('bbb'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('bb'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('high_yield'), 2, '%')}</td>
            </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">Corporate Bonds</h2>
            <p class="section-meta">Source: {metadata.get('source', 'FRED')} | Latest: AAA={self._format_number(latest.get('aaa'), 2, '%')}, BBB={self._format_number(latest.get('bbb'), 2, '%')}, HY={self._format_number(latest.get('high_yield'), 2, '%')}</p>

            <div class="chart-container">
                <canvas id="corpBondsChart"></canvas>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="number">AAA</th>
                        <th class="number">AA</th>
                        <th class="number">A</th>
                        <th class="number">BBB</th>
                        <th class="number">BB</th>
                        <th class="number">High Yield</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <script>
                const corpBondsCtx = document.getElementById('corpBondsChart');
                if (corpBondsCtx) {{
                    new Chart(corpBondsCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(chart_dates)},
                            datasets: [
                                {{
                                    label: 'AAA',
                                    data: {json.dumps(aaa_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'BBB',
                                    data: {json.dumps(bbb_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'High Yield',
                                    data: {json.dumps(hy_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top',
                                    labels: {{ font: {{ size: 9 }} }}
                                }},
                                title: {{
                                    display: true,
                                    text: '90-Day Trend',
                                    font: {{ size: 10, weight: 'bold' }}
                                }}
                            }},
                            scales: {{
                                x: {{
                                    display: false
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)',
                                        font: {{ size: 9 }}
                                    }},
                                    ticks: {{ font: {{ size: 8 }} }}
                                }}
                            }}
                        }}
                    }});
                }}
            </script>
        </div>"""

    def _generate_corporate_spreads_section(self, corporate_spreads: Dict) -> str:
        """Generate Corporate Spreads section"""
        if not corporate_spreads or not corporate_spreads.get('data'):
            return ""

        data = corporate_spreads.get('data', [])
        filtered_data = self._filter_to_recent(data, 30)
        chart_data = self._filter_for_charts(data, 90)

        if not filtered_data:
            return ""

        latest = filtered_data[-1]

        # Prepare chart data
        chart_dates = [d['date'] for d in chart_data]
        global_hy_data = [d.get('global_hy') for d in chart_data]
        global_ig_data = [d.get('global_ig') for d in chart_data]
        em_corp_data = [d.get('em_corporate') for d in chart_data]

        # Historical table
        table_rows = ""
        for entry in reversed(filtered_data):
            date = self._format_date(entry.get('date', ''))
            table_rows += f"""
            <tr>
                <td>{date}</td>
                <td class="number">{self._format_number(entry.get('global_hy'), 0, ' bps')}</td>
                <td class="number">{self._format_number(entry.get('global_ig'), 0, ' bps')}</td>
                <td class="number">{self._format_number(entry.get('em_corporate'), 0, ' bps')}</td>
                <td class="number">{self._format_number(entry.get('em_asia'), 0, ' bps')}</td>
                <td class="number">{self._format_number(entry.get('em_emea'), 0, ' bps')}</td>
                <td class="number">{self._format_number(entry.get('em_latam'), 0, ' bps')}</td>
            </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">Corporate Spreads (OAS)</h2>
            <p class="section-meta">Source: FRED | Latest: Global HY={self._format_number(latest.get('global_hy'), 0, 'bps')}, Global IG={self._format_number(latest.get('global_ig'), 0, 'bps')}, EM Corp={self._format_number(latest.get('em_corporate'), 0, 'bps')}</p>

            <div class="chart-container">
                <canvas id="corpSpreadsChart"></canvas>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="number">Global HY</th>
                        <th class="number">Global IG</th>
                        <th class="number">EM Corp</th>
                        <th class="number">EM Asia</th>
                        <th class="number">EM EMEA</th>
                        <th class="number">EM LatAm</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <script>
                const corpSpreadsCtx = document.getElementById('corpSpreadsChart');
                if (corpSpreadsCtx) {{
                    new Chart(corpSpreadsCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(chart_dates)},
                            datasets: [
                                {{
                                    label: 'Global HY',
                                    data: {json.dumps(global_hy_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'Global IG',
                                    data: {json.dumps(global_ig_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'EM Corp',
                                    data: {json.dumps(em_corp_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top',
                                    labels: {{ font: {{ size: 9 }} }}
                                }},
                                title: {{
                                    display: true,
                                    text: '90-Day Trend',
                                    font: {{ size: 10, weight: 'bold' }}
                                }}
                            }},
                            scales: {{
                                x: {{
                                    display: false
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Spread (bps)',
                                        font: {{ size: 9 }}
                                    }},
                                    ticks: {{ font: {{ size: 8 }} }}
                                }}
                            }}
                        }}
                    }});
                }}
            </script>
        </div>"""

    def _generate_corporate_yields_section(self, corporate_yields: Dict) -> str:
        """Generate Corporate Yields section"""
        if not corporate_yields or not corporate_yields.get('data'):
            return ""

        data = corporate_yields.get('data', [])
        filtered_data = self._filter_to_recent(data, 30)
        chart_data = self._filter_for_charts(data, 90)

        if not filtered_data:
            return ""

        latest = filtered_data[-1]

        # Prepare chart data
        chart_dates = [d['date'] for d in chart_data]
        global_hy_data = [d.get('global_hy') for d in chart_data]
        global_ig_data = [d.get('global_ig_bbb') for d in chart_data]
        em_corp_data = [d.get('em_corporate') for d in chart_data]

        # Historical table
        table_rows = ""
        for entry in reversed(filtered_data):
            date = self._format_date(entry.get('date', ''))
            table_rows += f"""
            <tr>
                <td>{date}</td>
                <td class="number">{self._format_number(entry.get('global_hy'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('global_ig_bbb'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('em_corporate'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('em_asia'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('em_emea'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('em_latam'), 2, '%')}</td>
            </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">Corporate Yields (Effective)</h2>
            <p class="section-meta">Source: FRED | Latest: Global HY={self._format_number(latest.get('global_hy'), 2, '%')}, Global IG={self._format_number(latest.get('global_ig_bbb'), 2, '%')}, EM Corp={self._format_number(latest.get('em_corporate'), 2, '%')}</p>

            <div class="chart-container">
                <canvas id="corpYieldsChart"></canvas>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="number">Global HY</th>
                        <th class="number">Global IG (BBB)</th>
                        <th class="number">EM Corp</th>
                        <th class="number">EM Asia</th>
                        <th class="number">EM EMEA</th>
                        <th class="number">EM LatAm</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <script>
                const corpYieldsCtx = document.getElementById('corpYieldsChart');
                if (corpYieldsCtx) {{
                    new Chart(corpYieldsCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(chart_dates)},
                            datasets: [
                                {{
                                    label: 'Global HY',
                                    data: {json.dumps(global_hy_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'Global IG',
                                    data: {json.dumps(global_ig_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'EM Corp',
                                    data: {json.dumps(em_corp_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top',
                                    labels: {{ font: {{ size: 9 }} }}
                                }},
                                title: {{
                                    display: true,
                                    text: '90-Day Trend',
                                    font: {{ size: 10, weight: 'bold' }}
                                }}
                            }},
                            scales: {{
                                x: {{
                                    display: false
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)',
                                        font: {{ size: 9 }}
                                    }},
                                    ticks: {{ font: {{ size: 8 }} }}
                                }}
                            }}
                        }}
                    }});
                }}
            </script>
        </div>"""

    def _generate_policy_rates_section(self, policy_rates: Dict) -> str:
        """Generate Policy Rates section"""
        if not policy_rates or not policy_rates.get('data'):
            return ""

        data = policy_rates.get('data', [])
        filtered_data = self._filter_to_recent(data, 30)
        chart_data = self._filter_for_charts(data, 90)

        if not filtered_data:
            return ""

        latest = filtered_data[-1]

        # Prepare chart data
        chart_dates = [d['date'] for d in chart_data]
        us_data = [d.get('US') for d in chart_data]
        gb_data = [d.get('GB') for d in chart_data]
        tr_data = [d.get('TR') for d in chart_data]

        # Historical table
        table_rows = ""
        for entry in reversed(filtered_data):
            date = self._format_date(entry.get('date', ''))
            table_rows += f"""
            <tr>
                <td>{date}</td>
                <td class="number">{self._format_number(entry.get('US'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('GB'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('KR'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('AU'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('TR'), 2, '%')}</td>
                <td class="number">{self._format_number(entry.get('XM'), 2, '%')}</td>
            </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">Central Bank Policy Rates</h2>
            <p class="section-meta">Source: BIS SDMX | Latest: USA={self._format_number(latest.get('US'), 2, '%')}, UK={self._format_number(latest.get('GB'), 2, '%')}, Turkey={self._format_number(latest.get('TR'), 2, '%')}</p>

            <div class="chart-container">
                <canvas id="policyRatesChart"></canvas>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="number">USA</th>
                        <th class="number">UK</th>
                        <th class="number">S. Korea</th>
                        <th class="number">Australia</th>
                        <th class="number">Turkey</th>
                        <th class="number">Euro Area</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <script>
                const policyRatesCtx = document.getElementById('policyRatesChart');
                if (policyRatesCtx) {{
                    new Chart(policyRatesCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(chart_dates)},
                            datasets: [
                                {{
                                    label: 'USA',
                                    data: {json.dumps(us_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'UK',
                                    data: {json.dumps(gb_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }},
                                {{
                                    label: 'Turkey',
                                    data: {json.dumps(tr_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top',
                                    labels: {{ font: {{ size: 9 }} }}
                                }},
                                title: {{
                                    display: true,
                                    text: '90-Day Trend',
                                    font: {{ size: 10, weight: 'bold' }}
                                }}
                            }},
                            scales: {{
                                x: {{
                                    display: false
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Rate (%)',
                                        font: {{ size: 9 }}
                                    }},
                                    ticks: {{ font: {{ size: 8 }} }}
                                }}
                            }}
                        }}
                    }});
                }}
            </script>
        </div>"""

    def _generate_fx_markets_section(self, fx_rates: Dict) -> str:
        """Generate FX Markets section"""
        if not fx_rates or not fx_rates.get('data'):
            return ""

        data = fx_rates.get('data', [])
        filtered_data = self._filter_to_recent(data, 30)
        chart_data = self._filter_for_charts(data, 90)

        if not filtered_data:
            return ""

        latest = filtered_data[-1]

        # Prepare chart data - normalize to index for better comparison
        chart_dates = [d['date'] for d in chart_data]
        vnd_data = [d.get('VND') for d in chart_data]
        try_data = [d.get('TRY') for d in chart_data]
        mnt_data = [d.get('MNT') for d in chart_data]

        # Historical table
        table_rows = ""
        for entry in reversed(filtered_data):
            date = self._format_date(entry.get('date', ''))
            table_rows += f"""
            <tr>
                <td>{date}</td>
                <td class="number">{self._format_number(entry.get('VND'), 0)}</td>
                <td class="number">{self._format_number(entry.get('TRY'), 2)}</td>
                <td class="number">{self._format_number(entry.get('MNT'), 0)}</td>
                <td class="number">{self._format_number(entry.get('UZS'), 0)}</td>
                <td class="number">{self._format_number(entry.get('AMD'), 0)}</td>
                <td class="number">{self._format_number(entry.get('GBP'), 4)}</td>
            </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">Foreign Exchange Rates (per 1 USD)</h2>
            <p class="section-meta">Source: Yahoo Finance | Latest: VND={self._format_number(latest.get('VND'), 0)}, TRY={self._format_number(latest.get('TRY'), 2)}, MNT={self._format_number(latest.get('MNT'), 0)}</p>

            <div class="chart-container">
                <canvas id="fxRatesChart"></canvas>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="number">VND</th>
                        <th class="number">TRY</th>
                        <th class="number">MNT</th>
                        <th class="number">UZS</th>
                        <th class="number">AMD</th>
                        <th class="number">GBP</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <script>
                const fxRatesCtx = document.getElementById('fxRatesChart');
                if (fxRatesCtx) {{
                    new Chart(fxRatesCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(chart_dates)},
                            datasets: [
                                {{
                                    label: 'VND',
                                    data: {json.dumps(vnd_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0,
                                    yAxisID: 'y'
                                }},
                                {{
                                    label: 'TRY',
                                    data: {json.dumps(try_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0,
                                    yAxisID: 'y1'
                                }},
                                {{
                                    label: 'MNT',
                                    data: {json.dumps(mnt_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1,
                                    pointRadius: 0,
                                    yAxisID: 'y'
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {{
                                mode: 'index',
                                intersect: false
                            }},
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top',
                                    labels: {{ font: {{ size: 9 }} }}
                                }},
                                title: {{
                                    display: true,
                                    text: '90-Day Trend',
                                    font: {{ size: 10, weight: 'bold' }}
                                }}
                            }},
                            scales: {{
                                x: {{
                                    display: false
                                }},
                                y: {{
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    title: {{
                                        display: true,
                                        text: 'VND/MNT',
                                        font: {{ size: 8 }}
                                    }},
                                    ticks: {{ font: {{ size: 7 }} }}
                                }},
                                y1: {{
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    title: {{
                                        display: true,
                                        text: 'TRY',
                                        font: {{ size: 8 }}
                                    }},
                                    ticks: {{ font: {{ size: 7 }} }},
                                    grid: {{
                                        drawOnChartArea: false
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            </script>
        </div>"""

    def generate_report(self) -> str:
        """Generate complete HTML report and return as string"""
        return self._generate_html()


def generate_markets_simple_html_report(json_dir: Path) -> str:
    """
    Generate a simple, table-based weekly markets report as HTML.

    Args:
        json_dir: Path to directory containing market data JSON files

    Returns:
        HTML file as string
    """
    generator = MarketsSimpleHTMLReportGenerator(json_dir)
    return generator.generate_report()
