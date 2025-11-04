# Liquidity Module Restructure - Executive Summary

## Problem

Your current system treats capital partners and contacts as separate, flat entities. However, you've identified that:

1. Each contact belongs to a **specific team** within a capital partner
2. Different teams have **different investment mandates and preferences**
3. Teams may be in **different locations**
4. You need to track **minimum and maximum investment amounts per team**
5. During meetings, you need to quickly **edit both contact info and team preferences**

## Solution: Three-Tier Hierarchy

```
Capital Partner (Organization)
    ↓
Team/Sub-team (Business Unit with investment mandate)
    ↓
Contact (Individual person)
```

## Key Benefits

✅ **Accurate Structure**: Matches real-world organizational hierarchy
✅ **Flexible Mandates**: Each team has its own preferences and investment ranges
✅ **Location Tracking**: Track which office each team operates from
✅ **Multiple Contacts**: Support multiple contacts across different teams
✅ **Meeting Efficiency**: New "Meeting Notes" page for quick updates during calls
✅ **Data Preserved**: All existing capital partner data migrates safely
✅ **Scalable**: Easy to add new teams or split existing ones

## New Data Structure

### 1. Capital Partners (`capital_partners.json`)
- Basic organization info
- Type, country, headquarters
- Overall relationship strength
- Organization-level notes

### 2. Teams (`teams.json`)
- Links to capital partner
- Team name and office location
- **Investment min/max amounts**
- **All investment preferences** (moved from capital partner)
- Team-specific notes

### 3. Contacts (`contacts.json`)
- Links to team and capital partner
- Personal details (name, role, email, phone, LinkedIn)
- Personal relationship strength
- DISC profile
- **Meeting history with dates and notes**
- Next contact reminder

## New Meeting Notes Feature

### Route: `/liquidity/meeting-notes/:contact_id`

**Purpose**: During a meeting, edit everything in one place:

| Section | What You Can Edit |
|---------|------------------|
| **Contact Info** | Name, role, email, phone |
| **Team Investment** | Min/max investment amounts, office location |
| **Team Preferences** | All Y/N investment preferences (grid view) |
| **Meeting Notes** | Today's discussion notes |
| **Follow-up** | Set next contact reminder date |

**Single Save**: One button saves all changes to both contact and team data.

## Restructured Liquidity Subfolder

### Current Structure
```
/liquidity               → Landing page
/contacts               → View/edit contacts
/damn-effect-strategy-edit  → Edit capital partners
/saved-filters          → Filter strategies
```

### New Structure
```
/liquidity                    → Landing page with contact reminders
/liquidity/capital-partners   → Manage organizations
/liquidity/teams             → Manage teams (with preferences)
/liquidity/contacts          → Manage individual contacts
/liquidity/meeting-notes     → NEW! Quick meeting interface
/liquidity/saved-filters     → Filter strategies
```

## Backend Changes

### New API Endpoints

**Capital Partners**:
- `GET/POST/PUT/DELETE /api/capital-partners`
- Basic CRUD for organizations

**Teams**:
- `GET/POST/PUT/DELETE /api/teams`
- Include investment preferences per team
- Filter by capital partner

**Contacts**:
- `GET/POST/PUT/DELETE /api/contacts`
- Include meeting history
- Filter by team or capital partner

**Meeting Notes** (Special):
- `POST /api/meeting-notes` → Update contact + team in one transaction
- `GET /api/meeting-notes/reminders` → Get upcoming follow-ups


### Database Files

```
data/json/
├── capital_partners.json  (NEW - organizations)
├── teams.json            (NEW - teams with preferences)
├── contacts.json         (UPDATED - now links to teams)
├── filters.json          (UNCHANGED)
│
└── backups/
    ├── institutions.json.backup  (Original data)
    └── contacts.json.backup      (Original data)
```

## Migration Strategy

### Step 1: Run Migration Script
```bash
python scripts/migrate_to_new_structure.py
```

