"""
Feature Flags Service
Manages runtime feature toggles for experimental and optional functionality
"""

from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import json


class FeatureFlags:
    """Service for managing feature flags"""

    FLAGS_FILE = "feature_flags.json"

    # Default flag definitions
    DEFAULT_FLAGS = {
        "excel_com_enabled": {
            "enabled": False,
            "name": "Excel COM Operations",
            "description": "Windows-only Excel macro execution via COM interface",
            "category": "integration",
            "requires_restart": False,
            "impact": "Enables /api/excel/refresh endpoint for macro execution",
            "last_modified": None,
            "modified_by": None
        },
        "auto_archive_enabled": {
            "enabled": False,
            "name": "Auto-Archive Old Records",
            "description": "Automatically archive deals/contacts older than configured threshold",
            "category": "data_management",
            "requires_restart": False,
            "impact": "Records older than 365 days will be moved to archive files",
            "last_modified": None,
            "modified_by": None
        },
        "experimental_ui_enabled": {
            "enabled": False,
            "name": "Experimental UI Features",
            "description": "Beta frontend features (new charts, layouts, components)",
            "category": "ui",
            "requires_restart": False,
            "impact": "Unlocks experimental UI components and features",
            "last_modified": None,
            "modified_by": None
        }
    }

    @staticmethod
    def _get_flags_path(json_dir: Path) -> Path:
        """Get path to feature flags file"""
        return json_dir / FeatureFlags.FLAGS_FILE

    @staticmethod
    def _load_flags(json_dir: Path) -> Dict[str, Any]:
        """Load feature flags from file, creating with defaults if not exists"""
        flags_path = FeatureFlags._get_flags_path(json_dir)

        if not flags_path.exists():
            # Create with default flags
            FeatureFlags._save_flags(json_dir, FeatureFlags.DEFAULT_FLAGS)
            return FeatureFlags.DEFAULT_FLAGS.copy()

        try:
            with open(flags_path, 'r', encoding='utf-8') as f:
                flags = json.load(f)

            # Merge with defaults to ensure all flags exist
            merged_flags = FeatureFlags.DEFAULT_FLAGS.copy()
            for flag_name, flag_data in flags.items():
                if flag_name in merged_flags:
                    merged_flags[flag_name].update(flag_data)

            return merged_flags
        except Exception as e:
            print(f"Error loading feature flags: {e}")
            return FeatureFlags.DEFAULT_FLAGS.copy()

    @staticmethod
    def _save_flags(json_dir: Path, flags: Dict[str, Any]) -> bool:
        """Save feature flags to file"""
        flags_path = FeatureFlags._get_flags_path(json_dir)

        try:
            # Create backup if file exists
            if flags_path.exists():
                backup_path = flags_path.with_suffix('.json.bak')
                with open(flags_path, 'r', encoding='utf-8') as f:
                    backup_data = f.read()
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(backup_data)

            # Write new data
            with open(flags_path, 'w', encoding='utf-8') as f:
                json.dump(flags, f, indent=2, ensure_ascii=False)

            return True
        except Exception as e:
            print(f"Error saving feature flags: {e}")
            return False

    @staticmethod
    def get_all_flags(json_dir: Path) -> Dict[str, Any]:
        """
        Get all feature flags with their current status and metadata

        Returns:
            Dict with all flags and their properties
        """
        return FeatureFlags._load_flags(json_dir)

    @staticmethod
    def is_enabled(json_dir: Path, flag_name: str) -> bool:
        """
        Check if a specific feature flag is enabled

        Args:
            json_dir: Path to JSON data directory
            flag_name: Name of the flag to check

        Returns:
            True if flag exists and is enabled, False otherwise
        """
        flags = FeatureFlags._load_flags(json_dir)

        if flag_name not in flags:
            return False

        return flags[flag_name].get("enabled", False)

    @staticmethod
    def toggle_flag(
        json_dir: Path,
        flag_name: str,
        enabled: bool,
        modified_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Enable or disable a feature flag

        Args:
            json_dir: Path to JSON data directory
            flag_name: Name of the flag to toggle
            enabled: New enabled state
            modified_by: Username of person making the change

        Returns:
            Dict with success status and updated flag data
        """
        flags = FeatureFlags._load_flags(json_dir)

        if flag_name not in flags:
            return {
                "success": False,
                "message": f"Unknown feature flag: {flag_name}"
            }

        # Update flag
        old_value = flags[flag_name].get("enabled", False)
        flags[flag_name]["enabled"] = enabled
        flags[flag_name]["last_modified"] = datetime.now().isoformat()
        flags[flag_name]["modified_by"] = modified_by

        # Save to file
        if not FeatureFlags._save_flags(json_dir, flags):
            return {
                "success": False,
                "message": "Failed to save feature flags"
            }

        return {
            "success": True,
            "message": f"Flag '{flag_name}' {('enabled' if enabled else 'disabled')}",
            "data": {
                "flag_name": flag_name,
                "old_value": old_value,
                "new_value": enabled,
                "flag_data": flags[flag_name]
            }
        }

    @staticmethod
    def get_flag_metadata(json_dir: Path, flag_name: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a specific flag

        Args:
            json_dir: Path to JSON data directory
            flag_name: Name of the flag

        Returns:
            Flag metadata dict or None if not found
        """
        flags = FeatureFlags._load_flags(json_dir)
        return flags.get(flag_name)

    @staticmethod
    def get_flags_by_category(json_dir: Path, category: str) -> Dict[str, Any]:
        """
        Get all flags in a specific category

        Args:
            json_dir: Path to JSON data directory
            category: Category to filter by (integration, data_management, ui)

        Returns:
            Dict of flags in the specified category
        """
        all_flags = FeatureFlags._load_flags(json_dir)

        return {
            flag_name: flag_data
            for flag_name, flag_data in all_flags.items()
            if flag_data.get("category") == category
        }

    @staticmethod
    def reset_to_defaults(json_dir: Path) -> Dict[str, Any]:
        """
        Reset all flags to their default values

        Args:
            json_dir: Path to JSON data directory

        Returns:
            Dict with success status
        """
        if FeatureFlags._save_flags(json_dir, FeatureFlags.DEFAULT_FLAGS):
            return {
                "success": True,
                "message": "All feature flags reset to defaults"
            }

        return {
            "success": False,
            "message": "Failed to reset feature flags"
        }
