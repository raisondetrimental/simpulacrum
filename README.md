# Meridian Universal Dashboard

A full-stack financial intelligence platform for emerging markets infrastructure finance combining market data analysis with a sophisticated CRM for managing relationships across capital partners, sponsors, legal advisors, and transaction agents.

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Windows (for local development)

### Development Setup

```bash
# Backend
cd backend
pip install -r requirements/dev.txt
python run.py
# Runs on http://127.0.0.1:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Login

Default credentials are defined in `backend/data/json/users.json`.

## Documentation

**📖 Start here:** [CLAUDE.md](CLAUDE.md) - Comprehensive project guide with:
- Essential commands and workflows
- Critical architecture patterns (unified CRM, two countries systems, investment matching)
- Development patterns and code examples
- API conventions and authentication
- Common gotchas and troubleshooting

**Additional Resources:**
- [Documentation Hub](docs/README.md) - Organized by category
- [Backend API](backend/README.md) - Backend-specific info
- [Component Guide](frontend/src/components/README.md) - Frontend components
- [Azure Deployment](AZURE_DEPLOYMENT.md) - Production deployment guide

## Tech Stack

- **Backend**: Python 3.11+, Flask 3.0, Flask-Login, bcrypt
- **Frontend**: React 18, TypeScript 5, Vite 4.4, Tailwind CSS
- **Data**: JSON file-based with automatic backups
- **Deployment**: Azure App Service (backend) + Azure Static Web Apps (frontend)

## Key Features

### Four-Module Unified CRM
- **Capital Partners (Liquidity)**: Insurance companies, pension funds, asset managers
- **Sponsors (Corporates)**: Infrastructure project sponsors and developers
- **Counsel (Legal Advisors)**: Law firms and legal advisors
- **Agents**: Transaction agents and intermediaries
- Unified architecture with single `organizations.json` and `unified_contacts.json`
- Interactive calendar with drag-and-drop meeting scheduling and editing
- Investment matching engine based on preferences, countries, and ticket size

### Pipeline Strategies & Deal Origination
- **Pipeline Strategies**: Track opportunities through 6-stage workflow (ideation → ready to close)
- **Damn Effect Strategy Hub**: Central landing page for deal origination workflow
- **Strategies Sandbox**: Test investment frameworks and match partners
- **Deals Database**: Browse precedent transactions for reference
- **Related Deals**: Link pipeline strategies to similar precedent transactions
- Home page pipeline visualisation with stage breakdown and health metrics

### Market Intelligence
- **5 Emerging Markets**: Armenia, Mongolia, Türkiye, Uzbekistan, Vietnam
- Macroeconomic analysis with IMF Article IV data
- Capital markets data (sovereign yields, policy rates, FX rates, corporate bonds)
- Infrastructure gap analysis from EBRD/ADB reports
- Yield curve tracking with historical data
- Weekly market reports with HTML generation

### Super Admin Portal (13+ Features)
- System statistics dashboard with real-time metrics
- Personal notes manager with TipTap rich text editor
- The Playbook Manager (6 operational sheets)
- Countries master management (90+ countries for investment preferences)
- Database explorer with read-only JSON file viewing
- Archive management with auto-archive functionality
- Data quality scanner for orphaned contacts and invalid participants
- Bulk operations with dry-run preview
- Feature flags management
- API playground for endpoint testing
- Security configuration viewer
- API keys management and testing
- Comprehensive audit log with filters

### Team Collaboration
- Threaded whiteboard system for team discussions
- User assignment for meetings and tasks
- Shared announcement system
- Cross-module contact and meeting tracking

## Project Structure

```
.
├── backend/              # Flask REST API
│   ├── src/
│   │   ├── api/         # 19 Flask blueprints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   └── data/json/       # JSON database
│
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # React components
│   │   ├── services/    # API clients
│   │   └── types/       # TypeScript types
│   └── public/
│
├── docs/                # Documentation (by category)
├── scripts/             # Utility scripts
├── shared/              # Shared constants (frontend/backend)
└── CLAUDE.md           # 📖 MAIN DOCUMENTATION - START HERE
```

## Common Commands

```bash
# Development
cd backend && python run.py           # Start backend
cd frontend && npm run dev            # Start frontend

# Code quality
cd backend && black src/              # Format Python
cd backend && pytest                  # Run tests
cd frontend && npm run lint           # Lint TypeScript
cd frontend && npm test               # Run tests

