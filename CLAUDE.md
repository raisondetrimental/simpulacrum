# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

### Essential Development Commands

```bash
# Start development servers (run in separate terminals)
cd backend && python run.py              # Backend API → http://127.0.0.1:5000
cd frontend && npm run dev               # Frontend → http://localhost:5173

# Code quality
cd backend && black src/                 # Format Python code
cd backend && pytest                     # Run backend tests
cd frontend && npm run lint              # Lint TypeScript
cd frontend && npm test                  # Run frontend tests

# Build for production
cd frontend && npm run build             # TypeScript + Vite → dist/
cd backend && gunicorn --bind 0.0.0.0:8000 --timeout 600 src.app:app
```

## Project Overview

**Meridian Universal Dashboard** is a financial intelligence platform for emerging markets infrastructure finance. The system combines market data analysis with a sophisticated CRM for managing relationships across capital partners, sponsors, legal advisors, and transaction agents.

**Key Features:**
- Four-module unified CRM with investment matching engine
- Interactive calendar with drag-and-drop meeting scheduling and editing across all modules
- Market intelligence for 5 emerging markets (Armenia, Mongolia, Türkiye, Uzbekistan, Vietnam)
- Pipeline strategies management with 6-stage workflow and related deals linking
- Deals database (precedent transactions for reference)
- Super admin portal with data quality tools and bulk operations
- Team collaboration via threaded whiteboard system
- Damn Effect Strategy hub with integrated origination workflow

**Tech Stack:**
- Backend: Flask 3.0 + Flask-Login + bcrypt (Python 3.11+)
- Frontend: React 18 + TypeScript 5 + Vite 4.4 + Tailwind CSS
- Data: JSON file-based with automatic backups
- Deployment: Azure App Service (backend) + Azure Static Web Apps (frontend)

## Critical Architecture Patterns

### 1. Unified CRM Data Model (MOST IMPORTANT)

**This is the most important architectural pattern to understand.**

Unlike traditional multi-module systems, ALL CRM data uses a **unified architecture** with just two files:

#### organizations.json - Single Source for ALL Organizations

Contains capital partners, sponsors (corporates), counsel (legal advisors), and agents in ONE file.

**Discriminator Pattern:**
```json
{
  "id": "cp_001",
  "organization_type": "capital_partner",  // Discriminator field
  "name": "Scottish Widows",
  "country": "UK",
  "preferences": { /* investment prefs */ },
  "countries": ["mongolia", "turkiye"],    // Investment target countries
  "starred": false
}
```

**Valid organization_type values:**
- `"capital_partner"` - Liquidity module entities
- `"sponsor"` - Sponsors module entities (corporates)
- `"counsel"` - Counsel module entities (legal advisors)
- `"agent"` - Agents module entities

#### unified_contacts.json - Single Source for ALL Contacts

All contacts across all four CRM modules in ONE file, linked to parent organizations.

```json
{
  "id": "contact_001",
  "organization_id": "cp_001",              // Links to parent in organizations.json
  "organization_type": "capital_partner",   // Matches parent type
  "name": "John Doe",
  "role": "Portfolio Manager",
  "meeting_history": [ /* array of meetings */ ],
  "next_contact_reminder": "2025-02-15"
}
```

#### Unified DAL (Data Access Layer)

**File:** `backend/src/utils/unified_dal.py`

Centralized data access layer that:
- Filters by `organization_type` discriminator
- Maintains backward compatibility with legacy blueprints
- Handles CRUD operations with automatic backups
- Transforms between unified schema and module-specific API formats

**Usage Pattern:**
```python
from ..utils.unified_dal import (
    get_all_organizations,
    get_organization_by_id,
    create_organization,
    update_organization,
    delete_organization
)

# Get all capital partners
partners = get_all_organizations("capital_partner")

# Get single organization
org = get_organization_by_id("cp_001")

# Create new organization
new_org = create_organization({
    "organization_type": "sponsor",
    "name": "Infrastructure Corp",
    # ... other fields
})
```

**Why This Matters:**
- Don't look for separate files like `capital_partners.json` or `corporates.json` - they're obsolete
- All CRM queries filter the unified files by `organization_type`
- Contact lookups require checking `organization_id` and `organization_type`
- Investment matching works across the unified data structure

### 2. Two Countries Systems (OFTEN CONFUSED)

The system has **TWO SEPARATE** countries databases serving different purposes. Mixing them up is a common mistake.

#### System A: Countries Master (Investment Preferences)

**Purpose:** User-selectable investment target countries
**File:** `backend/data/json/countries_master.json`
**Count:** 90+ countries
**Managed By:** Super admin at `/admin/super/countries`
**Usage:** Organizations select via `countries` array field

```json
// countries_master.json
{
  "id": "mongolia",
  "name": "Mongolia",
  "active": true,
  "display_order": 52
}

// In organization record
{
  "id": "cp_001",
  "countries": ["mongolia", "turkiye", "saudi_arabia"]  // Investment targets
}
```

**Key Properties:**
- Dynamic - super admin can add/remove countries without code changes
- Used by investment matching engine to find overlapping interests
- Available in `CountryMultiSelect` component for organization forms
- Exported in CSV reports (list and matrix formats)

#### System B: Country Fundamentals (Market Intelligence)

**Purpose:** Macroeconomic data and market analysis pages
**Files:**
- `backend/data/json/country_fundamentals.json` (basic info)
- `backend/data/json/Country Json/*_complete.json` (comprehensive data)

**Count:** 5 countries (Armenia, Mongolia, Türkiye, Uzbekistan, Vietnam)
**Usage:** Dedicated market pages at `/armenia`, `/mongolia`, etc.

```json
// country_fundamentals.json
{
  "name": "Mongolia",
  "slug": "mongolia",
  "capital": "Ulaanbaatar",
  "region": "Asia",
  "gdp_usd_bn": 15.1
}
```

**Key Properties:**
- Static - requires data files and code changes to add countries
- Contains IMF Article IV data, EBRD/ADB analysis, IMI data
- NOT used for investment matching (separate concern)
- Only 5 countries have full market data

