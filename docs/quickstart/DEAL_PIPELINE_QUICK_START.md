# Deal Pipeline - Quick Start Guide

## 🎯 What You Built

Transformed the Strategies section from passive filtering into an **active deal origination engine** that:
- Automatically generates prioritized deals by matching sponsors with capital partners
- Scores each deal 0-100 based on 4 factors (preference overlap, ticket fit, relationship, match count)
- Provides a full pipeline workflow from identification → closing
- Includes detailed views of sponsors, matched partners, and market context

---

## 🚀 How to Use It

### Step 1: Start the Backend API

```bash
cd api
python excel_api.py
```

The server runs on `http://127.0.0.1:5000`

**New Endpoints Available:**
- `POST /api/deals/generate` - Generate deals from filters
- `GET /api/deals/pipeline` - Get all deals + stats
- `GET /api/deals/<id>` - Get specific deal
- `PUT /api/deals/<id>/stage` - Update deal stage
- `POST /api/deals/<id>/action` - Log action
- `GET /api/deals/recommendations` - Top 10 priority deals

### Step 2: Start the Frontend

```bash
cd web
npm run dev
```

Dev server runs on `http://localhost:5173`

### Step 3: Navigate to New Pages

**New Routes:**
- `/strategies/pipeline` - Main deal pipeline workspace
- `/strategies/filters` - Create/manage investment strategies
- `/strategies/deals/:dealId` - Detailed deal view

**Navigation:**
- Top header → "Strategies" dropdown
  - **Deal Pipeline** → View all active deals
  - **Create Strategy** → Build filters and generate deals

---

## 📋 Complete Workflow Example

### 1. Create an Investment Strategy

1. Navigate to **Strategies → Create Strategy**
2. Click **"+ Create New Strategy"**
3. Enter name: `"Emerging Asia Energy"`
4. Set filters:
   - Energy Infra: **Y**
   - Emerging Markets: **Y**
   - Asia EM: **Y**
   - Min Investment: **50** (million USD)
   - Max Investment: **200** (million USD)
5. Click **"Save Strategy"**

### 2. Generate Deals

1. Select the "Emerging Asia Energy" strategy from the list
2. Scroll to **"Unified CRM Matches"** section
3. Review the sponsor overlaps shown
4. Click **"🚀 Generate Deals from This Strategy"** button
5. System creates deals for matching sponsors
6. Confirm popup: `"Successfully generated 8 new deal(s)! Would you like to view the pipeline?"`
7. Click **"OK"** to navigate to pipeline

### 3. View the Deal Pipeline

**Pipeline Page displays:**
- **KPI Dashboard:**
  - Active Deals: 12
  - Total Volume: $1,200M
  - In Diligence: 4
  - Closed This Month: 2

- **Deal Cards** (sorted by priority score):
  ```
  ┌─────────────────────────────────────┐
  │ 🟢 HIGH PRIORITY                    │
  │ Vietnam Solar Project               │
  │ Score: 88/100                       │
  │ ─────────────────────────────────── │
  │ Ticket: $75M - $100M                │
  │ Deadline: 45 days remaining         │
  │ 🎯 3 Matched Capital Sources        │
  │ ─────────────────────────────────── │
  │ Overlap: Energy, Emerging, Vietnam  │
  │ [📊 View Details] [📧 Introduce]    │
  └─────────────────────────────────────┘
  ```

### 4. Work a Deal

1. Click **"📊 View Details"** on the top-scoring deal
2. **Deal Detail Page shows:**
   - Sponsor information (country, headquarters, financing need)
   - 8 shared investment preferences (overlap drivers)
   - 3 matched capital partners with relationship info
   - 2 matched investment teams with ticket ranges
   - Overlap percentage bars for each team

3. **Take Actions:**
   - Click **"📝 Add Note"** → Enter deal progress update
   - Click **"📧 Draft Intro"** on a partner card (Phase 2)
   - Click **"📅 Schedule"** on a team card (Phase 2)

4. **Move Deal Forward:**
   - Scroll to **"Actions & Stage Management"**
   - Click **"Introduced"** button
   - Deal stage updates from `identified` → `introduced`
   - Action logged in Activity Log

5. **Return to Pipeline:**
   - Click breadcrumb **"Deal Pipeline"** at top
   - See deal now appears in "Introduced" column (if Kanban view)
   - Or shows "Introduced" badge (if Cards view)

### 5. Manage Pipeline

**Filter & Sort:**
- Search: `"vietnam"` → shows only Vietnam-related deals
- Stage filter: **"In Diligence"** → shows only DD-stage deals
- Sort by: **"Deadline"** → prioritize urgent deals

