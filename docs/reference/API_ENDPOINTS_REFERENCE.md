# Liquidity API Endpoints - Quick Reference

## Base URL
```
http://127.0.0.1:5000
```

---

## Capital Partners

### List All Partners
```http
GET /api/capital-partners
```
**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 106
}
```

### Get Specific Partner
```http
GET /api/capital-partners/cp_001
```

### Create Partner
```http
POST /api/capital-partners
Content-Type: application/json

{
  "name": "Example Fund",
  "type": "Pension Fund",
  "country": "US",
  "headquarters_location": "New York",
  "relationship": "Strong",
  "notes": "Optional notes"
}
```

### Update Partner
```http
PUT /api/capital-partners/cp_001
Content-Type: application/json

{
  "name": "Updated Name",
  "relationship": "Medium"
}
```

### Delete Partner (Cascades!)
```http
DELETE /api/capital-partners/cp_001
```
⚠️ **Warning**: Deletes all teams and contacts under this partner!

---

## Teams

### List All Teams
```http
GET /api/teams
```

### List Teams for Specific Partner
```http
GET /api/teams?capital_partner_id=cp_001
```

### Get Specific Team
```http
GET /api/teams/team_001
```

### Create Team
```http
POST /api/teams
Content-Type: application/json

{
  "capital_partner_id": "cp_001",
  "team_name": "Emerging Markets Team",
  "office_location": "Singapore",
  "investment_min": 25000000,
  "investment_max": 200000000,
  "preferences": {
    "investment_grade": "Y",
    "high_yield": "Y",
    "emerging_markets": "Y",
    "asia_em": "Y"
  },
  "team_notes": "Focus on Southeast Asia"
}
```

### Update Team
```http
PUT /api/teams/team_001
Content-Type: application/json

{
  "investment_max": 300000000,
  "preferences": {
    "mongolia": "Y"
  }
}
```

### Delete Team (Cascades!)
```http
DELETE /api/teams/team_001
```
⚠️ **Warning**: Deletes all contacts under this team!

---

## Contacts

### List All Contacts
```http
GET /api/contacts-new
```

### List Contacts for Specific Team
```http
GET /api/contacts-new?team_id=team_001
```

### List Contacts for Specific Partner
```http
GET /api/contacts-new?capital_partner_id=cp_001
```

### Get Specific Contact
```http
GET /api/contacts-new/contact_001
```

### Create Contact
```http
POST /api/contacts-new
Content-Type: application/json

{
  "team_id": "team_001",
  "name": "John Smith",
  "role": "Head of Infrastructure Debt",
  "email": "john.smith@example.com",
  "phone": "+44 20 1234 5678",
  "linkedin": "https://linkedin.com/in/johnsmith",
  "relationship": "Strong",
  "disc_profile": "DC",
  "contact_notes": "Prefers email communication"
}
```

### Update Contact
```http
PUT /api/contacts-new/contact_001
Content-Type: application/json

{
  "phone": "+44 20 9876 5432",
  "relationship": "Very Strong"
}
```

### Delete Contact
```http
DELETE /api/contacts-new/contact_001
```

---

## Meeting Notes (Special Combined Endpoint)

### Save Meeting Notes
**Updates both contact AND team in single transaction**

```http
POST /api/meeting-notes
Content-Type: application/json

{
  "contact_id": "contact_001",
  "contact_updates": {
    "phone": "+44 20 1234 5678",
    "email": "john.new@example.com"
  },
  "team_updates": {
    "investment_max": 600000000,
    "preferences": {
      "mongolia": "Y"
    }
  },
  "meeting_note": {
    "notes": "Discussed potential pipeline deals in Mongolia. Team mandate increased.",
    "participants": "John Smith, Sarah Jones, Michael Chen",
    "next_follow_up": "2024-10-15"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting notes saved successfully",
  "contact_updated": true,
  "team_updated": true,
  "contact": {...updated contact data...}
}
```

### Get Meeting Reminders
**Returns contacts with follow-ups in next 7 days**

```http
GET /api/meeting-notes/reminders
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contact": {...contact object...},
      "reminder_date": "2024-10-15",
      "days_until": 2,
      "overdue": false
    },
    {
      "contact": {...contact object...},
      "reminder_date": "2024-10-10",
      "days_until": -3,
      "overdue": true
    }
  ],
  "count": 2
}
```

---

## Filters (Existing)

### Get Saved Filters
```http
GET /api/filters
```

### Save Filters
```http
POST /api/filters/save
Content-Type: application/json

[
  {
    "id": "filter_001",
    "name": "Investment Grade Infrastructure",
    "filters": {...filter config...},
    "createdAt": "2024-10-01T12:00:00"
  }
]
```

---

## Legacy Endpoints (Backward Compatibility)

### Get Institutions (Old Format)
```http
GET /api/institutions
```
Returns flat structure for backward compatibility with existing pages.

### Save Institutions (Old Format)
```http
POST /api/institutions/save
```

### Get Contacts (Old Format)
```http
GET /api/contacts
```

### Save Contacts (Old Format)
```http
POST /api/contacts/save
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## Testing with cURL

### Create a new team and contact workflow:

```bash
# 1. Create a new team
curl -X POST http://127.0.0.1:5000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "capital_partner_id": "cp_001",
    "team_name": "Asia Infrastructure Team",
    "office_location": "Hong Kong",
    "investment_min": 50000000,
    "investment_max": 500000000,
    "preferences": {
      "asia_em": "Y",
      "infra_debt": "Y"
    }
  }'

# 2. Create a contact in that team
curl -X POST http://127.0.0.1:5000/api/contacts-new \
  -H "Content-Type: application/json" \
  -d '{
    "team_id": "team_107",
    "name": "Jane Doe",
    "role": "Senior Investment Manager",
    "email": "jane.doe@example.com",
    "relationship": "Medium"
  }'

# 3. Save meeting notes
curl -X POST http://127.0.0.1:5000/api/meeting-notes \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "contact_001",
    "meeting_note": {
      "notes": "Initial introductory call",
      "participants": "Jane Doe, Me",
      "next_follow_up": "2024-11-01"
    }
  }'

# 4. Check reminders
curl http://127.0.0.1:5000/api/meeting-notes/reminders
```

---

## Notes

- All POST/PUT endpoints create automatic backups (`.json.bak` files)
- Cascade deletes are automatic (Partner → Teams → Contacts)
- All dates use ISO 8601 format
- Currency is always USD
- Investment amounts are in USD cents or full dollars (be consistent)
- Preference values are "Y" or "N" strings

---

**Last Updated**: October 1, 2025
**API Version**: 1.0