#### How They Interact

**Overlap:** The 5 countries with fundamentals are ALSO in the countries master list
**Independence:** Organizations can select any of 90+ countries as investment preferences, but only 5 have detailed market pages

**Example Flow:**
1. Super admin adds "Pakistan" to countries master → Organizations can now select Pakistan as investment target
2. But Pakistan has NO fundamentals data → No `/pakistan` market page exists
3. Investment matching works fine (uses countries master only)
4. To add Pakistan market page → Need to create fundamentals JSON + complete data file + update code

### 3. Investment Matching Engine

Cross-CRM matching based on three criteria: preference alignment, country overlap, and ticket size fit.

#### Shared Preference Keys (Must Stay Synchronized)

**CRITICAL:** These 7 keys must match exactly across frontend and backend.

**Files to sync:**
- `backend/src/constants/shared.py` - `SHARED_PREFERENCE_KEYS` tuple
- `frontend/src/constants/shared.ts` - `SHARED_PREFERENCE_KEYS` array
- `shared/constants/preferences.md` - Canonical definition

**Validation:** Run `python shared/scripts/validate-sync.py` after changes

```python
SHARED_PREFERENCE_KEYS = (
    "transport_infra",
    "energy_infra",
    "us_market",
    "emerging_markets",
    "asia_em",
    "africa_em",
    "emea_em",
)
```

#### Matching Logic

**Preference Alignment:**
- `"Y"` matches `"Y"` (explicit yes)
- `"any"` matches all values (flexible)
- `"N"` only matches `"N"` or `"any"` (explicit no)

**Country Array Matching:**
```python
# Find overlapping countries
partner_countries = set(partner.get('countries', []))
sponsor_countries = set(sponsor.get('countries', []))
overlap = partner_countries & sponsor_countries
has_match = len(overlap) > 0
```

**Ticket Size Overlap:**
```python
# Investment ranges must overlap
partner_min, partner_max = partner['investment_min'], partner['investment_max']
sponsor_min, sponsor_max = sponsor['investment_min'], sponsor['investment_max']
overlaps = partner_min <= sponsor_max and sponsor_min <= partner_max
```

**Service Files:**
- `backend/src/services/investment_matching.py` - Matching algorithm
- `backend/src/services/investment_profiles.py` - Profile normalization (deprecated, uses DAL now)

**API Endpoint:**
```
POST /api/investment-matches
Body: {
  "preference_filters": { "transport_infra": "Y", "energy_infra": "any" },
  "ticket_range": { "min": 50000000, "max": 500000000 },
  "countries": ["mongolia", "turkiye"]
}
```

### 4. Pipeline Strategies & Deal Origination

**File:** `backend/data/json/pipeline_strategies.json`
**API:** `backend/src/api/pipeline.py`
**Frontend:** `frontend/src/pages/deals/PipelineDetailPage.tsx`

Pipeline strategies track deal opportunities from ideation through to close-ready status.

#### Six-Stage Workflow

Pipelines progress through six stages (British English used throughout UI):

1. **ideation** - Initial concept stage
2. **outreach** - Contacting potential parties
3. **negotiation** - Discussing terms
4. **structuring** - Designing deal structure
5. **documentation** - Preparing legal documents
6. **ready_to_close** - Final stage before execution

**Stage Configuration:**
```typescript
// frontend/src/components/home/PipelineVisualization.tsx
const stageConfig = {
  ideation: { label: 'Ideation', color: '#94a3b8', order: 1 },
  outreach: { label: 'Outreach', color: '#60a5fa', order: 2 },
  negotiation: { label: 'Negotiation', color: '#3b82f6', order: 3 },
  structuring: { label: 'Structuring', color: '#8b5cf6', order: 4 },
  documentation: { label: 'Documentation', color: '#10b981', order: 5 },
  ready_to_close: { label: 'Ready to Close', color: '#059669', order: 6 }
};
```

#### Related Deals Feature

Pipeline strategies can link to precedent transactions from the deals database for reference.

**Data Structure:**
```json
{
  "id": "pipeline_001",
  "name": "Mongolia Infrastructure Project",
  "stage": "negotiation",
  "related_deals": ["deal_001", "deal_002"],  // Array of deal IDs
  "sponsor": { /* sponsor details */ },
  "lenders": [ /* array of lenders */ ],
  "financing_scenarios": [ /* financing options */ ],
  "target_country": "Mongolia",
  "sector": "Transport Infrastructure"
}
```

**Component:** `frontend/src/components/features/pipeline/RelatedDealsSection.tsx`
- Displays linked deals with key information (name, country, sector, size, type)
- Modal interface for searching and adding deals
- Filter by name, number, country, or sector
- Click-through links to full deal details

#### Damn Effect Strategy Hub

**Route:** `/damn-effect-strategy`
**Component:** `frontend/src/pages/deals/DamnEffectStrategyPage.tsx`

Landing page for deal origination workflow, accessible only by clicking "Damn Effect Strategy" in header navigation.

**Three Main Sections:**
1. **Pipeline Strategies** (`/pipeline`) - Define and track opportunities
2. **Strategies Sandbox** (`/investment-strategies`) - Test frameworks and match partners
3. **Deals Database** (`/deals`) - Browse precedent transactions for reference

**Navigation Integration:**
- Header title "Damn Effect Strategy" is clickable → navigates to hub page
- Sidebar "Overview" link → navigates to hub page
- Hub page has three large cards linking to each section

#### Home Page Pipeline Visualisation

**Component:** `frontend/src/components/home/PipelineVisualization.tsx`

Displays pipeline strategies by stage on home page (uses British English "Visualisation").

**Key Features:**
- Horizontal bar chart showing count by stage
- Quick stats: Total Pipelines, Active Pipeline, Ready to Close, Total Value
- Stage breakdown cards with colour-coded borders
- Pipeline health section with key metrics
- Links to `/pipeline` page

