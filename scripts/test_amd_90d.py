#!/usr/bin/env python3
"""
Test AMD with 90 days period to see if more historical data is available
"""

import yfinance as yf

ticker = "USDAMD=X"
print(f"Testing {ticker} with 90 days period")
print("=" * 70)

try:
    data = yf.download(ticker, period="90d", interval="1d", progress=False)

    if data.empty:
        print("No data returned")
    else:
        print(f"SUCCESS! Got {len(data)} days of data")
        print(f"\nFirst 5 rows:")
        print(data.head())
        print(f"\nLast 5 rows:")
        print(data.tail())
        print(f"\nDate range: {data.index[0].strftime('%Y-%m-%d')} to {data.index[-1].strftime('%Y-%m-%d')}")

        # Check for null values
        null_count = data['Close'].isnull().sum()
        print(f"\nNull values in Close column: {null_count} out of {len(data)} days")

except Exception as e:
    print(f"Error: {str(e)}")
