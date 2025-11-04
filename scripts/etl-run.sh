#!/bin/bash
# Run all ETL scripts to generate dashboard data

echo "📊 Running Meridian Dashboard ETL Pipeline"
echo ""

# Check if Excel file exists
EXCEL_FILE="data/excel/Markets Dashboard (Macro Enabled) (version 3).xlsm"
if [ ! -f "$EXCEL_FILE" ]; then
    echo "❌ Error: Excel file not found at $EXCEL_FILE"
    exit 1
fi

# Run dashboard ETL
echo "1️⃣  Extracting dashboard data..."
cd etl
python read_dashboard.py
if [ $? -ne 0 ]; then
    echo "❌ Dashboard ETL failed"
    exit 1
fi
echo "✅ Dashboard data generated: storage/dashboard.json"
echo ""

# Run USA historical yields ETL
echo "2️⃣  Extracting USA historical yields..."
python extract_usa_historical.py
if [ $? -ne 0 ]; then
    echo "❌ USA historical yields ETL failed"
    exit 1
fi
echo "✅ USA historical yields generated: storage/usa_historical_yields.json"
echo ""

echo "🎉 ETL pipeline completed successfully!"
echo ""
echo "Generated files:"
echo "  - storage/dashboard.json"
echo "  - storage/usa_historical_yields.json"