**Data Source:**
```typescript
// frontend/src/pages/home/NewHomePage.tsx
// Fetches from /api/pipeline (NOT /api/deals)
const pipelineResponse = await fetch(`${API_BASE_URL}/api/pipeline`);
const pipelineData = await pipelineResponse.json();
```

### 5. Authentication & Authorization

#### Flask-Login + Bcrypt Session-Based Auth

**NOT JWT-based** - uses Flask sessions with secure cookies.

**User Model:**
```python
{
  "id": "user_001",
  "username": "jdoe",
  "full_name": "John Doe",
  "password": "$2b$12$...",  // bcrypt hash
  "role": "admin",            // "admin" or "standard"
  "is_super_admin": false     // Separate from role
}
```

**Three Access Levels:**
1. **Standard User:** CRM modules + markets + deals
2. **Admin:** + User management (`/admin/users`)
3. **Super Admin:** + Super admin portal (`/admin/super/*`)

**Protected Routes:**
```python
from flask_login import login_required, current_user

@bp.route('/protected', methods=['GET'])
@login_required  # Requires authentication
def protected_endpoint():
    if not current_user.is_super_admin:
        return jsonify({"success": False, "message": "Access denied"}), 403
    # Super admin logic
```

#### Frontend Authentication (CRITICAL PATTERN)

**ALL authenticated API calls MUST include `credentials: 'include'`**

```typescript
// ✅ CORRECT
const response = await fetch(`${API_BASE_URL}/api/deals`, {
  credentials: 'include'  // Sends session cookie
});

// ❌ WRONG - Will redirect to login, return HTML instead of JSON
const response = await fetch(`${API_BASE_URL}/api/deals`);
```

**Why This Matters:**
- Without credentials, Flask redirects to `/api/auth/login`
- Frontend receives HTML login page instead of expected JSON
- Results in parsing errors and failed operations
- Dashboard stats show 0 instead of actual counts

**Auth Context:**
- `frontend/src/contexts/AuthContext.tsx` - Global auth state
- `ProtectedRoute` component - Wraps authenticated pages
- `SuperAdminRoute` component - Wraps super admin pages

### 6. Navigation System (Manual Sync Required)

Two-level navigation with **duplicated structure** across two files.

#### Level 1: Header Dropdowns
**File:** `frontend/src/components/common/Layout.tsx`

Main navigation bar at top with hover-activated dropdowns.

#### Level 2: Sliding Sidebar
**File:** `frontend/src/components/common/Sidebar.tsx`

Hover-activated sidebar that translates from `-256px` off-screen.

**CRITICAL RULE:** When adding/changing navigation, you MUST update BOTH files manually.

**Navigation Structure Pattern:**
```tsx
// Layout.tsx - Header dropdowns
<div className="dropdown">
  <button>CRM Platform</button>
  <div className="dropdown-content">
    <Link to="/liquidity">Liquidity</Link>
    <Link to="/sponsors">Sponsors</Link>
    <Link to="/counsel">Counsel</Link>
    <Link to="/agents">Agents</Link>
  </div>
</div>

// Sidebar.tsx - Sliding sidebar (MUST MATCH)
<div className={`sidebar ${isOpen ? 'translate-x-0' : '-translate-x-64'}`}>
  <div className="section">
    <h3>CRM Platform</h3>
    <Link to="/liquidity">Liquidity</Link>
    <Link to="/sponsors">Sponsors</Link>
    <Link to="/counsel">Counsel</Link>
    <Link to="/agents">Agents</Link>
  </div>
</div>
```

**Why Duplicated:**
- Header: Always visible, dropdown on hover
- Sidebar: Hidden by default, slides in from left edge
- Different UX patterns require separate implementations
- No shared component to avoid coupling complexity

#### Clickable Section Headers

Several main navigation sections have clickable titles that navigate to overview/landing pages:

**Market Intelligence:**
- Header dropdown title is clickable → navigates to `/dashboard/markets` (Markets Overview)
- Also: "Live Market Intelligence" section title on home page → navigates to `/dashboard/markets`

**Damn Effect Strategy:**
- Header dropdown title is clickable → navigates to `/damn-effect-strategy` (hub page)
- Sidebar has "Overview" link → also navigates to hub page

**CRM Platform:**
- Header dropdown title is clickable → navigates to `/crm/all` (unified CRM overview)

**Whiteboard:**
- Header dropdown title is clickable → navigates to `/whiteboard` (whiteboard overview)

### 7. JSON Storage with Automatic Backups

All data operations use `backend/src/utils/json_store.py` which provides automatic backup.

**Read Pattern:**
```python
from pathlib import Path
from ..utils.json_store import read_json_list, find_by_id

# Read entire file
organizations = read_json_list(Path(json_dir) / 'organizations.json')

# Find single record
org = find_by_id(organizations, 'id', 'cp_001')
```

**Write Pattern (Automatic Backup):**
```python
from ..utils.json_store import write_json_file

# Modifies list in memory
org['name'] = 'Updated Name'

# Write to file - automatically creates .bak file first
write_json_file(Path(json_dir) / 'organizations.json', organizations)
```

**Backup Behavior:**
- Every write creates `filename.json.bak` before overwriting
- Timestamped backups in `data/json/backups/` directory
- Never commit `.bak` files to git
- Use `scripts/cleanup_old_backups.py` to manage accumulation

## API Blueprint Architecture

### Flask Application Factory Pattern

**File:** `backend/src/app.py`

```python
def create_app(config_name=None):
    app = Flask(__name__)

    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)

    # Initialize extensions
    CORS(app, supports_credentials=True)
    login_manager.init_app(app)

    # Register 19 blueprints
    from .api import (
        auth_bp, capital_partners_bp, sponsors_bp, counsel_bp,
        agents_bp, deals_bp, deal_participants_bp, investment_bp,
        users_bp, profile_bp, admin_bp, playbook_bp,
        countries_bp, countries_master_bp, fx_rates_bp,
        whiteboard_bp, data_bp, excel_bp, reports_bp
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(capital_partners_bp)
    # ... 17 more

    return app
```

### Blueprint Organization

**Location:** `backend/src/api/`

