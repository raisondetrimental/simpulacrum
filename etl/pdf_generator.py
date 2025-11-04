#!/usr/bin/env python3
"""
PDF Generator for Markets Dashboard
Reads data from PDF.xlsx and generates a nicely formatted PDF report
"""

import os
import sys
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas


class MarketsPDFGenerator:
    def __init__(self, excel_file_path, output_path):
        self.excel_file_path = Path(excel_file_path)
        self.output_path = Path(output_path)
        self.data = None

        # Color scheme
        self.colors = {
            'primary': HexColor('#1f2937'),      # Dark gray
            'secondary': HexColor('#3b82f6'),    # Blue
            'accent': HexColor('#10b981'),       # Green
            'warning': HexColor('#f59e0b'),      # Orange
            'danger': HexColor('#ef4444'),       # Red
            'light_gray': HexColor('#f9fafb'),   # Light gray
            'medium_gray': HexColor('#6b7280'),  # Medium gray
            'light_red': HexColor('#fee2e2'),    # Light red for negative changes
            'light_green': HexColor('#dcfce7'),  # Light green for positive changes
        }

        # Styles
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()

    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='MainTitle',
            parent=self.styles['Title'],
            fontSize=23,
            spaceAfter=30,
            textColor=self.colors['primary'],
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading1'],
            fontSize=15,
            spaceBefore=20,
            spaceAfter=12,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='SubTitle',
            parent=self.styles['Heading2'],
            fontSize=11,
            spaceBefore=10,
            spaceAfter=8,
            textColor=self.colors['primary'],
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='DateStyle',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.colors['medium_gray'],
            alignment=TA_LEFT
        ))

    def load_data(self):
        """Load and parse data from PDF.xlsx"""
        try:
            print(f"Loading data from: {self.excel_file_path}")
            self.data = pd.read_excel(self.excel_file_path, sheet_name='Sheet1', header=None)
            print(f"Loaded data shape: {self.data.shape}")
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False

    def format_percentage(self, value, multiplier=100):
        """Format decimal values as percentages"""
        if pd.isna(value) or value == '' or value == 0:
            return 'N/A'
        try:
            if isinstance(value, (int, float)):
                return f"{float(value) * multiplier:.3f}%"
            return str(value)
        except:
            return str(value)

    def format_bps(self, value):
        """Format basis points"""
        if pd.isna(value) or value == '':
            return 'N/A'
        return str(value)

    def get_change_color(self, value):
        """Get background color for change values based on positive/negative"""
        if pd.isna(value) or value == '' or value == 'N/A':
            return white

        try:
            # Extract numeric value from strings like "5.6 bps" or "-19.1 bps"
            if isinstance(value, str):
                # Remove 'bps' and other text, extract number
                import re
                num_match = re.search(r'[-+]?\d+\.?\d*', value)
                if num_match:
                    num_value = float(num_match.group())
                    if num_value > 0:
                        return self.colors['light_green']
                    elif num_value < 0:
                        return self.colors['light_red']
            elif isinstance(value, (int, float)):
                if value > 0:
                    return self.colors['light_green']
                elif value < 0:
                    return self.colors['light_red']
        except:
            pass

        return white

    def extract_sovereign_domestic(self):
        """Extract Domestic Currency sovereign yields table"""
        # Find the domestic currency section (around rows 5-10)
        countries = ['USA', 'Türkiye', 'Vietnam']
        maturities = ['1 years', '3 years', '5 years', '10 years']

        data = []
        header = ['Maturity', 'Unit'] + countries

        for i, mat in enumerate(maturities):
            row_idx = 6 + i  # Based on examination, data starts at row 7 (index 6)
            row_data = [mat, '% p.a']

            for country in countries:
                # Find country column
                for col_idx in range(2, 6):
                    if self.data.iloc[5, col_idx] == country:  # Header row
                        value = self.data.iloc[row_idx, col_idx]
                        row_data.append(self.format_percentage(value))
                        break
                else:
                    row_data.append('N/A')

            data.append(row_data)

        return header, data

    def extract_sovereign_usd(self):
        """Extract USD Denominated sovereign yields with changes"""
        # USA data with changes (around rows 13-17)
        maturities = ['1 years', '3 years', '5 years', '10 years']
        header = ['Maturity', 'Rate', '1D Change', '1W Change', '1M Change']

        data = []
        for i, mat in enumerate(maturities):
            row_idx = 13 + i  # Based on examination
            row_data = [
                mat,
                self.format_percentage(self.data.iloc[row_idx, 2]),  # Rate
                self.format_bps(self.data.iloc[row_idx, 3]),         # 1D Change
                self.format_bps(self.data.iloc[row_idx, 4]),         # 1W Change
                self.format_bps(self.data.iloc[row_idx, 5])          # 1M Change
            ]
            data.append(row_data)

        return header, data

    def extract_corporate_yields(self):
        """Extract Corporate Yields table"""
        ratings = ['AAA', 'AA', 'A', 'BBB', 'BB', 'High Yield']
        header = ['Rating', 'Effective Yield', '1D Change', '1W Change', '1M Change']

        data = []
        for i, rating in enumerate(ratings):
            row_idx = 29 + i  # Based on examination
            row_data = [
                rating,
                self.format_percentage(self.data.iloc[row_idx, 2]),  # Yield
                self.format_bps(self.data.iloc[row_idx, 3]),         # 1D Change
                self.format_bps(self.data.iloc[row_idx, 4]),         # 1W Change
                self.format_bps(self.data.iloc[row_idx, 5])          # 1M Change
            ]
            data.append(row_data)

        return header, data

    def extract_fx_rates(self):
        """Extract FX Rates table"""
        header = ['Currency', 'Identifier', 'Exchange Rate', '1D Change', '1W Change', '1M Change']

        data = []
        for row_idx in range(40, 43):  # Rows 41-43 based on examination
            currency_name = self.data.iloc[row_idx, 0]
            if pd.notna(currency_name):
                row_data = [
                    str(currency_name),
                    str(self.data.iloc[row_idx, 1]) if pd.notna(self.data.iloc[row_idx, 1]) else 'N/A',
                    str(self.data.iloc[row_idx, 2]) if pd.notna(self.data.iloc[row_idx, 2]) else 'N/A',
                    self.format_bps(self.data.iloc[row_idx, 3]),
                    self.format_bps(self.data.iloc[row_idx, 4]),
                    self.format_bps(self.data.iloc[row_idx, 5])
                ]
                data.append(row_data)

        return header, data

    def extract_benchmark_yields(self):
        """Extract Benchmark Yields table"""
        header = ['Index', 'Yield', '1D Change', '1W Change', '1M Change']

        data = []
        indices = ['EM Corporate', 'Asia Corporate', 'Global HY']
        for i, index in enumerate(indices):
            row_idx = 48 + i  # Based on examination
            row_data = [
                index,
                self.format_percentage(self.data.iloc[row_idx, 2]),  # Yield
                self.format_bps(self.data.iloc[row_idx, 3]),         # 1D Change
                self.format_bps(self.data.iloc[row_idx, 4]),         # 1W Change
                self.format_bps(self.data.iloc[row_idx, 5])          # 1M Change
            ]
            data.append(row_data)

        return header, data

    def create_table(self, header, data, col_widths=None, change_columns=None):
        """Create a minimalist formatted table with conditional coloring for change columns"""
        # Prepare table data
        table_data = [header] + data

        # Create table
        if col_widths is None:
            col_widths = [1.2*inch] * len(header)

        table = Table(table_data, colWidths=col_widths)

        # Base table styles - minimalist approach
        styles = [
            # Header row styling - bold, no background color
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['primary']),
            ('BACKGROUND', (0, 0), (-1, 0), white),

            # First column styling - bold
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (0, -1), 9),

            # Data styling
            ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (1, 1), (-1, -1), 8),
            ('TEXTCOLOR', (1, 1), (-1, -1), self.colors['primary']),
            ('BACKGROUND', (1, 1), (-1, -1), white),

            # Alignment - left align everything
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),

            # Simple grid lines
            ('GRID', (0, 0), (-1, -1), 0.5, self.colors['medium_gray']),

            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]

        # Add conditional coloring for change columns
        if change_columns:
            for row_idx, row_data in enumerate(data, 1):  # Start from 1 to skip header
                for col_idx in change_columns:
                    if col_idx < len(row_data):
                        cell_value = row_data[col_idx]
                        bg_color = self.get_change_color(cell_value)
                        if bg_color != white:
                            styles.append(('BACKGROUND', (col_idx, row_idx), (col_idx, row_idx), bg_color))

        table.setStyle(TableStyle(styles))
        return table

    def generate_pdf(self):
        """Generate the complete PDF report"""
        if not self.load_data():
            return False

        try:
            # Create PDF document
            doc = SimpleDocTemplate(
                str(self.output_path),
                pagesize=A4,
                topMargin=1*inch,
                bottomMargin=1*inch,
                leftMargin=0.75*inch,
                rightMargin=0.75*inch
            )

            # Story (content) list
            story = []

            # Add logo
            logo_path = Path(__file__).parent.parent / "frontend" / "public" / "assets" / "logo-2.jpg"
            if logo_path.exists():
                # logo-2.jpg dimensions: 354 × 89 pixels (aspect ratio ~3.98:1)
                # Using 2" width, height = 2 * (89/354) = 0.503"
                logo = Image(str(logo_path), width=2*inch, height=0.503*inch)
                logo.hAlign = 'RIGHT'
                story.append(logo)
                story.append(Spacer(1, 10))

            # Title
            title = Paragraph("Meridian Universal Dashboard", self.styles['MainTitle'])
            story.append(title)

            # Subtitle with date
            current_date = datetime.now().strftime("%B %d, %Y")
            subtitle = Paragraph(f"Markets Weekly Report - {current_date}", self.styles['DateStyle'])
            story.append(subtitle)
            story.append(Spacer(1, 20))

            # 1. Sovereign Yields - Domestic Currency
            story.append(Paragraph("Sovereign Yields", self.styles['SectionTitle']))
            story.append(Paragraph("Domestic Currency", self.styles['SubTitle']))

            header, data = self.extract_sovereign_domestic()
            table = self.create_table(header, data, col_widths=[1.2*inch, 0.8*inch, 1*inch, 1*inch, 1*inch])
            story.append(table)
            story.append(Spacer(1, 15))

            # 2. Sovereign Yields - USD Denominated
            story.append(Paragraph("USD Denominated (USA)", self.styles['SubTitle']))

            header, data = self.extract_sovereign_usd()
            table = self.create_table(header, data, col_widths=[1.2*inch, 1*inch, 1*inch, 1*inch, 1*inch], change_columns=[2, 3, 4])
            story.append(table)
            story.append(Spacer(1, 20))

            # 3. Corporate Yields
            story.append(Paragraph("USA Corporate Yields by Credit Rating", self.styles['SectionTitle']))

            header, data = self.extract_corporate_yields()
            table = self.create_table(header, data, col_widths=[1*inch, 1.2*inch, 1*inch, 1*inch, 1*inch], change_columns=[2, 3, 4])
            story.append(table)
            story.append(Spacer(1, 20))

            # 4. FX Rates
            story.append(Paragraph("Foreign Exchange Rates", self.styles['SectionTitle']))

            header, data = self.extract_fx_rates()
            table = self.create_table(header, data, col_widths=[1.5*inch, 0.8*inch, 1*inch, 1*inch, 1*inch, 1*inch], change_columns=[3, 4, 5])
            story.append(table)
            story.append(Spacer(1, 20))

            # 5. Benchmark Yields
            story.append(Paragraph("Benchmark Yields", self.styles['SectionTitle']))

            header, data = self.extract_benchmark_yields()
            table = self.create_table(header, data, col_widths=[1.5*inch, 1*inch, 1*inch, 1*inch, 1*inch], change_columns=[2, 3, 4])
            story.append(table)

            # Build PDF
            doc.build(story)

            print(f"PDF generated successfully: {self.output_path}")
            print(f"File size: {self.output_path.stat().st_size} bytes")
            return True

        except Exception as e:
            print(f"Error generating PDF: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Main entry point"""
    # Get paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    excel_file = project_root / "backend" / "data" / "excel" / "PDF.xlsx"

    # Format date as "29th September 2025"
    now = datetime.now()
    day = now.day
    suffix = "th" if 10 <= day <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
    date_str = now.strftime(f"%d{suffix} %B %Y")

    output_file = project_root / "backend" / "storage" / "generated_reports" / f"Markets_Report_{date_str}.pdf"

    # Create output directory
    output_file.parent.mkdir(exist_ok=True)

    if not excel_file.exists():
        print(f"ERROR: PDF.xlsx not found at {excel_file}")
        sys.exit(1)

    # Generate PDF
    generator = MarketsPDFGenerator(excel_file, output_file)
    success = generator.generate_pdf()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()