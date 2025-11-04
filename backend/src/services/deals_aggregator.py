"""
Deals Aggregator Service
Provides unified view of all deal precedents across Capital Partners and Corporates
"""
from pathlib import Path
from typing import List, Dict, Any
from ..utils.json_store import read_json_list


def get_all_deals(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Aggregate all deals from capital partners and corporates
    Returns unified list with source information
    """
    json_dir = Path(config['JSON_DIR'])

    all_deals = []

    # Get deals from capital partners
    cp_path = json_dir / config['JSON_CAPITAL_PARTNERS']
    capital_partners = read_json_list(cp_path)

    for partner in capital_partners:
        deals = partner.get('deal_precedents', [])
        for deal in deals:
            all_deals.append({
                **deal,
                'source_type': 'capital_partner',
                'source_id': partner['id'],
                'source_name': partner['name'],
                'source_country': partner.get('country', ''),
                'counterparty_type': 'investor'
            })

    # Get deals from corporates
    corp_path = json_dir / config['JSON_CORPORATES']
    corporates = read_json_list(corp_path)

    for corporate in corporates:
        deals = corporate.get('deal_precedents', [])
        for deal in deals:
            all_deals.append({
                **deal,
                'source_type': 'corporate',
                'source_id': corporate['id'],
                'source_name': corporate['name'],
                'source_country': corporate.get('country', ''),
                'counterparty_type': 'sponsor'
            })

    # Sort by date (most recent first)
    all_deals.sort(key=lambda x: x.get('deal_date', ''), reverse=True)

    return all_deals


def get_deal_by_id(config: Dict[str, Any], deal_id: str) -> Dict[str, Any] | None:
    """
    Find a specific deal across all entities
    Returns deal with source information
    """
    all_deals = get_all_deals(config)

    for deal in all_deals:
        if deal.get('id') == deal_id:
            return deal

    return None


def search_deals(
    config: Dict[str, Any],
    query: str = '',
    structure: str = '',
    currency: str = '',
    min_size: int = 0,
    max_size: int = None,
    date_from: str = '',
    date_to: str = ''
) -> List[Dict[str, Any]]:
    """
    Search deals with filters
    """
    all_deals = get_all_deals(config)
    filtered_deals = []

    for deal in all_deals:
        # Text search
        if query:
            searchable_text = f"{deal.get('deal_name', '')} {deal.get('notes', '')}".lower()
            if query.lower() not in searchable_text:
                continue

        # Structure filter
        if structure and deal.get('structure', '') != structure:
            continue

        # Currency filter
        if currency and deal.get('currency', '') != currency:
            continue

        # Size filter
        deal_size = deal.get('size', 0)
        if min_size and deal_size < min_size:
            continue
        if max_size and deal_size > max_size:
            continue

        # Date range filter
        deal_date = deal.get('deal_date', '')
        if date_from and deal_date < date_from:
            continue
        if date_to and deal_date > date_to:
            continue

        filtered_deals.append(deal)

    return filtered_deals


def get_deals_by_entity(
    config: Dict[str, Any],
    entity_id: str,
    entity_type: str
) -> List[Dict[str, Any]]:
    """
    Get all deals for a specific capital partner or corporate
    """
    all_deals = get_all_deals(config)

    return [
        deal for deal in all_deals
        if deal.get('source_id') == entity_id and deal.get('source_type') == entity_type
    ]


def get_deal_statistics(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate statistics across all deals
    """
    all_deals = get_all_deals(config)

    total_count = len(all_deals)

    # Count by structure
    by_structure = {}
    for deal in all_deals:
        structure = deal.get('structure', 'Unknown')
        by_structure[structure] = by_structure.get(structure, 0) + 1

    # Count by currency
    by_currency = {}
    for deal in all_deals:
        currency = deal.get('currency', 'Unknown')
        by_currency[currency] = by_currency.get(currency, 0) + 1

    # Total volume by currency
    volume_by_currency = {}
    for deal in all_deals:
        currency = deal.get('currency', 'Unknown')
        size = deal.get('size', 0)
        volume_by_currency[currency] = volume_by_currency.get(currency, 0) + size

    # Count by source type
    by_source = {
        'capital_partners': len([d for d in all_deals if d.get('source_type') == 'capital_partner']),
        'corporates': len([d for d in all_deals if d.get('source_type') == 'corporate'])
    }

    return {
        'total_deals': total_count,
        'by_structure': by_structure,
        'by_currency': by_currency,
        'volume_by_currency': volume_by_currency,
        'by_source_type': by_source
    }