**Core Blueprints:**
- `auth.py` - Login, logout, auth status
- `capital_partners.py` - Liquidity module (capital partners, contacts)
- `sponsors.py` - Sponsors module (corporates, sponsor contacts)
- `counsel.py` - Counsel module (legal advisors, counsel contacts)
- `agents.py` - Agents module (transaction agents, agent contacts)

**Investment & Deals:**
- `investment.py` - Investment strategies, profiles, matching
- `pipeline.py` - Pipeline strategies CRUD with 6-stage workflow
- `deals.py` - Deals database (precedent transactions)
- `deal_participants.py` - Deal participants management

**Market Data:**
- `countries.py` - Country fundamentals (5 countries with full data)
- `countries_master.py` - Countries master list management (super admin)
- `fx_rates.py` - FX rates (6 currencies vs USD)
- `excel.py` - Legacy Excel data endpoints
- `data.py` - Serve generated JSON files

**Collaboration & Admin:**
- `whiteboard.py` - Team posts with threaded replies
- `users.py` - User management (admin only)
- `profile.py` - User profile operations
- `admin.py` - Super admin portal (13+ features)
- `playbook.py` - Playbook manager (6 operational sheets)
- `reports.py` - CSV exports and reports

### Service Layer Pattern

**Location:** `backend/src/services/`

Business logic separated from API routes for reusability and testing.

**Key Services:**
- `investment_matching.py` - Matching algorithm with preference/country/ticket filters
- `deals_aggregator.py` - Deal data aggregation and statistics
- `archive_manager.py` - Archive and restore records (super admin)
- `bulk_operations.py` - Bulk update, export, import with validation
- `data_cleanup.py` - Data quality scanning (orphaned contacts, invalid participants)
- `database_explorer.py` - Read-only JSON file explorer
- `endpoint_discovery.py` - API endpoint discovery for playground
- `feature_flags.py` - Feature flag management

## Frontend Architecture

### Component Organization

```
frontend/src/
├── pages/                    # Page components (one per route)
│   ├── home/
│   ├── markets/              # 5 country pages + markets overview
│   ├── liquidity/            # Capital partners module
│   ├── sponsors/             # Sponsors module
│   ├── counsel/              # Counsel module
│   ├── agents/               # Agents module
│   ├── deals/                # Deal pipeline
│   ├── admin/                # User management + super admin portal
│   └── auth/                 # Login page
│
├── components/
│   ├── common/               # Layout components
│   │   ├── Layout.tsx        # Header + sidebar wrapper
│   │   ├── Sidebar.tsx       # Sliding sidebar
│   │   ├── ProtectedRoute.tsx
│   │   └── SuperAdminLayout.tsx
│   │
│   ├── features/             # Feature-specific components
│   │   ├── capital-partners/
│   │   ├── sponsors/
│   │   ├── counsel/
│   │   ├── agents/
│   │   ├── deals/
│   │   ├── countries/
│   │   └── admin/
│   │
│   ├── ui/                   # Reusable UI components
│   │   ├── CountryMultiSelect.tsx
│   │   ├── SortableTableHeader.tsx
│   │   └── AnimatedStat.tsx
│   │
│   └── shared/               # Shared components
│       └── InteractiveMermaidChart.tsx
│
├── services/                 # API clients (one per blueprint)
│   ├── api.ts                # Base API config
│   ├── authService.ts
│   ├── capitalPartnersService.ts
│   ├── sponsorsService.ts
│   ├── counselService.ts
│   ├── agentsService.ts
│   ├── dealsService.ts
│   ├── investmentService.ts
│   ├── marketsService.ts
│   ├── fxService.ts
│   ├── countriesService.ts
│   ├── countriesMasterService.ts
│   ├── whiteboardService.ts
│   ├── usersService.ts
│   ├── profileService.ts
│   ├── adminService.ts
│   ├── playbookService.ts
│   └── reportsService.ts
│
├── types/                    # TypeScript type definitions
│   ├── auth.ts
│   ├── liquidity.ts
│   ├── sponsors.ts
│   ├── counsel.ts
│   ├── agents.ts
│   ├── deals.ts
│   ├── investment.ts
│   ├── markets.ts
│   ├── admin.ts
│   ├── playbook.ts
│   └── countriesMaster.ts
│
├── contexts/                 # React contexts
│   └── AuthContext.tsx
│
├── hooks/                    # Custom React hooks
│   ├── useCountUp.ts
│   ├── useScrollReveal.ts
│   └── useTableSort.ts
│
├── constants/                # Frontend constants
│   ├── shared.ts             # Synced with backend
│   └── countries.ts
│
├── utils/                    # Utility functions
└── lib/                      # Third-party configs
```

### Service Layer Pattern (Frontend)

**All API calls must include `credentials: 'include'`**

```typescript
// frontend/src/services/capitalPartnersService.ts
import { API_BASE_URL } from '../config';
import { CapitalPartner } from '../types/liquidity';

export const getCapitalPartners = async () => {
  const response = await fetch(`${API_BASE_URL}/api/capital-partners`, {
    credentials: 'include'  // CRITICAL
  });
  return response.json();
};

export const createCapitalPartner = async (data: Partial<CapitalPartner>) => {
  const response = await fetch(`${API_BASE_URL}/api/capital-partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // CRITICAL
    body: JSON.stringify(data)
  });
  return response.json();
};

export const downloadCapitalPartnersCSV = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/capital-partners/export/csv`,
    { credentials: 'include' }  // CRITICAL
  );
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'capital_partners.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};
```

### TypeScript Types Pattern

Strong typing for all data structures with exact matches to backend.

