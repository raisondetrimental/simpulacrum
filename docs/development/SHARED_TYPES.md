# Working with Shared Types & Constants

This guide explains how to work with types and constants shared between the frontend (TypeScript) and backend (Python).

## Overview

The Meridian Dashboard uses a **single source of truth** approach for shared constants:

1. **Canonical Definitions** in `shared/` directory (markdown documentation)
2. **Frontend Implementation** in `frontend/src/constants/shared.ts` (TypeScript)
3. **Backend Implementation** in `backend/src/constants/shared.py` (Python)
4. **Validation Script** ensures implementations stay in sync

## Why Can't We Share Code Directly?

TypeScript and Python are different languages with different type systems. While we can't directly share code, we can:

- Document canonical definitions in one place
- Implement in each language following those definitions
- Validate implementations match using a Python script

## What's Shared?

### Deal Pipeline Constants

**Deal Stages** (6 stages):
```typescript
// Frontend
export const DEAL_STAGES = [
  'identified', 'introduced', 'in_diligence',
  'term_sheet', 'closed', 'dead'
] as const;
```

```python
# Backend
DEAL_STAGES = [
    "identified", "introduced", "in_diligence",
    "term_sheet", "closed", "dead"
]
```

**Action Types** (6 types):
```typescript
// Frontend
export const ACTION_TYPES = [
  'email_sent', 'meeting_scheduled', 'meeting_completed',
  'memo_generated', 'stage_changed', 'note_added'
] as const;
```

```python
# Backend
ACTION_TYPES = [
    "email_sent", "meeting_scheduled", "meeting_completed",
    "memo_generated", "stage_changed", "note_added"
]
```

### Investment Preferences

**Shared Preference Keys** (10 keys used for matching):
```typescript
// Frontend
export const SHARED_PREFERENCE_KEYS = [
  'transport_infra', 'energy_infra', 'us_market',
  'emerging_markets', 'asia_em', 'africa_em',
  'emea_em', 'vietnam', 'mongolia', 'turkey'
] as const;
```

```python
# Backend
SHARED_PREFERENCE_KEYS = (
    "transport_infra", "energy_infra", "us_market",
    "emerging_markets", "asia_em", "africa_em",
    "emea_em", "vietnam", "mongolia", "turkey",
)
```

## How to Use Shared Constants

### In Frontend (TypeScript)

```typescript
// Import constants
import { DEAL_STAGES, ACTION_TYPES } from '../constants/shared';
import type { DealStage, DealActionType } from '../constants/shared';

// Use in code
function isActiveDeal(stage: DealStage): boolean {
  const activeStages: DealStage[] = [
    'identified',
    'introduced',
    'in_diligence',
    'term_sheet'
  ];
  return activeStages.includes(stage);
}

// Iterate over constants
DEAL_STAGES.forEach(stage => {
  console.log(`Stage: ${stage}`);
});
```

### In Backend (Python)

```python
# Import constants
from backend.src.constants.shared import DEAL_STAGES, ACTION_TYPES

# Use in code
def is_active_deal(stage: str) -> bool:
    active_stages = [
        "identified",
        "introduced",
        "in_diligence",
        "term_sheet"
    ]
    return stage in active_stages

# Validate stage
def validate_stage(stage: str) -> bool:
    return stage in DEAL_STAGES
```

## How to Add a New Constant

### Example: Adding a New Deal Stage

**Step 1: Update Canonical Definition**

Edit `shared/constants/deal-stages.md`:
```markdown
### Stage List (in order)

1. **`identified`** - Deal has been identified
2. **`introduced`** - Initial introduction made
3. **`in_diligence`** - Due diligence underway
4. **`term_sheet`** - Negotiating terms
5. **`legal_review`** - NEW: Legal review in progress
6. **`closed`** - Deal closed
7. **`dead`** - Deal dead
```

**Step 2: Update Frontend**

Edit `frontend/src/constants/shared.ts`:
```typescript
export const DEAL_STAGES = [
  'identified',
  'introduced',
  'in_diligence',
  'term_sheet',
  'legal_review',  // NEW
  'closed',
  'dead'
] as const;
```

**Step 3: Update Backend**

Edit `backend/src/constants/shared.py`:
```python
DEAL_STAGES = [
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "legal_review",  # NEW
    "closed",
    "dead"
]
```

**Step 4: Update Validation Script**

