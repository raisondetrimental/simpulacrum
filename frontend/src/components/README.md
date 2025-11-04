# Component Organization

This directory contains all React components for the Meridian Universal Dashboard, organized into a three-tier hierarchy for maintainability and scalability.

## Directory Structure

```
components/
├── common/          # Shared layout and structural components
├── features/        # Module-specific feature components
├── shared/          # Reusable UI components used across features
└── ui/              # Base UI primitives and low-level components
```

## Tier Breakdown

### 1. `common/` - Layout Components

**Purpose:** Core structural components that define the application shell and navigation.

**Components:**
- **Layout.tsx** - Main application wrapper with header and sidebar
- **Sidebar.tsx** - Hover-activated sliding sidebar (translates from -256px)
- **Footer.tsx** - Application footer
- **ProtectedRoute.tsx** - Route wrapper requiring authentication

**Usage Example:**
```tsx
import { Layout } from '../components/common/Layout';

<Layout>
  <YourPage />
</Layout>
```

**Navigation Pattern:**
- Two-level navigation system:
  1. Header dropdowns (main sections)
  2. Sliding sidebar (submenu on hover)

**Important:** When updating navigation, you MUST update **both** `Layout.tsx` (header dropdown) and `Sidebar.tsx` (sliding sidebar) to keep them in sync.

---

### 2. `features/` - Module-Specific Components

**Purpose:** Components specific to individual CRM modules and business features.

**Organization:** Each module has its own subdirectory with related components.

#### CRM Module Components

##### `capital-partners/`
Liquidity module components:
- **CapitalPartnerForm.tsx** - Create/edit capital partner
- **ContactForm.tsx** - Create/edit contact
- **MeetingNotesForm.tsx** - Add meeting notes
- **PreferencesGrid.tsx** - Investment preference selector

##### `sponsors/`
Sponsors module components:
- **CorporateForm.tsx** - Create/edit corporate sponsor
- **SponsorContactForm.tsx** - Create/edit sponsor contact
- **SponsorMeetingNotesForm.tsx** - Add sponsor meeting notes
- **SponsorPreferencesGrid.tsx** - Sponsor investment preferences

##### `counsel/`
Counsel module components:
- **LegalAdvisorForm.tsx** - Create/edit legal advisor
- **CounselContactForm.tsx** - Create/edit counsel contact
- **CounselMeetingNotesForm.tsx** - Add counsel meeting notes
- **CounselPreferencesGrid.tsx** - Counsel investment preferences

##### `agents/`
Agents module components:
- **AgentForm.tsx** - Create/edit transaction agent
- **AgentContactForm.tsx** - Create/edit agent contact
- **AgentMeetingNotesForm.tsx** - Add agent meeting notes
- **AgentPreferencesGrid.tsx** - Agent investment preferences

##### `deals/`
Deal pipeline components:
- **DealForm.tsx** - Create/edit deal
- **DealCard.tsx** - Deal display card
- **DealParticipantsModal.tsx** - Manage deal participants

#### Other Feature Components

##### `excel/`
- **ExcelDataTable.tsx** - Display Excel-sourced market data

##### `whiteboard/`
Collaboration components:
- **PostCard.tsx** - Individual post display
- **PostForm.tsx** - Create new post
- **ReplyForm.tsx** - Add reply to post
- **WeeklyView.tsx** - Posts grouped by week
- **InteractiveMermaidChart.tsx** - Renders Mermaid diagrams
- **TipTapEditor.tsx** - Rich text WYSIWYG editor

**Usage Example:**
```tsx
import { CapitalPartnerForm } from '../../components/features/capital-partners/CapitalPartnerForm';

<CapitalPartnerForm
  onSubmit={handleSubmit}
  initialData={data}
/>
```

---

### 3. `shared/` - Reusable UI Components

**Purpose:** Components that are used across multiple features but are more complex than basic UI primitives.

**Examples:**
- Modal dialogs
- Complex form controls
- Data visualization components
- Specialized input components

**Characteristics:**
- No business logic
- Highly reusable
- Configurable via props
- Used by multiple feature modules

---

### 4. `ui/` - Base UI Primitives

**Purpose:** Low-level, atomic UI components that form the foundation of the design system.

**Examples:**
- Buttons
- Input fields
- Labels
- Cards
- Badges
- Spinners

**Characteristics:**
- Single responsibility
- No feature-specific logic
- Styled according to design system (Tailwind CSS)
- Maximum reusability

