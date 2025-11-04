# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

**Most Common Development Commands:**
```bash
# Start full development stack
cd backend && python run.py          # Terminal 1: Backend API on http://127.0.0.1:5000
cd frontend && npm run dev           # Terminal 2: Frontend on http://localhost:5173

# Generate fresh market data
cd etl && python read_dashboard.py   # Creates storage/dashboard.json

# Run tests
cd backend && pytest                 # Backend tests
cd frontend && npm test              # Frontend tests

# Check code quality
cd backend && black src/             # Format Python code
cd frontend && npm run lint          # Lint TypeScript
```

## Project Overview

**Meridian Universal Dashboard** is a financial markets intelligence platform that transforms Excel-based market data into an interactive web dashboard. The system consists of three main components:

1. **ETL Pipeline** (Python): Reads Excel workbooks in read-only mode and generates JSON data
2. **Backend API** (Flask): Provides market data endpoints, CRM management, and investment matching
3. **Frontend Dashboard** (React + TypeScript): Interactive multi-page web application with integrated CRM

**Key Constraint**: Excel file is read in read-only mode with NO macro execution from the ETL. Macros can only be executed via Flask API using COM automation (Windows only).

**Critical Deployment Constraint**: Excel COM automation requires Windows environment. Azure App Service Linux **CANNOT** run COM operations. For production deployment, COM features must remain on Windows local environment while other features can be deployed to Azure.

**Current Deployment Status**:
- **Local Development Only**: Both frontend and backend run locally
- **CORS Configuration**: Configured for localhost only (`http://localhost:5173`, `http://localhost:3000`, `http://localhost:3001`)
- **Excel COM**: Disabled in API for cloud compatibility

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
├── etl/                 # Python ETL scripts
│   ├── read_dashboard.py          # Main ETL for market data
│   ├── extract_usa_historical.py  # USA yields ETL
│   ├── excel_com_interface.py     # COM automation utilities (Windows only)
│   ├── pdf_generator.py           # PDF report generation
│   └── README.md                   # ETL documentation
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

**Generate JSON Data (manual ETL runs):**
```bash
# Generate main dashboard data
cd etl
python read_dashboard.py
# Outputs to: storage/dashboard.json

# Generate USA historical yields data
cd etl
python extract_usa_historical.py
# Outputs to: storage/usa_historical_yields.json
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
- `excel.py` - Excel data and legacy endpoints
- `data.py` - Serve generated JSON files
- `whiteboard.py` - Whiteboard posts with threading
- `users.py` - User management (admin only)
- `profile.py` - User profile management

**Services (`backend/src/services/`):**
- `investment_profiles.py` - Profile building for cross-CRM matching
- `investment_matching.py` - Investment matching engine
- `deals_aggregator.py` - Deal data aggregation

**Configuration (`backend/src/config.py`):**
Three environment configurations:
- `DevelopmentConfig` - Local development (port 5000)
- `ProductionConfig` - Azure deployment (port 8000)
- `TestConfig` - Testing environment

**Important**: Configuration paths use `Path` objects. The base directory is calculated as `backend/src/../../` which points to project root.

### Data Flow

```
Excel Files (data/excel/)
    ↓
[ETL Scripts] → JSON (storage/)
    ↓
[Flask API] serves JSON → [React Frontend]
    ↓
