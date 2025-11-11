#!/usr/bin/env python3
"""
Test different ticker formats for Armenian Dram (AMD) on Yahoo Finance
"""

import yfinance as yf
from datetime import datetime

# Different ticker formats to test
test_tickers = [
    "USDAMD=X",      # Standard format
    "AMD=X",         # Without USD prefix
    "AMDUSD=X",      # Reversed
    "USD/AMD",       # With slash
    "USDAM",         # Without =X
    "USDAMD",        # Without =X
    "X:AMD",         # Alternative format
    "AMD",           # Just currency code
]

print("Testing Armenian Dram (AMD) ticker formats on Yahoo Finance")
print("=" * 70)

for ticker in test_tickers:
    print(f"\nTesting ticker: {ticker}")
    try:
        data = yf.download(ticker, period="7d", interval="1d", progress=False)

        if data.empty:
            print(f"  [FAIL] No data returned (empty DataFrame)")
        else:
            print(f"  [SUCCESS] Got {len(data)} days of data")
            print(f"     Latest close: {data['Close'].iloc[-1] if 'Close' in data.columns else 'N/A'}")
            print(f"     Date range: {data.index[0].strftime('%Y-%m-%d')} to {data.index[-1].strftime('%Y-%m-%d')}")

    except Exception as e:
        print(f"  [ERROR] {str(e)}")

print("\n" + "=" * 70)
print("Test complete!")
