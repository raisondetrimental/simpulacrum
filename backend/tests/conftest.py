"""
Pytest configuration and shared fixtures for backend tests.
"""
import pytest
import sys
from pathlib import Path

# Add src directory to Python path
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))


@pytest.fixture
def app():
    """Create and configure a test Flask app instance."""
    from src.app import create_app

    app = create_app('test')
    app.config['TESTING'] = True

    yield app


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create a test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def sample_deal_data():
    """Sample deal data for testing."""
    return {
        "deal_id": "deal_test_001",
        "sponsor_id": "corp_test_001",
        "sponsor_name": "Test Sponsor Corp",
        "sponsor_ticket_min": 10000000,
        "sponsor_ticket_max": 50000000,
        "matched_partners": ["cp_001"],
        "matched_teams": ["team_001"],
        "priority_score": 85,
        "stage": "identified",
        "created_at": "2025-01-01T00:00:00Z",
        "notes": "Test deal",
        "overlap_preferences": ["transport_infra", "emerging_markets"],
        "overlap_count": 2,
        "actions": [],
        "metadata": {}
    }


@pytest.fixture
def sample_investment_profile():
    """Sample investment profile for testing."""
    return {
        "profile_id": "profile_test_001",
        "category": "capital_partner_team",
        "entity_id": "team_001",
        "name": "Test Team",
        "organization_name": "Test Capital Partner",
        "relationship": "Strong",
        "currency": "USD",
        "ticket_min": 5000000,
        "ticket_max": 25000000,
        "preferences": {
            "transport_infra": "Y",
            "energy_infra": "N",
            "us_market": "Y",
            "emerging_markets": "Y"
        },
        "metadata": {}
    }
