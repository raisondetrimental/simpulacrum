"""
Tests for investment profiles service.
"""
import pytest
from src.constants.shared import SHARED_PREFERENCE_KEYS


@pytest.mark.services
@pytest.mark.unit
def test_shared_preference_keys_constant():
    """Test that SHARED_PREFERENCE_KEYS constant is defined correctly."""
    assert isinstance(SHARED_PREFERENCE_KEYS, tuple)
    assert len(SHARED_PREFERENCE_KEYS) == 10

    # Verify expected keys are present
    expected_keys = [
        'transport_infra',
        'energy_infra',
        'us_market',
        'emerging_markets',
        'asia_em',
        'africa_em',
        'emea_em',
        'vietnam',
        'mongolia',
        'turkey'
    ]

    for key in expected_keys:
        assert key in SHARED_PREFERENCE_KEYS


@pytest.mark.services
@pytest.mark.unit
def test_sample_investment_profile_structure(sample_investment_profile):
    """Test that sample investment profile fixture has correct structure."""
    assert 'profile_id' in sample_investment_profile
    assert 'category' in sample_investment_profile
    assert 'entity_id' in sample_investment_profile
    assert 'name' in sample_investment_profile
    assert 'preferences' in sample_investment_profile
    assert 'metadata' in sample_investment_profile

    # Verify preferences is a dict
    assert isinstance(sample_investment_profile['preferences'], dict)

    # Verify preferences contain shared keys
    prefs = sample_investment_profile['preferences']
    assert 'transport_infra' in prefs
    assert 'energy_infra' in prefs
    assert 'us_market' in prefs
    assert 'emerging_markets' in prefs

    # Verify preference values are Y/N strings
    for key, value in prefs.items():
        assert value in ['Y', 'N'], f"Preference {key} has invalid value {value}"