**View Modes:**
- **Cards View** (default): Rich deal cards with all info
- **Kanban View**: 4 columns (Identified, Introduced, In Diligence, Term Sheet)

**Stage Progression:**
1. `Identified` → Initial match
2. `Introduced` → Parties connected
3. `In Diligence` → DD underway
4. `Term Sheet` → Negotiating terms
5. `Closed` → Deal completed ✅
6. `Dead` → Deal abandoned ❌

---

## 🎯 Priority Scoring Logic

Each deal scored 0-100 based on:

### 1. Preference Overlap (40 points max)
- Each shared preference = 4 points
- Example: 8 shared preferences = 32 points

**Preferences considered:**
- `transport_infra`, `energy_infra`
- `us_market`, `emerging_markets`
- `asia_em`, `africa_em`, `emea_em`
- `vietnam`, `mongolia`, `turkey`

### 2. Ticket Fit (30 points max)
- Perfect fit (sponsor midpoint within partner range) = 30 points
- Partial fit = scaled down by distance
- Example: Sponsor needs $87.5M, Partner offers $50M-$150M = 30 points

### 3. Relationship Strength (20 points max)
- Strong relationship with any matched entity = 20 points
- Medium = 10 points
- Weak = 5 points

### 4. Match Count (10 points max)
- Each matched entity (partner or team) = 2 points
- Example: 3 matched entities = 6 points

**Result:**
- **80-100**: 🟢 High Priority (green border, "HIGH PRIORITY" badge)
- **60-79**: 🟡 Medium Priority (yellow border)
- **40-59**: 🟠 Low Priority (orange border)
- **0-39**: 🔴 Very Low Priority (red border)

---

## 📊 Data Files

### New File Created:
`data/json/deal_pipeline.json`

**Structure:**
```json
[
  {
    "deal_id": "deal_1728000000000",
    "sponsor_id": "corp_123",
    "sponsor_name": "Vietnam Solar Project",
    "sponsor_ticket_min": 75000000,
    "sponsor_ticket_max": 100000000,
    "matched_partners": ["cp_001", "cp_005"],
    "matched_teams": ["team_003"],
    "priority_score": 88,
    "stage": "identified",
    "created_at": "2025-10-03T12:00:00Z",
    "deadline": "2025-11-15",
    "notes": "",
    "overlap_preferences": [
      "energy_infra",
      "emerging_markets",
      "asia_em",
      "vietnam"
    ],
    "overlap_count": 4,
    "actions": [],
    "metadata": {
      "sponsor_country": "Vietnam",
      "sponsor_headquarters": "Ho Chi Minh City",
      "match_count": 3
    }
  }
]
```

**Backup:**
- Automatic `.bak` file created on every save
- Located at: `data/json/deal_pipeline.json.bak`

---

## 🔧 Troubleshooting

### Issue: "No deals generated"
**Cause:** All matching sponsors already have deals in pipeline
**Solution:**
- Check existing deals in `/strategies/pipeline`
- Try different filter criteria
- Add new sponsors via `/sponsors/corporates`

### Issue: "Failed to connect to API"
**Cause:** Backend server not running
**Solution:**
```bash
cd api
python excel_api.py
```

### Issue: Deal cards don't show matched partners
**Cause:** Capital partners or teams missing in database
**Solution:**
- Verify data exists: `/liquidity/capital-partners`
- Check team assignments: `/liquidity/teams`

### Issue: Priority scores seem low
**Cause:** Weak overlap or mismatched ticket sizes
**Solution:**
- Review sponsor investment needs
- Update capital partner preferences
- Broaden strategy filters

### Issue: Can't move deal to next stage
**Cause:** API error or network issue
**Solution:**
- Check browser console for errors
- Verify API server running
- Check `deal_pipeline.json` file permissions

---

## 🎨 UI Components Reference

### DealCard Props
```typescript
interface DealCardProps {
  deal: Deal;
  onStageChange?: (dealId: string, newStage: string) => void;
  showActions?: boolean;
}
```

**Features:**
- Auto color-codes by priority
- Shows days until deadline with urgency colors
- Truncates overlap drivers to 6 badges (+X more)
- Conditional action buttons based on current stage

### DealPipelinePage Features
- KPI dashboard auto-updates on stage changes
- Search filters by sponsor name, country, or preference
- Stage filter dropdown (All / Identified / Introduced / etc.)
- Sort by priority, created date, or deadline
- Toggle between Cards and Kanban views
- Empty state with CTA when no deals exist

