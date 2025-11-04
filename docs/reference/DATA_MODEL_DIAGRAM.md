# Liquidity Data Model - Entity Relationship Diagram

## Current Structure (Flat)

```
┌──────────────────────────────────────────┐
│         institutions.json                │
│  (Capital Partners + Preferences)        │
│                                          │
│  - Capital Partner: "Scottish Widows"   │
│  - Type: "Pension Fund"                 │
│  - Country: "UK"                        │
│  - Investment Grade: "Y"                │
│  - High Yield: "N"                      │
│  - ... (all preferences)                │
└──────────────────────────────────────────┘
         ⚠️ No relationship ⚠️
┌──────────────────────────────────────────┐
│           contacts.json                  │
│                                          │
│  - Capital Partner: "Scottish Widows"   │
│  - Name: "John Smith"                   │
│  - Role: "Head of Debt"                 │
│  - Email: "john@sw.com"                 │
└──────────────────────────────────────────┘

Problems:
❌ One set of preferences per organization
❌ Can't handle multiple teams with different mandates
❌ No investment size ranges
❌ No team/office location tracking
```

## New Structure (Hierarchical)

```
┌─────────────────────────────────────────────────────────────┐
│              CAPITAL PARTNER (Organization)                 │
│                capital_partners.json                        │
├─────────────────────────────────────────────────────────────┤
│  id:           "cp_001"                                     │
│  name:         "Scottish Widows"                            │
│  type:         "Pension Fund"                               │
│  country:      "UK"                                         │
│  headquarters: "Edinburgh"                                   │
│  relationship: "Strong"                                     │
│  notes:        "Primary UK pension partner"                 │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ has many
                        ▼
        ┌───────────────────────────────────────┐
        │        TEAM (Business Unit)           │
        │          teams.json                   │
        ├───────────────────────────────────────┤
        │  id:                "team_001"        │
        │  capital_partner_id: "cp_001"         │
        │  team_name:         "Infra Debt Team" │
        │  office_location:   "London"          │
        │  investment_min:    50000000          │
        │  investment_max:    500000000         │
        │  currency:          "USD"             │
        │                                       │
        │  preferences: {                       │
        │    investment_grade: "Y"              │
        │    high_yield:      "N"               │
        │    infra_debt:      "Y"               │
        │    emerging_markets: "N"              │
        │    ... (all investment preferences)   │
        │  }                                    │
        └───────────────────────────────────────┘
                        │
                        │ has many
                        ▼
        ┌───────────────────────────────────────┐
        │         CONTACT (Person)              │
        │          contacts.json                │
        ├───────────────────────────────────────┤
        │  id:                "contact_001"     │
        │  team_id:           "team_001"        │
        │  capital_partner_id: "cp_001"         │
        │                                       │
        │  name:      "John Smith"              │
        │  role:      "Head of Infra Debt"      │
        │  email:     "john.smith@sw.com"       │
        │  phone:     "+44 20 1234 5678"        │
        │  linkedin:  "linkedin.com/in/..."     │
        │                                       │
        │  relationship:  "Strong"              │
        │  disc_profile:  "DC"                  │
        │                                       │
        │  meeting_history: [                   │
        │    {                                  │
        │      date: "2024-09-15",              │
        │      notes: "...",                    │
        │      next_follow_up: "2024-10-15"     │
        │    }                                  │
        │  ]                                    │
        │                                       │
        │  next_contact_reminder: "2024-10-15"  │
        └───────────────────────────────────────┘
```

## Real-World Example: Multiple Teams

```
┌──────────────────────────────────────────────────────────┐
│  CAPITAL PARTNER: Scottish Widows (cp_001)               │
│  Type: Pension Fund | Country: UK | HQ: Edinburgh        │
└──────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
┌──────────────────────┐  ┌──────────────────────┐
│ TEAM: Infra Debt     │  │ TEAM: Emerging Mkts  │
│ (team_001)           │  │ (team_002)           │
├──────────────────────┤  ├──────────────────────┤
│ Office: London       │  │ Office: Singapore    │
│ Min: $50M            │  │ Min: $25M            │
│ Max: $500M           │  │ Max: $200M           │
│                      │  │                      │
│ Preferences:         │  │ Preferences:         │
│ • Investment Grade ✓ │  │ • Investment Grade ✓ │
│ • High Yield ✗       │  │ • High Yield ✓       │
│ • Emerging Mkts ✗    │  │ • Emerging Mkts ✓    │
│ • Asia EM ✗          │  │ • Asia EM ✓          │
│ • US Market ✓        │  │ • US Market ✗        │
└──────────────────────┘  └──────────────────────┘
        │                         │
   ┌────┴────┐              ┌─────┴─────┐
   ▼         ▼              ▼           ▼
┌────────┐ ┌────────┐  ┌────────┐  ┌────────┐
│ John   │ │ Sarah  │  │ Michael│  │ Lisa   │
│ Smith  │ │ Jones  │  │ Chen   │  │ Brown  │
├────────┤ ├────────┤  ├────────┤  ├────────┤
│ Head   │ │ Analyst│  │ Head   │  │ VP     │
│ Infra  │ │        │  │ EM Team│  │ Asia   │
└────────┘ └────────┘  └────────┘  └────────┘
```

