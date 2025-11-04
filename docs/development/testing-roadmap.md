# Testing Roadmap

This document outlines the current state of testing in the Meridian Universal Dashboard project and provides a roadmap for improving test coverage.

**Last Updated:** October 29, 2025

---

## Current Testing Status

### Backend Testing

**Framework:** pytest
**Coverage:** Minimal (1 test file)
**Location:** `backend/tests/`

**Current Tests:**
```
backend/tests/
├── test_api/
│   └── test_health.py        # Single test for health endpoint
├── test_models/              # Empty directory
└── test_services/            # Empty directory
```

**Test Infrastructure:**
- ✓ pytest configured
- ✓ Test directory structure in place
- ✗ Most modules lack tests
- ✗ No coverage reporting configured

**Running Backend Tests:**
```bash
cd backend
pytest
pytest --verbose
pytest tests/test_api/test_health.py
```

---

### Frontend Testing

**Framework:** Vitest + React Testing Library
**Coverage:** Minimal (infrastructure in place, few tests)
**Location:** `frontend/src/__tests__/`

**Test Infrastructure:**
- ✓ Vitest configured
- ✓ React Testing Library installed
- ✓ Test scripts in package.json
- ✗ Component tests not written
- ✗ No integration tests

**Running Frontend Tests:**
```bash
cd frontend
npm test                    # Run tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Generate coverage report
```

---

## Testing Priorities

### Phase 1: Critical Path Testing (Weeks 1-2)

**Backend:**
1. **Authentication Tests** (`test_api/test_auth.py`)
   - Login with valid credentials
   - Login with invalid credentials
   - Logout
   - Session persistence
   - Protected route access

2. **CRM Core Operations** (`test_api/test_crm.py`)
   - Create capital partner
   - Read capital partner
   - Update capital partner
   - Delete capital partner (with cascading contacts)
   - Same for corporates, legal advisors, agents

3. **Investment Matching** (`test_services/test_investment_matching.py`)
   - Profile generation
   - Match computation
   - Filter logic

**Frontend:**
1. **Authentication Flow** (`__tests__/auth/`)
   - Login form validation
   - Successful login redirects
   - Protected route behavior
   - Logout functionality

2. **CRM Forms** (`__tests__/features/capital-partners/`)
   - Form validation
   - Submit handlers
   - Error handling
   - Success feedback

---

### Phase 2: Data Integrity Testing (Weeks 3-4)

**Backend:**
1. **JSON Store Tests** (`test_utils/test_json_store.py`)
   - CRUD operations
   - Backup creation (.bak files)
   - Concurrent access handling
   - Error recovery

2. **Data Migration Tests** (`test_migrations/`)
   - Verify migration logic (for future migrations)
   - Test rollback procedures
   - Backup validation

3. **Model Validation** (`test_models/`)
   - Deal model validation
   - User model validation
   - Deal participant relationships

**Frontend:**
1. **Service Layer Tests** (`__tests__/services/`)
   - API call handling
   - Error responses
   - Retry logic
   - Credential handling

---

### Phase 3: Business Logic Testing (Weeks 5-6)

**Backend:**
1. **Deal Aggregation** (`test_services/test_deals_aggregator.py`)
   - Deal statistics calculation
   - Deal search and filtering
   - Deal participant management

2. **FX Rates Service** (`test_api/test_fx_rates.py`)
   - Rate fetching
   - Historical data storage
   - Currency conversion

3. **Whiteboard Threading** (`test_api/test_whiteboard.py`)
   - Post creation
   - Reply threading
   - Week boundary calculations
   - User ordering

**Frontend:**
1. **Component Integration** (`__tests__/integration/`)
   - Full user flows (create partner → add contact → add meeting)
   - Calendar integration
   - Investment strategy builder

2. **Data Visualization** (`__tests__/components/charts/`)
   - Chart rendering
   - Data transformation
   - Interactive features

---

### Phase 4: Edge Cases & Error Handling (Weeks 7-8)

**Backend:**
1. **Error Handling**
   - Invalid JSON data
   - Missing files
   - Malformed requests
   - Unauthorized access attempts

2. **Boundary Conditions**
   - Empty datasets
   - Large datasets
   - Special characters in strings
   - Date edge cases

**Frontend:**
1. **UI Edge Cases**
   - Empty states
   - Loading states
   - Error states
   - Network failures

2. **Responsive Design**
   - Mobile viewport testing
   - Tablet viewport testing
   - Desktop testing

---

### Phase 5: End-to-End Testing (Weeks 9-10)

**Tools:** Playwright or Cypress

**Scenarios:**
1. Complete user registration and login flow
2. Create full CRM record (partner → contact → meeting → follow-up)
3. Investment matching workflow
4. Deal pipeline management
5. Whiteboard collaboration
6. Export functionality (CSV downloads)

---

## Test Coverage Goals

### Minimum Acceptable Coverage (MVP)
- **Backend:** 60% overall, 80% for critical paths
- **Frontend:** 50% overall, 70% for business logic