### DealDetailPage Features
- Breadcrumb navigation
- Sponsor details with link to full profile
- Overlap drivers displayed as badges
- Matched partners list with "Draft Intro" buttons (Phase 2)
- Matched teams with overlap percentage bars
- Stage management buttons (move to any stage)
- Activity log showing all actions chronologically
- Add notes modal with save functionality

---

## 📈 Key Metrics to Track

Monitor these stats on the pipeline page:

1. **Active Deals**: Total non-closed/dead deals
2. **Total Volume**: Sum of max tickets (in millions)
3. **In Diligence**: Deals requiring active work
4. **Closed This Month**: Recent successes

**Conversion Funnel:**
- Identified → Introduced: Should be >50%
- Introduced → In Diligence: Should be >30%
- In Diligence → Term Sheet: Should be >60%
- Term Sheet → Closed: Should be >70%

**Time Tracking:**
- Average days in "Identified": Target <7 days
- Average days in "In Diligence": Target <30 days
- Total time to close: Target <90 days

---

## 🚧 Phase 2 Features (Coming Soon)

Currently placeholders with alerts:

1. **AI Email Drafting**: Auto-generate intro emails
2. **Meeting Scheduling**: Calendar integration
3. **PDF Deal Memos**: Export deal summary as PDF
4. **Kanban Drag-Drop**: Move deals between stages visually
5. **Market Context Widgets**: Show sovereign yields, FX rates
6. **Analytics Dashboard**: Pipeline velocity, conversion metrics
7. **Watch Strategies**: Auto-alert on new matching sponsors
8. **Reverse Matching**: Show "Capital seeking deals" view

---

## 💡 Best Practices

### Creating Strategies
- ✅ **DO**: Use 3-5 key preferences for focus
- ✅ **DO**: Set realistic ticket ranges (±50% of typical deal)
- ✅ **DO**: Name strategies descriptively ("Vietnam Infrastructure" not "Strategy 1")
- ❌ **DON'T**: Use too many filters (reduces matches)
- ❌ **DON'T**: Set ticket ranges that don't overlap with partners

### Working Deals
- ✅ **DO**: Add notes after every action
- ✅ **DO**: Update stage as soon as progress happens
- ✅ **DO**: Set deadlines for time-sensitive deals
- ✅ **DO**: Focus on high-priority deals (80+ score) first
- ❌ **DON'T**: Let deals sit in "Identified" >7 days
- ❌ **DON'T**: Skip stages (follow the workflow)

### Pipeline Management
- ✅ **DO**: Review pipeline daily
- ✅ **DO**: Use Kanban view to spot bottlenecks
- ✅ **DO**: Mark dead deals promptly (don't clutter pipeline)
- ✅ **DO**: Track time in each stage
- ❌ **DON'T**: Let "In Diligence" accumulate >10 deals
- ❌ **DON'T**: Ignore deals past deadline

---

## 🎯 Success Criteria

You'll know it's working when:

✅ New sponsor added → Deal auto-generated within minutes
✅ Pipeline shows 10+ active deals with 60+ avg priority
✅ Deals move through stages weekly
✅ Clear differentiation between high/low priority
✅ Team can see full context (sponsor + partners + overlaps) in one click
✅ Actions are logged and auditable
✅ Time to first intro <7 days
✅ Conversion rate (identified → closed) >15%

---

## 📞 Support

**Issues or Questions?**
- Check `docs/deal_pipeline_implementation.md` for technical details
- Review API logs in terminal where `python excel_api.py` is running
- Inspect browser console for frontend errors
- Verify data files exist in `data/json/` directory

**Quick Checks:**
```bash
# Verify backend running
curl http://127.0.0.1:5000/api/deals/pipeline

# Check deal file exists
ls data/json/deal_pipeline.json

# Verify deals generated
cat data/json/deal_pipeline.json | grep "deal_id"
```

---

## 🎉 You're Ready!

Your Deal Origination Engine is fully operational. Go generate some deals!

**Quick Start Checklist:**
- [ ] Backend API running (`python excel_api.py`)
- [ ] Frontend running (`npm run dev`)
- [ ] At least 1 sponsor in database
- [ ] At least 1 capital partner in database
- [ ] Strategy created with filters
- [ ] First deal generated
- [ ] Deal pipeline page viewed
- [ ] Deal detail page viewed
- [ ] Deal stage updated

**Next Actions:**
1. Create 3-5 focused investment strategies
2. Generate deals from each strategy
3. Review top 10 priority deals
4. Take first action on highest-priority deal
5. Track time to first introduction

Welcome to professional deal origination! 🚀
