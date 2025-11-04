#!/usr/bin/env python3
"""
Azure App Service startup script
Entry point for Gunicorn in production deployment
"""
import os
import sys
from pathlib import Path

# Add src directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Set environment for production
os.environ.setdefault('FLASK_ENV', 'production')

# Import app from new structure
from src.app import app

# Azure expects port 8000
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