### Target Coverage (Production)
- **Backend:** 80% overall, 95% for critical paths
- **Frontend:** 70% overall, 85% for business logic

---

## Testing Best Practices

### Backend (Python/pytest)

**File Naming:**
```
tests/
├── test_api/
│   └── test_[module_name].py
├── test_models/
│   └── test_[model_name].py
└── test_services/
    └── test_[service_name].py
```

**Test Function Naming:**
```python
def test_[function]_[condition]_[expected_result]():
    # Example:
    def test_create_partner_with_valid_data_returns_201():
        pass
```

**Fixtures:**
```python
import pytest

@pytest.fixture
def sample_partner():
    return {
        "name": "Test Partner",
        "country": "USA",
        # ... more fields
    }

def test_create_partner(sample_partner):
    response = client.post('/api/capital-partners', json=sample_partner)
    assert response.status_code == 201
```

---

### Frontend (Vitest/React Testing Library)

**File Naming:**
```
src/__tests__/
├── components/
│   ├── features/
│   │   └── [ModuleName]/[ComponentName].test.tsx
│   └── common/
│       └── [ComponentName].test.tsx
├── services/
│   └── [serviceName].test.ts
└── integration/
    └── [flowName].test.tsx
```

**Component Testing Pattern:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CapitalPartnerForm } from './CapitalPartnerForm';

describe('CapitalPartnerForm', () => {
  it('renders form fields correctly', () => {
    render(<CapitalPartnerForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const handleSubmit = vi.fn();
    render(<CapitalPartnerForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

---

## Running Tests in CI/CD

### GitHub Actions Workflows

**Current Workflows:**
- `.github/workflows/backend-tests.yml` - Backend pytest runner
- `.github/workflows/frontend-build.yml` - Frontend build test
- `.github/workflows/validate-constants.yml` - Shared constants validation

**Future Enhancements:**
1. Add coverage reporting to GitHub Actions
2. Fail builds on coverage drop
3. Add E2E test workflow
4. Performance regression testing

---

## Test Data Management

### Backend Test Data

**Location:** `backend/tests/fixtures/`

Create sample JSON files for testing:
```
tests/fixtures/
├── sample_capital_partners.json
├── sample_deals.json
├── sample_users.json
└── README.md
```

**Setup/Teardown:**
```python
@pytest.fixture(autouse=True)
def setup_test_data(tmp_path):
    # Copy sample data to temp directory
    # Run test
    # Cleanup
    pass
```

---

### Frontend Test Data

**Mocking API Calls:**
```typescript
import { vi } from 'vitest';

vi.mock('../services/capitalPartnersService', () => ({
  getCapitalPartners: vi.fn(() => Promise.resolve([
    { id: 'cp_001', name: 'Test Partner' }
  ]))
}));
```

---

## Performance Testing

### Backend Performance

**Tools:** pytest-benchmark, locust

**Metrics to Track:**
- API response times (<100ms for simple queries, <500ms for complex)
- JSON file read/write times
- Investment matching computation time
- Concurrent user handling

**Example:**
```python
def test_investment_matching_performance(benchmark):
    result = benchmark(compute_pairings, sponsors, partners)
    assert result  # Should complete in <1 second
```

---

### Frontend Performance

**Tools:** Lighthouse, Vitest performance APIs

**Metrics to Track:**
- Initial page load (<3s)
- Time to interactive (<5s)
- Component render times
- Bundle size (<500KB gzipped)

---

## Manual Testing Checklist

Until automated tests are comprehensive, use this manual checklist:

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Session persistence
- [ ] Protected route redirects

### CRM Operations (Repeat for Each Module)
- [ ] Create new entity
- [ ] Edit existing entity
- [ ] Delete entity
- [ ] View entity details
- [ ] Add contacts
- [ ] Add meeting notes
- [ ] Calendar reminders display
- [ ] CSV export works

### Investment Matching
- [ ] Build strategy
- [ ] Get matches
- [ ] Filter results
- [ ] Save strategy

### Deals Pipeline
- [ ] Create deal
- [ ] Edit deal
- [ ] Add participants
- [ ] View statistics
- [ ] Search/filter deals

### Whiteboard
- [ ] Create post
- [ ] Add reply
- [ ] View by week
- [ ] Render Mermaid diagrams
- [ ] Rich text formatting

---

## Continuous Improvement

**Monthly:**
- Review test coverage reports
- Identify untested code paths
- Add tests for new features
- Update this roadmap

**Quarterly:**
- Evaluate testing tools and frameworks
- Review test performance
- Update CI/CD pipelines
- Team training on testing practices

---

## Resources

**Documentation:**
- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)

**Internal Docs:**
- [CLAUDE.md](../../CLAUDE.md) - Project architecture
- [Backend README](../../backend/README.md)
- [Frontend Testing Guide](./TESTING.md)

---

## Getting Help

If you're new to testing:
1. Start with simple unit tests
2. Review existing test examples in codebase
3. Reference testing framework documentation
4. Pair program with experienced developers

**Remember:** Some tests are better than no tests. Start small and iterate!
