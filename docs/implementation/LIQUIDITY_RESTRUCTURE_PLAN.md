# Liquidity Module Restructuring Plan

## Problem Statement

Currently, the system treats contacts and capital partners as separate entities. However, the real-world relationship is more complex:

1. **Each contact** belongs to a **capital partner** organization
2. **Each contact** works within a specific **team/sub-team** in that organization
3. **Different teams** within the same capital partner may have different:
   - Investment preferences and mandates
   - Geographic locations/offices
   - Investment size ranges (min/max)
   - Risk appetites and requirements

4. **Multiple contacts** from different teams can exist under the same capital partner
5. During meetings, we need to quickly edit both contact details AND their team's investment preferences

## Proposed Data Model

### Three-Tier Hierarchy

```
Capital Partner (Organization)
    └── Team/Sub-team (Business Unit)
        └── Contact (Individual Person)
```

### 1. Capital Partners Collection
**File**: `data/json/capital_partners.json`

```json
[
  {
    "id": "cp_001",
    "name": "Scottish Widows",
    "type": "Pension Fund",
    "country": "UK",
    "headquarters_location": "Edinburgh",
    "relationship": "Strong",
    "notes": "Primary UK pension fund partner",
    "created_at": "2024-01-15",
    "last_updated": "2024-10-01"
  }
]
```

**Fields**:
- `id`: Unique identifier (generated)
- `name`: Organization name
- `type`: Organization type (Pension Fund, Sovereign Wealth Fund, etc.)
- `country`: Primary country
- `headquarters_location`: HQ city
- `relationship`: Overall relationship strength (Strong, Medium, Developing, Cold)
- `notes`: General notes about the organization
- Timestamps for tracking

### 2. Teams Collection
**File**: `data/json/teams.json`

```json
[
  {
    "id": "team_001",
    "capital_partner_id": "cp_001",
    "team_name": "Infrastructure Debt Team",
    "office_location": "London",
    "investment_min": 50000000,
    "investment_max": 500000000,
    "currency": "USD",

    "preferences": {
      "investment_grade": "Y",
      "high_yield": "N",
      "infra_debt": "Y",
      "senior_secured": "Y",
      "subordinated": "N",
      "bonds": "Y",
      "loan_agreement": "Y",
      "quasi_sovereign_only": "N",
      "public_bond_high_yield": "N",
      "us_market": "Y",
      "emerging_markets": "N",
      "asia_em": "N",
      "africa_em": "N",
      "emea_em": "N",
      "vietnam": "N",
      "mongolia": "N",
      "turkey": "N",
      "coal": "N",
      "energy_infra": "Y",
      "transport_infra": "Y",
      "more_expensive_than_usual": "N",
      "require_bank_guarantee": "N"
    },

    "team_notes": "Focus on large-scale UK/US infrastructure",
    "created_at": "2024-01-15",
    "last_updated": "2024-10-01"
  },
  {
    "id": "team_002",
    "capital_partner_id": "cp_001",
    "team_name": "Emerging Markets Team",
    "office_location": "Singapore",
    "investment_min": 25000000,
    "investment_max": 200000000,
    "currency": "USD",

    "preferences": {
      "investment_grade": "Y",
      "high_yield": "Y",
      "infra_debt": "Y",
      "senior_secured": "Y",
      "subordinated": "N",
      "bonds": "Y",
      "loan_agreement": "Y",
      "quasi_sovereign_only": "N",
      "public_bond_high_yield": "Y",
      "us_market": "N",
      "emerging_markets": "Y",
      "asia_em": "Y",
      "africa_em": "N",
      "emea_em": "Y",
      "vietnam": "Y",
      "mongolia": "N",
      "turkey": "Y",
      "coal": "N",
      "energy_infra": "Y",
      "transport_infra": "Y",
      "more_expensive_than_usual": "N",
      "require_bank_guarantee": "N"
    },

    "team_notes": "Singapore-based EM infrastructure team",
    "created_at": "2024-02-20",
    "last_updated": "2024-10-01"
  }
]
```

**Key Fields**:
- `id`: Unique team identifier
- `capital_partner_id`: Links to parent organization
- `team_name`: Name of the team/division
- `office_location`: Physical location
- `investment_min`/`investment_max`: Investment range in specified currency
- `currency`: Currency for investment amounts
- `preferences`: All investment preferences (migrated from current institutions data)
- `team_notes`: Team-specific notes

### 3. Contacts Collection
**File**: `data/json/contacts.json`