**What it does**:
1. Reads current `institutions.json`
2. Creates a capital partner for each institution
3. Creates a "Main Team" for each partner with all preferences
4. Sets default investment min/max (editable later)
5. Keeps backups of original files

### Step 2: Update Backend
- Add new API endpoints
- Maintain `/api/institutions` for backward compatibility
- Add cascade delete logic

### Step 3: Update Frontend
- Build new pages for capital partners and teams
- Update ContactsUnifiedPage to show team hierarchy
- Create new MeetingNotesPage

### Step 4: Update Liquidity Landing Page
- Show contact reminders (from `next_contact_reminder`)
- Add "Start Meeting" quick actions
- Display recent meeting history

## Example: Real-World Usage

### Scenario: Scottish Widows has two teams

**Organization**: Scottish Widows (Pension Fund, UK)

**Team 1: Infrastructure Debt Team**
- Office: London
- Investment: $50M - $500M
- Focus: Investment grade, senior secured, US/UK markets
- Contacts: John Smith (Head), Sarah Jones (Analyst)

**Team 2: Emerging Markets Team**
- Office: Singapore
- Investment: $25M - $200M
- Focus: High yield, emerging markets, Asia
- Contacts: Michael Chen (Head), Lisa Brown (VP)

**During Meeting with John Smith**:
1. Open `/liquidity/meeting-notes/contact_john_smith`
2. Update John's email if changed
3. Adjust team's max investment to $600M (mandate increased)
4. Toggle "Mongolia" preference to "Y" (new mandate)
5. Add notes: "Interested in Mongolia transport deals"
6. Set next follow-up: 2 weeks
7. Click "Save" → All updates saved together

## Implementation Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1** | Backend & data migration | 1 week |
| **Phase 2** | Capital partners & teams UI | 1 week |
| **Phase 3** | Contacts restructure | 1 week |
| **Phase 4** | Meeting notes feature | 1 week |
| **Phase 5** | Testing & refinement | 1 week |

**Total**: ~5 weeks for full implementation

## Risk Mitigation

✅ **No Data Loss**: Migration script preserves all existing data
✅ **Reversible**: Original files backed up
✅ **Backward Compatible**: Legacy API endpoints maintained
✅ **Testable**: Can test on copy of data first
✅ **Incremental**: Can roll out pages one at a time

## Questions to Discuss

1. **Investment amounts**: Should we support multiple currencies per team?
Just USD
2. **Meeting notes**: Should we add participants field (if multiple people on call)?
Yes, as a small category.
3. **Preferences**: Any new Y/N fields we should add?
Not for now- but there will be additions later on
4. **Reminders**: Email notifications for upcoming follow-ups?
- Yes this is very helpful. However, instead of doing this now- come up with a plan for how this can be implemented
6. **Deal tracking**: Should we link contacts to specific deals/opportunities?
No- not yet

## Next Steps

1. ✅ Review this architecture proposal
2. ⬜ Approve data model structure
3. ⬜ Run migration script on test data
4. ⬜ Review migrated data for accuracy
5. ⬜ Begin backend implementation
6. ⬜ Build frontend pages
7. ⬜ User testing and feedback
8. ⬜ Production deployment

---

## Quick Decision Checklist

Before proceeding, confirm:

- [ ] Three-tier hierarchy (Partner > Team > Contact) makes sense
- [ ] Investment min/max should be per team, not per organization
- [ ] Preferences should be per team, not per organization
- [ ] Meeting Notes page design meets your needs
- [ ] Migration approach preserves all existing data
- [ ] Timeline is acceptable (~5 weeks)

All confirmed.

---

**Prepared**: October 2024
**Next Review**: After stakeholder feedback

For detailed technical specifications, see:
- `LIQUIDITY_RESTRUCTURE_PLAN.md` - Full technical plan
- `DATA_MODEL_DIAGRAM.md` - Visual data model diagrams
