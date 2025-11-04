#!/usr/bin/env python3
"""
Development server runner for Meridian Dashboard backend
"""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Set development environment
os.environ.setdefault('FLASK_ENV', 'development')

from src.app import app

if __name__ == '__main__':
    print("=> Starting Meridian Dashboard API Server...")
    print(f"[*] Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"[*] Debug Mode: {app.config.get('DEBUG', False)}")
    print(f"[*] Data Directory: {app.config.get('DATA_DIR')}")
    print(f"[*] CORS Origins: {app.config.get('CORS_ORIGINS')}")
    print(f"\n[OK] Server starting on http://127.0.0.1:5000\n")

    app.run(host='127.0.0.1', port=5000, debug=True)