```json
[
  {
    "id": "contact_001",
    "team_id": "team_001",
    "capital_partner_id": "cp_001",

    "name": "John Smith",
    "role": "Head of Infrastructure Debt",
    "email": "john.smith@scottishwidows.com",
    "phone": "+44 20 1234 5678",
    "linkedin": "https://linkedin.com/in/johnsmith",

    "relationship": "Strong",
    "disc_profile": "DC",

    "meeting_history": [
      {
        "date": "2024-09-15",
        "notes": "Discussed potential pipeline deals",
        "next_follow_up": "2024-10-15"
      }
    ],

    "contact_notes": "Prefers email communication, interested in UK transport",
    "last_contact_date": "2024-09-15",
    "next_contact_reminder": "2024-10-15",

    "created_at": "2024-01-15",
    "last_updated": "2024-09-15"
  }
]
```

**Key Fields**:
- `id`: Unique contact identifier
- `team_id`: Links to team
- `capital_partner_id`: Links to capital partner (for quick lookup)
- Contact details: name, role, email, phone, linkedin
- `relationship`: Personal relationship strength
- `disc_profile`: DISC personality type
- `meeting_history`: Array of meeting records
- `contact_notes`: Personal notes
- Contact reminders and tracking

## Migration Strategy

### Phase 1: Data Migration from Current Structure

**Current `institutions.json`** contains rows like:
```json
{
  "Capital Partner": "Scottish Widows",
  "Type": "Pension Fund",
  "Country": "UK",
  "Relationship": "Strong",
  "Investment Grade": "Y",
  ...all preferences...
}
```

**Migration Script** (`scripts/migrate_to_new_structure.py`):
1. Read current `institutions.json`
2. For each institution:
   - Create a Capital Partner entry
   - Create a default "Main Team" entry with all preferences
   - Set default investment min/max (can be edited later)
3. Read current `contacts.json` (currently empty)
4. Generate new files preserving all data
5. Create backups of original files

### Phase 2: Backend API Updates

**New Endpoints**:

```python
# Capital Partners
GET  /api/capital-partners              # List all capital partners
GET  /api/capital-partners/<id>         # Get specific partner
POST /api/capital-partners              # Create new partner
PUT  /api/capital-partners/<id>         # Update partner
DELETE /api/capital-partners/<id>       # Delete partner (cascade to teams/contacts)

# Teams
GET  /api/teams                         # List all teams
GET  /api/teams?capital_partner_id=X    # Filter by partner
GET  /api/teams/<id>                    # Get specific team
POST /api/teams                         # Create new team
PUT  /api/teams/<id>                    # Update team (including preferences)
DELETE /api/teams/<id>                  # Delete team (cascade to contacts)

# Contacts
GET  /api/contacts                      # List all contacts
GET  /api/contacts?team_id=X            # Filter by team
GET  /api/contacts?capital_partner_id=X # Filter by partner
GET  /api/contacts/<id>                 # Get specific contact
POST /api/contacts                      # Create new contact
PUT  /api/contacts/<id>                 # Update contact
DELETE /api/contacts/<id>               # Delete contact

# Meeting Notes (Special endpoint for quick updates during meetings)
POST /api/meeting-notes                 # Save meeting notes + update contact/team
PUT  /api/meeting-notes/<contact_id>    # Update during meeting

# Legacy compatibility (optional - for backward compatibility)
GET  /api/institutions                  # Maps to capital-partners + teams flattened
```

**Data Relationships in API**:
- Deleting a capital partner cascades to all teams and contacts
- Deleting a team cascades to all contacts in that team
- Validation ensures team references valid capital partner
- Validation ensures contact references valid team

### Phase 3: Frontend Restructure

**New Liquidity Subfolder Structure**:

```
/liquidity                          # Landing page with reminders
  /capital-partners                 # List all organizations
  /capital-partners/new             # Add new organization
  /capital-partners/:id             # View organization details
  /capital-partners/:id/edit        # Edit organization

  /teams                            # List all teams
  /teams/new                        # Add new team
  /teams/:id                        # View team details + preferences
  /teams/:id/edit                   # Edit team preferences

  /contacts                         # List all contacts (grouped by partner > team)
  /contacts/new                     # Add new contact
  /contacts/:id                     # View contact details
  /contacts/:id/edit                # Edit contact

  /meeting-notes                    # NEW: Quick meeting interface
  /meeting-notes/:contact_id        # NEW: Active meeting editor

  /saved-filters                    # Existing: saved filter strategies
```

**Key New Page: Meeting Notes**

**Route**: `/liquidity/meeting-notes/:contact_id`

