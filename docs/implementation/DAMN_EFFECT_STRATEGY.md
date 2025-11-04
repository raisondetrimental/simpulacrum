# Damn Effect Strategy System

## Overview

The **Damn Effect Strategy** is a capital partner management system that allows users to filter and analyze potential investment partners based on 22 qualitative attributes. The system consists of multiple pages for viewing, editing, and managing capital partner data and associated contacts.

## System Architecture

### Data Flow

```
Excel (Institutions.xlsx)
         ↓
[Python Script: process_institutions.py]
         ↓
JSON Files (data/json/)
         ↓
[Flask API: /api/institutions, /api/contacts]
         ↓
[React Frontend Pages]
```

### Backend Components

#### 1. Data Storage
- **Location**: `data/json/institutions.json` and `data/json/contacts.json`
- **Backup**: Automatic `.bak` files created on every save operation
- **Source**: Originally generated from `data/excel/Institutions.xlsx`

#### 2. Flask API Endpoints

**Institutions Endpoints** (`api/excel_api.py`):
- `GET /api/institutions` - Fetch all capital partners
- `POST /api/institutions/save` - Save updated institutions data
  - Validates required fields: Capital Partner, Type, Country, Relationship
  - Creates backup before saving
  - Auto-deletes associated contacts when a partner is removed

**Contacts Endpoints**:
- `GET /api/contacts` - Fetch all contacts
- `POST /api/contacts/save` - Save updated contacts data
  - Validates required fields: Capital Partner, Name, Role, Email, Relationship
  - Optional fields: DISC, Notes
  - Creates backup before saving

**Saved Filters Endpoints**:
- `GET /api/filters` - Fetch saved filter configurations
- `POST /api/filters/save` - Save filter presets

#### 3. Processing Script

**`scripts/process_institutions.py`**:
- Converts `Institutions.xlsx` to JSON format
- Usage: `python process_institutions.py --input data/excel/Institutions.xlsx --output data/json/institutions.json`
- Preserves all column names and data types

### Frontend Pages

#### 1. Capital Partners (View) - `/damn-effect-strategy`

**Component**: `web/src/pages/DamnEffectStrategy.tsx`

**Features**:
- **Read-only table** displaying all capital partners
- **Tri-state filter toggles** for 22 attributes:
  - `—` (Not on) - No filter applied
  - `Y` (Yes) - Show only rows with "Y" in that column
  - `N` (No) - Show only rows with "N" in that column
- **Multi-filter logic**: Rows must satisfy ALL active filters simultaneously
- **Real-time filtering**: Instant table updates as toggles change

**Data Columns**:
- **Meta columns**: Capital Partner, Type, Country, Relationship
- **Filterable attributes** (22):
  - Investment types: Investment Grade, High Yield, Infra Debt, Senior Secured, Subordinated, Bonds, Loan Agreement
  - Special categories: Quasi-Sovereign Only, Public Bond High Yield
  - Markets: US Market, Emerging Markets, Asia EM, Africa EM, EMEA EM
  - Countries: Vietnam, Mongolia, Turkey
  - Sectors: Coal, Energy Infra, Transport Infra
  - Conditions: More Expensive than usual, Require Bank Guarantee

**Technical Implementation**:
```typescript
// Filter state management
type FilterState = 'any' | 'Y' | 'N';
const [filterStates, setFilterStates] = useState<Record<string, FilterState>>({});

// Filtering logic
const filteredData = useMemo(() => {
  return data.filter(row => {
    return filterableAttributes.every(attr => {
      const filterValue = filterStates[attr];
      if (filterValue === 'any') return true;
      const cellValue = (row[attr] || '').toUpperCase();
      return cellValue === filterValue;
    });
  });
}, [data, filterStates]);
```

#### 2. Capital Partners (Edit) - `/damn-effect-strategy-edit`

**Component**: `web/src/pages/DamnEffectStrategyEdit.tsx`

