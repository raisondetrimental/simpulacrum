# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

**Most Common Development Commands:**
```bash
# Start full development stack
cd backend && python run.py          # Terminal 1: Backend API on http://127.0.0.1:5000
cd frontend && npm run dev           # Terminal 2: Frontend on http://localhost:5173

# Run tests
cd backend && pytest                 # Backend tests
cd frontend && npm test              # Frontend tests

# Check code quality
cd backend && black src/             # Format Python code
cd frontend && npm run lint          # Lint TypeScript
```

## Project Overview

**Meridian Universal Dashboard** is a financial markets intelligence platform providing an interactive web dashboard for market data and CRM management. The system consists of two main components:

1. **Backend API** (Flask): Provides market data endpoints, CRM management, and investment matching
2. **Frontend Dashboard** (React + TypeScript): Interactive multi-page web application with integrated CRM

**Note on ETL Pipeline**: The ETL scripts that previously extracted data from Excel workbooks have been deprecated and removed (November 2024). Market data is now managed through direct JSON file management or backend API operations.

**Current Deployment Status**:
- **Local Development Only**: Both frontend and backend run locally
- **CORS Configuration**: Configured for localhost only (`http://localhost:5173`, `http://localhost:3000`, `http://localhost:3001`)

## Project Structure

```
.
├── backend/              # Flask REST API
│   ├── src/
│   │   ├── api/         # Route blueprints
│   │   ├── models/      # Data models
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utilities
│   │   ├── constants/   # Shared constants
│   │   ├── config.py    # Configuration
│   │   └── app.py       # Flask app factory
│   ├── tests/           # Test suite
│   ├── data/            # Data files (Excel sources + JSON databases)
│   │   ├── excel/       # Excel source files
│   │   └── json/        # JSON databases (CRM data)
│   ├── storage/         # Generated files (JSON, reports, logs)
│   ├── migrations/      # Migration documentation
│   ├── run.py           # Development server runner
│   └── startup.py       # Azure entry point
├── frontend/            # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/  # React components (common/features/shared/ui)
│   │   ├── pages/       # Page components (feature-based)
│   │   ├── services/    # API clients
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   ├── types/       # TypeScript types
│   │   ├── constants/   # Frontend constants
│   │   ├── utils/       # Utility functions (NEW)
│   │   └── lib/         # Third-party library configs (NEW)
│   └── public/
│       ├── assets/      # Images and logos (NEW)
│       └── documents/   # Static documents
├── etl/                 # ETL scripts (deprecated - see README.md)
│   └── README.md                   # Historical ETL documentation
├── docs/                # Documentation (organized by category)
│   ├── quickstart/      # Getting started guides
│   ├── architecture/    # System architecture
│   ├── deployment/      # Deployment guides
│   ├── development/     # Development practices
│   ├── implementation/  # Implementation plans
│   ├── reference/       # API reference & specs
│   └── README.md        # Documentation navigation
├── scripts/             # Utility scripts
├── shared/              # Cross-language shared code
└── infrastructure/      # Docker and Azure configs
```

## Essential Commands

### Full System Startup

**Start Backend API:**
```bash
cd backend
python run.py
# Server runs on http://127.0.0.1:5000
```

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
# Dev server runs on http://localhost:5173
```

### Frontend Commands

```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start dev server (Vite)
npm run build           # Build for production (TypeScript + Vite)
npm run lint            # Run ESLint
npm run preview         # Preview production build
```

### Backend Commands

```bash
cd backend

# Install dependencies
pip install -r requirements/dev.txt   # Development
pip install -r requirements/prod.txt  # Production

# Run development server
python run.py

# Run with Gunicorn (production)
gunicorn --bind 0.0.0.0:8000 --timeout 600 src.app:app

# Run tests
pytest
pytest --cov=src --cov-report=html

# Code quality
black src/
flake8 src/
mypy src/
```

## Backend Architecture

### Module Organization

The backend uses Flask application factory pattern with blueprints:

**Blueprints (`backend/src/api/`):**
- `auth.py` - Authentication (login, logout, status)
- `capital_partners.py` - Liquidity module (partners, contacts)
- `sponsors.py` - Sponsors module (corporates, contacts)
- `counsel.py` - Counsel module (legal advisors, contacts)
- `agents.py` - Agents module (transaction agents, contacts)
- `investment.py` - Investment strategies and matching
- `deals.py` - Deals management (CRUD operations)
- `deal_participants.py` - Deal participants management
- `fx_rates.py` - FX rates API and historical data
- `countries.py` - Country fundamentals and macroeconomic data
- `countries_master.py` - Countries master list management (super admin)
- `excel.py` - Excel data and legacy endpoints
- `data.py` - Serve generated JSON files
- `whiteboard.py` - Whiteboard posts with threading
- `users.py` - User management (admin only)
- `profile.py` - User profile management
- `admin.py` - Super admin portal (system stats, database, archives, bulk ops, feature flags, audit log)
- `playbook.py` - Playbook manager (contacts, calendar, deals, people, workstreams, filing)
- `reports.py` - Report generation and CSV exports

**Services (`backend/src/services/`):**
- `investment_profiles.py` - Profile building for cross-CRM matching
- `investment_matching.py` - Investment matching engine
- `deals_aggregator.py` - Deal data aggregation
- `archive_manager.py` - Archive and restore records (super admin)
- `bulk_operations.py` - Bulk update, export, import operations (super admin)
- `data_cleanup.py` - Data quality scanning and fixing (super admin)
- `database_explorer.py` - Read-only database file explorer (super admin)
- `endpoint_discovery.py` - API endpoint discovery for playground (super admin)
- `feature_flags.py` - Feature flag management (super admin)

**Utilities (`backend/src/utils/`):**
- `json_store.py` - JSON file read/write utilities with backup support
- `audit_logger.py` - Audit logging for super admin actions

**Configuration (`backend/src/config.py`):**
Three environment configurations:
- `DevelopmentConfig` - Local development (port 5000)
- `ProductionConfig` - Azure deployment (port 8000)
- `TestConfig` - Testing environment

**Important**: Configuration paths use `Path` objects. The base directory is calculated as `backend/src/../../` which points to project root.

### Data Flow

```
Static Market Data (storage/)
    ↓