# Build
cd frontend && npm run build          # Production build
```

## Deployment

- **Frontend**: Azure Static Web Apps
- **Backend**: Azure App Service (Linux)
- **Database**: JSON files in persistent storage

See [Azure Deployment Guide](docs/deployment/Azure_Deployment_Guide.md) for details.

## Critical Architecture Patterns

### 1. Unified CRM Data Model (MOST IMPORTANT)

Unlike traditional multi-module systems, ALL CRM data uses a unified architecture:
- **organizations.json**: ALL organizations (capital partners, sponsors, counsel, agents) in ONE file
- **unified_contacts.json**: ALL contacts across all four modules in ONE file
- **Discriminator Pattern**: Use `organization_type` field to filter by module
- **Unified DAL**: `backend/src/utils/unified_dal.py` handles all data access

### 2. Two Countries Systems (OFTEN CONFUSED)

The system has TWO SEPARATE countries databases:
- **Countries Master** (`countries_master.json`): 90+ countries for investment preferences, managed by super admin
- **Country Fundamentals** (`country_fundamentals.json`): 5 countries with full market data pages (Armenia, Mongolia, Türkiye, Uzbekistan, Vietnam)

### 3. Authentication (CRITICAL)

**ALL authenticated API calls MUST include `credentials: 'include'`**

```typescript
// ✅ CORRECT
fetch(`${API_BASE_URL}/api/deals`, { credentials: 'include' })

// ❌ WRONG - Will redirect to login, return HTML instead of JSON
fetch(`${API_BASE_URL}/api/deals`)
```

### 4. Navigation System (MANUAL SYNC REQUIRED)

When adding/changing navigation, you MUST update BOTH files:
- `frontend/src/components/common/Layout.tsx` (header dropdowns)
- `frontend/src/components/common/Sidebar.tsx` (sliding sidebar)

### 5. Pipeline vs Deals

- **Pipeline Strategies** (`/api/pipeline`): Active opportunities tracked through 6-stage workflow
- **Deals Database** (`/api/deals`): Precedent transactions for reference
- Pipeline strategies can link to deals via `related_deals` array field

### 6. Calendar & Meeting Management

- Interactive calendar with drag-and-drop rescheduling
- Create new meetings or edit scheduled meetings from calendar
- Meeting notes pages support dual mode (create new / edit existing)
- Works identically across all four CRM modules

## Common Gotchas & Troubleshooting

1. **Missing `credentials: 'include'`** → API returns HTML login page instead of JSON
2. **Looking for separate CRM files** → Use `organizations.json` filtered by `organization_type`
3. **Country not found** → Check if using countries master (90+) vs country fundamentals (5)
4. **Menu appears in header but not sidebar** → Update BOTH `Layout.tsx` AND `Sidebar.tsx`
5. **Investment matching fails** → Verify shared preference keys match in backend and frontend
6. **Organization type typo** → Use exact values: `"capital_partner"`, `"sponsor"`, `"counsel"`, `"agent"`
7. **CORS errors** → Add frontend URL to `backend/src/config.py` CORS_ORIGINS
8. **Super admin access denied** → User needs `"is_super_admin": true` flag in `users.json`
9. **Dashboard stats show 0** → Likely missing `credentials: 'include'` in fetch calls
10. **Pipeline vs Deals confusion** → Pipeline tracks active opportunities; Deals are precedent transactions

See [CLAUDE.md](CLAUDE.md) "Common Gotchas and Troubleshooting" section for detailed solutions.

## Development Workflows

### Adding a New API Endpoint

1. Create blueprint in `backend/src/api/myfeature.py`
2. Register blueprint in `backend/src/app.py`
3. Create service file in `frontend/src/services/myFeatureService.ts` (with `credentials: 'include'`)
4. Define TypeScript types in `frontend/src/types/myfeature.ts`
5. Create page component in `frontend/src/pages/myfeature/`
6. Add route in `frontend/src/App.tsx`
7. Update navigation in BOTH `Layout.tsx` and `Sidebar.tsx`

### Adding a New Organization Type (Rare)

1. Add new value to `organization_type` discriminator logic
2. Update `unified_dal.py` to support new type
3. Create blueprint in `backend/src/api/`
4. Add frontend service, types, and pages
5. Update navigation and investment matching if needed

### Adding a Country to Countries Master

1. Super admin navigates to `/admin/super/countries`
2. Click "Add New Country"
3. Fill in name, active status, display order
4. Save → Immediately available for selection in organization forms
5. NOTE: This does NOT create a market data page (requires fundamentals data)

## Getting Help

- **New to the project?** Read [CLAUDE.md](CLAUDE.md) from start to finish
- **Need specific info?** Check [docs/README.md](docs/README.md) for categorized documentation
- **Troubleshooting?** See CLAUDE.md "Common Gotchas and Troubleshooting" section
- **API Reference?** See [Backend API](backend/README.md) for endpoint documentation

## Contributing

When making changes:
- Follow existing patterns in CLAUDE.md
- Update both backend and frontend when adding features
- Maintain TypeScript types that match backend data structures
- Keep CLAUDE.md updated with new patterns or gotchas
- Run tests before committing: `pytest` (backend), `npm test` (frontend)
- Use `black` for Python formatting, ESLint for TypeScript

## License

Proprietary - Meridian Universal

---

**For complete documentation, architecture details, and development patterns, see [CLAUDE.md](CLAUDE.md)**
