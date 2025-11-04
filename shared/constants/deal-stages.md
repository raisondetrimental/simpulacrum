# Deal Stages - Canonical Definition

**Last Updated**: 2025-10-08
**Source of Truth**: This document defines the canonical list of deal stages for the entire application.

## Deal Stages

Deal stages represent the progression of an infrastructure financing opportunity from identification to closure (or failure).

### Stage List (in order)

1. **`identified`** - Deal has been identified as a potential opportunity
2. **`introduced`** - Initial introduction made between sponsor and capital partners
3. **`in_diligence`** - Active due diligence underway
4. **`term_sheet`** - Term sheet stage, negotiating terms
5. **`closed`** - Deal successfully closed
6. **`dead`** - Deal no longer being pursued

### Stage Transitions

Valid transitions:
- `identified` → `introduced` or `dead`
- `introduced` → `in_diligence` or `dead`
- `in_diligence` → `term_sheet` or `dead`
- `term_sheet` → `closed` or `dead`
- `closed` (final state, no transitions)
- `dead` (final state, no transitions)

### Business Rules

- **Active deals**: Stages `identified`, `introduced`, `in_diligence`, `term_sheet`
- **Inactive deals**: Stages `closed`, `dead`
- **Default stage**: `identified` (for newly created deals)

## Implementation

### TypeScript (Frontend)

```typescript
// frontend/src/constants/shared.ts
export const DEAL_STAGES = [
  'identified',
  'introduced',
  'in_diligence',
  'term_sheet',
  'closed',
  'dead'
] as const;

export type DealStage = typeof DEAL_STAGES[number];
```

### Python (Backend)

```python
# backend/src/constants/shared.py
DEAL_STAGES = [
    "identified",
    "introduced",
    "in_diligence",
    "term_sheet",
    "closed",
    "dead"
]
```

## Sync Requirements

⚠️ **IMPORTANT**: When updating this list, you MUST update:
1. This canonical definition (`shared/constants/deal-stages.md`)
2. Frontend constants (`frontend/src/constants/shared.ts`)
3. Backend constants (`backend/src/constants/shared.py`)
4. Run validation: `python shared/scripts/validate-sync.py`

## Used In

**Frontend:**
- `frontend/src/types/deals.ts`
- `frontend/src/pages/deals/DealPipelinePage.tsx`
- `frontend/src/components/deals/DealCard.tsx`

**Backend:**
- `backend/src/services/deal_pipeline.py`
- `backend/src/api/deals.py`
