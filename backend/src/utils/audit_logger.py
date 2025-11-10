"""
Audit logging system for tracking super admin actions
Logs all administrative operations for security and compliance
"""
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
from flask import current_app
from flask_login import current_user
import json

from .json_store import read_json_file, write_json_file


class AuditLogger:
    """
    Centralized audit logging for super admin operations

    Logs include:
    - Timestamp
    - User who performed the action
    - Action type (create/update/delete/bulk/archive/etc.)
    - Entity type affected (organizations/contacts/deals/users)
    - Record IDs affected
    - Old and new values (for updates)
    - Additional metadata
    """

    @staticmethod
    def _get_audit_log_path() -> Path:
        """Get path to audit log file"""
        json_dir = Path(current_app.config['JSON_DIR'])
        return json_dir / 'audit_log.json'

    @staticmethod
    def _read_log() -> List[Dict[str, Any]]:
        """Read existing audit log"""
        log_path = AuditLogger._get_audit_log_path()

        if not log_path.exists():
            return []

        data = read_json_file(log_path)

        # Handle both list and dict formats
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return data.get('entries', [])
        else:
            return []

    @staticmethod
    def _write_log(entries: List[Dict[str, Any]]) -> bool:
        """Write audit log to file"""
        log_path = AuditLogger._get_audit_log_path()

        # Store as object with metadata
        data = {
            'entries': entries,
            'last_updated': datetime.now().isoformat(),
            'total_entries': len(entries)
        }

        return write_json_file(log_path, data, create_backup=True)

    @staticmethod
    def log(
        action: str,
        entity_type: str,
        affected_ids: Optional[List[str]] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Log an administrative action

        Args:
            action: Action performed (e.g., 'bulk_update', 'archive', 'delete', 'api_key_update')
            entity_type: Type of entity affected (e.g., 'organizations', 'contacts', 'deals', 'config')
            affected_ids: List of record IDs affected by the action
            old_values: Previous values (for updates)
            new_values: New values (for updates)
            metadata: Additional context (e.g., filters used, import filename, etc.)
            success: Whether the operation succeeded
            error_message: Error message if operation failed

        Returns:
            bool: True if log entry was written successfully
        """
        try:
            # Get current user info
            user_id = current_user.id if current_user and current_user.is_authenticated else 'system'
            username = current_user.username if current_user and current_user.is_authenticated else 'system'

            # Create log entry
            entry = {
                'id': f"audit_{int(datetime.now().timestamp() * 1000)}",
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id,
                'username': username,
                'action': action,
                'entity_type': entity_type,
                'affected_ids': affected_ids or [],
                'affected_count': len(affected_ids) if affected_ids else 0,
                'old_values': old_values,
                'new_values': new_values,
                'metadata': metadata or {},
                'success': success,
                'error_message': error_message
            }

            # Read existing log
            entries = AuditLogger._read_log()

            # Add new entry
            entries.append(entry)

            # Keep only last 10,000 entries to prevent file from growing too large
            if len(entries) > 10000:
                entries = entries[-10000:]

            # Write updated log
            return AuditLogger._write_log(entries)

        except Exception as e:
            # If audit logging fails, log to console but don't fail the operation
            print(f"[AUDIT LOG ERROR] Failed to write audit log: {str(e)}")
            return False

    @staticmethod
    def get_logs(
        limit: int = 100,
        offset: int = 0,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        entity_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve audit logs with optional filters

        Args:
            limit: Maximum number of entries to return
            offset: Number of entries to skip (for pagination)
            user_id: Filter by user ID
            action: Filter by action type
            entity_type: Filter by entity type
            start_date: Filter by start date (ISO format)
            end_date: Filter by end date (ISO format)

        Returns:
            Dict with filtered entries, total count, and metadata
        """
        try:
            # Read all entries
            entries = AuditLogger._read_log()

            # Apply filters
            filtered = entries

            if user_id:
                filtered = [e for e in filtered if e.get('user_id') == user_id]

            if action:
                filtered = [e for e in filtered if e.get('action') == action]

            if entity_type:
                filtered = [e for e in filtered if e.get('entity_type') == entity_type]

            if start_date:
                filtered = [e for e in filtered if e.get('timestamp', '') >= start_date]

            if end_date:
                filtered = [e for e in filtered if e.get('timestamp', '') <= end_date]

            # Sort by timestamp descending (most recent first)
            filtered.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

            # Get total count before pagination
            total = len(filtered)

            # Apply pagination
            paginated = filtered[offset:offset + limit]

            return {
                'success': True,
                'entries': paginated,
                'total': total,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'entries': [],
                'total': 0
            }

    @staticmethod
    def get_stats() -> Dict[str, Any]:
        """
        Get statistics about audit log

        Returns:
            Dict with action counts, user activity, etc.
        """
        try:
            entries = AuditLogger._read_log()

            # Count by action type
            actions = {}
            for entry in entries:
                action = entry.get('action', 'unknown')
                actions[action] = actions.get(action, 0) + 1

            # Count by user
            users = {}
            for entry in entries:
                user = entry.get('username', 'unknown')
                users[user] = users.get(user, 0) + 1

            # Count by entity type
            entities = {}
            for entry in entries:
                entity = entry.get('entity_type', 'unknown')
                entities[entity] = entities.get(entity, 0) + 1

            # Success rate
            successful = len([e for e in entries if e.get('success', True)])
            failed = len(entries) - successful

            return {
                'success': True,
                'total_entries': len(entries),
                'by_action': actions,
                'by_user': users,
                'by_entity_type': entities,
                'successful_operations': successful,
                'failed_operations': failed,
                'success_rate': round(successful / len(entries) * 100, 2) if entries else 100
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


# Convenience function for quick logging
def log_admin_action(
    action: str,
    entity_type: str,
    affected_ids: Optional[List[str]] = None,
    **kwargs
) -> bool:
    """
    Convenience wrapper for AuditLogger.log()

    Usage:
        log_admin_action('bulk_update', 'organizations', affected_ids=['cp_001', 'cp_002'])
    """
    return AuditLogger.log(action, entity_type, affected_ids, **kwargs)