[CRM Operations] → JSON databases (data/json/)
```

**Directory Paths:**
- `DATA_DIR`: `data/` (project root)
- `EXCEL_DIR`: `data/excel/`
- `JSON_DIR`: `data/json/` (CRM databases)
- `STORAGE_DIR`: `storage/` (generated dashboard data)
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

**Administration:** `/admin/*` - User management (admin only)

**Account:** `/account/*` - User profile and settings

### Key Components

**Shared Components (`frontend/src/components/`):**
- `Layout.tsx` - Main wrapper with header and sidebar
- `Sidebar.tsx` - Hover-activated sliding sidebar
- `Footer.tsx` - Footer component
- `ProtectedRoute.tsx` - Route wrapper requiring authentication

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
- `whiteboardService.ts` - Whiteboard posts and replies
- `usersService.ts` - User management (admin)
- `profileService.ts` - User profile operations

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
- `backend/src/constants/shared.py` - `SHARED_PREFERENCE_KEYS`
- `frontend/src/constants/shared.ts` - `SHARED_PREFERENCE_KEYS`

Current shared keys: `transport_infra`, `energy_infra`, `us_market`, `emerging_markets`, `asia_em`, `africa_em`, `emea_em`, `vietnam`, `mongolia`, `turkey`

## ETL Pipeline

### Dashboard ETL (`etl/read_dashboard.py`)

Extracts data from specific Excel cell ranges:
- **Sovereign Yields**: Rows 15-33 (domestic & USD denominated)
- **Corporate Yields**: Rows 39-44 (AAA to High Yield)
- **FX Rates**: Rows 50-53 (currency pairs with changes)
- **Central Bank Rates**: Rows 92-95 (policy rates)
- **Credit Ratings**: Rows 220-241 (sovereign ratings & yields)

**Output**: `storage/dashboard.json`

### USA Historical Yields ETL (`etl/extract_usa_historical.py`)

Extracts 3-month historical yield data from USA sheet:
- **Data Source**: Rows 31-44 (date headers + 13 maturities: 1M-30Y)
- **Time Range**: Last 90 days of actual data (filters out future dates)
- **Validation**: Only includes dates where 10Y yield has non-null value
- **Output**: `storage/usa_historical_yields.json`

**Important**: Cell positions are hard-coded. If Excel layout changes, update row/column numbers in extraction methods.

### Excel COM Interface (`etl/excel_com_interface.py`)

Windows-only utility for Excel COM automation:
- Opens Excel via COM (win32com)
- Executes macros programmatically
- Performs refresh and recalculation operations
- **Cannot be used on Azure Linux** - COM is Windows-specific

### PDF Generator (`etl/pdf_generator.py`)

Generates PDF reports from market data:
- Creates formatted PDF documents
- Includes charts and tables
- Outputs to `storage/` directory

## CRM Data Management

### Four CRM Modules

**1. Liquidity Module (Capital Partners)**
Two-tier hierarchy:
- Capital Partners → Contacts
- Capital Partners have investment preferences and investment ranges (min/max/currency)
- Contacts have optional `team_name` text field for team designation
- Cascading deletes (partner deletion removes contacts)
- Sequential IDs: `cp_001`, `contact_001`

**2. Sponsors Module**
Two-tier structure:
- Corporates → Sponsor Contacts
- Timestamp IDs: `corp_1234567890123`, `scontact_1234567890123`

**3. Counsel Module**
Two-tier structure:
- Legal Advisors → Counsel Contacts
- Timestamp IDs: `legal_1234567890123`, `ccontact_1234567890123`
- Uses same investment preferences structure as Liquidity module

**4. Agents Module**
Two-tier structure:
- Agents → Agent Contacts
- Timestamp IDs: `agent_1234567890123`, `acontact_1234567890123`
- Similar pattern to Sponsors and Counsel modules

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
capital_partners.json      # Liquidity: Capital partners
contacts.json              # Liquidity: Contacts
corporates.json            # Sponsors: Corporate sponsors
sponsor_contacts.json      # Sponsors: Sponsor contacts
legal_advisors.json        # Counsel: Legal advisory firms
counsel_contacts.json      # Counsel: Lawyer contacts
agents.json                # Agents: Transaction agents
agent_contacts.json        # Agents: Agent contacts
deals.json                 # Deals: Deal pipeline
deal_participants.json     # Deals: Deal participants
investment_strategies.json # Saved investment strategies
investment_profiles.json   # Generated matching profiles
fx_rates.json              # Current FX rates
fx_rates_history.json      # Historical FX data
country_fundamentals.json  # Country fundamentals (basic info)
weekly_whiteboards.json    # Whiteboard: Weekly posts and replies
general_posts.json         # Whiteboard: General posts
users.json                 # User accounts (bcrypt hashed)
Country Json/              # Subfolder: Complete country data files (*_complete.json)
```

**Backup System**: All write operations create `.bak` files before overwriting.

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
- Preference alignment (shared keys)
- Ticket size overlap (min/max ranges)
- Geographic/sector fit

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

## Authentication System

**Technology**: Flask-Login with bcrypt password hashing

**Session Management**:
- Session-based authentication
- Secure cookies (httpOnly, sameSite)
- Protected routes use `@login_required` decorator

**User Roles**:
- Admin: Full access including user management
- Standard: Access to CRM and markets features

**Frontend Context**: `AuthContext.tsx` manages global auth state

**User Storage**: `backend/data/json/users.json` with bcrypt hashed passwords

## Common File Locations

**Where to find things:**

| What | Location |
|------|----------|
| Backend API routes | `backend/src/api/*.py` |
| Backend services (business logic) | `backend/src/services/*.py` |
| Backend configuration | `backend/src/config.py` |
| Frontend pages | `frontend/src/pages/*/` |
| Frontend services (API calls) | `frontend/src/services/*.ts` |
| Frontend types | `frontend/src/types/*.ts` |
| React components | `frontend/src/components/features/*/` |
| Shared constants | `backend/src/constants/shared.py` + `frontend/src/constants/shared.ts` |
| CRM data (JSON) | `backend/data/json/*.json` |
| Generated market data | `backend/storage/dashboard.json`, `backend/storage/usa_historical_yields.json` |
| Excel source files | `backend/data/excel/` |
| ETL scripts | `etl/*.py` |
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

### Modifying Excel Cell Ranges

If Excel layout changes:
1. Update `etl/read_dashboard.py` - Row/column numbers in extraction methods
2. Test ETL: `python etl/read_dashboard.py`
3. Verify output: Check `storage/dashboard.json`

### Adding Investment Matching Criteria

1. **Update backend constants**: `backend/src/constants/shared.py`
2. **Update frontend constants**: `frontend/src/constants/shared.ts`
3. **Update preference grids**: Liquidity, Sponsors, and Counsel modules
4. **Regenerate profiles**: `POST /api/investment-matches`

### Adding Country Fundamentals Data

Country fundamentals are stored in two places:
1. **Basic Data**: `data/json/country_fundamentals.json` - Contains name, slug, capital, region, basic metrics
2. **Complete Data**: `data/json/Country Json/*_complete.json` - Contains comprehensive IMF Article IV, EBRD/ADB, and IMI data

**Supported Countries**: Armenia, Mongolia, Turkiye, Uzbekistan, Vietnam

**To add a new country**:
1. Add country to `country_fundamentals.json` with required fields (name, slug, capital, region)
2. Create `{CountryName}_complete.json` in `Country Json/` folder
3. Update `COMPLETE_DATA_FILES` mapping in `backend/src/api/countries.py`
4. Add route in `frontend/src/App.tsx` (e.g., `/countryname`)
5. Create page component in `frontend/src/pages/markets/{CountryName}Page.tsx`
6. Update navigation in Layout.tsx and Sidebar.tsx

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
- pandas 2.1.4 - Data manipulation for ETL
- openpyxl 3.1.2 - Excel file reading (read-only)
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

Full stack with all features:
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: ETL (when needed)
cd etl
python read_dashboard.py
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

**Excel COM**: Remains on Windows local machine (COM not supported on Azure Linux)

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

- **Excel Must Be Closed**: COM operations fail if Excel is open
- **Windows Only COM**: COM automation only works on Windows (not Azure Linux)
- **Read-Only ETL**: ETL scripts never modify Excel files (read-only mode)
- **Hard-Coded Cell Positions**: Excel layout changes require code updates in ETL scripts
- **JSON Backups**: `.bak` files automatically created before overwriting any JSON file
- **Relative Imports**: Backend uses relative imports (e.g., `from ..services.investment_profiles import ...`)
- **Path Configuration**: Backend paths are computed from `BASE_DIR` in config.py
- **Session-Based Auth**: API uses Flask sessions with cookies - frontend must send `credentials: 'include'`
- **Team Name Field**: Contacts have `team_name` as a text field (not a separate teams entity)

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

**Excel COM not available in cloud**: The `/tools` route is disabled for cloud deployment since Excel COM automation only works on Windows.

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