## Data Flow During Meeting

```
                    ┌──────────────────────┐
                    │   MEETING NOTES      │
                    │       PAGE           │
                    └──────────────────────┘
                              │
                    User selects contact
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │  Load contact_001 data                 │
        │  ├─ Contact: John Smith               │
        │  ├─ Team: team_001 (Infra Debt)       │
        │  └─ Capital Partner: cp_001 (SW)      │
        └────────────────────────────────────────┘
                              │
                    User makes edits
                              │
        ┌─────────────────────┴─────────────────┐
        │                                        │
        ▼                                        ▼
┌──────────────────┐              ┌──────────────────────┐
│ Update Contact   │              │ Update Team          │
│ contacts.json    │              │ teams.json           │
├──────────────────┤              ├──────────────────────┤
│ • Name           │              │ • Investment min/max │
│ • Email          │              │ • Office location    │
│ • Phone          │              │ • Preferences grid   │
│ • Meeting notes  │              │ • Team notes         │
│ • Next follow-up │              │                      │
└──────────────────┘              └──────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  Save both updates in  │
        │  single API call       │
        │  /api/meeting-notes    │
        └────────────────────────┘
```

## API Endpoint Relationships

```
Capital Partners
├─ GET    /api/capital-partners
├─ GET    /api/capital-partners/:id
├─ POST   /api/capital-partners
├─ PUT    /api/capital-partners/:id
└─ DELETE /api/capital-partners/:id  ← Cascade deletes teams + contacts

Teams
├─ GET    /api/teams
├─ GET    /api/teams?capital_partner_id=:id
├─ GET    /api/teams/:id
├─ POST   /api/teams
├─ PUT    /api/teams/:id
└─ DELETE /api/teams/:id  ← Cascade deletes contacts

Contacts
├─ GET    /api/contacts
├─ GET    /api/contacts?team_id=:id
├─ GET    /api/contacts?capital_partner_id=:id
├─ GET    /api/contacts/:id
├─ POST   /api/contacts
├─ PUT    /api/contacts/:id
└─ DELETE /api/contacts/:id

Meeting Notes (Special Combined Update)
├─ POST   /api/meeting-notes
│         Body: { contact_updates: {...}, team_updates: {...} }
│         → Updates both contact and team in single transaction
│
└─ GET    /api/meeting-notes/reminders
          → Returns contacts with upcoming follow-ups
```

## Frontend Page Structure

```
/liquidity (Landing Page)
│
├─ 📊 Dashboard
│  ├─ Contact Reminders (upcoming follow-ups)
│  ├─ Recent Meetings
│  └─ Quick Stats
│
├─ 🏢 Capital Partners
│  ├─ /capital-partners (List all orgs)
│  ├─ /capital-partners/new (Add new org)
│  ├─ /capital-partners/:id (View org details)
│  └─ /capital-partners/:id/edit (Edit org)
│
├─ 👥 Teams
│  ├─ /teams (List all teams, grouped by partner)
│  ├─ /teams/new (Add new team)
│  ├─ /teams/:id (View team + preferences + contacts)
│  └─ /teams/:id/edit (Edit team preferences)
│
├─ 📇 Contacts
│  ├─ /contacts (List all contacts, grouped by partner > team)
│  ├─ /contacts/new (Add new contact)
│  ├─ /contacts/:id (View contact details + history)
│  └─ /contacts/:id/edit (Edit contact)
│
├─ 📝 Meeting Notes (NEW!)
│  ├─ /meeting-notes (Select contact to start meeting)
│  └─ /meeting-notes/:contact_id (Active meeting editor)
│     ├─ Edit contact details
│     ├─ Edit team investment parameters
│     ├─ Edit team preferences
│     ├─ Add meeting notes
│     └─ Set next follow-up
│
└─ 🔍 Saved Filters
   └─ /saved-filters (Existing filter strategies)
```

## Migration Path: Before & After

### BEFORE (Current institutions.json)
```json
{
  "Capital Partner": "Scottish Widows",
  "Type": "Pension Fund",
  "Country": "UK",
  "Investment Grade": "Y",
  "High Yield": "N",
  "Infra Debt": "Y"
}
```

### AFTER (New Structure)

**capital_partners.json**
```json
{
  "id": "cp_001",
  "name": "Scottish Widows",
  "type": "Pension Fund",
  "country": "UK"
}
```

**teams.json**
```json
{
  "id": "team_001",
  "capital_partner_id": "cp_001",
  "team_name": "Main Team",
  "office_location": "Edinburgh",
  "investment_min": 0,
  "investment_max": 999999999,
  "preferences": {
    "investment_grade": "Y",
    "high_yield": "N",
    "infra_debt": "Y"
  }
}
```

**contacts.json**
```json
{
  "id": "contact_001",
  "team_id": "team_001",
  "capital_partner_id": "cp_001",
  "name": "",
  "email": "",
  "role": ""
}
```

✅ **All data preserved**
✅ **Can now add multiple teams**
✅ **Ready for contacts to be added**