```typescript
// frontend/src/types/liquidity.ts
export interface CapitalPartner {
  id: string;
  organization_type: 'capital_partner';  // Discriminator
  name: string;
  country: string;
  headquarters_location: string;
  type: string;
  relationship: string;
  notes: string;
  starred: boolean;
  preferences: InvestmentPreferences;
  investment_min: number;
  investment_max: number;
  currency: string;
  countries: string[];  // Array of country IDs from countries_master
  created_at: string;
  last_updated: string;
}

export interface InvestmentPreferences {
  investment_grade: 'Y' | 'N' | 'any';
  high_yield: 'Y' | 'N' | 'any';
  transport_infra: 'Y' | 'N' | 'any';
  energy_infra: 'Y' | 'N' | 'any';
  us_market: 'Y' | 'N' | 'any';
  emerging_markets: 'Y' | 'N' | 'any';
  asia_em: 'Y' | 'N' | 'any';
  africa_em: 'Y' | 'N' | 'any';
  emea_em: 'Y' | 'N' | 'any';
}

export interface Contact {
  id: string;
  organization_id: string;  // Links to parent in organizations.json
  organization_type: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  team_name: string;
  meeting_history: MeetingNote[];
  last_contact_date: string;
  next_contact_reminder: string;
  created_at: string;
  last_updated: string;
}

export interface MeetingNote {
  id: string;
  date: string;
  notes: string;
  participants: string;
  next_follow_up?: string;
}

// frontend/src/types/pipeline.ts
export type PipelineStage =
  | 'ideation'
  | 'outreach'
  | 'negotiation'
  | 'structuring'
  | 'documentation'
  | 'ready_to_close';

export interface PipelineStrategy {
  id: string;
  name: string;
  lead_initial: string;
  stage: PipelineStage;
  created_at: string;
  last_updated: string;

  // Parties
  sponsor: PipelineSponsor;
  lenders: PipelineLender[];
  advisors: PipelineAdvisor[];

  // Deal structure
  deal_type: string;
  financing_scenarios: FinancingScenario[];

  // Intelligence
  target_country: string;
  sector: string;
  risk_score?: number;
  feasibility_flags: string[];
  deal_quality_rating?: 'A' | 'B' | 'C';

  // Tracking
  target_close_date: string;
  milestones: PipelineMilestone[];

  // Collaboration
  activity_log: PipelineActivityLog[];
  notes: PipelineNote[];
  documents: PipelineDocument[];

  // Outcomes
  promoted_to_deal_id?: string | null;
  archived: boolean;
  archive_reason: string;

  // Related deals (precedent transactions)
  related_deals: string[];  // Array of deal IDs from deals database
}
```

### Calendar and Meeting Management

**Location:** `/liquidity/calendar` (and similar routes for other CRM modules)
**Components:**
- `CalendarPage.tsx` - Main calendar view using React Big Calendar
- `QuickMeetingModal.tsx` - Create/schedule meetings from calendar
- `EventDetailsModal.tsx` - View and navigate to meeting details

#### Interactive Calendar Features

The calendar system supports both creating new meetings and editing scheduled meetings across all four CRM modules.

**Create New Meeting:**
1. Click on any date in the calendar
2. `QuickMeetingModal` opens with date pre-filled
3. Select contact from all CRM modules (searchable)
4. Add meeting details (notes, participants, time, assigned users)
5. System detects past vs. future:
   - **Past dates**: Form shows "Record Past Meeting" with "Meeting Notes" field
   - **Future dates**: Form shows "Schedule Meeting" with "Meeting Agenda / Details" field
6. Meeting saved to contact's `meeting_history` array

**Edit Scheduled Meeting:**
1. Click on a future meeting event in calendar
2. `EventDetailsModal` displays meeting details with status badge:
   - **Future meeting**: Blue "Scheduled" badge + green "Update Meeting Details" button
   - **Past meeting**: Gray "Completed" badge + blue "View Full Contact" button
3. Clicking "Update Meeting Details" navigates to:
   - `/liquidity/meeting?contact={contact_id}&meeting={meeting_id}` (Capital Partners)
   - `/sponsors/meeting?contact={contact_id}&meeting={meeting_id}` (Sponsors)
   - `/counsel/meeting?contact={contact_id}&meeting={meeting_id}` (Counsel)
   - `/agents/meeting?contact={contact_id}&meeting={meeting_id}` (Agents)
4. Meeting notes page detects `meeting` parameter and pre-fills form with existing data
5. On save, uses PUT endpoint to update existing meeting (not create duplicate)

**Drag-and-Drop Rescheduling:**
- Drag any meeting event to a new date/time
- System automatically updates the meeting's datetime
- Only works for meetings (not reminders)

#### Meeting Notes Pages

**Files:**
- `frontend/src/pages/capital-partners/MeetingNotesNew.tsx`
- `frontend/src/pages/sponsors/SponsorMeetingNotes.tsx`
- `frontend/src/pages/counsel/CounselMeetingNotesNew.tsx`
- `frontend/src/pages/agents/AgentMeetingNotes.tsx`

**Dual Mode Operation:**

Each meeting notes page supports both creating new meetings and editing existing ones:

```typescript
// State for tracking edit mode
const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

// URL parameters
const contactId = searchParams.get('contact');  // Required
const meetingId = searchParams.get('meeting');   // Optional - triggers edit mode

// Pre-fill form if editing
if (meetingId && contact.meeting_history) {
  const existingMeeting = contact.meeting_history.find(m => m.id === meetingId);
  if (existingMeeting) {
    setEditingMeetingId(meetingId);
    setMeetingNote({
      date: existingMeeting.date.split('T')[0],
      notes: existingMeeting.notes || '',
      participants: existingMeeting.participants || '',
      next_follow_up: existingMeeting.next_follow_up || '',
      assigned_user_ids: existingMeeting.assigned_to?.map(u => u.user_id) || []
    });
  }
}
```

**Save Logic:**
- **Creating**: POST to `/api/meeting-notes` (or module-specific endpoint)
- **Updating**: PUT to `/api/contacts-new/{contact_id}/meetings/{meeting_id}`
- Success message adapts: "Meeting created successfully!" vs "Meeting updated successfully!"

#### Backend Endpoints

**Create Meeting (Quick):**
```
POST /api/quick-meeting
Body: {
  contact_id, organization_type, date (ISO), notes, participants,
  next_follow_up, assigned_user_ids
}
```

