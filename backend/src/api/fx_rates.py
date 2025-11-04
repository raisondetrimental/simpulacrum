"""
FX Rates routes - ExchangeRate-API integration
"""
from flask import Blueprint, jsonify, current_app
from pathlib import Path
from datetime import datetime, timedelta, timezone
import requests
import json

from ..utils.json_store import read_json_list, write_json_file

fx_rates_bp = Blueprint('fx_rates', __name__, url_prefix='/api')


def _load_fx_rates():
    """Load current FX rates from JSON file"""
    fx_rates_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_FX_RATES']

    if not fx_rates_path.exists():
        return None

    try:
        with open(fx_rates_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def _load_fx_history():
    """Load FX rates history from JSON file"""
    history_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_FX_HISTORY']

    if not history_path.exists():
        return []

    return read_json_list(history_path)


def _save_fx_rates(rates_data):
    """Save current FX rates to JSON file"""
    fx_rates_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_FX_RATES']
    return write_json_file(fx_rates_path, rates_data)


def _save_fx_history(history_data):
    """Save FX rates history to JSON file"""
    history_path = Path(current_app.config['JSON_DIR']) / current_app.config['JSON_FX_HISTORY']
    return write_json_file(history_path, history_data)


def _calculate_changes(current_rate, history):
    """Calculate 1D, 1W, 1M percentage changes from historical data"""
    changes = {
        '1D': None,
        '1W': None,
        '1M': None
    }

    now = datetime.now(timezone.utc)

    for snapshot in reversed(history):
        snapshot_date = datetime.fromisoformat(snapshot['timestamp'].replace('Z', '+00:00'))
        days_ago = (now - snapshot_date).days

        # 1 day change
        if changes['1D'] is None and 0 < days_ago <= 1:
            if snapshot.get('rate') is not None and snapshot['rate'] != 0:
                changes['1D'] = ((current_rate - snapshot['rate']) / snapshot['rate']) * 100

        # 1 week change
        if changes['1W'] is None and 6 <= days_ago <= 8:
            if snapshot.get('rate') is not None and snapshot['rate'] != 0:
                changes['1W'] = ((current_rate - snapshot['rate']) / snapshot['rate']) * 100

        # 1 month change
        if changes['1M'] is None and 28 <= days_ago <= 32:
            if snapshot.get('rate') is not None and snapshot['rate'] != 0:
                changes['1M'] = ((current_rate - snapshot['rate']) / snapshot['rate']) * 100

    return changes


def _fetch_from_api():
    """Fetch latest rates from ExchangeRate-API"""
    api_key = current_app.config['EXCHANGERATE_API_KEY']
    api_url = current_app.config['EXCHANGERATE_API_URL']

    url = f"{api_url}/{api_key}/latest/USD"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get('result') != 'success':
            raise Exception(f"API error: {data.get('error-type', 'Unknown error')}")

        return data
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch FX rates: {str(e)}")


@fx_rates_bp.route('/fx-rates/latest', methods=['GET'])
def get_fx_rates():
    """Get latest FX rates from local storage"""
    try:
        rates_data = _load_fx_rates()

        if not rates_data:
            return jsonify({
                "success": False,
                "message": "No FX rates data available. Please refresh to fetch data."
            }), 404

        return jsonify({
            "success": True,
            "data": rates_data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error loading FX rates: {str(e)}"
        }), 500


@fx_rates_bp.route('/fx-rates/refresh', methods=['POST'])
def refresh_fx_rates():
    """Refresh FX rates from ExchangeRate-API"""
    try:
        # Fetch from API
        api_data = _fetch_from_api()

        # Extract conversion rates
        conversion_rates = api_data.get('conversion_rates', {})
        target_currencies = current_app.config['FX_TARGET_CURRENCIES']
        currency_names = current_app.config['FX_CURRENCY_NAMES']

        # Load historical data
        history = _load_fx_history()

        # Build rates object with changes
        rates = {}
        current_timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

        for currency in target_currencies:
            if currency in conversion_rates:
                current_rate = conversion_rates[currency]

                # Get currency-specific history
                currency_history = [
                    {
                        'timestamp': h['timestamp'],
                        'rate': h['rates'].get(currency)
                    }
                    for h in history
                    if currency in h.get('rates', {})
                ]

                # Calculate changes
                changes = _calculate_changes(current_rate, currency_history)

                rates[currency] = {
                    'name': currency_names.get(currency, currency),
                    'rate': current_rate,
                    'changes': changes
                }

        # Create new rates data
        rates_data = {
            'last_updated': current_timestamp,
            'source': 'exchangerate-api',
            'base_currency': 'USD',
            'rates': rates
        }

        # Save current rates
        if not _save_fx_rates(rates_data):
            raise Exception("Failed to save FX rates")

        # Add snapshot to history
        new_snapshot = {
            'timestamp': current_timestamp,
            'rates': {currency: conversion_rates[currency] for currency in target_currencies if currency in conversion_rates}
        }

        history.append(new_snapshot)

        # Keep only last 60 days of history
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=60)
        history = [
            h for h in history
            if datetime.fromisoformat(h['timestamp'].replace('Z', '+00:00')) >= cutoff_date
        ]

        # Save updated history
        if not _save_fx_history(history):
            raise Exception("Failed to save FX rates history")

        return jsonify({
            "success": True,
            "data": rates_data,
            "message": f"FX rates refreshed successfully. {len(rates)} currencies updated."
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to refresh FX rates: {str(e)}"
        }), 500
