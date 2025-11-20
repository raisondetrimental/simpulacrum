"""
Configuration management for Meridian Dashboard backend
"""
import os
from pathlib import Path

class Config:
    """Base configuration"""
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'meridian-universal-secret-key-change-in-production')

    # CORS
    CORS_ORIGINS = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3001",
        "http://localhost:3000",
        "http://127.0.0.1:5173",  # Vite dev server (127.0.0.1)
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3000"
    ]

    # Paths
    # BASE_DIR now points to backend/ directory (not project root)
    BASE_DIR = Path(__file__).parent.parent  # backend/src/config.py -> backend/src/ -> backend/
    DATA_DIR = os.getenv('DATA_DIR', str(BASE_DIR / 'data'))        # backend/data/
    EXCEL_DIR = os.getenv('EXCEL_DIR', str(BASE_DIR / 'data' / 'excel'))   # backend/data/excel/
    JSON_DIR = os.getenv('JSON_DIR', str(BASE_DIR / 'data' / 'json'))      # backend/data/json/
    STORAGE_DIR = os.getenv('STORAGE_DIR', str(BASE_DIR / 'storage'))      # backend/storage/
    REPORTS_DIR = os.getenv('REPORTS_DIR', str(BASE_DIR / 'storage' / 'generated-reports'))
    WEB_DIR = os.getenv('WEB_DIR', str(BASE_DIR / 'storage'))  # For generated JSON files

    # Excel files
    EXCEL_DASHBOARD = 'Markets Dashboard (Macro Enabled) (version 3).xlsm'

    # JSON files
    JSON_INSTITUTIONS = 'institutions_LEGACY.json'
    JSON_CONTACTS = 'contacts.json'
    JSON_CAPITAL_PARTNERS = 'capital_partners.json'
    JSON_TEAMS = 'teams.json'
    JSON_CORPORATES = 'corporates.json'
    JSON_SPONSOR_CONTACTS = 'sponsor_contacts.json'
    JSON_LEGAL_ADVISORS = 'legal_advisors.json'
    JSON_COUNSEL_CONTACTS = 'counsel_contacts.json'
    JSON_AGENTS = 'agents.json'
    JSON_AGENT_CONTACTS = 'agent_contacts.json'
    JSON_USERS = 'users.json'
    JSON_FX_RATES = 'fx_rates.json'
    JSON_FX_HISTORY = 'fx_rates_history.json'
    JSON_DEALS = 'deals.json'
    JSON_DEAL_PARTICIPANTS = 'deal_participants.json'

    # Full paths (computed properties)
    @property
    def EXCEL_FILE_PATH(self):
        return Path(self.EXCEL_DIR) / self.EXCEL_DASHBOARD

    @property
    def JSON_OUTPUT_PATH(self):
        return Path(self.WEB_DIR) / 'dashboard.json'

    @property
    def USA_HISTORICAL_JSON_PATH(self):
        return Path(self.WEB_DIR) / 'usa_historical_yields.json'

    # ExchangeRate-API Configuration
    EXCHANGERATE_API_KEY = os.getenv('EXCHANGERATE_API_KEY', 'bd8b8e35ffa920b5832eb94c')
    EXCHANGERATE_API_URL = 'https://v6.exchangerate-api.com/v6'

    # FX Target Currencies (vs USD)
    FX_TARGET_CURRENCIES = ['VND', 'TRY', 'MNT', 'UZS', 'AMD', 'GBP']
    FX_CURRENCY_NAMES = {
        'VND': 'Vietnamese Dong',
        'TRY': 'Turkish Lira',
        'MNT': 'Mongolian Tugrik',
        'UZS': 'Uzbek Som',
        'AMD': 'Armenian Dram',
        'GBP': 'British Pound Sterling'
    }

    # Flask-Login
    SESSION_COOKIE_SECURE = False  # Set True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = False  # Set True in production with HTTPS
    REMEMBER_COOKIE_HTTPONLY = True


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

    # Production CORS - Allow your Azure Static Web App
    CORS_ORIGINS = [
        "https://gentle-water-0d2bfab0f.3.azurestaticapps.net",  # Your production frontend
        "http://localhost:5173",  # Keep for local testing against production backend
        "http://127.0.0.1:5173"
    ]

    # Cross-site cookie requirements for authentication
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SAMESITE = "None"
    REMEMBER_COOKIE_SECURE = True

    # Azure paths
    DATA_DIR = os.getenv('DATA_DIR', '/home/site/data')
    WEB_DIR = os.getenv('WEB_DIR', '/home/site/wwwroot')


class TestConfig(Config):
    """Test configuration"""
    DEBUG = True
    TESTING = True
    # Use temporary directories for testing


# Config dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'test': TestConfig,
    'default': DevelopmentConfig
}


def get_config(env=None):
    """Get configuration based on environment"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