---

## Component Patterns

### CRM Module Pattern

Each CRM module follows a consistent component structure:

1. **Primary Entity Form** - Create/edit the main entity (Partner/Corporate/Advisor/Agent)
2. **Contact Form** - Create/edit contacts for the entity
3. **Meeting Notes Form** - Add meeting notes with follow-up dates
4. **Preferences Grid** - Investment preferences selector (where applicable)

**Navigation Menu Order:**
1. Overview
2. Primary entity list (Capital Partners/Corporates/Legal Advisors/Agents)
3. Contacts list
4. Table View
5. Meeting Notes (always at bottom)

### Form Components

**Standard Props:**
```tsx
interface FormProps<T> {
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  initialData?: T;
  isLoading?: boolean;
}
```

### Preference Grid Components

Investment preference grids use shared constants defined in:
- `backend/src/constants/shared.py` (backend)
- `frontend/src/constants/shared.ts` (frontend)

**CRITICAL:** These constants must be kept in sync. Update both files when adding/removing preference criteria.

---

## Styling Conventions

**Framework:** Tailwind CSS utility-first approach

**Key Design Choices:**
- **Font Family:** Serif fonts (Georgia, Cambria, Times New Roman)
- **Color Palette:** Primary gray tones with blue accents
- **Responsive:** Mobile-first breakpoints

**Example:**
```tsx
<div className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-serif text-gray-800 mb-4">
    Component Title
  </h2>
</div>
```

---

## State Management

### Context Providers

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Global authentication state
- User information
- Login/logout functions

**Usage:**
```tsx
import { useAuth } from '../../contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

---

## Testing

Component tests should be placed in:
- `src/__tests__/` directory, or
- Co-located with component as `ComponentName.test.tsx`

**Testing Framework:** Vitest + React Testing Library

**Run Tests:**
```bash
npm test
npm run test:ui
npm run test:coverage
```

---

## Best Practices

### Do's ✓
- Keep components focused on single responsibility
- Use TypeScript for type safety
- Extract reusable logic to custom hooks
- Follow existing naming conventions
- Update both Layout.tsx and Sidebar.tsx when changing navigation
- Keep shared constants in sync between frontend/backend

### Don'ts ✗
- Don't mix business logic with presentation
- Don't hardcode API URLs (use config.ts)
- Don't forget authentication for protected components
- Don't create duplicate components (check shared/ and ui/ first)
- Don't use emojis unless explicitly requested

---

## Adding New Components

### 1. Determine Correct Tier
- Layout/Navigation? → `common/`
- Module-specific? → `features/[module-name]/`
- Reusable across features? → `shared/`
- Basic UI element? → `ui/`

### 2. Create Component File
```tsx
// features/example/ExampleComponent.tsx
import React from 'react';

interface ExampleComponentProps {
  // Define props
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  // Destructure props
}) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### 3. Add TypeScript Types
- Simple props: Inline interface
- Complex types: Create in `src/types/[module].ts`

### 4. Update Imports
- Use relative imports for components
- Use `@/` alias if configured

### 5. Add Tests
- Create `ExampleComponent.test.tsx`
- Test key functionality and user interactions

---

## Integration with Pages

Components are consumed by pages in `src/pages/`:

```
src/pages/
├── capital-partners/   → uses features/capital-partners/
├── sponsors/           → uses features/sponsors/
├── counsel/            → uses features/counsel/
├── agents/             → uses features/agents/
├── deals/              → uses features/deals/
├── markets/            → uses features/excel/
└── whiteboard/         → uses features/whiteboard/
```

---

## Dependencies

**Key Libraries:**
- **React 18.2.0** - UI framework
- **TypeScript 5.0.2** - Type safety
- **Recharts 2.8.0** - Charts and data visualization
- **Mermaid 11.12.0** - Diagram rendering
- **TipTap 3.9.0** - Rich text editor
- **React Big Calendar 1.19.4** - Calendar component
- **React Zoom Pan Pinch 3.7.0** - Interactive zooming/panning

---

## See Also

- [CLAUDE.md](../../../CLAUDE.md) - Main project documentation
- [Pages Documentation](../pages/README.md) - Page structure
- [Services Documentation](../services/README.md) - API integration
- [Types Documentation](../types/README.md) - TypeScript types
- [Testing Guide](../../../docs/development/TESTING.md) - Testing practices
