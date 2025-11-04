# Shared Types & Constants

This directory contains **canonical definitions** for types and constants shared between the frontend (TypeScript) and backend (Python).

## Purpose

Since TypeScript and Python are different languages, we can't directly share code. Instead, this directory serves as the **single source of truth** for:

- Deal pipeline stages and actions
- Investment preference keys
- Profile categories
- Relationship status values
- JSON schemas for API contracts

## Directory Structure

```
shared/
├── types/              # Type documentation
├── constants/          # Constant definitions
├── schemas/            # JSON schemas
├── scripts/            # Validation scripts
└── README.md           # This file
```

## How It Works

1. **Canonical Definitions** - This directory contains markdown documentation defining all shared constants
2. **Language-Specific Implementations** - Frontend and backend each have their own implementation:
   - `frontend/src/constants/shared.ts` (TypeScript)
   - `backend/src/constants/shared.py` (Python)
3. **Validation** - Run `python shared/scripts/validate-sync.py` to ensure implementations match

## Shared Constants

### Deal Pipeline

**Deal Stages** (`shared/constants/deal-stages.md`):
- `identified`, `introduced`, `in_diligence`, `term_sheet`, `closed`, `dead`

**Action Types** (`shared/constants/action-types.md`):
- `email_sent`, `meeting_scheduled`, `meeting_completed`, `memo_generated`, `stage_changed`, `note_added`

### Investment Preferences

**Shared Preference Keys** (`shared/constants/preferences.md`):
- 10 keys used for cross-CRM matching
- `transport_infra`, `energy_infra`, `us_market`, `emerging_markets`, `asia_em`, `africa_em`, `emea_em`, `vietnam`, `mongolia`, `turkey`

### Entity Types

**Profile Categories**:
- `capital_partner`, `capital_partner_team`, `sponsor`

**Relationship Statuses**:
- `Strong`, `Medium`, `Developing`, `Cold`

## How to Update Constants

⚠️ **IMPORTANT**: Always follow this process when updating shared constants:

### Step 1: Update Canonical Definition

Edit the markdown file in `shared/constants/`:
```bash
# Example: Updating deal stages
vim shared/constants/deal-stages.md
```

### Step 2: Update Frontend Implementation

Edit `frontend/src/constants/shared.ts`:
```typescript
export const DEAL_STAGES = [
  'identified',
  'introduced',
  // ... your changes
] as const;
```

### Step 3: Update Backend Implementation

Edit `backend/src/constants/shared.py`:
```python
DEAL_STAGES = [
    "identified",
    "introduced",
    # ... your changes
]
```

### Step 4: Run Validation

```bash
python shared/scripts/validate-sync.py
```

If validation passes, you're done! If not, fix the mismatches and run again.

### Step 5: Test

```bash
# Test frontend
cd frontend
npm run build

# Test backend
cd backend
python src/app.py
```

## JSON Schemas

JSON schemas in `shared/schemas/` provide:
- API contract validation
- Documentation for API consumers
- Type safety at runtime

### Available Schemas

- `deal.schema.json` - Deal object structure
- `profile.schema.json` - InvestmentProfile structure

## Validation Script

**`shared/scripts/validate-sync.py`** checks that:
- Backend constants match canonical definitions
- All required constants are present
- Values are in the correct format

Run it regularly during development:
```bash
python shared/scripts/validate-sync.py
```

## Best Practices

### DO ✅

- **Always update canonical definition first** - This is the source of truth
- **Update both frontend and backend** - Keep implementations in sync
- **Run validation script** - Catch mismatches early
- **Document changes** - Update markdown files with context

### DON'T ❌

- **Don't edit frontend/backend directly** - Update canonical first
- **Don't skip validation** - Always run the script
- **Don't use magic strings** - Import from shared constants
- **Don't duplicate constants** - Use shared definitions

## Example: Adding a New Deal Stage

```markdown
# 1. Update shared/constants/deal-stages.md
Add new stage to list with description

# 2. Update frontend/src/constants/shared.ts
export const DEAL_STAGES = [
  'identified',
  'introduced',
  'in_diligence',
  'term_sheet',
  'negotiating', // NEW
  'closed',
  'dead'
] as const;

# 3. Update backend/src/constants/shared.py
DEAL_STAGES = [
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "negotiating",  # NEW
    "closed",
    "dead"
]

# 4. Run validation
python shared/scripts/validate-sync.py

# 5. Update JSON schema if needed
Edit shared/schemas/deal.schema.json
```

## Files Using Shared Constants

### Frontend
- `frontend/src/types/deals.ts`
- `frontend/src/pages/deals/DealPipelinePage.tsx`
- `frontend/src/services/dealsService.ts`

### Backend
- `backend/src/services/deal_pipeline.py`
- `backend/src/services/investment_profiles.py`
- `backend/src/api/deals.py`

## Related Documentation

- `docs/development/SHARED_TYPES.md` - Developer guide
- `docs/API_ENDPOINTS_REFERENCE.md` - API documentation
- `CLAUDE.md` - Project overview

## Questions?

- Check canonical definitions in `shared/constants/`
- Read developer guide in `docs/development/SHARED_TYPES.md`
- Review code in `frontend/src/constants/shared.ts` or `backend/src/constants/shared.py`
