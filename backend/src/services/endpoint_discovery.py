"""
Endpoint Discovery Service
Automatically discovers and catalogs all registered Flask API endpoints
"""

from flask import current_app
from typing import Dict, List, Any, Optional
import inspect


class EndpointDiscovery:
    """Service for discovering and cataloging Flask API endpoints"""

    # Blueprint groupings
    BLUEPRINT_CATEGORIES = {
        'auth': 'Authentication',
        'admin': 'Administration',
        'capital-partners': 'Liquidity (Capital Partners)',
        'sponsors': 'Sponsors',
        'counsel': 'Counsel',
        'agents': 'Agents',
        'deals': 'Deals',
        'deal-participants': 'Deal Participants',
        'investment': 'Investment Strategies',
        'fx-rates': 'FX Rates',
        'countries': 'Countries',
        'excel': 'Excel/Market Data',
        'data': 'Data Files',
        'whiteboards': 'Whiteboard',
        'users': 'Users',
        'profile': 'Profile'
    }

    @staticmethod
    def get_all_endpoints() -> List[Dict[str, Any]]:
        """
        Scan Flask app and return all registered API routes

        Returns:
            List of endpoint dictionaries with metadata
        """
        endpoints = []

        # Iterate through all registered routes
        for rule in current_app.url_map.iter_rules():
            # Filter only API endpoints
            if not rule.rule.startswith('/api/'):
                continue

            # Skip static endpoints
            if rule.endpoint == 'static':
                continue

            # Extract blueprint name
            blueprint_name = rule.endpoint.split('.')[0] if '.' in rule.endpoint else 'default'

            # Get view function
            view_func = current_app.view_functions.get(rule.endpoint)
            description = None
            if view_func and view_func.__doc__:
                # Get first line of docstring as description
                description = view_func.__doc__.strip().split('\n')[0]

            endpoint_info = {
                'path': rule.rule,
                'methods': sorted(list(rule.methods - {'HEAD', 'OPTIONS'})),  # Exclude HEAD/OPTIONS
                'blueprint': blueprint_name,
                'blueprint_label': EndpointDiscovery.BLUEPRINT_CATEGORIES.get(
                    blueprint_name, blueprint_name.title()
                ),
                'endpoint': rule.endpoint,
                'description': description or 'No description available',
                'requires_auth': EndpointDiscovery._requires_auth(view_func)
            }

            endpoints.append(endpoint_info)

        # Sort by blueprint then path
        endpoints.sort(key=lambda x: (x['blueprint'], x['path']))

        return endpoints

    @staticmethod
    def _requires_auth(view_func) -> bool:
        """Check if endpoint requires authentication"""
        if not view_func:
            return False

        # Check if @login_required decorator is applied
        # Flask decorators are stored in the function's closure
        try:
            if hasattr(view_func, '__wrapped__'):
                # Check wrapped function
                return True

            # Check function name for common auth patterns
            func_name = view_func.__name__
            if 'login_required' in str(view_func.__code__.co_names):
                return True

        except:
            pass

        return False

    @staticmethod
    def get_endpoints_by_blueprint(blueprint_name: str) -> List[Dict[str, Any]]:
        """
        Get all endpoints for a specific blueprint

        Args:
            blueprint_name: Name of blueprint to filter by

        Returns:
            List of endpoints in that blueprint
        """
        all_endpoints = EndpointDiscovery.get_all_endpoints()
        return [ep for ep in all_endpoints if ep['blueprint'] == blueprint_name]

    @staticmethod
    def get_endpoint_info(path: str, method: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific endpoint

        Args:
            path: API path (e.g., '/api/deals')
            method: HTTP method (e.g., 'GET')

        Returns:
            Endpoint info dict or None if not found
        """
        all_endpoints = EndpointDiscovery.get_all_endpoints()

        for endpoint in all_endpoints:
            if endpoint['path'] == path and method in endpoint['methods']:
                return endpoint

        return None

    @staticmethod
    def get_grouped_endpoints() -> Dict[str, List[Dict[str, Any]]]:
        """
        Get endpoints grouped by blueprint

        Returns:
            Dictionary mapping blueprint names to lists of endpoints
        """
        all_endpoints = EndpointDiscovery.get_all_endpoints()
        grouped = {}

        for endpoint in all_endpoints:
            blueprint = endpoint['blueprint']
            if blueprint not in grouped:
                grouped[blueprint] = []
            grouped[blueprint].append(endpoint)

        # Sort groups by blueprint label
        sorted_grouped = {}
        for blueprint in sorted(grouped.keys(), key=lambda x: EndpointDiscovery.BLUEPRINT_CATEGORIES.get(x, x)):
            sorted_grouped[blueprint] = grouped[blueprint]

        return sorted_grouped

    @staticmethod
    def search_endpoints(query: str) -> List[Dict[str, Any]]:
        """
        Search endpoints by path or description

        Args:
            query: Search term

        Returns:
            List of matching endpoints
        """
        all_endpoints = EndpointDiscovery.get_all_endpoints()
        query_lower = query.lower()

        results = []
        for endpoint in all_endpoints:
            if (query_lower in endpoint['path'].lower() or
                query_lower in endpoint.get('description', '').lower()):
                results.append(endpoint)

        return results

    @staticmethod
    def get_endpoint_parameters(path: str, method: str) -> Dict[str, Any]:
        """
        Attempt to infer parameters for an endpoint

        Note: This is a best-effort analysis based on common patterns.
        For accurate parameter documentation, endpoints should have docstrings.

        Args:
            path: API path
            method: HTTP method

        Returns:
            Dictionary with inferred parameters
        """
        # Extract path parameters (e.g., /api/deals/<id>)
        path_params = []
        parts = path.split('/')
        for part in parts:
            if part.startswith('<') and part.endswith('>'):
                param_name = part.strip('<>')
                # Remove type hints like <int:id>
                if ':' in param_name:
                    param_name = param_name.split(':')[1]
                path_params.append(param_name)

        parameters = {
            'path_parameters': path_params,
            'query_parameters': [],
            'body_parameters': []
        }

        # Common query parameters for GET requests
        if method == 'GET':
            if 'list' in path or 'search' in path:
                parameters['query_parameters'] = ['limit', 'offset', 'search']
            if '/deals' in path:
                parameters['query_parameters'] = ['status', 'country', 'starred']
            if '/capital-partners' in path or '/corporates' in path:
                parameters['query_parameters'] = ['country', 'relationship', 'starred']

        # Common body parameters for POST/PUT
        if method in ['POST', 'PUT']:
            # Infer based on endpoint type
            if '/deals' in path:
                parameters['body_parameters'] = ['deal_name', 'country', 'status', 'amount', 'currency']
            elif '/capital-partners' in path:
                parameters['body_parameters'] = ['name', 'country', 'website', 'relationship']
            elif '/contacts' in path:
                parameters['body_parameters'] = ['first_name', 'last_name', 'email', 'phone']

        return parameters