**Update Meeting:**
```
PUT /api/contacts-new/{contact_id}/meetings/{meeting_id}         (Capital Partners)
PUT /api/sponsor-contacts/{contact_id}/meetings/{meeting_id}     (Sponsors)
PUT /api/counsel-contacts/{contact_id}/meetings/{meeting_id}     (Counsel)
PUT /api/agent-contacts/{contact_id}/meetings/{meeting_id}       (Agents)

Body: { notes, participants, next_follow_up, assigned_user_ids }
```

**Reschedule Meeting (Drag-and-Drop):**
```
PUT /api/quick-meeting/{contact_id}/{meeting_id}
Body: { date (ISO), organization_type }
```

#### Important Notes

- **Button Label**: Changed from "Start Meeting" to "Meeting Notes" across all modules
- **Timezone Handling**: Backend uses `datetime.now(timezone.utc)` for timezone-aware comparisons
- **Cross-Module Support**: Calendar and meeting editing work identically across all four CRM modules
- **User Assignment**: Meetings can be assigned to multiple users via `assigned_user_ids` array
- **Meeting History**: Stored in contact's `meeting_history` array with unique `id` for each meeting

## Common Development Patterns

### 1. Adding a New Page with Data

```typescript
// 1. Define types (frontend/src/types/myfeature.ts)
export interface MyEntity {
  id: string;
  name: string;
  // ...
}

// 2. Create service (frontend/src/services/myFeatureService.ts)
import { API_BASE_URL } from '../config';

export const getMyEntities = async () => {
  const response = await fetch(`${API_BASE_URL}/api/my-entities`, {
    credentials: 'include'
  });
  return response.json();
};

// 3. Create page (frontend/src/pages/myfeature/MyPage.tsx)
import { useState, useEffect } from 'react';
import { getMyEntities } from '../../services/myFeatureService';

const MyPage = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const response = await getMyEntities();
      if (response.success) {
        setEntities(response.data);
      }
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {entities.map(entity => (
        <div key={entity.id}>{entity.name}</div>
      ))}
    </div>
  );
};

export default MyPage;

// 4. Add route (frontend/src/App.tsx)
<Route path="/my-page" element={<MyPage />} />

// 5. Update navigation (BOTH files)
// frontend/src/components/common/Layout.tsx
// frontend/src/components/common/Sidebar.tsx
```

### 2. Adding a Backend API Endpoint

```python
# 1. Create blueprint (backend/src/api/myfeature.py)
from flask import Blueprint, jsonify, request
from flask_login import login_required
from pathlib import Path

myfeature_bp = Blueprint('myfeature', __name__, url_prefix='/api')

@myfeature_bp.route('/my-entities', methods=['GET'])
@login_required
def get_my_entities():
    from ..utils.json_store import read_json_list
    from ..config import get_config

    config = get_config()
    json_dir = config.JSON_DIR
    entities = read_json_list(Path(json_dir) / 'my_entities.json')

    return jsonify({
        "success": True,
        "data": entities,
        "count": len(entities)
    })

@myfeature_bp.route('/my-entities', methods=['POST'])
@login_required
def create_my_entity():
    from ..utils.json_store import read_json_list, write_json_file
    from ..config import get_config
    import time

    config = get_config()
    json_dir = config.JSON_DIR
    path = Path(json_dir) / 'my_entities.json'

    entities = read_json_list(path)

    new_entity = request.json
    new_entity['id'] = f"entity_{int(time.time() * 1000)}"
    new_entity['created_at'] = datetime.now().isoformat()

    entities.append(new_entity)
    write_json_file(path, entities)  # Automatic backup

    return jsonify({
        "success": True,
        "data": new_entity,
        "message": "Entity created successfully"
    })

# 2. Register blueprint (backend/src/app.py)
from .api.myfeature import myfeature_bp

def create_app(config_name=None):
    app = Flask(__name__)
    # ... existing setup
    app.register_blueprint(myfeature_bp)
    return app
```

### 3. CSV Export Pattern

```python
# Backend endpoint
import csv
from io import StringIO
from flask import Response

@bp.route('/my-entities/export/csv', methods=['GET'])
@login_required
def export_my_entities_csv():
    from ..utils.json_store import read_json_list
    from ..config import get_config

    config = get_config()
    entities = read_json_list(Path(config.JSON_DIR) / 'my_entities.json')

    output = StringIO()
    fieldnames = ['id', 'name', 'country', 'created_at']
    writer = csv.DictWriter(output, fieldnames=fieldnames)

    writer.writeheader()
    for entity in entities:
        writer.writerow({k: entity.get(k, '') for k in fieldnames})

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=my_entities.csv'
    return response
```

