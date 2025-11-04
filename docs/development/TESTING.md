# Testing Guide

This document provides comprehensive guidance for testing the Meridian Universal Dashboard application.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Code Coverage](#code-coverage)
- [Pre-commit Hooks](#pre-commit-hooks)

## Overview

The project uses industry-standard testing frameworks and tools:

- **Backend**: pytest with coverage reporting
- **Frontend**: vitest with React Testing Library
- **Pre-commit hooks**: Automated code quality checks
- **CI/CD**: GitHub Actions workflows for continuous testing

### Test Directory Structure

```
backend/
├── tests/
│   ├── conftest.py              # Pytest configuration and fixtures
│   ├── test_api/                # API endpoint tests
│   │   ├── __init__.py
│   │   └── test_health.py       # Example health check tests
│   ├── test_services/           # Service layer tests
│   │   ├── __init__.py
│   │   ├── test_deal_pipeline.py
│   │   └── test_investment_profiles.py
│   └── test_models/             # Data model tests
│       └── __init__.py
├── pytest.ini                   # Pytest configuration
└── .coveragerc                  # Coverage configuration

frontend/
└── src/
    └── __tests__/
        ├── setup.ts             # Vitest test setup
        ├── components/          # Component tests
        │   └── Footer.test.tsx  # Example component test
        ├── services/            # Service tests
        └── utils/               # Utility tests
            └── constants.test.ts # Example constants test
```

## Backend Testing

### Framework: pytest

The backend uses pytest for all testing needs.

### Configuration Files

- **pytest.ini**: Main pytest configuration
- **.coveragerc**: Coverage reporting configuration
- **pyproject.toml**: Tool configurations (black, isort, mypy)

### Running Backend Tests

```bash
# Run all tests
cd backend
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_api/test_health.py

# Run tests with marker
pytest -m unit
pytest -m integration
pytest -m api

# Run tests in verbose mode
pytest -v

# Run tests and show local variables on failure
pytest -l

# Run tests in parallel (requires pytest-xdist)
pytest -n auto
```

### Test Markers

Use markers to categorize tests:

- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.api` - API endpoint tests
- `@pytest.mark.services` - Service layer tests
- `@pytest.mark.slow` - Slow running tests

### Available Fixtures (conftest.py)

```python
@pytest.fixture
def app():
    """Flask app instance configured for testing."""

@pytest.fixture
def client(app):
    """Test client for making API requests."""

@pytest.fixture
def runner(app):
    """CLI runner for testing commands."""

@pytest.fixture
def sample_deal_data():
    """Sample deal data for testing."""

@pytest.fixture
def sample_investment_profile():
    """Sample investment profile for testing."""
```

### Writing Backend Tests

```python
"""
Example test module for API endpoints.
"""
import pytest


@pytest.mark.api
def test_endpoint_returns_200(client):
    """Test that endpoint returns 200 status."""
    response = client.get('/api/endpoint')
    assert response.status_code == 200


@pytest.mark.api
def test_endpoint_returns_json(client):
    """Test that endpoint returns JSON."""
    response = client.get('/api/endpoint')
    assert response.content_type == 'application/json'


@pytest.mark.services
@pytest.mark.unit
def test_service_function():
    """Test service function logic."""
    result = my_service_function()
    assert result is not None
    assert isinstance(result, dict)
```

## Frontend Testing

### Framework: Vitest + React Testing Library

The frontend uses Vitest (Vite-native test runner) with React Testing Library.

### Configuration Files

- **vitest.config.ts**: Vitest configuration
- **src/__tests__/setup.ts**: Test environment setup

### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test src/__tests__/components/Footer.test.tsx
```

### Writing Frontend Tests

```typescript
/**
 * Example component test
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Testing Utilities

The test setup (src/__tests__/setup.ts) provides:

- Jest-DOM matchers for better assertions
- Automatic cleanup after each test
- Mock for window.matchMedia
- Mock for IntersectionObserver

## Running Tests

### Local Development

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Run both (from root)
make test
```

### Watch Mode

```bash
# Backend (requires pytest-watch)
cd backend
pytest-watch

# Frontend
cd frontend
npm test -- --watch
```

### Coverage Reports

```bash
# Backend coverage (generates htmlcov/)
cd backend
pytest --cov=src --cov-report=html
# Open backend/htmlcov/index.html

# Frontend coverage (generates coverage/)
cd frontend
npm run test:coverage
# Open frontend/coverage/index.html
```

## Writing Tests

### Best Practices

1. **One assertion per test** (when possible)
2. **Use descriptive test names** that explain what is being tested
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Use fixtures** for common test data
5. **Mark slow tests** with appropriate markers
6. **Test behavior, not implementation**
7. **Keep tests independent** and idempotent

### Test Structure

```python
# Backend test structure
def test_descriptive_name():
    """Clear docstring explaining what is tested."""
    # Arrange: Set up test data
    data = create_test_data()

    # Act: Perform the action
    result = function_under_test(data)

    # Assert: Verify the result
    assert result == expected_value
```

```typescript
// Frontend test structure
it('should do something specific', () => {
  // Arrange: Set up component
  render(<MyComponent prop="value" />);

  // Act: Perform user action
  const button = screen.getByRole('button');
  fireEvent.click(button);

  // Assert: Verify outcome
  expect(screen.getByText('Result')).toBeInTheDocument();
});
```

### Testing Shared Constants

Both frontend and backend have tests for shared constants to ensure synchronization:

- Backend: `tests/test_services/test_deal_pipeline.py`
- Frontend: `src/__tests__/utils/constants.test.ts`

These tests verify:
- Constants are properly defined
- Arrays have expected length
- All expected values are present
- Types are correct

## CI/CD Integration

### GitHub Actions Workflows

The project includes several CI/CD workflows:

#### Main CI Pipeline (.github/workflows/ci.yml)

Runs on every push and pull request:

1. **Validate Constants**: Ensures frontend/backend constants are synchronized
2. **Frontend Lint**: Runs ESLint
3. **Frontend Typecheck**: TypeScript compilation check
4. **Backend Lint**: Runs flake8
5. **Backend Tests**: Runs pytest with coverage
6. **Frontend Tests**: Runs vitest with coverage

#### Backend Tests Workflow (.github/workflows/backend-tests.yml)

Dedicated backend testing workflow:
- Tests against Python 3.9, 3.10, 3.11
- Generates coverage reports
- Uploads to Codecov

#### Frontend Build Workflow (.github/workflows/frontend-build.yml)

Production build verification:
- Builds frontend for production
- Verifies no build errors
- Uploads build artifacts

#### Validate Constants Workflow (.github/workflows/validate-constants.yml)

Runs validation script on changes to:
- `shared/` directory
- `frontend/src/constants/`
- `backend/src/constants/`

### Running CI Checks Locally

Before pushing code, run CI checks locally:

```bash
# Validate shared constants
python shared/scripts/validate-sync.py

# Backend lint
cd backend
flake8 src/

# Backend tests
pytest

# Frontend lint
cd frontend
npm run lint

# Frontend typecheck
npm run build

# Frontend tests
npm test
```

## Code Coverage

### Coverage Goals

- **Backend**: Minimum 50% coverage (configured in pytest.ini)
- **Frontend**: Minimum 50% coverage (configured in vitest.config.ts)

### Viewing Coverage

```bash
# Backend HTML report
cd backend
pytest --cov=src --cov-report=html
open htmlcov/index.html  # or start htmlcov/index.html on Windows

# Frontend HTML report
cd frontend
npm run test:coverage
open coverage/index.html  # or start coverage/index.html on Windows
```

### Coverage Reports in CI

Coverage reports are automatically:
- Generated on every CI run
- Uploaded to Codecov (backend only, currently)
- Available as workflow artifacts

## Pre-commit Hooks

### Setup

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

### Configured Hooks

The `.pre-commit-config.yaml` includes:

**General:**
- Trailing whitespace removal
- End of file fixer
- YAML/JSON validation
- Large file check
- Merge conflict detection
- Private key detection

**Python (Backend):**
- Black (formatting)
- Flake8 (linting)
- isort (import sorting)
- mypy (type checking)

**TypeScript (Frontend):**
- Prettier (formatting)
- ESLint (linting)

**Markdown:**
- markdownlint (Markdown linting)

**Shell:**
- shellcheck (Shell script linting)

**Custom:**
- Shared constants validation

### Bypassing Hooks

```bash
# Skip all hooks (not recommended)
git commit --no-verify

# Skip specific hook
SKIP=flake8 git commit -m "message"
```

## Troubleshooting

### Common Issues

**Tests not discovered:**
- Ensure test files start with `test_`
- Ensure test functions start with `test_`
- Check pytest.ini configuration

**Import errors:**
- Verify virtual environment is activated
- Check PYTHONPATH includes src directory
- Ensure all dependencies are installed

**Coverage not working:**
- Check .coveragerc configuration
- Ensure pytest-cov is installed
- Verify source paths are correct

**Frontend tests failing:**
- Clear node_modules and reinstall
- Check vitest.config.ts paths
- Verify jsdom is installed

### Getting Help

- Check test output for detailed error messages
- Run tests in verbose mode: `pytest -v` or `npm test -- --reporter=verbose`
- Check CI logs for additional context
- Review test configuration files

## Additional Resources

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Coverage.py documentation](https://coverage.readthedocs.io/)
- [Pre-commit documentation](https://pre-commit.com/)
