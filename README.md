# Meridian Universal Dashboard

A full-stack financial markets intelligence platform with integrated CRM, built with Flask (Python) and React (TypeScript).

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Data Architecture](#data-architecture)
- [Development Workflow](#development-workflow)
- [API Conventions](#api-conventions)
- [Common Patterns](#common-patterns)

## Project Overview

**Meridian Universal Dashboard** transforms Excel-based market data into an interactive web application with:

- **Market Intelligence**: Real-time sovereign/corporate yields, FX rates, credit ratings for emerging markets
- **CRM System**: Unified management of capital partners, corporates, legal advisors, and transaction agents
- **Investment Matching**: Cross-CRM matching engine based on investment preferences
- **Deal Pipeline**: Deal tracking with participant management
- **Super Admin Portal**: System administration, data quality tools, bulk operations, feature flags

**Tech Stack:**
- **Backend**: Python 3.11+, Flask 3.0, Flask-Login, pandas, openpyxl
- **Frontend**: React 18, TypeScript 5, Vite, TailwindCSS, Recharts
- **Data**: JSON file-based storage with automatic backups

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Windows (for Excel COM automation features)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd "Dashboard Website"

# Backend setup
cd backend
pip install -r requirements/dev.txt
python run.py
# Backend runs on http://127.0.0.1:5000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173

# ETL (when needed)
cd etl
python read_dashboard.py  # Generates market data JSON
```

### Login Credentials

Default admin user is defined in `backend/data/json/users.json`.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Excel Workbooks                         │
│           (Market Data + Playbook Tracking)                  │
└────────────────┬────────────────────────────────────────────┘
                 │ (Read-only)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    ETL Pipeline (Python)                     │
│              Extracts data to JSON files                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 Flask Backend API (Port 5000)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Blueprints: auth, capital_partners, sponsors,       │   │
│  │  counsel, agents, deals, investment, admin, etc.     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services: matching, profiles, archives, cleanup     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data: JSON files (organizations, contacts, deals)   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│           React Frontend (Port 5173 - Dev)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Markets, CRM modules, Deals, Admin           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components: Forms, Tables, Charts, Navigation       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services: API clients for each backend module       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Backend Structure

### Directory Layout

```
backend/
├── src/                          # Source code
│   ├── api/                      # Route blueprints (Flask)
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── capital_partners.py  # Liquidity module API
│   │   ├── sponsors.py          # Sponsors module API
│   │   ├── counsel.py           # Counsel module API
│   │   ├── agents.py            # Agents module API
│   │   ├── deals.py             # Deals management API
│   │   ├── investment.py        # Investment matching API
│   │   ├── admin.py             # Super admin portal API
│   │   ├── playbook.py          # Playbook manager API
│   │   ├── countries.py         # Country fundamentals API
│   │   ├── countries_master.py  # Countries master list API
│   │   ├── fx_rates.py          # FX rates API
│   │   ├── whiteboard.py        # Collaboration API
│   │   ├── users.py             # User management API
│   │   └── profile.py           # User profile API
│   │
│   ├── services/                # Business logic layer
│   │   ├── investment_profiles.py    # Profile normalization
│   │   ├── investment_matching.py    # Matching algorithm
│   │   ├── deals_aggregator.py       # Deal aggregation
│   │   ├── archive_manager.py        # Archive/restore operations
│   │   ├── bulk_operations.py        # Bulk update/export/import
│   │   ├── data_cleanup.py           # Data quality scanning
│   │   ├── database_explorer.py      # Read-only DB explorer
│   │   ├── endpoint_discovery.py     # API playground
│   │   └── feature_flags.py          # Feature flag management
│   │
│   ├── utils/                   # Utilities
│   │   ├── json_store.py        # JSON file I/O with backups
│   │   └── audit_logger.py      # Audit logging for admin actions
│   │
│   ├── constants/               # Shared constants
│   │   └── shared.py            # Investment preference keys
│   │
│   ├── models/                  # Data models (Pydantic/dataclasses)
│   ├── config.py                # Flask configuration
│   └── app.py                   # Flask application factory
│
├── data/                        # Data storage
│   ├── excel/                   # Excel source files
│   │   └── The Playbook.xlsx    # Main data source
│   │
│   └── json/                    # JSON database files
│       ├── organizations.json          # ALL CRM organizations (unified)
│       ├── unified_contacts.json       # ALL CRM contacts (unified)
│       ├── deals.json                  # Deal pipeline
│       ├── users.json                  # User accounts
│       ├── countries_master.json       # Investment preference countries (90+)
│       ├── country_fundamentals.json   # Market data countries (5)
│       ├── fx_rates.json               # Current FX rates
│       ├── investment_strategies.json  # Saved strategies
│       ├── feature_flags.json          # Feature flags
│       ├── audit_log.json              # Admin audit trail
│       ├── playbook_*.json             # Playbook sheets
│       ├── super_admin_notes.json      # Admin notes
│       ├── weekly_whiteboards.json     # Team posts
│       └── Country Json/               # Complete country data
│
├── storage/                     # Generated files
│   ├── dashboard.json           # Market data (from ETL)
│   ├── usa_historical_yields.json
│   └── logs/                    # Application logs
│
├── tests/                       # Test suite
│   ├── test_api/
│   └── test_services/
│
├── migrations/                  # Migration documentation
├── run.py                       # Development server
├── startup.py                   # Production entry point
└── requirements/                # Python dependencies
    ├── dev.txt                  # Development
    └── prod.txt                 # Production
```

### Backend Patterns

#### 1. Flask Application Factory (`app.py`)

```python
def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    login_manager.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)

    # Register blueprints
    from .api import auth_bp, capital_partners_bp, deals_bp, admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(capital_partners_bp)
    # ... more blueprints

    return app
```

#### 2. Blueprint Structure

Each API module is a Flask blueprint:

```python
# backend/src/api/capital_partners.py
from flask import Blueprint, jsonify, request
from flask_login import login_required

capital_partners_bp = Blueprint('capital_partners', __name__, url_prefix='/api')

@capital_partners_bp.route('/capital-partners', methods=['GET'])
@login_required
def get_capital_partners():
    # Business logic here
    return jsonify({"success": True, "data": partners})
```

#### 3. Service Layer

Services contain reusable business logic:

```python
# backend/src/services/investment_matching.py
def filter_profiles(profiles, preference_filters, ticket_range):
    """Filter profiles based on investment criteria"""
    filtered = []
    for profile in profiles:
        if matches_criteria(profile, preference_filters, ticket_range):
            filtered.append(profile)
    return filtered
```

#### 4. JSON Storage Pattern

All data operations use the JSON store utility:

```python
from ..utils.json_store import read_json_list, write_json_file, find_by_id

# Read data
organizations = read_json_list(json_dir / 'organizations.json')

# Find by ID
org = find_by_id(organizations, 'id', 'cp_001')

# Update and write (automatic backup)
org['name'] = 'Updated Name'
write_json_file(json_dir / 'organizations.json', organizations)
```

#### 5. Authentication

Flask-Login with bcrypt password hashing:

```python
# Protect routes
@login_required
def protected_route():
    current_user.username  # Access logged-in user

# Super admin check
def require_super_admin():
    if not current_user.is_super_admin:
        return jsonify({"success": False, "message": "Access denied"}), 403
```

### Key Backend Concepts

**Unified Organizations Architecture:**
- All organizations (capital partners, corporates, legal advisors, agents) are in `organizations.json`
- Use `organization_type` field to filter: `"capital_partner"`, `"corporate"`, `"legal_advisor"`, `"agent"`
- All contacts are in `unified_contacts.json` linked by `organization_id`

**Two Countries Systems:**
1. **Countries Master** (`countries_master.json`): 90+ countries for investment preferences
2. **Country Fundamentals** (`country_fundamentals.json`): 5 countries with full market data

**Audit Logging:**
- Super admin actions are automatically logged to `audit_log.json`
- Includes user, action, entity type, affected IDs, timestamp

## Frontend Structure

### Directory Layout

```
frontend/
├── src/
│   ├── pages/                   # Page components (feature-based)
│   │   ├── home/
│   │   │   └── NewHomePage.tsx        # Landing page
│   │   │
│   │   ├── markets/                   # Market intelligence pages
│   │   │   ├── ArmeniaPage.tsx
│   │   │   ├── MongoliaPage.tsx
│   │   │   ├── TurkiyePage.tsx
│   │   │   ├── UzbekistanPage.tsx
│   │   │   ├── VietnamPage.tsx
│   │   │   └── USAHistoricalYieldsPage.tsx
│   │   │
│   │   ├── liquidity/                 # Liquidity module (Capital Partners)
│   │   │   ├── CapitalPartnersList.tsx
│   │   │   ├── ContactsList.tsx
│   │   │   └── CalendarView.tsx       # Unified CRM calendar
│   │   │
│   │   ├── sponsors/                  # Sponsors module
│   │   │   ├── CorporatesTableView.tsx
│   │   │   └── SponsorContactsList.tsx
│   │   │
│   │   ├── counsel/                   # Counsel module
│   │   │   ├── LegalAdvisorsTableView.tsx
│   │   │   └── CounselContactsList.tsx
│   │   │
│   │   ├── agents/                    # Agents module
│   │   │   ├── AgentsTableView.tsx
│   │   │   └── AgentContactsList.tsx
│   │   │
│   │   ├── deals/                     # Deal pipeline
│   │   │   ├── DealsList.tsx
│   │   │   ├── DealDetails.tsx
│   │   │   └── InvestmentStrategiesPage.tsx
│   │   │
│   │   ├── admin/                     # Administration
│   │   │   ├── UserManagement.tsx      # User management (admin)
│   │   │   ├── SuperAdminHome.tsx      # Super admin portal home
│   │   │   ├── SuperAdminSettings.tsx  # System configuration
│   │   │   ├── MyNotes.tsx             # Personal notes
│   │   │   ├── PlaybookManager.tsx     # Playbook sheets manager
│   │   │   └── CountriesMasterManager.tsx  # Countries list
│   │   │
│   │   └── auth/                      # Authentication
│   │       └── LoginPage.tsx
│   │
│   ├── components/              # React components
│   │   ├── common/              # Layout components
│   │   │   ├── Layout.tsx             # Main wrapper with header/sidebar
│   │   │   ├── Sidebar.tsx            # Hover-activated sliding sidebar
│   │   │   ├── Footer.tsx
│   │   │   ├── ProtectedRoute.tsx     # Auth wrapper
│   │   │   └── SuperAdminLayout.tsx   # Super admin layout
│   │   │
│   │   ├── features/            # Feature-specific components
│   │   │   ├── capital-partners/
│   │   │   │   ├── CapitalPartnerForm.tsx
│   │   │   │   └── CapitalPartnerCard.tsx
│   │   │   │
│   │   │   ├── sponsors/
│   │   │   │   └── CorporateForm.tsx
│   │   │   │
│   │   │   ├── counsel/
│   │   │   │   └── LegalAdvisorForm.tsx
│   │   │   │
│   │   │   ├── agents/
│   │   │   │   └── AgentForm.tsx
│   │   │   │
│   │   │   ├── deals/
│   │   │   │   ├── DealForm.tsx
│   │   │   │   └── DealCard.tsx
│   │   │   │
│   │   │   ├── countries/
│   │   │   │   ├── CountryTabs.tsx
│   │   │   │   ├── CountryFundamentals.tsx
│   │   │   │   └── MacroAnalysisStructured.tsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── SystemStats.tsx
│   │   │       └── DatabaseExplorer.tsx
│   │   │
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── CountryMultiSelect.tsx   # Countries dropdown
│   │   │   ├── SortableTableHeader.tsx
│   │   │   └── AnimatedStat.tsx
│   │   │
│   │   └── shared/              # Shared components
│   │       └── InteractiveMermaidChart.tsx
│   │
│   ├── services/                # API clients
│   │   ├── api.ts                      # Base API config
│   │   ├── authService.ts              # Authentication
│   │   ├── capitalPartnersService.ts   # Liquidity API
│   │   ├── sponsorsService.ts          # Sponsors API
│   │   ├── counselService.ts           # Counsel API
│   │   ├── agentsService.ts            # Agents API
│   │   ├── dealsService.ts             # Deals API
│   │   ├── investmentService.ts        # Investment matching
│   │   ├── marketsService.ts           # Market data
│   │   ├── fxService.ts                # FX rates
│   │   ├── countriesService.ts         # Country fundamentals
│   │   ├── countriesMasterService.ts   # Countries master
│   │   ├── whiteboardService.ts        # Collaboration
│   │   ├── usersService.ts             # User management
│   │   ├── profileService.ts           # User profile
│   │   ├── adminService.ts             # Super admin
│   │   └── playbookService.ts          # Playbook
│   │
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx             # Authentication state
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCountUp.ts               # Animated counters
│   │   ├── useScrollReveal.ts          # Scroll animations
│   │   └── useTableSort.ts             # Table sorting
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── liquidity.ts                # Capital partners types
│   │   ├── sponsors.ts
│   │   ├── counsel.ts
│   │   ├── agents.ts
│   │   ├── investment.ts
│   │   ├── admin.ts
│   │   ├── playbook.ts
│   │   ├── countriesMaster.ts
│   │   └── markets.ts
│   │
│   ├── constants/               # Frontend constants
│   │   ├── shared.ts                   # Synced with backend
│   │   └── countries.ts                # Country lists
│   │
│   ├── utils/                   # Utility functions
│   │   └── currencyMappings.ts
│   │
│   ├── lib/                     # Third-party configs
│   │
│   ├── config.ts                # API base URL config
│   ├── App.tsx                  # Main app with routes
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles (Tailwind)
│
├── public/
│   ├── assets/                  # Images and logos
│   │   ├── logo-white.jpg
│   │   ├── logo-black.jpg
│   │   └── countries/           # Country images
│   │       ├── armenia/
│   │       ├── mongolia/
│   │       ├── turkiye/
│   │       ├── uzbekistan/
│   │       └── vietnam/
│   │
│   └── documents/               # Static documents
│
├── index.html                   # HTML template
├── package.json                 # Node dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite bundler config
└── tailwind.config.js           # Tailwind CSS config
```

### Frontend Patterns

#### 1. Page Components

Pages represent complete views and handle routing:

```tsx
// frontend/src/pages/liquidity/CapitalPartnersList.tsx
import { useState, useEffect } from 'react';
import { getCapitalPartners } from '../../services/capitalPartnersService';
import CapitalPartnerCard from '../../components/features/capital-partners/CapitalPartnerCard';

const CapitalPartnersList = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    const response = await getCapitalPartners();
    if (response.success) {
      setPartners(response.data);
    }
  };

  return (
    <div>
      {partners.map(partner => (
        <CapitalPartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  );
};
```

#### 2. Feature Components

Reusable components for specific features:

```tsx
// frontend/src/components/features/capital-partners/CapitalPartnerForm.tsx
interface Props {
  partner?: CapitalPartner;
  onSave: (data: CapitalPartner) => void;
  onCancel: () => void;
}

const CapitalPartnerForm: React.FC<Props> = ({ partner, onSave, onCancel }) => {
  const [formData, setFormData] = useState(partner || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

#### 3. Service Layer (API Clients)

Services handle all backend communication:

```typescript
// frontend/src/services/capitalPartnersService.ts
import { API_BASE_URL } from '../config';

export const getCapitalPartners = async () => {
  const response = await fetch(`${API_BASE_URL}/api/capital-partners`, {
    credentials: 'include'  // CRITICAL: Include auth cookies
  });
  return response.json();
};

export const createCapitalPartner = async (data: CapitalPartner) => {
  const response = await fetch(`${API_BASE_URL}/api/capital-partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return response.json();
};
```

#### 4. TypeScript Types

Strong typing for all data structures:

```typescript
// frontend/src/types/liquidity.ts
export interface CapitalPartner {
  id: string;
  organization_type: 'capital_partner';
  name: string;
  country: string;
  preferences: InvestmentPreferences;
  investment_min: number;
  investment_max: number;
  currency: string;
  countries: string[];  // Array of country IDs
  starred: boolean;
  created_at: string;
  last_updated: string;
}

export interface InvestmentPreferences {
  investment_grade: 'Y' | 'N' | 'any';
  high_yield: 'Y' | 'N' | 'any';
  transport_infra: 'Y' | 'N' | 'any';
  energy_infra: 'Y' | 'N' | 'any';
  // ... more preferences
}
```

#### 5. Navigation System

Two-level navigation:
1. **Header Dropdowns**: Main sections (defined in `Layout.tsx`)
2. **Sliding Sidebar**: Hover-activated submenu (defined in `Sidebar.tsx`)

```tsx
// Always update BOTH files when changing navigation
// frontend/src/components/common/Layout.tsx
// frontend/src/components/common/Sidebar.tsx
```

### Key Frontend Concepts

**API Authentication:**
- All protected endpoints require `credentials: 'include'`
- Auth state managed by `AuthContext`
- Protected routes use `ProtectedRoute` wrapper

**Component Organization:**
- `pages/`: Complete views (one per route)
- `components/features/`: Feature-specific reusable components
- `components/ui/`: Generic reusable UI components
- `components/common/`: Layout and navigation

**State Management:**
- React hooks (`useState`, `useEffect`)
- Context API for global state (auth)
- No Redux/Zustand (simple state needs)

## Data Architecture

### Unified CRM Structure

**Organizations** (`organizations.json`):
```json
{
  "id": "cp_001",
  "organization_type": "capital_partner",  // Discriminator
  "name": "Scottish Widows",
  "country": "UK",
  "preferences": { /* ... */ },
  "investment_min": 0,
  "investment_max": 1000000000000,
  "currency": "USD",
  "countries": ["mongolia", "turkiye"],    // Investment targets
  "starred": false
}
```

**Contacts** (`unified_contacts.json`):
```json
{
  "id": "contact_001",
  "organization_id": "cp_001",             // Links to parent
  "organization_type": "capital_partner",  // Matches parent
  "name": "John Doe",
  "role": "Portfolio Manager",
  "email": "john@example.com",
  "team_name": "DCM Team",
  "meeting_history": [
    {
      "date": "2025-01-15",
      "notes": "Discussed investment opportunities",
      "participants": "John Doe, CT",
      "next_follow_up": "2025-02-15",
      "id": "meeting_001"
    }
  ],
  "last_contact_date": "2025-01-15",
  "next_contact_reminder": "2025-02-15"
}
```

### Two Countries Systems

**1. Countries Master** (Investment Preferences):
```json
// countries_master.json - 90+ countries
{
  "id": "mongolia",
  "name": "Mongolia",
  "active": true,
  "display_order": 52
}
```

**2. Country Fundamentals** (Market Data):
```json
// country_fundamentals.json - 5 countries
{
  "name": "Mongolia",
  "slug": "mongolia",
  "capital": "Ulaanbaatar",
  "region": "Asia",
  "gdp_usd_bn": 15.1
}
```

## Development Workflow

### Adding a New CRM Feature

1. **Backend API** (`backend/src/api/module.py`):
```python
@module_bp.route('/endpoint', methods=['GET'])
@login_required
def get_data():
    return jsonify({"success": True, "data": []})
```

2. **TypeScript Types** (`frontend/src/types/module.ts`):
```typescript
export interface MyEntity {
  id: string;
  name: string;
}
```

3. **Service** (`frontend/src/services/moduleService.ts`):
```typescript
export const getMyEntities = async () => {
  const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
    credentials: 'include'
  });
  return response.json();
};
```

4. **Page Component** (`frontend/src/pages/module/Page.tsx`):
```tsx
import { getMyEntities } from '../../services/moduleService';

const Page = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const response = await getMyEntities();
    if (response.success) setData(response.data);
  };

  return <div>{/* Render data */}</div>;
};
```

5. **Add Route** (`frontend/src/App.tsx`):
```tsx
<Route path="/module" element={<Page />} />
```

6. **Update Navigation** (BOTH files):
   - `frontend/src/components/common/Layout.tsx`
   - `frontend/src/components/common/Sidebar.tsx`

### Adding a Country to Investment Preferences

Super admin portal → Countries Master Manager → Add Country

No code changes required! The country immediately appears in:
- Organization forms (CountryMultiSelect dropdown)
- Investment matching filters
- CSV exports

### Adding a Country Market Page

Requires data files and code changes:

1. Add to `country_fundamentals.json`
2. Create `{Country}_complete.json` with IMF/EBRD data
3. Update `COMPLETE_DATA_FILES` in `backend/src/api/countries.py`
4. Create page component: `frontend/src/pages/markets/{Country}Page.tsx`
5. Add route in `App.tsx`
6. Update navigation in Layout.tsx and Sidebar.tsx

## API Conventions

### Request Format

```typescript
// GET request
fetch(`${API_BASE_URL}/api/resource`, {
  credentials: 'include'
});

// POST request
fetch(`${API_BASE_URL}/api/resource`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data)
});
```

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operation completed",
  "count": 10  // For list endpoints
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Authentication

- Protected routes require `@login_required` decorator
- Super admin routes also check `current_user.is_super_admin`
- Frontend must send `credentials: 'include'` to include session cookie

## Common Patterns

### CSV Export Pattern

**Backend:**
```python
@bp.route('/resource/export/csv', methods=['GET'])
@login_required
def export_csv():
    data = get_data()
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=['id', 'name'])
    writer.writeheader()
    writer.writerows(data)

    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=export.csv'
    return response