**Features**:
- **Two editing modes**:
  1. **Inline editing**: Click cells to cycle through values
     - Y/N attributes: cycles `Y → N → (blank) → Y`
     - Relationship: cycles `Strong → Medium → Weak → (blank) → Strong`
     - Capital Partner/Type/Country: Text input fields
  2. **Form editing**: Dropdown selector + comprehensive form
     - Edit existing partners or add new ones
     - Full validation and data entry

- **Edit mode toggle**: Switch between view-only and edit mode
- **Save/Discard changes**:
  - Save sends PUT request to `/api/institutions/save`
  - Discard reloads original data
- **Visual indicators**: Changed cells highlighted in yellow
- **Capital Partner Form**: Separate component for adding/editing via dropdown

**State Management**:
```typescript
const [data, setData] = useState<DataRow[]>([]);
const [initialData, setInitialData] = useState<DataRow[]>([]);
const [isEditMode, setIsEditMode] = useState(false);
const [selectedPartner, setSelectedPartner] = useState<string>('');
const [showForm, setShowForm] = useState(false);
```

**Save Logic**:
```typescript
const handleSave = async () => {
  const response = await fetch('http://127.0.0.1:5000/api/institutions/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  // Auto-deletes contacts from removed partners
  // Creates backup before saving
};
```

#### 3. Contacts (Unified View) - `/contacts`

**Component**: `web/src/pages/ContactsUnifiedPage.tsx`

**Features**:
- **Displays all contacts** linked to capital partners
- **Read-only table** with contact details:
  - Capital Partner, Name, Role, Email, Relationship
  - DISC personality type, Notes
- **Filter by Capital Partner**: Dropdown to show contacts from specific partner
- **Auto-sync**: Contacts deleted when parent capital partner is removed

#### 4. Contacts (Edit) - `/damn-effect-contacts-edit`

**Component**: `web/src/pages/DamnEffectContactsEdit.tsx`

**Features**:
- **Editable contacts table**
- **Add new contacts**: Form with dropdown for Capital Partner selection
- **Edit existing contacts**: Inline or form-based editing
- **Delete contacts**: Remove individual contacts
- **Validation**: Ensures all required fields are filled
- **Save to backend**: POST to `/api/contacts/save`

**Contact Data Structure**:
```typescript
{
  "Capital Partner": string,
  "Name": string,
  "Role": string,
  "Email": string,
  "Relationship": "Strong" | "Medium" | "Weak" | "",
  "DISC": string (optional),
  "Notes": string (optional)
}
```

#### 5. Saved Filters - `/saved-filters`

**Component**: `web/src/pages/SavedFiltersPage.tsx`

**Features**:
- **Save filter configurations**: Store current filter states as named presets
- **Load saved filters**: Quick apply previously saved filter combinations
- **Manage presets**: View, load, delete saved filter configurations
- **Persistence**: Stored in `data/json/filters.json` via API

**Filter Data Structure**:
```typescript
{
  "id": string,
  "name": string,
  "filters": Record<string, FilterState>,
  "createdAt": string (ISO date)
}
```

## Data Model

### Capital Partner (Institution)
```json
{
  "Capital Partner": "Example Bank",
  "Type": "Bank",
  "Country": "USA",
  "Relationship": "Strong",
  "Investment Grade": "Y",
  "High Yield": "N",
  "Infra Debt": "Y",
  // ... 19 more Y/N attributes
}
```

### Contact
```json
{
  "Capital Partner": "Example Bank",
  "Name": "John Doe",
  "Role": "Managing Director",
  "Email": "john@example.com",
  "Relationship": "Strong",
  "DISC": "D",
  "Notes": "Primary contact for infrastructure deals"
}
```

### Saved Filter
```json
{
  "id": "filter_1234567890",
  "name": "Infrastructure Focus",
  "filters": {
    "Infra Debt": "Y",
    "Investment Grade": "Y",
    "Coal": "N"
  },
  "createdAt": "2025-10-01T12:00:00.000Z"
}
```

## API Integration

