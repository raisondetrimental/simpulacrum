# Database Migrations

This directory previously contained migration scripts for transforming the JSON database structure. All migrations have been successfully completed and the scripts have been removed to reduce clutter.

## Completed Migrations (October 2025)

### 1. Deal Precedents Migration
**Script:** `migrate_deals.py` (deleted)
**Date Completed:** October 9, 2025
**Description:** Converted embedded `deal_precedents` from Capital Partners, Corporates, and Legal Advisors into standalone entries in `deals.json`.

**Changes:**
- Extracted nested deal data to independent deal records
- Created proper deal participant relationships in `deal_participants.json`
- Maintained backward references from participants to deals
- Removed `deal_precedents` field from source entities

**Documentation:** See `docs/architecture/migration-complete.md`

---

### 2. Deal Precedents Cleanup
**Script:** `cleanup_deal_precedents.py` (deleted)
**Date Completed:** October 2025
**Description:** Removed `deal_precedents` fields from all CRM entities after successful migration to standalone deals.

**Affected Files:**
- `data/json/capital_partners.json`
- `data/json/corporates.json`
- `data/json/legal_advisors.json`

---

### 3. Teams Hierarchy Removal
**Script:** `migrate_remove_teams.py` (deleted)
**Date Completed:** October 23, 2024
**Description:** Flattened the three-tier hierarchy (Capital Partner → Team → Contact) to two-tier (Capital Partner → Contact).

**Changes:**
- Converted `teams` array to individual contacts
- Added `team_name` text field to contacts for team designation
- Deleted `teams.json` entity
- Archived old teams data to `data/json/teams_ARCHIVED.json` (deleted during 2025 cleanup)

**Impact:**
- Simplified data model
- Reduced complexity in frontend UI
- Contacts now directly associated with Capital Partners

---

### 4. Meeting Notes IDs
**Script:** `add_meeting_ids.py` (deleted)
**Date Completed:** October 2025
**Description:** Added unique IDs to all meeting notes entries for better tracking and management.

**Changes:**
- Generated sequential IDs for meeting notes
- Format: `meeting_001`, `meeting_002`, etc.
- Applied to all CRM modules (Liquidity, Sponsors, Counsel, Agents)

---

## Migration History Archive

All migration scripts and detailed logs have been preserved in git history. If you need to review the migration logic or rollback (not recommended), you can access the scripts via git:

```bash
# View deleted migration scripts
git log --all --full-history -- "backend/migrate_*.py"
git log --all --full-history -- "backend/add_meeting_ids.py"
git log --all --full-history -- "backend/cleanup_deal_precedents.py"

# Restore a specific migration script (for reference only)
git show <commit-hash>:backend/migrate_deals.py > migrate_deals.py.backup
```

---

## Current Database Structure

### Active JSON Files (`data/json/`)

**CRM Entities:**
- `capital_partners.json` - Capital partners (liquidity module)
- `contacts.json` - Liquidity contacts
- `corporates.json` - Corporate sponsors
- `sponsor_contacts.json` - Sponsor contacts
- `legal_advisors.json` - Legal advisory firms
- `counsel_contacts.json` - Counsel contacts
- `agents.json` - Transaction agents
- `agent_contacts.json` - Agent contacts

**Deals & Transactions:**
- `deals.json` - Deal pipeline (standalone deals from migration)
- `deal_participants.json` - Deal participant relationships

**Investment Matching:**
- `investment_strategies.json` - User-saved investment strategies
- `investment_profiles.json` - Generated profiles for matching

**Market Data:**
- `fx_rates.json` - Current FX rates
- `fx_rates_history.json` - Historical FX data

**Collaboration:**
- `general_posts.json` - General whiteboard posts
- `weekly_whiteboards.json` - Weekly whiteboard posts

**User Management:**
- `users.json` - User accounts (bcrypt hashed passwords)

---

## Future Migrations

If you need to create new migrations in the future:

1. **Create a migration script** in this directory (`backend/migrations/`)
2. **Use the JSON store utility**: `backend/src/utils/json_store.py`
3. **Create automatic backups**: The JSON store creates `.bak` files automatically
4. **Test thoroughly**: Run on a copy of production data first
5. **Document the migration**: Add details to this README
6. **Keep the script**: Don't delete until confirmed successful in production

### Migration Script Template

```python
#!/usr/bin/env python3
"""
Migration: [Brief Description]

Date: YYYY-MM-DD
Author: [Your Name]

Description:
    [Detailed description of what this migration does]

Changes:
    - [List of changes]
    - [Impact on data structure]
"""

import json
from pathlib import Path
from datetime import datetime


def migrate():
    """Perform the migration."""
    data_dir = Path(__file__).parent.parent.parent / 'data' / 'json'

    # Load data
    with open(data_dir / 'your_file.json', 'r') as f:
        data = json.load(f)

    # Create backup
    backup_path = data_dir / f'your_file_{datetime.now().strftime("%Y%m%d_%H%M%S")}.bak'
    with open(backup_path, 'w') as f:
        json.dump(data, f, indent=2)

    # Perform migration
    # ... migration logic ...

    # Save migrated data
    with open(data_dir / 'your_file.json', 'w') as f:
        json.dump(data, f, indent=2)

    print(f"Migration completed successfully!")
    print(f"Backup saved to: {backup_path}")


if __name__ == '__main__':
    migrate()
```

---

## Rollback Procedures

**Important:** Rollbacks should only be performed in exceptional circumstances.

### Using .bak Files

All write operations create automatic `.bak` backups:

```bash
# List recent backups
ls -lht data/json/*.bak | head -10

# Restore from backup
cp data/json/capital_partners.json.bak data/json/capital_partners.json
```

### Using Timestamped Backups

Some migrations create timestamped backups in `data/json/backups/`:

```bash
# Restore from specific date
cp data/json/backups/capital_partners_20251027_170750.json data/json/capital_partners.json
```

### Using Git History

If backups are not available:

```bash
# Find when file was last modified
git log -- data/json/capital_partners.json

# Restore file from specific commit
git checkout <commit-hash> -- data/json/capital_partners.json
```

---

## See Also

- [Migration Complete Documentation](../../docs/architecture/migration-complete.md)
- [Data Model Diagram](../../docs/DATA_MODEL_DIAGRAM.md)
- [Backend README](../README.md)
- [JSON Store Utility](../src/utils/json_store.py)
