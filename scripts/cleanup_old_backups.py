#!/usr/bin/env python3
"""
Cleanup Old Backup Files

This script automatically deletes .bak files older than 30 days from the data/json directory.
It's designed to be run periodically (e.g., via cron job or task scheduler) to prevent
backup file accumulation.

Usage:
    python scripts/cleanup_old_backups.py [--days N] [--dry-run]

Options:
    --days N     Delete backups older than N days (default: 30)
    --dry-run    Show what would be deleted without actually deleting
"""

import argparse
import os
import time
from datetime import datetime, timedelta
from pathlib import Path


def cleanup_backups(data_dir: Path, days: int = 30, dry_run: bool = False):
    """
    Delete .bak files older than specified number of days.

    Args:
        data_dir: Path to the data/json directory
        days: Number of days to keep (files older than this are deleted)
        dry_run: If True, only show what would be deleted without deleting
    """
    if not data_dir.exists():
        print(f"Error: Directory {data_dir} does not exist")
        return

    # Calculate cutoff time
    cutoff_time = time.time() - (days * 24 * 60 * 60)
    cutoff_date = datetime.fromtimestamp(cutoff_time)

    print(f"Searching for .bak files older than {days} days (before {cutoff_date.strftime('%Y-%m-%d')})")
    print(f"Directory: {data_dir}")
    print()

    # Find all .bak files
    backup_files = list(data_dir.glob("*.bak"))

    if not backup_files:
        print("No .bak files found")
        return

    deleted_count = 0
    kept_count = 0
    total_size_deleted = 0

    for backup_file in sorted(backup_files):
        file_mtime = backup_file.stat().st_mtime
        file_date = datetime.fromtimestamp(file_mtime)
        file_size = backup_file.stat().st_size

        if file_mtime < cutoff_time:
            size_mb = file_size / (1024 * 1024)
            if dry_run:
                print(f"[DRY RUN] Would delete: {backup_file.name} ({size_mb:.2f} MB, {file_date.strftime('%Y-%m-%d')})")
            else:
                print(f"Deleting: {backup_file.name} ({size_mb:.2f} MB, {file_date.strftime('%Y-%m-%d')})")
                backup_file.unlink()

            deleted_count += 1
            total_size_deleted += file_size
        else:
            kept_count += 1

    print()
    print("Summary:")
    print(f"  Files {'that would be ' if dry_run else ''}deleted: {deleted_count}")
    print(f"  Files kept: {kept_count}")
    print(f"  Space {'that would be ' if dry_run else ''}freed: {total_size_deleted / (1024 * 1024):.2f} MB")

    if dry_run:
        print()
        print("This was a dry run. No files were actually deleted.")
        print("Run without --dry-run to perform the cleanup.")


def main():
    parser = argparse.ArgumentParser(
        description="Cleanup old .bak backup files from data/json directory",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Delete backups older than 30 days (default)
    python scripts/cleanup_old_backups.py

    # Delete backups older than 60 days
    python scripts/cleanup_old_backups.py --days 60

    # Show what would be deleted without deleting
    python scripts/cleanup_old_backups.py --dry-run
        """
    )

    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Delete backups older than this many days (default: 30)"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be deleted without actually deleting"
    )

    args = parser.parse_args()

    # Calculate data/json path relative to script location
    script_dir = Path(__file__).parent.parent  # Go up to project root
    data_dir = script_dir / "data" / "json"

    cleanup_backups(data_dir, args.days, args.dry_run)


if __name__ == "__main__":
    main()
