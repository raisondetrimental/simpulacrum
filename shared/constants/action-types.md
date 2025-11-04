# Action Types - Canonical Definition

**Last Updated**: 2025-10-08
**Source of Truth**: This document defines the canonical list of deal action types for the entire application.

## Action Types

Action types represent activities and events that occur during a deal's lifecycle.

### Action List

1. **`email_sent`** - Email sent to sponsor or capital partner
2. **`meeting_scheduled`** - Meeting scheduled between parties
3. **`meeting_completed`** - Meeting completed
4. **`memo_generated`** - Investment memo generated
5. **`stage_changed`** - Deal stage changed
6. **`note_added`** - Note added to deal

### Action Details

Each action should include:
- `action_type`: One of the types listed above
- `timestamp`: ISO 8601 timestamp
- `user`: Username or "system"
- `details`: Additional metadata (object)

### Common Detail Fields

- **email_sent**: `to`, `subject`, `body_preview`
- **meeting_scheduled**: `date`, `time`, `participants`, `location`
- **meeting_completed**: `participants`, `outcome`, `next_steps`
- **memo_generated**: `filename`, `url`
- **stage_changed**: `old_stage`, `new_stage`, `reason`
- **note_added**: `note_text`, `category`

## Implementation

### TypeScript (Frontend)

```typescript
// frontend/src/constants/shared.ts
export const ACTION_TYPES = [
  'email_sent',
  'meeting_scheduled',
  'meeting_completed',
  'memo_generated',
  'stage_changed',
  'note_added'
] as const;

export type DealActionType = typeof ACTION_TYPES[number];
```

### Python (Backend)

```python
# backend/src/constants/shared.py
ACTION_TYPES = [
    "email_sent",
    "meeting_scheduled",
    "meeting_completed",
    "memo_generated",
    "stage_changed",
    "note_added"
]
```

## Sync Requirements

⚠️ **IMPORTANT**: When updating this list, you MUST update:
1. This canonical definition (`shared/constants/action-types.md`)
2. Frontend constants (`frontend/src/constants/shared.ts`)
3. Backend constants (`backend/src/constants/shared.py`)
4. Run validation: `python shared/scripts/validate-sync.py`

## Used In

**Frontend:**
- `frontend/src/types/deals.ts`
- `frontend/src/pages/deals/DealDetailPage.tsx`
- `frontend/src/components/deals/DealActivityLog.tsx`

**Backend:**
- `backend/src/services/deal_pipeline.py`
- `backend/src/api/deals.py`