### Frontend Data Fetching Pattern
```typescript
// Load institutions
const response = await fetch('http://127.0.0.1:5000/api/institutions');
const result = await response.json();
// result.success, result.data, result.count

// Save institutions
const saveResponse = await fetch('http://127.0.0.1:5000/api/institutions/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Backend Validation & Safety

1. **Required field validation**: All required fields checked before saving
2. **Automatic backups**: `.bak` file created before every write operation
3. **Cascade deletes**: Contacts auto-deleted when parent partner removed
4. **Type validation**: Ensures data is array of objects with correct structure

## Navigation Structure

The Damn Effect Strategy pages are grouped under the **"Tools"** dropdown in the main navigation:

```
Tools
├── Excel Refresh
├── PDF Generator
├── Capital Partners (View)    → /damn-effect-strategy
├── Capital Partners (Edit)    → /damn-effect-strategy-edit
├── Contacts                   → /contacts
└── Saved Filters             → /saved-filters
```

## File Locations

### Backend
- **API**: `api/excel_api.py`
- **Data Files**:
  - `data/json/institutions.json`
  - `data/json/contacts.json`
  - `data/json/filters.json`
- **Source Excel**: `data/excel/Institutions.xlsx`
- **Processing Script**: `scripts/process_institutions.py`

### Frontend
- **View Page**: `web/src/pages/DamnEffectStrategy.tsx`
- **Edit Page**: `web/src/pages/DamnEffectStrategyEdit.tsx`
- **Contacts Page**: `web/src/pages/ContactsUnifiedPage.tsx`
- **Contacts Edit**: `web/src/pages/DamnEffectContactsEdit.tsx`
- **Saved Filters**: `web/src/pages/SavedFiltersPage.tsx`
- **Form Component**: `web/src/components/CapitalPartnerForm.tsx`

## Usage Workflow

### 1. View and Filter Capital Partners
1. Navigate to **Tools → Capital Partners (View)**
2. Use tri-state toggles to filter by attributes
3. Multiple filters combine with AND logic
4. View filtered results in real-time

### 2. Edit Capital Partner Data
1. Navigate to **Tools → Capital Partners (Edit)**
2. Click "Edit Mode" button
3. **Option A**: Click cells to cycle through values
4. **Option B**: Use dropdown + form to edit/add partners
5. Click "Save Changes" (creates backup automatically)
6. Or click "Discard Changes" to revert

### 3. Manage Contacts
1. Navigate to **Tools → Contacts**
2. View all contacts or filter by capital partner
3. For editing, use the edit variant of the page
4. Add/edit/delete contacts as needed
5. Save changes to persist

### 4. Save and Load Filter Presets
1. Configure filters on the view page
2. Navigate to **Tools → Saved Filters**
3. Save current configuration with a name
4. Load saved filters when needed
5. Delete obsolete filter presets

## Technical Notes

### Tri-State Toggle Implementation
Each filterable attribute has three states:
- `'any'` (default): No filtering, show all rows
- `'Y'`: Show only rows where attribute = "Y"
- `'N'`: Show only rows where attribute = "N"

Blank cells fail both 'Y' and 'N' filters, ensuring clean filtering logic.

### Data Synchronization
- **Frontend state**: React useState hooks manage local data
- **Backend persistence**: Flask API writes to JSON files
- **Backup strategy**: `.bak` files prevent data loss
- **Cascade logic**: Deleting a capital partner removes all associated contacts

### Performance Considerations
- **useMemo hook**: Filtered data recalculated only when dependencies change
- **Local state**: Editing happens in-memory, saves batch to server
- **Optimistic updates**: UI updates immediately, errors handled gracefully

## Error Handling

1. **API connection errors**: Shows user-friendly message to check server
2. **Validation errors**: Returns 400 with specific field error messages
3. **File not found**: Returns 404 with file path information
4. **Save failures**: Backup preserved, original data unchanged
5. **Network errors**: Caught with try/catch, user notified

## Future Enhancements

Potential improvements to the system:
- Export filtered results to Excel/CSV
- Advanced search within table cells
- Sorting by column headers
- Batch edit operations
- Contact import from external sources
- Email integration for contacts
- Activity logging for edits
