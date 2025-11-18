"""
Markets Weekly Report Generator

Generates comprehensive PDF reports containing all markets data with charts and tables.
Uses ReportLab for PDF generation and matplotlib for chart generation.
"""

from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Tuple
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.figure import Figure

import json


class MarketsWeeklyReportGenerator:
    """Generate comprehensive weekly markets PDF reports"""

    # Color palette matching web app
    COLORS = {
        'primary': '#2563EB',      # Blue
        'success': '#16A34A',      # Green
        'danger': '#DC2626',       # Red
        'warning': '#F59E0B',      # Amber
        'purple': '#9333EA',       # Purple
        'cyan': '#06B6D4',         # Cyan
        'orange': '#EA580C',       # Orange
        'teal': '#14B8A6',         # Teal
        'gray': '#6B7280'          # Gray
    }

    # Font sizes
    FONT_SIZES = {
        'title': 16,
        'section': 12,
        'subsection': 10,
        'body': 8,
        'table_header': 9,
        'table_body': 7,
        'small': 6
    }

    def __init__(self, json_dir: Path):
        """Initialize report generator with path to market data JSON files"""
        self.json_dir = Path(json_dir)
        self.styles = self._create_styles()
        self.generated_at = datetime.now()

    def _create_styles(self) -> Dict[str, ParagraphStyle]:
        """Create custom paragraph styles with serif fonts and compact sizing"""
        styles = getSampleStyleSheet()

        custom_styles = {
            'Title': ParagraphStyle(
                'CustomTitle',
                parent=styles['Title'],
                fontName='Times-Roman',
                fontSize=self.FONT_SIZES['title'],
                leading=18,
                spaceAfter=6
            ),
            'Section': ParagraphStyle(
                'CustomSection',
                parent=styles['Heading1'],
                fontName='Times-Bold',
                fontSize=self.FONT_SIZES['section'],
                leading=14,
                spaceAfter=4,
                spaceBefore=8
            ),
            'Subsection': ParagraphStyle(
                'CustomSubsection',
                parent=styles['Heading2'],
                fontName='Times-Bold',
                fontSize=self.FONT_SIZES['subsection'],
                leading=12,
                spaceAfter=3,
                spaceBefore=6
            ),
            'Body': ParagraphStyle(
                'CustomBody',
                parent=styles['Normal'],
                fontName='Times-Roman',
                fontSize=self.FONT_SIZES['body'],
                leading=10,
                spaceAfter=2
            ),
            'BodySmall': ParagraphStyle(
                'CustomBodySmall',
                parent=styles['Normal'],
                fontName='Times-Roman',
                fontSize=self.FONT_SIZES['small'],
                leading=8,
                spaceAfter=1
            )
        }

        return custom_styles

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

    def _format_change(self, value: float, is_percentage: bool = False) -> str:
        """Format change value with sign and color indication"""
        if value is None:
            return 'N/A'

        sign = '+' if value > 0 else ''
        if is_percentage:
            return f"{sign}{value:.2f}%"
        else:
            return f"{sign}{value:.0f}bp"

    def _create_chart(self, chart_type: str, data: Dict[str, Any], **kwargs) -> Image:
        """Create matplotlib chart and return as ReportLab Image"""
        fig = Figure(figsize=kwargs.get('figsize', (7, 3)), dpi=100)
        ax = fig.add_subplot(111)

        # Set compact layout
        fig.subplots_adjust(left=0.1, right=0.95, top=0.9, bottom=0.15)

        if chart_type == 'line':
            self._create_line_chart(ax, data, **kwargs)
        elif chart_type == 'bar':
            self._create_bar_chart(ax, data, **kwargs)

        # Style improvements for PDF
        ax.grid(True, alpha=0.3, linewidth=0.5)
        ax.tick_params(labelsize=7)

        # Save to buffer
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        buf.seek(0)
        plt.close(fig)

        # Convert to ReportLab Image
        img = Image(buf, width=kwargs.get('width', 5*inch), height=kwargs.get('height', 2.5*inch))
        return img

    def _create_line_chart(self, ax, data: Dict[str, Any], **kwargs):
        """Create line chart for time series data"""
        series = data.get('series', [])
        dates_data = data.get('dates', [])

        # Convert dates
        dates = [datetime.fromisoformat(d.replace('Z', '')) if isinstance(d, str) else d
                 for d in dates_data]

        # Plot each series
        for i, s in enumerate(series):
            values = s.get('values', [])
            label = s.get('label', f'Series {i+1}')
            color = s.get('color', list(self.COLORS.values())[i % len(self.COLORS)])

            ax.plot(dates, values, label=label, color=color, linewidth=1.5)

        # Formatting
        ax.set_xlabel(kwargs.get('xlabel', ''), fontsize=8)
        ax.set_ylabel(kwargs.get('ylabel', ''), fontsize=8)
        ax.set_title(kwargs.get('title', ''), fontsize=9, fontweight='bold')

        if len(series) > 1 and kwargs.get('show_legend', True):
            ax.legend(fontsize=6, loc='best', framealpha=0.9)

        # Date formatting
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        fig = ax.get_figure()
        fig.autofmt_xdate(rotation=45)

    def _create_bar_chart(self, ax, data: Dict[str, Any], **kwargs):
        """Create bar chart for comparative data"""
        categories = data.get('categories', [])
        values = data.get('values', [])
        colors_list = data.get('colors', [self.COLORS['primary']] * len(values))

        ax.barh(categories, values, color=colors_list)
        ax.set_xlabel(kwargs.get('xlabel', ''), fontsize=8)
        ax.set_title(kwargs.get('title', ''), fontsize=9, fontweight='bold')
        ax.invert_yaxis()  # Highest at top

    def _create_table(self, data: List[List[str]], headers: List[str],
                      col_widths: List[float] = None) -> Table:
        """Create styled table"""
        # Prepare data with headers
        table_data = [headers] + data

        # Create table
        if col_widths:
            table = Table(table_data, colWidths=[w*inch for w in col_widths])
        else:
            table = Table(table_data)

        # Style
        style = TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E5E7EB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), self.FONT_SIZES['table_header']),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('TOPPADDING', (0, 0), (-1, 0), 6),

            # Body
            ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 1), (-1, -1), self.FONT_SIZES['table_body']),
            ('TOPPADDING', (0, 1), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 3),

            # Borders
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),

            # Alternating rows
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')])
        ])

        table.setStyle(style)
        return table

    def _add_cover_page(self, story: List):
        """Add cover page to report"""
        story.append(Spacer(1, 2*inch))

        title = Paragraph("Markets Weekly Report", self.styles['Title'])
        story.append(title)
        story.append(Spacer(1, 0.3*inch))

        date_range = Paragraph(
            f"Report Generated: {self.generated_at.strftime('%B %d, %Y at %I:%M %p')}",
            self.styles['Body']
        )
        story.append(date_range)
        story.append(Spacer(1, 0.2*inch))

        data_range = Paragraph(
            "Data Period: Last 90 Days",
            self.styles['Body']
        )
        story.append(data_range)

        story.append(PageBreak())

    def _add_us_yields_section(self, story: List):
        """Add US Treasury Yields section"""
        us_yields_data = self._load_market_data('Markets/US_Yields.json')
        if not us_yields_data:
            return

        story.append(Paragraph("US Treasury Yields", self.styles['Section']))

        metadata = us_yields_data.get('metadata', {})
        story.append(Paragraph(
            f"Source: {metadata.get('source', 'FRED')} | "
            f"Last Updated: {metadata.get('last_updated', 'N/A')}",
            self.styles['BodySmall']
        ))
        story.append(Spacer(1, 0.1*inch))

        data = us_yields_data.get('data', [])
        if not data:
            story.append(Paragraph("No data available", self.styles['Body']))
            story.append(PageBreak())
            return

        filtered_data = self._filter_to_90_days(data)

        # Current Yield Curve Chart
        story.append(Paragraph("Current Yield Curve", self.styles['Subsection']))

        latest = filtered_data[-1] if filtered_data else {}
        maturities = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']
        maturity_months = [1/12, 3/12, 6/12, 1, 2, 3, 5, 7, 10, 20, 30]
        yields = [latest.get(m, None) for m in maturities]

        chart_data = {
            'categories': maturity_months,
            'series': [{
                'label': 'Yield Curve',
                'values': yields,
                'color': self.COLORS['primary']
            }]
        }

        # Simplified line chart for yield curve
        fig = Figure(figsize=(7, 2.5), dpi=100)
        ax = fig.add_subplot(111)
        ax.plot(maturity_months, yields, marker='o', color=self.COLORS['primary'], linewidth=2)
        ax.set_xlabel('Maturity (Years)', fontsize=8)
        ax.set_ylabel('Yield (%)', fontsize=8)
        ax.set_title('US Treasury Yield Curve (Latest)', fontsize=9, fontweight='bold')
        ax.grid(True, alpha=0.3)
        ax.tick_params(labelsize=7)

        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        buf.seek(0)
        plt.close(fig)
        img = Image(buf, width=5*inch, height=2*inch)
        story.append(img)
        story.append(Spacer(1, 0.15*inch))

        # 90-Day Historical Trends
        story.append(Paragraph("90-Day Historical Trends (Key Maturities)", self.styles['Subsection']))

        dates = [d['date'] for d in filtered_data]
        series_data = []
        key_maturities = [('2Y', self.COLORS['primary']), ('10Y', self.COLORS['success']),
                         ('30Y', self.COLORS['danger'])]

        for mat, color in key_maturities:
            values = [d.get(mat, None) for d in filtered_data]
            series_data.append({
                'label': mat,
                'values': values,
                'color': color
            })

        chart_data = {'dates': dates, 'series': series_data}
        chart = self._create_chart('line', chart_data, title='', ylabel='Yield (%)',
                                   figsize=(7, 2.5), height=2*inch)
        story.append(chart)
        story.append(Spacer(1, 0.15*inch))

        # Latest Yields Table
        story.append(Paragraph("Latest Yields & Changes", self.styles['Subsection']))

        table_data = []
        for mat in maturities:
            current = latest.get(mat, None)
            if current is None:
                continue

            # Calculate changes (simplified - would need historical data for accurate changes)
            table_data.append([
                mat,
                f"{current:.2f}%",
                "N/A",  # 1 Day change
                "N/A",  # 1 Week change
                "N/A"   # 1 Month change
            ])

        headers = ['Maturity', 'Current Yield', '1 Day', '1 Week', '1 Month']
        table = self._create_table(table_data, headers, col_widths=[1.2, 1.5, 1.2, 1.2, 1.2])
        story.append(table)

        story.append(PageBreak())

    def _add_corporate_bonds_section(self, story: List):
        """Add Corporate Bonds section"""
        corp_bonds_data = self._load_market_data('Markets/Corporate_Bonds.json')
        if not corp_bonds_data:
            return

        story.append(Paragraph("Corporate Bonds", self.styles['Section']))

        metadata = corp_bonds_data.get('metadata', {})
        story.append(Paragraph(
            f"Source: {metadata.get('source', 'FRED')} | "
            f"Last Updated: {metadata.get('last_updated', 'N/A')}",
            self.styles['BodySmall']
        ))
        story.append(Spacer(1, 0.1*inch))

        data = corp_bonds_data.get('data', [])
        if not data:
            story.append(Paragraph("No data available", self.styles['Body']))
            story.append(PageBreak())
            return

        filtered_data = self._filter_to_90_days(data)
        latest = filtered_data[-1] if filtered_data else {}

        # 90-Day Trends by Rating
        story.append(Paragraph("90-Day Trends by Credit Rating", self.styles['Subsection']))

        dates = [d['date'] for d in filtered_data]
        ratings = [('AAA', self.COLORS['primary']), ('A', self.COLORS['success']),
                  ('BBB', self.COLORS['warning']), ('HY', self.COLORS['danger'])]

        series_data = []
        for rating, color in ratings:
            values = [d.get(rating, None) for d in filtered_data]
            series_data.append({'label': rating, 'values': values, 'color': color})

        chart_data = {'dates': dates, 'series': series_data}
        chart = self._create_chart('line', chart_data, title='', ylabel='Yield (%)',
                                   figsize=(7, 2.5), height=2*inch)
        story.append(chart)
        story.append(Spacer(1, 0.15*inch))

        # Latest Yields Table
        story.append(Paragraph("Latest Yields by Rating", self.styles['Subsection']))

        table_data = []
        for rating, _ in ratings:
            current = latest.get(rating, None)
            if current is None:
                continue
            table_data.append([rating, f"{current:.2f}%", "N/A", "N/A", "N/A"])

        headers = ['Rating', 'Current Yield', '1 Day', '1 Week', '1 Month']
        table = self._create_table(table_data, headers, col_widths=[1.2, 1.5, 1.2, 1.2, 1.2])
        story.append(table)

        story.append(PageBreak())

    def _add_corporate_spreads_section(self, story: List):
        """Add Corporate Spreads section"""
        spreads_data = self._load_market_data('Markets/Corporate_Spreads.json')
        if not spreads_data:
            return

        story.append(Paragraph("Corporate Spreads (OAS)", self.styles['Section']))

        metadata = spreads_data.get('metadata', {})
        story.append(Paragraph(
            f"Source: {metadata.get('source', 'FRED')} | "
            f"Last Updated: {metadata.get('last_updated', 'N/A')}",
            self.styles['BodySmall']
        ))
        story.append(Spacer(1, 0.1*inch))

        data = spreads_data.get('data', [])
        if not data:
            story.append(Paragraph("No data available", self.styles['Body']))
            story.append(PageBreak())
            return

        filtered_data = self._filter_to_90_days(data)

        # 90-Day Trends Chart
        story.append(Paragraph("90-Day Spread Trends", self.styles['Subsection']))

        dates = [d['date'] for d in filtered_data]
        categories = [
            ('Global_HY', 'Global HY', self.COLORS['danger']),
            ('Global_IG', 'Global IG', self.COLORS['primary']),
            ('EM_Corp', 'EM Corporate', self.COLORS['warning']),
            ('EM_Asia', 'EM Asia', self.COLORS['teal'])
        ]

        series_data = []
        for key, label, color in categories:
            values = [d.get(key, None) for d in filtered_data]
            series_data.append({'label': label, 'values': values, 'color': color})

        chart_data = {'dates': dates, 'series': series_data}
        chart = self._create_chart('line', chart_data, title='', ylabel='Spread (bps)',
                                   figsize=(7, 2.5), height=2*inch)
        story.append(chart)

        story.append(PageBreak())

    def _add_corporate_yields_section(self, story: List):
        """Add Corporate Yields section"""
        yields_data = self._load_market_data('Markets/Corporate_Yields.json')
        if not yields_data:
            return

        story.append(Paragraph("Corporate Yields (Effective)", self.styles['Section']))

        metadata = yields_data.get('metadata', {})
        story.append(Paragraph(
            f"Source: {metadata.get('source', 'FRED')} | "
            f"Last Updated: {metadata.get('last_updated', 'N/A')}",
            self.styles['BodySmall']
        ))
        story.append(Spacer(1, 0.1*inch))

        data = yields_data.get('data', [])
        if not data:
            story.append(Paragraph("No data available", self.styles['Body']))
            story.append(PageBreak())
            return

        filtered_data = self._filter_to_90_days(data)

        # 90-Day Trends Chart
        story.append(Paragraph("90-Day Yield Trends", self.styles['Subsection']))

        dates = [d['date'] for d in filtered_data]
        categories = [
            ('Global_HY', 'Global HY', self.COLORS['danger']),
            ('Global_IG', 'Global IG (BBB)', self.COLORS['primary']),
            ('EM_Corp', 'EM Corporate', self.COLORS['warning'])
        ]

        series_data = []
        for key, label, color in categories:
            values = [d.get(key, None) for d in filtered_data]
            series_data.append({'label': label, 'values': values, 'color': color})

        chart_data = {'dates': dates, 'series': series_data}
        chart = self._create_chart('line', chart_data, title='', ylabel='Yield (%)',
                                   figsize=(7, 2.5), height=2*inch)
        story.append(chart)

        story.append(PageBreak())

    def _add_policy_rates_section(self, story: List):
        """Add Policy Rates section"""
        policy_data = self._load_market_data('Markets/Policy_Rates.json')
        if not policy_data:
            return

        story.append(Paragraph("Central Bank Policy Rates", self.styles['Section']))

        metadata = policy_data.get('metadata', {})
        story.append(Paragraph(
            f"Source: {metadata.get('source', 'BIS')} | "
            f"Last Updated: {metadata.get('last_updated', 'N/A')}",
            self.styles['BodySmall']
        ))
        story.append(Spacer(1, 0.1*inch))

        data = policy_data.get('data', [])
        if not data:
            story.append(Paragraph("No data available", self.styles['Body']))
            story.append(PageBreak())
            return

        filtered_data = self._filter_to_90_days(data)
        latest = filtered_data[-1] if filtered_data else {}

        # Current Rates Bar Chart
        story.append(Paragraph("Current Policy Rates by Country", self.styles['Subsection']))

        countries = ['USA', 'UK', 'South_Korea', 'Australia', 'Turkey', 'Euro_Area']
        country_labels = ['USA', 'UK', 'S. Korea', 'Australia', 'Turkey', 'Euro Area']
        rates = [latest.get(c, 0) for c in countries]

        # Sort by rate
        sorted_data = sorted(zip(country_labels, rates), key=lambda x: x[1], reverse=True)
        sorted_labels, sorted_rates = zip(*sorted_data) if sorted_data else ([], [])

        fig = Figure(figsize=(7, 2.5), dpi=100)
        ax = fig.add_subplot(111)
        ax.barh(sorted_labels, sorted_rates, color=self.COLORS['primary'])
        ax.set_xlabel('Policy Rate (%)', fontsize=8)
        ax.set_title('Central Bank Policy Rates', fontsize=9, fontweight='bold')
        ax.grid(True, alpha=0.3, axis='x')
        ax.tick_params(labelsize=7)
        ax.invert_yaxis()

        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        buf.seek(0)
        plt.close(fig)
        img = Image(buf, width=5*inch, height=2*inch)
        story.append(img)
        story.append(Spacer(1, 0.15*inch))

        # 90-Day Trends
        story.append(Paragraph("90-Day Policy Rate Trends", self.styles['Subsection']))

        dates = [d['date'] for d in filtered_data]
        colors_list = [self.COLORS['primary'], self.COLORS['success'], self.COLORS['warning'],
                       self.COLORS['danger'], self.COLORS['purple'], self.COLORS['cyan']]

        series_data = []
        for country, label, color in zip(countries, country_labels, colors_list):
            values = [d.get(country, None) for d in filtered_data]
            series_data.append({'label': label, 'values': values, 'color': color})

        chart_data = {'dates': dates, 'series': series_data}
        chart = self._create_chart('line', chart_data, title='', ylabel='Policy Rate (%)',
                                   figsize=(7, 2.5), height=2*inch)
        story.append(chart)

        story.append(PageBreak())

    def _add_fx_markets_section(self, story: List):
        """Add FX Markets section"""
        fx_data = self._load_market_data('Markets/FX_Rates_Yahoo.json')
        if not fx_data:
            return

        story.append(Paragraph("Foreign Exchange Markets", self.styles['Section']))

        metadata = fx_data.get('metadata', {})
        story.append(Paragraph(
            f"Source: {metadata.get('source', 'Yahoo Finance')} | "
            f"Last Updated: {metadata.get('last_updated', 'N/A')}",
            self.styles['BodySmall']
        ))
        story.append(Spacer(1, 0.1*inch))

        data = fx_data.get('data', [])
        if not data:
            story.append(Paragraph("No data available", self.styles['Body']))
            story.append(PageBreak())
            return

        filtered_data = self._filter_to_90_days(data)

        # Individual Currency Charts (2x3 grid)
        currencies = ['VND', 'TRY', 'MNT', 'UZS', 'AMD', 'GBP']
        currency_names = ['Vietnamese Dong', 'Turkish Lira', 'Mongolian Tugrik',
                         'Uzbek Som', 'Armenian Dram', 'British Pound']
        colors_list = [self.COLORS['primary'], self.COLORS['success'], self.COLORS['warning'],
                       self.COLORS['danger'], self.COLORS['purple'], self.COLORS['cyan']]

        story.append(Paragraph("90-Day Currency Trends vs. USD", self.styles['Subsection']))

        # Create 2x3 grid of small charts
        for i, (curr, name, color) in enumerate(zip(currencies, currency_names, colors_list)):
            dates = [d['date'] for d in filtered_data]
            values = [d.get(curr, None) for d in filtered_data]

            chart_data = {
                'dates': dates,
                'series': [{'label': curr, 'values': values, 'color': color}]
            }

            chart = self._create_chart('line', chart_data,
                                      title=f'{curr} - {name}',
                                      ylabel='Rate (USD:XXX)',
                                      figsize=(3.3, 1.8),
                                      width=3*inch,
                                      height=1.5*inch,
                                      show_legend=False)
            story.append(chart)

            # Add spacer between charts, page break after 4 charts
            if (i + 1) % 2 == 0:
                story.append(Spacer(1, 0.1*inch))
            if (i + 1) == 4:
                story.append(PageBreak())
                story.append(Paragraph("Foreign Exchange Markets (continued)", self.styles['Section']))

        story.append(PageBreak())

    def generate_report(self) -> bytes:
        """Generate complete PDF report and return as bytes"""
        # Create PDF buffer
        buffer = io.BytesIO()

        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=0.5*inch,
            rightMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )

        # Build story
        story = []

        # Add sections
        self._add_cover_page(story)
        self._add_us_yields_section(story)
        self._add_corporate_bonds_section(story)
        self._add_corporate_spreads_section(story)
        self._add_corporate_yields_section(story)
        self._add_policy_rates_section(story)
        self._add_fx_markets_section(story)

        # Build PDF
        doc.build(story)

        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes


def generate_markets_weekly_report(json_dir: Path) -> bytes:
    """
    Generate a comprehensive weekly markets report PDF.

    Args:
        json_dir: Path to directory containing market data JSON files

    Returns:
        PDF file as bytes
    """
    generator = MarketsWeeklyReportGenerator(json_dir)
    return generator.generate_report()