**Purpose**: During a meeting, quickly edit:
1. Contact personal details
2. Contact meeting notes (add to history)
3. Team investment preferences
4. Team min/max investment amounts
5. Schedule next follow-up

**UI Design**:
```
┌─────────────────────────────────────────────────────────┐
│ Meeting with: John Smith (Scottish Widows)             │
│ Team: Infrastructure Debt Team                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ CONTACT INFORMATION                                     │
│ ┌─────────────────────────────────────────────┐        │
│ │ Name:  [John Smith                         ]│        │
│ │ Role:  [Head of Infrastructure Debt        ]│        │
│ │ Email: [john.smith@scottishwidows.com      ]│        │
│ │ Phone: [+44 20 1234 5678                   ]│        │
│ └─────────────────────────────────────────────┘        │
│                                                         │
│ TEAM INVESTMENT PARAMETERS                              │
│ ┌─────────────────────────────────────────────┐        │
│ │ Minimum Investment: [$ 50,000,000          ]│        │
│ │ Maximum Investment: [$ 500,000,000         ]│        │
│ │ Office Location:    [London                ]│        │
│ └─────────────────────────────────────────────┘        │
│                                                         │
│ TEAM PREFERENCES (Grid with Y/N toggles)                │
│ ┌─────────────────────────────────────────────┐        │
│ │ Investment Grade    [Y]  High Yield      [N]│        │
│ │ Infra Debt         [Y]  Senior Secured  [Y]│        │
│ │ ... (all preferences in collapsible grid)   │        │
│ └─────────────────────────────────────────────┘        │
│                                                         │
│ MEETING NOTES                                           │
│ ┌─────────────────────────────────────────────┐        │
│ │ [Text area for today's meeting notes       ]│        │
│ │                                              │        │
│ │                                              │        │
│ └─────────────────────────────────────────────┘        │
│                                                         │
│ Next Follow-Up: [📅 2024-10-15]                         │
│                                                         │
│ [Save Meeting Notes]  [Cancel]                         │
└─────────────────────────────────────────────────────────┘
```

**Liquidity Landing Page Updates**:

Add "Meeting Notes" section showing:
- Upcoming reminders (contacts to follow up with)
- Recent meetings
- Quick "Start Meeting" button that selects contact

## Implementation Phases

### Phase 1: Backend & Data Migration (Week 1)
1. Create migration script
2. Add new API endpoints
3. Test with migrated data
4. Keep legacy `/api/institutions` endpoint for compatibility

### Phase 2: Capital Partners & Teams UI (Week 2)
1. Create CapitalPartnersList, CapitalPartnerForm
2. Create TeamsList, TeamForm
3. Update DamnEffectStrategyEdit to use new structure
4. Test CRUD operations

### Phase 3: Contacts Restructure (Week 3)
1. Update ContactsUnifiedPage to show team hierarchy
2. Update ContactForm to select team (not just partner)
3. Add team context to contact display

### Phase 4: Meeting Notes Feature (Week 4)
1. Create MeetingNotesPage component
2. Implement combined contact + team editing
3. Add meeting history tracking
4. Update LiquidityPage with reminders

### Phase 5: Testing & Refinement (Week 5)
1. End-to-end testing
2. Data validation
3. UI/UX refinement
4. Documentation updates

## Benefits of New Structure

1. **Flexibility**: Different teams in same organization can have different mandates
2. **Scalability**: Easy to add multiple teams per organization
3. **Accuracy**: Better reflects real-world organizational structure
4. **Meeting Efficiency**: Quick editing during meetings with all relevant data
5. **Better Tracking**: Meeting history and reminders per contact
6. **Investment Clarity**: Min/max per team, not per organization
7. **Geographic Awareness**: Track which office/location each team operates from

## Data Preservation

- All existing capital partner data preserved
- All existing preference data preserved
- Default team created for each partner
- Easy to split teams later as needed
- Migration is reversible (backups maintained)

## File Structure

```
data/
  json/
    capital_partners.json       # Organizations
    teams.json                  # Teams/divisions
    contacts.json              # Individuals
    filters.json               # Saved filter strategies

    # Backups (created during migration)
    institutions.json.backup    # Original institutions data
    contacts.json.backup        # Original contacts data
```

## Next Steps

1. Review and approve this architecture
2. Run migration script on copy of data
3. Implement backend API changes
4. Build new frontend components
5. Test with real data
6. Deploy and train users

---

**Questions to Consider:**
1. Should we track multiple offices per team?
2. Do we need approval workflows for large edits?
3. Should meeting notes be encrypted/secure?
4. Do we want version history for team preferences?
5. Should we add deal tracking linked to contacts?
