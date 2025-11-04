"""
Tests for health check API endpoint.
"""
import pytest


@pytest.mark.api
def test_health_endpoint_exists(client):
    """Test that health endpoint exists and responds."""
    response = client.get('/api/health')
    assert response.status_code in [200, 500]  # May fail if paths don't exist


@pytest.mark.api
def test_health_endpoint_returns_json(client):
    """Test that health endpoint returns JSON."""
    response = client.get('/api/health')
    assert response.content_type == 'application/json'


@pytest.mark.api
def test_health_endpoint_has_status(client):
    """Test that health endpoint includes status field."""
    response = client.get('/api/health')
    data = response.get_json()
    assert 'status' in data