```

**Frontend:**
```typescript
export const downloadCSV = async () => {
  const response = await fetch(`${API_BASE_URL}/api/resource/export/csv`, {
    credentials: 'include'
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.csv';
  a.click();
};
```

### Form Pattern

```tsx
const [formData, setFormData] = useState<MyType>({});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  const newErrors = validateForm(formData);
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Submit
  const response = await createResource(formData);
  if (response.success) {
    // Success handling
  }
};
```

### Table Sorting Pattern

```tsx
import { useTableSort } from '../../hooks/useTableSort';

const Table = ({ data }) => {
  const { sortedData, sortField, sortDirection, handleSort } = useTableSort(data, 'name');

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
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => <tr key={row.id}>...</tr>)}
      </tbody>
    </table>
  );
};
```

### Multi-Select Countries Pattern

```tsx
import CountryMultiSelect from '../../components/ui/CountryMultiSelect';

const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

<CountryMultiSelect
  selectedCountries={selectedCountries}
  onChange={setSelectedCountries}
/>
```

## File Naming Conventions

**Backend:**
- Blueprints: `snake_case.py` (e.g., `capital_partners.py`)
- Services: `snake_case.py` (e.g., `investment_matching.py`)
- Functions: `snake_case` (e.g., `get_capital_partners`)

**Frontend:**
- Components: `PascalCase.tsx` (e.g., `CapitalPartnerForm.tsx`)
- Services: `camelCase.ts` (e.g., `capitalPartnersService.ts`)
- Types: `camelCase.ts` (e.g., `liquidity.ts`)
- Functions: `camelCase` (e.g., `getCapitalPartners`)

**Data Files:**
- JSON: `snake_case.json` (e.g., `unified_contacts.json`)
- Excel: `Title Case.xlsx` (e.g., `The Playbook.xlsx`)

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

**Development:**
- Backend: `python run.py` (port 5000)
- Frontend: `npm run dev` (port 5173)

**Production:**
- Backend: Gunicorn on Azure App Service (Linux)
- Frontend: Azure Static Web Apps
- Excel COM: Windows local machine (not cloud)

## Documentation

- **CLAUDE.md**: Comprehensive guide for AI assistants
- **README.md**: This file - code structure guide
- **docs/**: Detailed documentation by category
- **ETL README**: `etl/README.md`
- **Components README**: `frontend/src/components/README.md`

## Support

For questions or issues:
1. Check CLAUDE.md for detailed explanations
2. Review docs/ folder for specific topics
3. File issues at GitHub repository

---

**Happy coding! 🚀**