Edit `shared/scripts/validate-sync.py`:
```python
CANONICAL_DEAL_STAGES = [
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "legal_review",  # NEW
    "closed",
    "dead"
]
```

**Step 5: Validate**

```bash
python shared/scripts/validate-sync.py
```

Expected output:
```
🔍 Validating backend constants against canonical definitions...

✅ DEAL_STAGES matches
✅ ACTION_TYPES matches
✅ SHARED_PREFERENCE_KEYS matches
✅ PROFILE_CATEGORIES matches
✅ RELATIONSHIP_STATUSES matches

✅ All constants are in sync!
```

**Step 6: Update Types in Frontend**

The type is automatically updated since we use `as const`:
```typescript
// DealStage type now includes 'legal_review'
type DealStage = typeof DEAL_STAGES[number];
// 'identified' | 'introduced' | ... | 'legal_review' | 'closed' | 'dead'
```

**Step 7: Update UI Labels (if needed)**

Edit `frontend/src/types/deals.ts`:
```typescript
export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  identified: 'Identified',
  introduced: 'Introduced',
  in_diligence: 'In Diligence',
  term_sheet: 'Term Sheet',
  legal_review: 'Legal Review',  // NEW
  closed: 'Closed',
  dead: 'Dead'
};
```

**Step 8: Test**

```bash
# Test frontend builds
cd frontend
npm run build

# Test backend runs
cd backend
python src/app.py
```

## Common Patterns

### Checking if Value is Valid

**Frontend:**
```typescript
import { DEAL_STAGES } from '../constants/shared';

function isValidStage(stage: string): stage is DealStage {
  return (DEAL_STAGES as readonly string[]).includes(stage);
}
```

**Backend:**
```python
from backend.src.constants.shared import DEAL_STAGES

def is_valid_stage(stage: str) -> bool:
    return stage in DEAL_STAGES
```

### Getting All Values

**Frontend:**
```typescript
// DEAL_STAGES is already an array
const allStages = DEAL_STAGES;
```

**Backend:**
```python
# DEAL_STAGES is already a list
all_stages = DEAL_STAGES
```

### Type-Safe Enums

**Frontend:**
```typescript
// Type is automatically inferred from const array
type DealStage = typeof DEAL_STAGES[number];

// Use in function signatures
function processDeal(stage: DealStage) {
  // TypeScript ensures only valid stages can be passed
}
```

**Backend:**
```python
# Python doesn't have built-in enums from lists,
# but you can use typing.Literal
from typing import Literal

DealStage = Literal[
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "closed",
    "dead"
]

def process_deal(stage: DealStage) -> None:
    # Type checker ensures only valid stages
    pass
```

## Troubleshooting

### Frontend Build Errors

**Error**: `Type 'string' is not assignable to type 'DealStage'`

**Solution**: You're trying to use a hardcoded string. Import the type:
```typescript
import type { DealStage } from '../constants/shared';
```

### Backend Import Errors

**Error**: `ModuleNotFoundError: No module named 'constants'`

**Solution**: Use relative import:
```python
from ..constants.shared import DEAL_STAGES
```

### Validation Script Fails

**Error**: `❌ DEAL_STAGES mismatch!`

**Solution**:
1. Check what the mismatch is (script will show expected vs actual)
2. Update the mismatched file (frontend or backend)
3. Run validation again

## Best Practices

### ✅ DO

- Import from shared constants, never hardcode strings
- Update canonical definition first
- Run validation script after changes
- Use types for compile-time safety

### ❌ DON'T

- Hardcode magic strings (`"identified"`, `"email_sent"`)
- Update only frontend or only backend (keep in sync!)
- Skip validation step
- Edit files without updating canonical definitions

## Related Files

### Canonical Definitions
- `shared/constants/deal-stages.md`
- `shared/constants/action-types.md`
- `shared/constants/preferences.md`

### Implementations
- `frontend/src/constants/shared.ts`
- `backend/src/constants/shared.py`

### Validation
- `shared/scripts/validate-sync.py`

### Usage Examples
- `frontend/src/types/deals.ts`
- `backend/src/services/deal_pipeline.py`

## Further Reading

- `shared/README.md` - Overview of shared types system
- `docs/API_ENDPOINTS_REFERENCE.md` - API contracts using these types
- JSON schemas in `shared/schemas/` - Runtime validation