[Flask API] serves JSON → [React Frontend]
    ↓
[CRM Operations] → JSON databases (data/json/)
```

**Directory Paths:**
- `DATA_DIR`: `data/` (project root)
- `EXCEL_DIR`: `data/excel/` (legacy Excel sources)
- `JSON_DIR`: `data/json/` (CRM databases)
- `STORAGE_DIR`: `storage/` (static market data files)
- `WEB_DIR`: `storage/` (for serving to frontend)

### API Endpoints

**Authentication:**
```
POST /api/auth/login              # Login with username/password
POST /api/auth/logout             # Logout and clear session
GET  /api/auth/status             # Check authentication status
```

**User Management:**
```
GET         /api/users                      # List users (admin only)
POST        /api/users                      # Create user (admin only)
PUT         /api/users/:id                  # Update user (admin only)
DELETE      /api/users/:id                  # Delete user (admin only)
GET         /api/profile                    # Get current user profile
PUT         /api/profile                    # Update profile
POST        /api/profile/change-password    # Change password
```

**Capital Partners (Liquidity Module):**
```
GET/POST/PUT/DELETE /api/capital-partners
GET/POST/PUT/DELETE /api/contacts-new
POST /api/meeting-notes
GET  /api/meeting-notes/reminders
```

**Sponsors Module:**
```
GET/POST/PUT/DELETE /api/corporates
GET/POST/PUT/DELETE /api/sponsor-contacts
POST /api/sponsor-meetings
GET  /api/sponsor-meetings/reminders
```

**Counsel Module:**
```
GET/POST/PUT/DELETE /api/legal-advisors
GET/POST/PUT/DELETE /api/counsel-contacts
POST /api/counsel-meetings
GET  /api/counsel-meetings/reminders
POST /api/counsel-contacts/:id/complete-reminder
```

**Agents Module:**
```
GET/POST/PUT/DELETE /api/agents
GET/POST/PUT/DELETE /api/agent-contacts
POST /api/agent-meetings
GET  /api/agent-meetings/reminders
```

**Whiteboard:**
```
GET         /api/whiteboards                # Get posts (weekly or all)
POST        /api/whiteboards                # Create new post
GET         /api/whiteboards/:id            # Get specific post
PUT         /api/whiteboards/:id            # Update post
DELETE      /api/whiteboards/:id            # Delete post
GET         /api/whiteboards/:id/replies    # Get replies to post
POST        /api/whiteboards/:id/replies    # Add reply to post
```

**Investment Strategies:**
```
GET  /api/investment-strategies       # Get saved strategies
POST /api/investment-strategies/save  # Save strategies
POST /api/investment-matches          # Get cross-CRM matches
GET  /api/investment-profiles         # Get normalized profiles
```

**Market Data:**
```
GET  /api/health                      # Health check
GET  /api/historical-yields/usa       # USA historical yields
GET  /api/dashboard-data              # Serve dashboard.json
GET  /api/usa-historical-yields       # Serve usa_historical_yields.json
```

**FX Rates:**
```
GET  /api/fx-rates                    # Get current FX rates
POST /api/fx-rates/refresh            # Refresh rates from API
GET  /api/fx-rates/history            # Get historical data
```

**Countries (Fundamentals):**
```
GET  /api/countries                   # List all countries with basic info
GET  /api/countries/:slug             # Get country fundamentals (armenia, mongolia, turkiye, uzbekistan, vietnam)
GET  /api/countries/:slug/complete    # Get comprehensive country data (IMF, EBRD/ADB, IMI)
GET  /api/countries/:slug/export/csv  # Export key macroeconomic metrics to CSV
```

**Deals Module:**
```
GET/POST         /api/deals                  # List all deals / Create new deal
GET/PUT/DELETE   /api/deals/:id              # Get / Update / Delete specific deal
GET              /api/deals/statistics       # Get deal analytics
POST             /api/deals/search           # Advanced deal search
GET/POST/DELETE  /api/deal-participants      # Manage deal participants
GET              /api/deal-participants/deal/:deal_id  # Get participants for deal
```

**Countries Master Management (Admin):**
```
GET         /api/admin/countries-master             # List all countries in master list
POST        /api/admin/countries-master             # Create new country
PUT         /api/admin/countries-master/:id         # Update country
DELETE      /api/admin/countries-master/:id         # Deactivate country
GET         /api/admin/countries-master/usage       # Get usage statistics
```

**Reports & CSV Exports:**
```
GET  /api/reports/country-preferences/csv        # Export country preferences (list format)
GET  /api/reports/country-preferences/matrix/csv # Export country preferences (matrix format)
GET  /api/reports/country-preferences/stats      # Get country preference statistics
```

## Frontend Architecture

### Navigation System

Two-level navigation:
1. **Header Dropdowns** - Main sections (Markets, Infrastructure, CRM modules, About)
2. **Sliding Sidebar** - Hover-activated submenu (translates from -256px)

### Route Structure

**CRM Modules:**
- Liquidity: `/liquidity/*` - Capital partners, contacts
- Sponsors: `/sponsors/*` - Corporates, sponsor contacts
- Counsel: `/counsel/*` - Legal advisors, counsel contacts
- Agents: `/agents/*` - Transaction agents, agent contacts

**Markets:** `/markets`, `/sovereign`, `/corporate`, `/fx`, `/central-banks`, `/ratings`, `/usa-historical-yields`, `/infra-gaps`, `/deals-outlook`, `/news`, `/energy-metrics`, `/transit-friction`, `/internet-coverage`, `/armenia`, `/mongolia`, `/turkiye`, `/uzbekistan`, `/vietnam`

**Deals:** `/deals`, `/deals/:id` - Deal pipeline management

**Strategies:** `/investment-strategies` - Cross-CRM matching

**Calendar:** `/liquidity/calendar` - Unified calendar for all CRM modules

**Collaboration:** `/whiteboard` - Team posts and discussions

**Administration:**
- `/admin/users` - User management (admin only)
- `/admin/super` - Super admin portal home (Cameron only)
- `/admin/super/notes` - Personal notes manager
- `/admin/super/settings` - Super admin settings and configuration
- `/admin/super/playbook` - The Playbook manager (6 sheets)
- `/admin/super/countries` - Countries master list manager

**Account:** `/account/*` - User profile and settings

### Key Components

**Shared Components (`frontend/src/components/`):**
- `Layout.tsx` - Main wrapper with header and sidebar
- `Sidebar.tsx` - Hover-activated sliding sidebar
- `Footer.tsx` - Footer component
- `ProtectedRoute.tsx` - Route wrapper requiring authentication
- `SuperAdminLayout.tsx` - Super admin portal layout with permanent sidebar

**UI Components (`frontend/src/components/ui/`):**
- `CountryMultiSelect.tsx` - Multi-select dropdown for country preferences

**CRM Components (`frontend/src/components/features/`):**
- `capital-partners/` - Liquidity module forms and grids
- `sponsors/` - Sponsors module forms and grids
- `counsel/` - Counsel module forms and grids
- `agents/` - Agents module forms and grids
- `deals/` - Deals module components

**Services (`frontend/src/services/`):**
- `api.ts` - Base API client configuration
- `authService.ts` - Authentication operations
- `capitalPartnersService.ts` - Liquidity API calls
- `sponsorsService.ts` - Sponsors API calls
- `counselService.ts` - Counsel API calls
- `agentsService.ts` - Agents API calls
- `investmentService.ts` - Investment matching API calls
- `marketsService.ts` - Market data API calls
- `dealsService.ts` - Deals and deal participants API calls
- `fxService.ts` - FX rates API calls
- `countriesService.ts` - Country fundamentals and macroeconomic data
- `countriesMasterService.ts` - Countries master list management (admin)
- `whiteboardService.ts` - Whiteboard posts and replies
- `usersService.ts` - User management (admin)
- `profileService.ts` - User profile operations
- `adminService.ts` - Super admin operations (stats, database, archives, bulk ops, feature flags, audit log, notes)
- `playbookService.ts` - Playbook management (contacts, calendar, deals, people, workstreams, filing)

### Configuration

**API Base URL** (`frontend/src/config.ts`):
```typescript
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL || ''
  : 'http://127.0.0.1:5000';
```

### Shared Constants

**CRITICAL**: Investment preference keys are shared between frontend and backend and must be kept in sync.

**Files to update when changing preferences:**
- `shared/constants/preferences.md` - Canonical definition
- `backend/src/constants/shared.py` - `SHARED_PREFERENCE_KEYS`
- `frontend/src/constants/shared.ts` - `SHARED_PREFERENCE_KEYS`
- `shared/scripts/validate-sync.py` - Validation script
- Run: `python shared/scripts/validate-sync.py` to verify sync

**Current shared keys (7 total):** `transport_infra`, `energy_infra`, `us_market`, `emerging_markets`, `asia_em`, `africa_em`, `emea_em`

**Countries as Investment Preferences:**
Organizations use a dynamic `countries` array field to select investment target countries:
- Countries stored as arrays: `["armenia", "mongolia", "turkiye"]`
- Source: `countries_master.json` (90+ countries, managed by super admin)
- Admin interface: `/admin/super/countries`
- Investment matching engine: Filters by overlapping countries array
- CSV exports: Available in list and matrix formats
- See "Countries System Architecture" section for full details on countries master vs country fundamentals

## CRM Data Management

### Unified Organizations Architecture

**IMPORTANT**: The CRM system uses a **unified data structure** rather than separate files per module.

**Organizations** (`data/json/organizations.json`):
- Single JSON file containing ALL organizations across all four CRM modules
- Each organization has an `organization_type` field: `"capital_partner"`, `"corporate"`, `"legal_advisor"`, or `"agent"`
- Organizations share common fields:
  - `id`: Module-specific prefix (cp_001, corp_xxx, legal_xxx, agent_xxx)
  - `organization_type`: Discriminator field for module type
  - `name`, `country`, `headquarters_location`, `relationship`, `notes`
  - `starred`: Boolean flag for favorites
  - `type`: Organization subtype (varies by module)
  - `preferences`: Investment preferences object (for capital_partner, legal_advisor)
  - `investment_min`, `investment_max`, `currency`: Investment ranges
  - `countries`: Array of country IDs for investment preferences
  - `created_at`, `last_updated`: Timestamps

**Contacts** (`data/json/unified_contacts.json`):
- Single JSON file containing ALL contacts across all four CRM modules
- Each contact has:
  - `id`: Contact ID (contact_001, contact_002, etc.)
  - `organization_id`: Links to parent organization in organizations.json
  - `organization_type`: Matches parent organization type
  - `name`, `role`, `email`, `phone`, `team_name`
  - `meeting_history`: Array of meeting records
  - `last_contact_date`, `next_contact_reminder`
  - `created_at`, `last_updated`: Timestamps
  - Legacy ID field: `capital_partner_id`, `corporate_id`, `legal_advisor_id`, or `agent_id` (for backwards compatibility)

### Four CRM Modules (Unified Backend)

**1. Liquidity Module (Capital Partners)**
- Organization type: `"capital_partner"`
- ID prefix: `cp_001`, `cp_002`, etc.
- Features: Investment preferences, investment ranges, starred organizations
- Contacts have optional `team_name` field

**2. Sponsors Module (Corporates)**
- Organization type: `"corporate"`
- ID prefix: `corp_xxx` (timestamp-based)
- Features: Company descriptions, relationship tracking
- Contacts linked via `organization_id`

**3. Counsel Module (Legal Advisors)**
- Organization type: `"legal_advisor"`
- ID prefix: `legal_xxx` (timestamp-based)
- Features: Investment preferences (same as capital partners), starred organizations
- Contacts linked via `organization_id`

**4. Agents Module (Transaction Agents)**
- Organization type: `"agent"`
- ID prefix: `agent_xxx` (timestamp-based)
- Features: Agent type classification, relationship tracking
- Contacts linked via `organization_id`

### Meeting Notes System

**Atomic Updates**: Single transaction updates contact (and parent entity for Sponsors/Counsel/Agents modules)

**Meeting History**: Stored as array in contact record with:
- Date, notes, participants
- Next follow-up date (`next_contact_reminder`)
- Automatic `last_contact_date` tracking

**Calendar Integration**:
- Unified calendar at `/liquidity/calendar`
- Color-coded by module: Green (Liquidity), Purple (Sponsors), Violet (Counsel), Blue (Agents)
- Urgency indicators: Red (overdue), Orange (due within 7 days)

### Data Files

All stored in `data/json/`:
```
# CRM Data (UNIFIED ARCHITECTURE)
organizations.json         # ALL organizations (capital partners, corporates, legal advisors, agents)
unified_contacts.json      # ALL contacts across all four CRM modules
deals.json                 # Deals: Deal pipeline
deal_participants.json     # Deals: Deal participants

# Investment Data
investment_strategies.json # Saved investment strategies
investment_profiles.json   # Generated matching profiles
countries_master.json      # Countries master list for investment preferences

# Market Data
fx_rates.json              # Current FX rates
fx_rates_history.json      # Historical FX data
country_fundamentals.json  # Country fundamentals (basic info)
Country Json/              # Subfolder: Complete country data files (*_complete.json)

# Collaboration
weekly_whiteboards.json    # Whiteboard: Weekly posts and replies
general_posts.json         # Whiteboard: General posts

# User Management
users.json                 # User accounts (bcrypt hashed)

# Super Admin Portal
super_admin_notes.json     # Personal notes (super admin only)
playbook_contacts.json     # Playbook: External contacts sheet
playbook_calendar.json     # Playbook: Calendar sheet
playbook_deals.json        # Playbook: Deal flow sheet
playbook_people.json       # Playbook: People/team sheet
playbook_workstreams.json  # Playbook: Workstreams sheet
playbook_filing.json       # Playbook: Filing instructions sheet
feature_flags.json         # System feature flags
audit_log.json             # Audit trail for super admin actions

# Backups
backups/                   # Timestamped backup files
```

**Backup System**: All write operations create `.bak` files before overwriting.

## Countries System Architecture

**CRITICAL**: The system has **TWO SEPARATE** countries systems serving different purposes. Do not confuse them.

### 1. Countries Master (Investment Preferences)

**Purpose**: Dynamic, user-configurable list of countries for investment targeting

**Data File**: `data/json/countries_master.json`
- Contains 90+ countries (Afghanistan to Yemen)
- Each country has: `id`, `name`, `active`, `display_order`
- Managed by super admin at `/admin/super/countries`

**Usage**:
- Organizations select multiple countries from this list via the `countries` array field
- Example: `"countries": ["armenia", "mongolia", "turkiye"]`
- Used in investment matching engine to find organizations with overlapping country interests
- Supports dynamic addition/removal of countries without code changes

**API Endpoints**:
```
GET         /api/admin/countries-master             # List all countries
POST        /api/admin/countries-master             # Create new country
PUT         /api/admin/countries-master/:id         # Update country
DELETE      /api/admin/countries-master/:id         # Deactivate country
GET         /api/admin/countries-master/usage       # Usage statistics
```

**Frontend Component**: `CountryMultiSelect.tsx` - Multi-select dropdown for organization forms

### 2. Country Fundamentals (Market Data)

**Purpose**: Macroeconomic data and market intelligence for specific emerging markets

**Data Files**:
- `data/json/country_fundamentals.json` - Basic info (name, slug, capital, region)
- `data/json/Country Json/*_complete.json` - Comprehensive data (IMF Article IV, EBRD/ADB, IMI)

**Supported Countries**: 5 countries with full market data
- Armenia
- Mongolia
- Türkiye
- Uzbekistan
- Vietnam

**Usage**:
- Dedicated market pages: `/armenia`, `/mongolia`, `/turkiye`, `/uzbekistan`, `/vietnam`
- Country-specific tabs: Fundamentals, Macro Analysis, IMF Article IV data
- CSV export of macroeconomic metrics
- NOT used for investment preferences matching

**API Endpoints**:
```
GET  /api/countries                   # List all countries with basic info
GET  /api/countries/:slug             # Get country fundamentals
GET  /api/countries/:slug/complete    # Get comprehensive country data
GET  /api/countries/:slug/export/csv  # Export macroeconomic metrics
```

**Frontend Pages**: `ArmeniaPage.tsx`, `MongoliaPage.tsx`, `TurkiyePage.tsx`, `UzbekistanPage.tsx`, `VietnamPage.tsx`

### Coordination Between Systems

**Key Distinction**:
- **Countries Master**: User-selectable investment preferences (90+ countries, dynamic list)
- **Country Fundamentals**: Fixed market intelligence data (5 countries, requires data files)

**Country ID Matching**:
- Countries master uses lowercase IDs with underscores: `"mongolia"`, `"turkiye"`, `"saudi_arabia"`
- Country fundamentals uses slugs: `"mongolia"`, `"turkiye"` (matching subset)
- The 5 supported fundamentals countries are ALSO in the countries master list
- Organizations can select any of 90+ countries as preferences, but only 5 have detailed market data

**Example Flow**:
1. Super admin adds "Pakistan" to countries master → Organizations can now select Pakistan as investment preference
2. But Pakistan has NO country fundamentals data → No `/pakistan` market page available
3. To add Pakistan market data → Requires creating `country_fundamentals.json` entry AND `Pakistan_complete.json` file

**Investment Matching**:
- Uses `countries` array from organizations.json (references countries_master.json)
- Matches organizations with overlapping country preferences
- Does NOT use country fundamentals data (market data is separate concern)

## Investment Matching Engine

### Profile Building

**Service**: `backend/src/services/investment_profiles.py`

Normalizes investment preferences across CRM modules:
- Converts Y/N/any flags to consistent format
- Combines data from Capital Partners and Sponsors (corporates)
- Generates unified profiles in `data/json/investment_profiles.json`

### Matching Logic

**Service**: `backend/src/services/investment_matching.py`

```python
# Filter profiles by investment strategy criteria
filter_profiles(profiles, preference_filters, ticket_range)

# Match capital partners with compatible sponsors
compute_pairings(sponsors, capital_partners)
```

**Compatibility Rules**:
- Preference alignment (shared keys: 7 keys)
- Ticket size overlap (min/max ranges)
- Geographic/sector fit
- Country array matching (organizations with overlapping country preferences)

**Endpoint**: `POST /api/investment-matches`

## Whiteboard System

**Purpose**: Team collaboration with weekly posts and threaded replies

**Key Features**:
- Weekly posts organized by Monday-Sunday boundaries
- Nested replies (threading)
- Fixed user order for sorting: Naveen, Aijan, Lavinia, Kush, Maximilian, Amgalan, Cameron
- Week boundaries calculated from Monday 00:00 to Sunday 23:59:59
- Posts organized by week with ISO date ranges

**Data Structure**:
```json
{
  "id": "post_001",
  "user": "Full Name",
  "content": "Post content",
  "timestamp": "ISO datetime",
  "week_start": "ISO datetime (Monday)",
  "week_end": "ISO datetime (Sunday)",
  "replies": [
    {
      "id": "reply_001",
      "user": "Full Name",
      "content": "Reply content",
      "timestamp": "ISO datetime"
    }
  ]
}
```

## Super Admin Portal

**Access Level**: Super Admin only (Cameron) - requires `is_super_admin` flag on user model

**Purpose**: Comprehensive system administration portal with advanced features for system management, data quality, and operational tools.

### Portal Structure

**Home Dashboard** (`/admin/super`):
- System statistics overview (users, organizations, contacts, deals)
- Database size and file count
- Upcoming reminders summary
- Recent notes preview
- Quick access cards to all portal sections

### Core Features

**1. My Notes** (`/admin/super/notes`):
- Personal notes manager for super admin
- Rich text support with TipTap editor
- CRUD operations: Create, read, update, delete notes
- Automatic timestamp tracking (created_at, updated_at)
- Backend endpoints: `/api/admin/notes`

**2. The Playbook Manager** (`/admin/super/playbook`):
Manages six operational sheets from The Playbook Excel workbook:
- **External Contacts**: Network contacts with contact level tracking
- **Calendar**: Important dates and milestones
- **Deal Flow**: Pipeline and deal stages
- **People/Team**: Team structure and roles
- **Workstreams**: Project tracking and task management
- **Filing Instructions**: Document organization procedures

Backend endpoints: `/api/playbook/*` (contacts, calendar, deals, people, workstreams, filing)

**3. Countries Master Manager** (`/admin/super/countries`):
- Manage dynamic countries list for investment preferences
- CRUD operations on countries
- View usage statistics across organizations
- Backend endpoints: `/api/admin/countries-master`

**4. Super Admin Settings** (`/admin/super/settings`):
Comprehensive system configuration interface:

**System Statistics**:
- Real-time system health monitoring
- User statistics (total, active, admin, super admin)
- CRM statistics by organization type
- Deal statistics and total value
- Database size breakdown (JSON + storage)
- Whiteboard post counts
- Backup status and last backup timestamp

**Database Management**:
- List all database files with metadata
- View database size by type (JSON database vs generated storage)
- Manual backup triggering
- Database Explorer: Read-only view of all JSON files with:
  - Record pagination and search
  - Schema analysis and field types
  - Grouped views by category

**Archive Management**:
- Archive old records (deals, organizations, contacts)
- List archived records with pagination
- Restore archived records
- Auto-archive based on age criteria and status filters
- Archive statistics across entity types

**Data Quality Tools**:
- Scan for data issues:
  - Orphaned contacts (contacts referencing non-existent organizations)
  - Invalid deal participants (participants referencing non-existent entities)
- Fix detected issues:
  - Delete orphaned contacts
  - Remove invalid participants
- Data quality reports

**Bulk Operations**:
- Bulk update records with filters (dry-run preview available)
- Bulk export to CSV or JSON with custom filters
- Bulk import with validation:
  - Validate records before import
  - Preview validation results
  - Commit import with append or replace mode

**Feature Flags**:
- Toggle feature flags on/off
- View flags by category (integration, data_management, ui)
- View flag metadata (description, last modified, modified by)
- Reset all flags to default values
- Backend: `/api/admin/feature-flags`

**API Playground**:
- List all API endpoints (grouped by blueprint)
- Search endpoints by name or path
- Execute API requests with custom:
  - HTTP method
  - Headers
  - Query parameters
  - Request body
- View response with status code, headers, body
- Execution time tracking

**Security Configuration** (read-only):
- CORS settings and allowed origins
- Session configuration (lifetime, cookie settings)
- Authentication settings (bcrypt rounds, remember me)
- Environment info (Flask env, debug mode, testing mode)

**API Keys Management**:
- View configured API keys (masked for security)
- Update API keys (writes to `.env` file)
- Test API key validity (live verification)
- Currently supports: ExchangeRate API

**Audit Log**:
- View comprehensive audit log with filters:
  - Filter by user, action, entity type, date range
  - Pagination support
  - Success/failure tracking
- Audit statistics:
  - Total entries
  - Actions breakdown (create, update, delete, archive, etc.)
  - Operations by user
  - Operations by entity type
  - Success rate percentage

**System Health**:
- Health check for critical services:
  - Database accessibility
  - Storage accessibility
  - Users file existence
- Overall system status (online, degraded, error)

**Logs Management**:
- List available log files with metadata
- Download specific log files
- Sort by modification date

### Super Admin API Endpoints

```
# System Statistics
GET  /api/admin/stats                           # Comprehensive system statistics

# Database Management
GET  /api/admin/database/files                  # List all database files
GET  /api/admin/database/size                   # Get database size breakdown
POST /api/admin/database/backup                 # Trigger manual backup

# Archive Management
GET  /api/admin/archive/stats                   # Archive statistics
POST /api/admin/archive/:entityType             # Archive records
GET  /api/admin/archive/:entityType/list        # List archived records
POST /api/admin/archive/:entityType/restore     # Restore archived records
POST /api/admin/archive/:entityType/auto-archive # Auto-archive old records

# Data Quality
GET  /api/admin/cleanup/scan                    # Scan for data quality issues
POST /api/admin/cleanup/fix                     # Fix detected issues

# Bulk Operations
POST /api/admin/bulk/update                     # Bulk update with filters
POST /api/admin/bulk/export                     # Bulk export to CSV/JSON
POST /api/admin/bulk/import/validate            # Validate import data
POST /api/admin/bulk/import/commit              # Commit import

# Feature Flags
GET  /api/admin/feature-flags                   # Get all feature flags
PUT  /api/admin/feature-flags/:flagName         # Toggle feature flag
GET  /api/admin/feature-flags/:flagName/metadata # Get flag metadata
POST /api/admin/feature-flags/reset             # Reset all flags to defaults

# API Playground
GET  /api/admin/api-playground/endpoints        # List all endpoints
GET  /api/admin/api-playground/endpoints/search # Search endpoints
POST /api/admin/api-playground/execute          # Execute API request

# Database Explorer (Read-Only)
GET  /api/admin/database-explorer/files         # List database files
GET  /api/admin/database-explorer/files/:filename # Read file records
GET  /api/admin/database-explorer/files/:filename/schema # Get file schema

# Audit Log
GET  /api/admin/audit-log                       # Get audit log entries
GET  /api/admin/audit-log/stats                 # Get audit statistics

# Security & Configuration
GET  /api/admin/config/security                 # Get security config (read-only)
GET  /api/admin/config/api-keys                 # Get API keys (masked)
PUT  /api/admin/config/api-keys/:keyName        # Update API key
POST /api/admin/config/api-keys/test            # Test API key

# System Health & Logs
GET  /api/admin/system/health                   # System health check
GET  /api/admin/logs                            # List log files
GET  /api/admin/logs/:filename                  # Download log file

# My Notes
GET    /api/admin/notes                         # Get all notes
GET    /api/admin/notes/:noteId                 # Get specific note
POST   /api/admin/notes                         # Create note
PUT    /api/admin/notes/:noteId                 # Update note
DELETE /api/admin/notes/:noteId                 # Delete note

# Playbook Management
GET    /api/playbook/contacts                   # Get playbook contacts
POST   /api/playbook/contacts                   # Create contact
PUT    /api/playbook/contacts/:id               # Update contact
DELETE /api/playbook/contacts/:id               # Delete contact
# Similar endpoints for: calendar, deals, people, workstreams, filing
```

### Data Files

Super admin portal uses these JSON files in `data/json/`:
```
super_admin_notes.json         # Personal notes
playbook_contacts.json         # External contacts sheet
playbook_calendar.json         # Calendar sheet
playbook_deals.json            # Deal flow sheet
playbook_people.json           # People/team sheet
playbook_workstreams.json      # Workstreams sheet
playbook_filing.json           # Filing instructions sheet
feature_flags.json             # System feature flags
audit_log.json                 # Audit trail
```

### Important Notes

- **Access Control**: Super admin endpoints check for `is_super_admin` flag, separate from regular admin role
- **Audit Logging**: All super admin actions are logged to audit trail
- **Security**: API keys are masked when displayed and stored in `.env` file
- **Backups**: Manual backup creates timestamped copies in `data/json/backups/`
- **Dry Run**: Bulk operations support dry-run mode to preview changes before applying
- **Read-Only Views**: Database Explorer and Security Config are read-only for safety

## Authentication System

**Technology**: Flask-Login with bcrypt password hashing

**Session Management**:
- Session-based authentication
- Secure cookies (httpOnly, sameSite)
- Protected routes use `@login_required` decorator

**User Roles**:
- Super Admin: Full system access including super admin portal (Cameron only)
- Admin: Full access including user management, but no super admin portal
- Standard: Access to CRM and markets features

**Frontend Context**: `AuthContext.tsx` manages global auth state

**User Storage**: `backend/data/json/users.json` with bcrypt hashed passwords

## Common File Locations

**Where to find things:**

| What | Location |
|------|----------|
| Backend API routes | `backend/src/api/*.py` |
| Backend services (business logic) | `backend/src/services/*.py` |
| Backend utilities | `backend/src/utils/*.py` |
| Backend configuration | `backend/src/config.py` |
| Frontend pages | `frontend/src/pages/*/` |
| Frontend services (API calls) | `frontend/src/services/*.ts` |
| Frontend types | `frontend/src/types/*.ts` |
| React components | `frontend/src/components/features/*/` |
| Shared constants | `backend/src/constants/shared.py` + `frontend/src/constants/shared.ts` |
| CRM data (JSON) | `backend/data/json/*.json` |
| Super admin data (JSON) | `backend/data/json/super_admin_notes.json`, `feature_flags.json`, `audit_log.json` |
| Playbook data (JSON) | `backend/data/json/playbook_*.json` |
| Generated market data | `backend/storage/dashboard.json`, `backend/storage/usa_historical_yields.json` |
| Excel source files | `backend/data/excel/` (legacy) |
| ETL scripts | `etl/` (deprecated - see README.md) |
| Backend tests | `backend/tests/` |
| Frontend tests | `frontend/src/__tests__/` |
| ETL documentation | `etl/README.md` |
| Component organization guide | `frontend/src/components/README.md` |
| Migration history | `backend/migrations/README.md` |
| Utility scripts | `scripts/` (see `scripts/README.md`) |
| Testing roadmap | `docs/development/testing-roadmap.md` |
| Logo assets | `frontend/public/assets/logo-*.jpg` |
| Frontend utils | `frontend/src/utils/` (helper functions) |
| Frontend lib | `frontend/src/lib/` (third-party configs) |
| Documentation hub | `docs/README.md` (navigation guide) |
| Super admin pages | `frontend/src/pages/admin/SuperAdmin*.tsx`, `MyNotes.tsx`, `PlaybookManager.tsx` |

## Common Development Patterns

### Adding a New CRM Module

1. **Create backend blueprint** (`backend/src/api/new_module.py`)
2. **Register blueprint** in `backend/src/app.py`
3. **Add TypeScript types** (`frontend/src/types/new_module.ts`)
4. **Create service** (`frontend/src/services/newModuleService.ts`)
5. **Create pages** (`frontend/src/pages/new-module/`)
6. **Add routes** in `frontend/src/App.tsx`
7. **Update navigation** in BOTH `frontend/src/components/common/Layout.tsx` AND `frontend/src/components/common/Sidebar.tsx`

**Navigation Menu Pattern**: Each CRM module has a consistent navigation order:
1. Overview
2. Primary entity list (Capital Partners/Corporates/Legal Advisors/Agents)
3. Contacts list
4. Table View
5. Meeting Notes (always at bottom)

**CRITICAL**: When updating navigation, you MUST update both Layout.tsx (header dropdown) and Sidebar.tsx (sliding sidebar) to keep them in sync.

### Adding Investment Matching Criteria

1. **Update backend constants**: `backend/src/constants/shared.py`
2. **Update frontend constants**: `frontend/src/constants/shared.ts`
3. **Update preference grids**: Liquidity, Sponsors, and Counsel modules
4. **Regenerate profiles**: `POST /api/investment-matches`

### Adding Country Fundamentals Data (Market Intelligence)

**Note**: This is for adding **market data pages**, NOT investment preferences. To add countries for investment preferences, use the super admin Countries Master Manager at `/admin/super/countries`.

**Country fundamentals** provide macroeconomic data and market intelligence:

**Data Storage**:
1. **Basic Data**: `data/json/country_fundamentals.json` - Contains name, slug, capital, region, basic metrics
2. **Complete Data**: `data/json/Country Json/*_complete.json` - Contains comprehensive IMF Article IV, EBRD/ADB, and IMI data

**Currently Supported**: Armenia, Mongolia, Türkiye, Uzbekistan, Vietnam (5 countries with full market data)

**To add a new country market page**:
1. Add country to `country_fundamentals.json` with required fields (name, slug, capital, region)
2. Create `{CountryName}_complete.json` in `Country Json/` folder with IMF/EBRD/ADB/IMI data
3. Update `COMPLETE_DATA_FILES` mapping in `backend/src/api/countries.py`
4. Add route in `frontend/src/App.tsx` (e.g., `/countryname`)
5. Create page component in `frontend/src/pages/markets/{CountryName}Page.tsx`
6. Update navigation in Layout.tsx and Sidebar.tsx
7. **Optional**: If country should also be available as investment preference, add to `countries_master.json` via super admin portal

**Remember**: Countries master (90+ countries) vs Country fundamentals (5 countries) are separate systems. See "Countries System Architecture" section.

### Working with Charts

Uses Recharts library:
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

<LineChart data={data}>
  <XAxis dataKey="maturity" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line dataKey="yield" stroke="#3b82f6" />
</LineChart>
```

Common pattern: Transform data into array of objects with consistent keys for XAxis/dataKey.

### CSV Export Functionality

All CRM modules support CSV export for their primary entities:

**Liquidity Module:**
- Capital Partners: `downloadCapitalPartnersCSV()` - Accessible from list page
- Contacts: `downloadContactsCSV()` - Accessible from list page

**Sponsors Module:**
- Corporates: `downloadCorporatesCSV()` - Accessible from list page
- Sponsor Contacts: `downloadSponsorContactsCSV(corporateId?)` - Accessible from list page with optional filtering

**Counsel Module:**
- Legal Advisors: `downloadLegalAdvisorsCSV()` - Accessible from list page
- Counsel Contacts: `downloadCounselContactsCSV(advisorId?)` - Accessible from list page with optional filtering

**Agents Module:**
- Agents: `downloadAgentsCSV()` - Accessible from list page
- Agent Contacts: `downloadAgentContactsCSV(agentId?)` - Accessible from list page with optional filtering

**Deals Module:**
- Deals: `downloadDealsCSV()` - Accessible from list page

**Countries Module:**
- Country Metrics: `exportCountryCSV(slug)` - Exports key macroeconomic metrics (IMF Article IV data) for specific countries

**Pattern**: Each service module has a `download*CSV()` or `export*CSV()` function that:
1. Fetches data from API endpoint with `/export/csv` suffix
2. Creates a Blob from the response
3. Triggers browser download with appropriate filename

**Example**:
```typescript
export const downloadContactsCSV = async () => {
  const response = await fetch(`${API_BASE_URL}/api/contacts-new/export/csv`, {
    credentials: 'include'
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contacts.csv';
  a.click();
};
```

### Authenticated API Calls

**CRITICAL**: All API calls to protected endpoints MUST include `credentials: 'include'` to send authentication cookies.

```typescript
// ✅ CORRECT - Includes credentials
const response = await fetch(`${API_BASE_URL}/api/deals`, {
  credentials: 'include'
});

// ❌ WRONG - Missing credentials, will get redirect to login
const response = await fetch(`${API_BASE_URL}/api/deals`);
```

This pattern is essential for:
- All CRM operations (GET/POST/PUT/DELETE)
- Protected market data endpoints
- CSV export downloads
- Statistics/counts for dashboard

## Key Technologies

**Backend:**
- Flask 3.0.0 - Web framework with application factory pattern
- Flask-Login 0.6.3 - Session-based authentication
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- bcrypt 4.1.2 - Password hashing
- gunicorn 21.2.0 - Production WSGI server

**Frontend:**
- React 18.2.0 - UI framework with hooks
- TypeScript 5.0.2 - Type-safe JavaScript
- Vite 4.4.5 - Build tool and dev server
- React Router 6.15.0 - Client-side routing
- Recharts 2.8.0 - Chart library
- Mermaid 11.12.0 - Diagram rendering
- TipTap 3.9.0 - Rich text WYSIWYG editor
- React Big Calendar 1.19.4 - Calendar component
- React Zoom Pan Pinch 3.7.0 - Interactive zooming/panning
- Tailwind CSS 3.3.0 - Utility-first CSS framework
- Vitest 1.0.4 - Testing framework

**Development Tools:**
- pytest - Python testing
- black - Python code formatter
- flake8 - Python linter
- mypy - Python type checker
- ESLint - TypeScript/JavaScript linter

## Styling Conventions

- **Framework**: Tailwind CSS
- **Font Family**: Serif fonts (Georgia, Cambria, Times New Roman)
- **Colors**: Primary gray tones, blue accents
- **Charts**: Recharts library
- **Diagrams**: Mermaid.js (InteractiveMermaidChart component)
- **Rich Text**: TipTap editor
- **Responsive**: Mobile-first approach with responsive breakpoints

## Testing

**Backend Tests** (`backend/tests/`):
```bash
cd backend
pytest                               # Run all tests
pytest tests/test_api/               # Test specific module
pytest --cov=src --cov-report=html   # Coverage report
```

**Note**: Backend test suite is in development. The `tests/` directory exists but may have limited coverage.

**Frontend Tests** (`frontend/src/__tests__/`):
```bash
cd frontend
npm test                             # Run tests (Vitest)
npm run test:ui                      # Run tests with UI
npm run test:coverage                # Coverage report
```

**Note**: Frontend uses Vitest for testing. Test files should be placed in `frontend/src/__tests__/` or co-located with components as `*.test.tsx`.

## Deployment

### Local Development (Windows)

Full stack:
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Azure Production (Hybrid Approach)

**Frontend**: Azure Static Web Apps
```bash
cd frontend
npm run build
# Deploy dist/ folder to Azure Static Web Apps
```

**Backend**: Azure App Service (Linux)
```bash
cd backend
# Uses startup.py as entry point
# Configure: gunicorn --bind=0.0.0.0:8000 --timeout 600 startup:app
```

**Environment Variables (Azure App Service)**:
```
FLASK_ENV=production
SECRET_KEY=<your-production-key>
PORT=8000
DATA_DIR=/home/site/data
WEB_DIR=/home/site/wwwroot
```

## Data Migration and Maintenance

**Migration History:**
All data migrations have been completed (October 2025) and migration scripts have been deleted. For historical reference and future migration guidelines, see:
- `backend/migrations/README.md` - Completed migrations documentation
- `docs/architecture/migration-complete.md` - Migration completion record

**Completed Migrations:**
- Deal precedents migration (October 9, 2025)
- Teams hierarchy removal (October 23, 2024)
- Meeting notes IDs addition (October 2025)
- Deal precedents cleanup (October 2025)

**Backup Management:**
- Automatic `.bak` files created on every JSON write
- Use `scripts/cleanup_old_backups.py` to manage backup accumulation
- Timestamped backups available in git history

## Important Notes

- **Unified CRM Architecture**: All organizations are in `organizations.json`, all contacts in `unified_contacts.json` (not separate files per module)
- **Two Countries Systems**: Countries master (90+ for investment prefs) vs Country fundamentals (5 with market data) - separate purposes
- **Organization Type Field**: Use `organization_type` to filter by module: `capital_partner`, `corporate`, `legal_advisor`, `agent`
- **ETL Scripts Deprecated**: ETL scripts have been removed (November 2024) - market data is now managed manually
- **JSON Backups**: `.bak` files automatically created before overwriting any JSON file
- **Relative Imports**: Backend uses relative imports (e.g., `from ..services.investment_profiles import ...`)
- **Path Configuration**: Backend paths are computed from `BASE_DIR` in config.py
- **Session-Based Auth**: API uses Flask sessions with cookies - frontend must send `credentials: 'include'`
- **Team Name Field**: Contacts have `team_name` as a text field (not a separate teams entity)
- **Countries Array**: Organizations have `countries` array field referencing `countries_master.json` IDs

## Troubleshooting

**Backend won't start**: Check that you're in `backend/` directory and running `python run.py`

**Import errors**: Ensure relative imports use dots (e.g., `.investment_profiles` not `investment_profiles`)

**CORS errors**: Verify frontend URL is in `CORS_ORIGINS` list in `backend/src/config.py`

**JSON data not loading**: Check that files exist in `data/json/` and backend is running

**Charts not showing**: Verify `storage/dashboard.json` exists and has valid data

**Calendar reminders missing**: Verify `next_contact_reminder` dates are in ISO format

**Investment matching returns empty**: Check that preference keys match between backend and frontend constants

**Azure deployment fails**:
- Port configuration: Azure expects port 8000 (configured in startup.py)
- Environment variables: Set DATA_DIR, WEB_DIR, PORT in Azure App Service
- CORS: Add Azure Static Web App URL to CORS origins

**Home page statistics showing 0**: If CRM statistics (capital partners count, corporates count, etc.) show as 0, check that all fetch calls include `credentials: 'include'`. Without credentials, protected endpoints redirect to login and return HTML instead of JSON, causing counts to fail.

**CSV export not working**: Verify that:
1. The export button is calling the correct service function
2. The fetch call includes `credentials: 'include'`
3. The backend endpoint exists and has `/export/csv` suffix
4. The user is authenticated

**Whiteboard posts not showing**: Check that week boundaries are calculated correctly (Monday-Sunday) and posts have valid `week_start` and `week_end` ISO timestamps.

**Country data not loading**: Verify that:
1. `country_fundamentals.json` exists in `data/json/`
2. Complete country data files exist in `data/json/Country Json/` folder
3. Country slug matches the filename mapping in `countries.py` `COMPLETE_DATA_FILES`
4. API calls include `credentials: 'include'`

**Super admin portal access denied**: Check that:
1. User has `is_super_admin: true` flag in `users.json`
2. User is authenticated (logged in)
3. The `is_super_admin` flag is separate from regular `role: admin`
4. Only Cameron should have super admin access in production

**CRM data not loading**: Verify unified architecture:
1. Data should be in `organizations.json` and `unified_contacts.json` (NOT separate module files)
2. Check `organization_type` field exists and matches expected value
3. Contacts should have `organization_id` linking to parent organization
4. Old files like `capital_partners.json`, `corporates.json` are obsolete

**Country selection not working**: Check which system you're using:
1. For investment preferences: Use `countries_master.json` (90+ countries), updated via super admin portal
2. For market data pages: Use `country_fundamentals.json` (5 countries), requires complete data files
3. Organizations use `countries` array field, not individual country flags
4. Investment matching filters by `countries` array, not country fundamentals

**Countries master updates not appearing**: Verify:
1. Changes saved to `countries_master.json`
2. Frontend `CountryMultiSelect` component fetching latest list
3. API endpoint `/api/admin/countries-master` returns updated list
4. Browser cache cleared if using cached responses
