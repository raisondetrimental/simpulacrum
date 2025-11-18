"""
Markets Weekly Report Generator - HTML Version

Generates comprehensive HTML reports containing all markets data with embedded charts.
Uses JSON data and generates self-contained HTML with inline styles and Chart.js for visualization.
"""

from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
import json


class MarketsHTMLReportGenerator:
    """Generate comprehensive weekly markets HTML reports"""

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

    def _filter_to_90_days(self, data: List[Dict]) -> List[Dict]:
        """Filter data to last 90 days"""
        if not data:
            return []

        cutoff = (datetime.now() - timedelta(days=90)).isoformat()
        return [d for d in data if d.get('date', '') >= cutoff]

    def _escape_json(self, data):
        """Safely escape JSON for embedding in HTML"""
        import html
        json_str = json.dumps(data)
        return json_str.replace('</', '<\\/')  # Prevent </script> issues

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
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.30.0/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 2rem;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}

        .header {{
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 3px solid #2563eb;
        }}

        h1 {{
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 0.5rem;
        }}

        .report-meta {{
            color: #6b7280;
            font-size: 0.95rem;
        }}

        .section {{
            margin: 3rem 0;
            page-break-inside: avoid;
        }}

        .section-title {{
            font-size: 1.75rem;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
        }}

        .section-meta {{
            color: #6b7280;
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
        }}

        .subsection {{
            margin: 2rem 0 1rem 0;
        }}

        .subsection-title {{
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
        }}

        .chart-container {{
            margin: 1.5rem 0;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 8px;
            height: 400px;
        }}

        .chart-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin: 1.5rem 0;
        }}

        .chart-grid .chart-container {{
            height: 300px;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.9rem;
        }}

        thead {{
            background: #f3f4f6;
        }}

        th {{
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
        }}

        td {{
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
        }}

        tbody tr:hover {{
            background: #f9fafb;
        }}

        .positive {{
            color: #16a34a;
        }}

        .negative {{
            color: #dc2626;
        }}

        .no-data {{
            padding: 2rem;
            text-align: center;
            color: #6b7280;
            background: #f9fafb;
            border-radius: 8px;
            margin: 1rem 0;
        }}

        @media print {{
            body {{
                background: white;
                padding: 0;
            }}

            .container {{
                box-shadow: none;
                padding: 1rem;
            }}

            .section {{
                page-break-inside: avoid;
            }}

            .chart-container {{
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Markets Weekly Report</h1>
            <div class="report-meta">
                <p><strong>Generated:</strong> {self.generated_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>Data Period:</strong> Last 90 Days</p>
            </div>
        </div>

        {self._generate_us_yields_section(us_yields)}
        {self._generate_corporate_bonds_section(corporate_bonds)}
        {self._generate_corporate_spreads_section(corporate_spreads)}
        {self._generate_corporate_yields_section(corporate_yields)}
        {self._generate_policy_rates_section(policy_rates)}
        {self._generate_fx_markets_section(fx_rates)}
    </div>

    <script>
        // Chart.js default configuration
        Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        Chart.defaults.color = '#6b7280';

        // Initialize all charts after DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {{
            initializeCharts();
        }});
    </script>
</body>
</html>"""

        return html

    def _generate_us_yields_section(self, us_yields: Dict) -> str:
        """Generate US Treasury Yields section"""
        if not us_yields:
            return ""

        metadata = us_yields.get('metadata', {})
        data = us_yields.get('data', [])

        if not data:
            return f"""
        <div class="section">
            <h2 class="section-title">US Treasury Yields</h2>
            <div class="no-data">No data available</div>
        </div>"""

        filtered_data = self._filter_to_90_days(data)
        latest = filtered_data[-1] if filtered_data else {}

        # Prepare data for charts
        dates = [d['date'] for d in filtered_data]
        maturities = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']
        maturity_years = [1/12, 0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30]
        current_yields = [latest.get(m) for m in maturities]

        # Historical data for key maturities
        y2_data = [d.get('2Y') for d in filtered_data]
        y10_data = [d.get('10Y') for d in filtered_data]
        y30_data = [d.get('30Y') for d in filtered_data]

        # Build table rows
        table_rows = ""
        for mat, current in zip(maturities, current_yields):
            if current is not None:
                table_rows += f"""
                <tr>
                    <td><strong>{mat}</strong></td>
                    <td>{current:.2f}%</td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>N/A</td>
                </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">US Treasury Yields</h2>
            <p class="section-meta">Source: {metadata.get('source', 'FRED')} | Last Updated: {metadata.get('last_updated', 'N/A')}</p>

            <div class="subsection">
                <h3 class="subsection-title">Current Yield Curve</h3>
                <div class="chart-container">
                    <canvas id="usYieldCurveChart"></canvas>
                </div>
            </div>

            <div class="subsection">
                <h3 class="subsection-title">90-Day Historical Trends (Key Maturities)</h3>
                <div class="chart-container">
                    <canvas id="usYieldsTrendChart"></canvas>
                </div>
            </div>

            <div class="subsection">
                <h3 class="subsection-title">Latest Yields & Changes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Maturity</th>
                            <th>Current Yield</th>
                            <th>1 Day</th>
                            <th>1 Week</th>
                            <th>1 Month</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_rows}
                    </tbody>
                </table>
            </div>
        </div>

        <script>
            function initUsYieldsCharts() {{
                // Yield Curve Chart
                const yieldCurveCtx = document.getElementById('usYieldCurveChart');
                if (yieldCurveCtx) {{
                    new Chart(yieldCurveCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(maturity_years)},
                            datasets: [{{
                                label: 'Yield Curve',
                                data: {json.dumps(current_yields)},
                                borderColor: '#2563eb',
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                title: {{
                                    display: true,
                                    text: 'US Treasury Yield Curve (Latest)'
                                }},
                                legend: {{
                                    display: false
                                }}
                            }},
                            scales: {{
                                x: {{
                                    title: {{
                                        display: true,
                                        text: 'Maturity (Years)'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}

                // Historical Trends Chart
                const trendCtx = document.getElementById('usYieldsTrendChart');
                if (trendCtx) {{
                    new Chart(trendCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(dates)},
                            datasets: [
                                {{
                                    label: '2Y',
                                    data: {json.dumps(y2_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: '10Y',
                                    data: {json.dumps(y10_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: '30Y',
                                    data: {json.dumps(y30_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top'
                                }}
                            }},
                            scales: {{
                                x: {{
                                    type: 'time',
                                    time: {{
                                        unit: 'week'
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Date'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            }}
        </script>"""

    def _generate_corporate_bonds_section(self, corporate_bonds: Dict) -> str:
        """Generate Corporate Bonds section"""
        if not corporate_bonds:
            return ""

        metadata = corporate_bonds.get('metadata', {})
        data = corporate_bonds.get('data', [])

        if not data:
            return f"""
        <div class="section">
            <h2 class="section-title">Corporate Bonds</h2>
            <div class="no-data">No data available</div>
        </div>"""

        filtered_data = self._filter_to_90_days(data)
        latest = filtered_data[-1] if filtered_data else {}

        dates = [d['date'] for d in filtered_data]
        aaa_data = [d.get('AAA') for d in filtered_data]
        a_data = [d.get('A') for d in filtered_data]
        bbb_data = [d.get('BBB') for d in filtered_data]
        hy_data = [d.get('HY') for d in filtered_data]

        table_rows = ""
        for rating in ['AAA', 'A', 'BBB', 'HY']:
            current = latest.get(rating)
            if current is not None:
                table_rows += f"""
                <tr>
                    <td><strong>{rating}</strong></td>
                    <td>{current:.2f}%</td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>N/A</td>
                </tr>"""

        return f"""
        <div class="section">
            <h2 class="section-title">Corporate Bonds</h2>
            <p class="section-meta">Source: {metadata.get('source', 'FRED')} | Last Updated: {metadata.get('last_updated', 'N/A')}</p>

            <div class="subsection">
                <h3 class="subsection-title">90-Day Trends by Credit Rating</h3>
                <div class="chart-container">
                    <canvas id="corpBondsTrendChart"></canvas>
                </div>
            </div>

            <div class="subsection">
                <h3 class="subsection-title">Latest Yields by Rating</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Rating</th>
                            <th>Current Yield</th>
                            <th>1 Day</th>
                            <th>1 Week</th>
                            <th>1 Month</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_rows}
                    </tbody>
                </table>
            </div>
        </div>

        <script>
            function initCorpBondsCharts() {{
                const ctx = document.getElementById('corpBondsTrendChart');
                if (ctx) {{
                    new Chart(ctx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(dates)},
                            datasets: [
                                {{
                                    label: 'AAA',
                                    data: {json.dumps(aaa_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'A',
                                    data: {json.dumps(a_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'BBB',
                                    data: {json.dumps(bbb_data)},
                                    borderColor: '#f59e0b',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'HY',
                                    data: {json.dumps(hy_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top'
                                }}
                            }},
                            scales: {{
                                x: {{
                                    type: 'time',
                                    time: {{
                                        unit: 'week'
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Date'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            }}
        </script>"""

    def _generate_corporate_spreads_section(self, corporate_spreads: Dict) -> str:
        """Generate Corporate Spreads section"""
        if not corporate_spreads:
            return ""

        metadata = corporate_spreads.get('metadata', {})
        data = corporate_spreads.get('data', [])

        if not data:
            return f"""
        <div class="section">
            <h2 class="section-title">Corporate Spreads (OAS)</h2>
            <div class="no-data">No data available</div>
        </div>"""

        filtered_data = self._filter_to_90_days(data)
        dates = [d['date'] for d in filtered_data]

        global_hy = [d.get('Global_HY') for d in filtered_data]
        global_ig = [d.get('Global_IG') for d in filtered_data]
        em_corp = [d.get('EM_Corp') for d in filtered_data]
        em_asia = [d.get('EM_Asia') for d in filtered_data]

        return f"""
        <div class="section">
            <h2 class="section-title">Corporate Spreads (OAS)</h2>
            <p class="section-meta">Source: {metadata.get('source', 'FRED')} | Last Updated: {metadata.get('last_updated', 'N/A')}</p>

            <div class="subsection">
                <h3 class="subsection-title">90-Day Spread Trends</h3>
                <div class="chart-container">
                    <canvas id="corpSpreadsTrendChart"></canvas>
                </div>
            </div>
        </div>

        <script>
            function initCorpSpreadsCharts() {{
                const ctx = document.getElementById('corpSpreadsTrendChart');
                if (ctx) {{
                    new Chart(ctx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(dates)},
                            datasets: [
                                {{
                                    label: 'Global HY',
                                    data: {json.dumps(global_hy)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'Global IG',
                                    data: {json.dumps(global_ig)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'EM Corporate',
                                    data: {json.dumps(em_corp)},
                                    borderColor: '#f59e0b',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'EM Asia',
                                    data: {json.dumps(em_asia)},
                                    borderColor: '#14b8a6',
                                    borderWidth: 2,
                                    tension: 0.1
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top'
                                }}
                            }},
                            scales: {{
                                x: {{
                                    type: 'time',
                                    time: {{
                                        unit: 'week'
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Date'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Spread (bps)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            }}
        </script>"""

    def _generate_corporate_yields_section(self, corporate_yields: Dict) -> str:
        """Generate Corporate Yields section"""
        if not corporate_yields:
            return ""

        metadata = corporate_yields.get('metadata', {})
        data = corporate_yields.get('data', [])

        if not data:
            return f"""
        <div class="section">
            <h2 class="section-title">Corporate Yields (Effective)</h2>
            <div class="no-data">No data available</div>
        </div>"""

        filtered_data = self._filter_to_90_days(data)
        dates = [d['date'] for d in filtered_data]

        global_hy = [d.get('Global_HY') for d in filtered_data]
        global_ig = [d.get('Global_IG') for d in filtered_data]
        em_corp = [d.get('EM_Corp') for d in filtered_data]

        return f"""
        <div class="section">
            <h2 class="section-title">Corporate Yields (Effective)</h2>
            <p class="section-meta">Source: {metadata.get('source', 'FRED')} | Last Updated: {metadata.get('last_updated', 'N/A')}</p>

            <div class="subsection">
                <h3 class="subsection-title">90-Day Yield Trends</h3>
                <div class="chart-container">
                    <canvas id="corpYieldsTrendChart"></canvas>
                </div>
            </div>
        </div>

        <script>
            function initCorpYieldsCharts() {{
                const ctx = document.getElementById('corpYieldsTrendChart');
                if (ctx) {{
                    new Chart(ctx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(dates)},
                            datasets: [
                                {{
                                    label: 'Global HY',
                                    data: {json.dumps(global_hy)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'Global IG (BBB)',
                                    data: {json.dumps(global_ig)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'EM Corporate',
                                    data: {json.dumps(em_corp)},
                                    borderColor: '#f59e0b',
                                    borderWidth: 2,
                                    tension: 0.1
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top'
                                }}
                            }},
                            scales: {{
                                x: {{
                                    type: 'time',
                                    time: {{
                                        unit: 'week'
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Date'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Yield (%)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            }}
        </script>"""

    def _generate_policy_rates_section(self, policy_rates: Dict) -> str:
        """Generate Policy Rates section"""
        if not policy_rates:
            return ""

        metadata = policy_rates.get('metadata', {})
        data = policy_rates.get('data', [])

        if not data:
            return f"""
        <div class="section">
            <h2 class="section-title">Central Bank Policy Rates</h2>
            <div class="no-data">No data available</div>
        </div>"""

        filtered_data = self._filter_to_90_days(data)
        latest = filtered_data[-1] if filtered_data else {}
        dates = [d['date'] for d in filtered_data]

        countries = ['USA', 'UK', 'South_Korea', 'Australia', 'Turkey', 'Euro_Area']
        country_labels = ['USA', 'UK', 'S. Korea', 'Australia', 'Turkey', 'Euro Area']
        current_rates = [latest.get(c, 0) for c in countries]

        # Historical data
        usa_data = [d.get('USA') for d in filtered_data]
        uk_data = [d.get('UK') for d in filtered_data]
        turkey_data = [d.get('Turkey') for d in filtered_data]

        return f"""
        <div class="section">
            <h2 class="section-title">Central Bank Policy Rates</h2>
            <p class="section-meta">Source: {metadata.get('source', 'BIS')} | Last Updated: {metadata.get('last_updated', 'N/A')}</p>

            <div class="subsection">
                <h3 class="subsection-title">Current Policy Rates by Country</h3>
                <div class="chart-container">
                    <canvas id="policyRatesBarChart"></canvas>
                </div>
            </div>

            <div class="subsection">
                <h3 class="subsection-title">90-Day Policy Rate Trends</h3>
                <div class="chart-container">
                    <canvas id="policyRatesTrendChart"></canvas>
                </div>
            </div>
        </div>

        <script>
            function initPolicyRatesCharts() {{
                // Bar chart
                const barCtx = document.getElementById('policyRatesBarChart');
                if (barCtx) {{
                    new Chart(barCtx, {{
                        type: 'bar',
                        data: {{
                            labels: {json.dumps(country_labels)},
                            datasets: [{{
                                label: 'Policy Rate (%)',
                                data: {json.dumps(current_rates)},
                                backgroundColor: '#2563eb'
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: false
                                }}
                            }},
                            scales: {{
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Policy Rate (%)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}

                // Trend chart
                const trendCtx = document.getElementById('policyRatesTrendChart');
                if (trendCtx) {{
                    new Chart(trendCtx, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(dates)},
                            datasets: [
                                {{
                                    label: 'USA',
                                    data: {json.dumps(usa_data)},
                                    borderColor: '#2563eb',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'UK',
                                    data: {json.dumps(uk_data)},
                                    borderColor: '#16a34a',
                                    borderWidth: 2,
                                    tension: 0.1
                                }},
                                {{
                                    label: 'Turkey',
                                    data: {json.dumps(turkey_data)},
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                    tension: 0.1
                                }}
                            ]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: true,
                                    position: 'top'
                                }}
                            }},
                            scales: {{
                                x: {{
                                    type: 'time',
                                    time: {{
                                        unit: 'week'
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Date'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Policy Rate (%)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            }}
        </script>"""

    def _generate_fx_markets_section(self, fx_rates: Dict) -> str:
        """Generate FX Markets section"""
        if not fx_rates:
            return ""

        metadata = fx_rates.get('metadata', {})
        data = fx_rates.get('data', [])

        if not data:
            return f"""
        <div class="section">
            <h2 class="section-title">Foreign Exchange Markets</h2>
            <div class="no-data">No data available</div>
        </div>"""

        filtered_data = self._filter_to_90_days(data)
        dates = [d['date'] for d in filtered_data]

        currencies = ['VND', 'TRY', 'MNT', 'UZS', 'AMD', 'GBP']
        currency_names = ['Vietnamese Dong', 'Turkish Lira', 'Mongolian Tugrik',
                         'Uzbek Som', 'Armenian Dram', 'British Pound']

        # Prepare chart scripts for each currency
        currency_charts = ""
        chart_scripts = ""

        for i, (curr, name) in enumerate(zip(currencies, currency_names)):
            curr_data = [d.get(curr) for d in filtered_data]
            colors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#9333ea', '#06b6d4']

            currency_charts += f"""
            <div class="subsection">
                <h3 class="subsection-title">{curr} - {name}</h3>
                <div class="chart-container">
                    <canvas id="fxChart{curr}"></canvas>
                </div>
            </div>"""

            chart_scripts += f"""
                const ctx{curr} = document.getElementById('fxChart{curr}');
                if (ctx{curr}) {{
                    new Chart(ctx{curr}, {{
                        type: 'line',
                        data: {{
                            labels: {json.dumps(dates)},
                            datasets: [{{
                                label: '{curr}',
                                data: {json.dumps(curr_data)},
                                borderColor: '{colors[i]}',
                                borderWidth: 2,
                                tension: 0.1
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {{
                                legend: {{
                                    display: false
                                }}
                            }},
                            scales: {{
                                x: {{
                                    type: 'time',
                                    time: {{
                                        unit: 'week'
                                    }},
                                    title: {{
                                        display: true,
                                        text: 'Date'
                                    }}
                                }},
                                y: {{
                                    title: {{
                                        display: true,
                                        text: 'Rate (per USD)'
                                    }}
                                }}
                            }}
                        }}
                    }});
                }}
            """

        return f"""
        <div class="section">
            <h2 class="section-title">Foreign Exchange Markets</h2>
            <p class="section-meta">Source: {metadata.get('source', 'Yahoo Finance')} | Last Updated: {metadata.get('last_updated', 'N/A')}</p>

            {currency_charts}
        </div>

        <script>
            function initFxCharts() {{
                {chart_scripts}
            }}
        </script>"""

    def generate_report(self) -> str:
        """Generate complete HTML report and return as string"""
        html = self._generate_html()

        # Add initialization call at the end
        html = html.replace('</body>', """
        <script>
            function initializeCharts() {
                if (typeof initUsYieldsCharts === 'function') initUsYieldsCharts();
                if (typeof initCorpBondsCharts === 'function') initCorpBondsCharts();
                if (typeof initCorpSpreadsCharts === 'function') initCorpSpreadsCharts();
                if (typeof initCorpYieldsCharts === 'function') initCorpYieldsCharts();
                if (typeof initPolicyRatesCharts === 'function') initPolicyRatesCharts();
                if (typeof initFxCharts === 'function') initFxCharts();
            }
        </script>
    </body>""")

        return html


def generate_markets_weekly_html_report(json_dir: Path) -> str:
    """
    Generate a comprehensive weekly markets report as HTML.

    Args:
        json_dir: Path to directory containing market data JSON files

    Returns:
        HTML file as string
    """
    generator = MarketsHTMLReportGenerator(json_dir)
    return generator.generate_report()