```typescript
// Frontend download function
export const downloadMyEntitiesCSV = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/my-entities/export/csv`,
    { credentials: 'include' }
  );
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my_entities.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};
```

### 4. Form Handling with Validation

```typescript
const MyForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (formData.investment_min > formData.investment_max) {
      newErrors.investment_max = 'Max must be greater than min';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      setErrors({ general: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      {errors.general && (
        <div className="error">{errors.general}</div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};
```

### 5. Table Sorting with Custom Hook

```typescript
// Using the existing useTableSort hook
import { useTableSort } from '../../hooks/useTableSort';
import SortableTableHeader from '../../components/ui/SortableTableHeader';

const MyTableView = ({ data }) => {
  const { sortedData, sortField, sortDirection, handleSort } = useTableSort(
    data,
    'name'  // Default sort field
  );

  return (
    <table>
      <thead>
        <tr>
          <SortableTableHeader
            field="name"
            label="Name"
            currentSort={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableTableHeader
            field="country"
            label="Country"
            currentSort={sortField}
            direction={sortDirection}
            onSort={handleSort}
          />
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.country}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 6. Using Country Multi-Select

```typescript
import CountryMultiSelect from '../../components/ui/CountryMultiSelect';

const MyForm = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  return (
    <div>
      <label>Investment Target Countries</label>
      <CountryMultiSelect
        selectedCountries={selectedCountries}
        onChange={setSelectedCountries}
      />
    </div>
  );
};
```

## Super Admin Portal

**Access Level:** Super admin only (requires `is_super_admin: true` flag)
**Routes:** `/admin/super/*`
**Layout:** `SuperAdminLayout` with permanent left sidebar

### Key Features

1. **System Statistics Dashboard** - Real-time metrics (users, organizations, contacts, deals, database size)
2. **My Notes** - Personal notes manager with TipTap rich text editor
3. **The Playbook Manager** - 6 operational sheets (contacts, calendar, deals, people, workstreams, filing)
4. **Countries Master Manager** - Manage 90+ countries list for investment preferences
5. **Database Explorer** - Read-only view of all JSON files with pagination
6. **Archive Management** - Archive/restore old records with auto-archive
7. **Data Quality Scanner** - Find orphaned contacts, invalid participants
8. **Bulk Operations** - Bulk update/export/import with dry-run preview
9. **Feature Flags** - Toggle system features on/off
10. **API Playground** - Test API endpoints with custom requests
11. **Security Config** - View CORS, session, auth settings (read-only)
12. **API Keys Management** - Update and test API keys (ExchangeRate API)
13. **Audit Log** - View all super admin actions with filters

### API Endpoints

```
# System Statistics
GET  /api/admin/stats

# Database Management
GET  /api/admin/database/files
GET  /api/admin/database/size
POST /api/admin/database/backup

# Archive Management
GET  /api/admin/archive/stats
POST /api/admin/archive/:entityType
GET  /api/admin/archive/:entityType/list
POST /api/admin/archive/:entityType/restore
POST /api/admin/archive/:entityType/auto-archive

# Data Quality
GET  /api/admin/cleanup/scan
POST /api/admin/cleanup/fix

# Bulk Operations
POST /api/admin/bulk/update
POST /api/admin/bulk/export
POST /api/admin/bulk/import/validate
POST /api/admin/bulk/import/commit

# Feature Flags
GET  /api/admin/feature-flags
PUT  /api/admin/feature-flags/:flagName
POST /api/admin/feature-flags/reset

# Database Explorer
GET  /api/admin/database-explorer/files
GET  /api/admin/database-explorer/files/:filename
GET  /api/admin/database-explorer/files/:filename/schema

# Audit Log
GET  /api/admin/audit-log
GET  /api/admin/audit-log/stats

# API Keys & Config
GET  /api/admin/config/security
GET  /api/admin/config/api-keys
PUT  /api/admin/config/api-keys/:keyName
POST /api/admin/config/api-keys/test

# System Health
GET  /api/admin/system/health
GET  /api/admin/logs
GET  /api/admin/logs/:filename

# My Notes
GET    /api/admin/notes
POST   /api/admin/notes
PUT    /api/admin/notes/:noteId
DELETE /api/admin/notes/:noteId

# Playbook
GET/POST/PUT/DELETE  /api/playbook/contacts
GET/POST/PUT/DELETE  /api/playbook/calendar
GET/POST/PUT/DELETE  /api/playbook/deals
GET/POST/PUT/DELETE  /api/playbook/people
GET/POST/PUT/DELETE  /api/playbook/workstreams
GET/POST/PUT/DELETE  /api/playbook/filing

# Countries Master
GET    /api/admin/countries-master
POST   /api/admin/countries-master
PUT    /api/admin/countries-master/:id
DELETE /api/admin/countries-master/:id
GET    /api/admin/countries-master/usage
```

## Configuration

### Backend Configuration

**Files:** `backend/src/config.py`

**Three Environments:**
```python
class DevelopmentConfig:
    DEBUG = True
    PORT = 5000
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]

class ProductionConfig:
    DEBUG = False
    PORT = 8000
    CORS_ORIGINS = [
        "https://your-frontend.azurestaticapps.net"
    ]

class TestConfig:
    TESTING = True
    PORT = 5000
```

**Path Configuration:**
```python
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DATA_DIR = BASE_DIR.parent / 'data'                # data/
EXCEL_DIR = DATA_DIR / 'excel'                      # data/excel/
JSON_DIR = DATA_DIR / 'json'                        # data/json/
STORAGE_DIR = BASE_DIR / 'storage'                  # backend/storage/
```

### Frontend Configuration

**File:** `frontend/src/config.ts`

```typescript
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL || ''
  : 'http://127.0.0.1:5000';

export { API_BASE_URL };
```

## Key Technologies

**Backend:**
- Flask 3.0.0 - Web framework with application factory
- Flask-Login 0.6.3 - Session-based authentication
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- bcrypt 4.1.2 - Password hashing
- pandas 2.1.4 - Data manipulation
- openpyxl 3.1.2 - Excel reading
- Gunicorn 21.2.0 - Production WSGI server

**Frontend:**
- React 18.2.0 - UI framework with hooks
- TypeScript 5.0.2 - Type-safe JavaScript
- Vite 4.4.5 - Build tool and dev server
- React Router 6.15.0 - Client-side routing
- Tailwind CSS 3.3.0 - Utility-first CSS
- Recharts 2.8.0 - Chart library
- Mermaid 11.12.0 - Diagram rendering
- TipTap 3.9.0 - Rich text WYSIWYG editor
- React Big Calendar 1.19.4 - Calendar component
- React Zoom Pan Pinch 3.7.0 - Interactive controls
- date-fns 4.1.0 - Date utilities
- Vitest 1.0.4 - Testing framework

## File Naming Conventions

**Backend:**
- Modules: `snake_case.py` (`capital_partners.py`)
- Functions: `snake_case()` (`get_capital_partners`)
- Classes: `PascalCase` (`CapitalPartner`)

**Frontend:**
- Components: `PascalCase.tsx` (`CapitalPartnerForm.tsx`)
- Services: `camelCase.ts` (`capitalPartnersService.ts`)
- Types: `camelCase.ts` (`liquidity.ts`)
- Functions: `camelCase()` (`getCapitalPartners`)

**Data:**
- JSON: `snake_case.json` (`unified_contacts.json`)
- Excel: `Title Case.xlsx` (`The Playbook.xlsx`)

## Common Gotchas and Troubleshooting

### 1. Missing `credentials: 'include'`

**Symptom:** API calls redirect to login, return HTML instead of JSON
**Cause:** Session cookie not sent with request
**Fix:** Add `credentials: 'include'` to ALL authenticated fetch calls

```typescript
// ❌ WRONG
fetch(`${API_BASE_URL}/api/deals`)

// ✅ CORRECT
fetch(`${API_BASE_URL}/api/deals`, { credentials: 'include' })
```

### 2. Looking for Separate CRM Module Files

**Symptom:** Can't find `capital_partners.json` or `corporates.json`
**Cause:** System uses unified architecture
**Fix:** Use `organizations.json` filtered by `organization_type`

### 3. Confusing Two Countries Systems

**Symptom:** Can't find country in countries master, or country page doesn't exist
**Cause:** Mixing up countries master (90+) vs country fundamentals (5)
**Fix:**
- Investment preferences → Use countries master
- Market data pages → Use country fundamentals

### 4. Navigation Out of Sync

**Symptom:** Menu item appears in header but not sidebar (or vice versa)
**Cause:** Forgot to update both files
**Fix:** Update BOTH `Layout.tsx` AND `Sidebar.tsx`

### 5. Shared Constants Out of Sync

**Symptom:** Investment matching fails, preference keys mismatch
**Cause:** Backend and frontend constants don't match
**Fix:**
1. Update both `backend/src/constants/shared.py` and `frontend/src/constants/shared.ts`
2. Run `python shared/scripts/validate-sync.py`

### 6. Organization Type Typo

**Symptom:** Query returns empty array when data exists
**Cause:** Using wrong discriminator value
**Fix:** Use exact values: `"capital_partner"`, `"sponsor"`, `"counsel"`, `"agent"`

### 7. JSON File Not Found

**Symptom:** File read errors on startup
**Cause:** Missing data file or incorrect path
**Fix:**
- Check file exists in `backend/data/json/`
- Verify path configuration in `config.py`
- Create empty array `[]` if file should be empty

### 8. CORS Errors

**Symptom:** Cross-origin request blocked
**Cause:** Frontend URL not in CORS_ORIGINS
**Fix:** Add frontend URL to `backend/src/config.py` CORS_ORIGINS list

### 9. Backup File Accumulation

**Symptom:** Hundreds of `.bak` files
**Cause:** Every write creates backup
**Fix:** Run `python scripts/cleanup_old_backups.py`

### 10. Super Admin Access Denied

**Symptom:** 403 error on `/admin/super` pages
**Cause:** User doesn't have `is_super_admin` flag
**Fix:** Update `users.json` to set `"is_super_admin": true` (Cameron only in production)

## Testing

**Backend:**
```bash
cd backend
pytest                               # Run all tests
pytest tests/test_api/               # Test specific module
pytest --cov=src --cov-report=html   # Coverage report
```

**Frontend:**
```bash
cd frontend
npm test                             # Run tests (Vitest)
npm run test:ui                      # Tests with UI
npm run test:coverage                # Coverage report
```

## Deployment

### Local Development (Windows)

```bash
# Terminal 1: Backend
cd backend
python run.py
# Runs on http://127.0.0.1:5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Azure Production

**Frontend:** Azure Static Web Apps
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

**Backend:** Azure App Service (Linux)
```bash
cd backend
# Entry point: startup.py
# Command: gunicorn --bind=0.0.0.0:8000 --timeout 600 startup:app
```

**Environment Variables (Azure):**
```
FLASK_ENV=production
SECRET_KEY=<strong-secret-key>
PORT=8000
DATA_DIR=/home/site/data
WEB_DIR=/home/site/wwwroot
EXCHANGERATE_API_KEY=<your-key>
```

## Important Notes

1. **Unified CRM Architecture** - All organizations in `organizations.json`, all contacts in `unified_contacts.json`
2. **Two Countries Systems** - Master (90+ for preferences) vs Fundamentals (5 with market data)
3. **Authentication Required** - All API calls need `credentials: 'include'`
4. **Navigation Duplication** - Must update both Layout.tsx and Sidebar.tsx
5. **Shared Constants Sync** - Run validation script after changes
6. **Automatic Backups** - Every write creates `.bak` file
7. **Session-Based Auth** - Not JWT, uses Flask sessions with cookies
8. **JSON Database** - File-based storage appropriate for data scale
9. **Relative Imports** - Backend uses relative imports (`from ..utils import`)
10. **Path Configuration** - All paths computed from BASE_DIR in config.py
11. **Pipeline vs Deals** - Pipeline strategies (`/api/pipeline`) track active opportunities; Deals database (`/api/deals`) contains precedent transactions
12. **Related Deals Feature** - Pipeline strategies can link to deals database via `related_deals` array field
13. **Six Pipeline Stages** - ideation → outreach → negotiation → structuring → documentation → ready_to_close
14. **British English** - Use "Visualisation" not "Visualization", "Organise" not "Organize" in UI text
15. **Clickable Headers** - Market Intelligence and Damn Effect Strategy section titles navigate to overview pages
16. **Calendar Meeting Editing** - All four CRM modules support editing scheduled meetings from calendar via `?meeting={id}` parameter
17. **Meeting Notes Button** - Renamed from "Start Meeting" to "Meeting Notes" across all modules
18. **Dual Meeting Modes** - Meeting notes pages detect past vs. future dates and adapt UI labels accordingly
19. **Meeting History IDs** - Each meeting in `meeting_history` array has unique `id` field for editing and tracking
20. **Timezone Awareness** - Backend uses `datetime.now(timezone.utc)` for all datetime comparisons to avoid timezone errors

## Additional Resources

- **Documentation Hub:** `docs/README.md`
- **API Reference:** `docs/reference/`
- **Migration History:** `backend/migrations/README.md`
- **Component Guide:** `frontend/src/components/README.md`
- **ETL Documentation:** `etl/README.md` (deprecated for market data)
- **Scripts Guide:** `scripts/README.md`
