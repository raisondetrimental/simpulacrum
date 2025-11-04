# Contributing Guide - Adding New Features

This guide provides best practices and patterns for adding new features to the Meridian Universal Dashboard.

## Core Principles

1. **Follow Existing Patterns**: Look at existing implementations before creating new ones
2. **Maintain Separation of Concerns**: Keep backend logic in services, routes in blueprints, UI in components
3. **Type Safety**: Use TypeScript types for all frontend data structures
4. **Consistent Naming**: Follow established naming conventions across the codebase
5. **Test Before Committing**: Manually test both frontend and backend changes

## Adding a New Page

### 1. Create TypeScript Types (Frontend)

**Location**: `frontend/src/types/`

```typescript
// frontend/src/types/my_feature.ts
export interface MyFeature {
  id: string;
  name: string;
  created_at: string;
  // ... other fields
}

export interface MyFeatureFormData {
  name: string;
  // ... form fields (exclude id, created_at)
}
```

**Naming**: Use snake_case for field names to match backend JSON

### 2. Create Page Component

**Location**: `frontend/src/pages/my-feature/`

```typescript
// frontend/src/pages/my-feature/MyFeaturePage.tsx
import { useEffect, useState } from 'react';
import { myFeatureService } from '../../services/myFeatureService';
import type { MyFeature } from '../../types/my_feature';

export default function MyFeaturePage() {
  const [data, setData] = useState<MyFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await myFeatureService.getAll();
      setData(result);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Feature</h1>
        {/* Content */}
      </div>
    </div>
  );
}
```

**Pattern**: Use consistent container structure (`max-w-7xl mx-auto px-4`)

### 3. Create API Service (Frontend)

**Location**: `frontend/src/services/`

```typescript
// frontend/src/services/myFeatureService.ts
import { api } from './api';
import type { MyFeature, MyFeatureFormData } from '../types/my_feature';

export const myFeatureService = {
  async getAll(): Promise<MyFeature[]> {
    const response = await api.get('/api/my-features');
    return response.data.data || [];
  },

  async getById(id: string): Promise<MyFeature> {
    const response = await api.get(`/api/my-features/${id}`);
    return response.data.data;
  },

  async create(data: MyFeatureFormData): Promise<MyFeature> {
    const response = await api.post('/api/my-features', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<MyFeatureFormData>): Promise<MyFeature> {
    const response = await api.put(`/api/my-features/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/my-features/${id}`);
  }
};
```

**Pattern**: All services follow this CRUD structure

### 4. Add Route

**Location**: `frontend/src/App.tsx`

```typescript
import MyFeaturePage from './pages/my-feature/MyFeaturePage';

// Inside Routes component
<Route path="/my-feature" element={<MyFeaturePage />} />
```

### 5. Add Navigation Link

**Location**: `frontend/src/components/common/Layout.tsx`

```typescript
const navigationSections = [
  // ... existing sections
  {
    name: 'My Section',
    pages: [
      { name: 'My Feature', path: '/my-feature' }
    ]
  }
]
```

## Adding a New API Endpoint

### 1. Create Blueprint (Backend)

**Location**: `backend/src/api/`

```python
# backend/src/api/my_feature.py
"""
My Feature routes
"""
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required
from pathlib import Path
from datetime import datetime

from ..utils.json_store import read_json_list, write_json_file

my_feature_bp = Blueprint('my_feature', __name__, url_prefix='/api')


@my_feature_bp.route('/my-features', methods=['GET'])
@login_required  # Add if authentication required
def get_my_features():
    """Get all my features"""
    try:
        data_path = Path(current_app.config['JSON_DIR']) / 'my_features.json'
        features = read_json_list(data_path)

        return jsonify({
            "success": True,
            "data": features,
            "count": len(features)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error reading data: {str(e)}"
        }), 500


@my_feature_bp.route('/my-features/<feature_id>', methods=['GET'])
@login_required
def get_my_feature(feature_id):
    """Get specific my feature"""
    try:
        data_path = Path(current_app.config['JSON_DIR']) / 'my_features.json'
        features = read_json_list(data_path)

        feature = next((f for f in features if f['id'] == feature_id), None)

        if not feature:
            return jsonify({
                "success": False,
                "message": "Feature not found"
            }), 404

        return jsonify({
            "success": True,
            "data": feature
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500


@my_feature_bp.route('/my-features', methods=['POST'])
@login_required
def create_my_feature():
    """Create new my feature"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        # Generate ID and timestamp
        import time
        feature_id = f"feat_{int(time.time() * 1000)}"

        new_feature = {
            "id": feature_id,
            "created_at": datetime.now().isoformat(),
            **data
        }

        # Load existing, append, save
        data_path = Path(current_app.config['JSON_DIR']) / 'my_features.json'
        features = read_json_list(data_path)
        features.append(new_feature)

        if write_json_file(data_path, features):
            return jsonify({
                "success": True,
                "data": new_feature,
                "message": "Feature created successfully"
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Failed to save feature"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500


@my_feature_bp.route('/my-features/<feature_id>', methods=['PUT'])
@login_required
def update_my_feature(feature_id):
    """Update existing my feature"""
    try:
        data = request.get_json()

        data_path = Path(current_app.config['JSON_DIR']) / 'my_features.json'
        features = read_json_list(data_path)

        # Find and update
        feature_index = next((i for i, f in enumerate(features) if f['id'] == feature_id), None)

        if feature_index is None:
            return jsonify({
                "success": False,
                "message": "Feature not found"
            }), 404

        # Update fields
        features[feature_index].update(data)
        features[feature_index]['updated_at'] = datetime.now().isoformat()

        if write_json_file(data_path, features):
            return jsonify({
                "success": True,
                "data": features[feature_index],
                "message": "Feature updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update feature"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500


@my_feature_bp.route('/my-features/<feature_id>', methods=['DELETE'])
@login_required
def delete_my_feature(feature_id):
    """Delete my feature"""
    try:
        data_path = Path(current_app.config['JSON_DIR']) / 'my_features.json'
        features = read_json_list(data_path)

        # Filter out the feature to delete
        filtered = [f for f in features if f['id'] != feature_id]

        if len(filtered) == len(features):
            return jsonify({
                "success": False,
                "message": "Feature not found"
            }), 404

        if write_json_file(data_path, filtered):
            return jsonify({
                "success": True,
                "message": "Feature deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete feature"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 500
```

**Key Patterns**:
- All responses use `{"success": True/False, "data": ..., "message": ...}` format
- Use `@login_required` for protected routes
- Validate required fields before processing
- Use `write_json_file()` utility (automatically creates `.bak` backups)
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)

### 2. Register Blueprint

**Location**: `backend/src/app.py`

```python
def create_app(config_name=None):
    # ... existing code ...

    # Register blueprints
    from .api.my_feature import my_feature_bp
    app.register_blueprint(my_feature_bp)

    # ... existing code ...
```

### 3. Create Data File

**Location**: `data/json/`

Create initial JSON file:
```json
[]
```

**File naming**: Use snake_case (e.g., `my_features.json`)

### 4. Update Config (if needed)

**Location**: `backend/src/config.py`

If you need a config constant:
```python
class Config:
    # ... existing ...
    JSON_MY_FEATURES = 'my_features.json'
```

## Adding a New CRM Module

Follow the pattern of existing modules (Capital Partners, Sponsors, Counsel):

### Backend Structure
```
backend/src/api/my_module.py
data/json/my_module_entities.json
data/json/my_module_contacts.json
```

### Frontend Structure
```
frontend/src/types/my_module.ts
frontend/src/services/myModuleService.ts
frontend/src/pages/my-module/
  ├── MyModuleOverview.tsx
  ├── EntitiesList.tsx
  ├── EntityDetail.tsx
  └── ContactDetail.tsx
frontend/src/components/features/my-module/
  ├── EntityForm.tsx
  └── ContactForm.tsx
```

### Features to Include
1. **List View** - Display all entities
2. **Detail View** - Show single entity with related contacts
3. **Form Components** - Create/edit entities and contacts
4. **Meeting Notes** - Track interactions (if applicable)
5. **Reminders** - Follow-up tracking (if applicable)
6. **Calendar Integration** - Add to unified calendar (if using reminders)

## File Naming Conventions

### Backend (Python)
- **Files**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions**: `snake_case()`
- **Constants**: `UPPER_SNAKE_CASE`

### Frontend (TypeScript/React)
- **Components**: `PascalCase.tsx`
- **Services**: `camelCase.ts`
- **Types**: `snake_case.ts` (to match JSON field names)
- **Interfaces**: `PascalCase`
- **Variables**: `camelCase`

### Data Files (JSON)
- **Filenames**: `snake_case.json`
- **Field names**: `snake_case` (matches backend Python conventions)

## ID Generation Patterns

Choose based on module pattern:

### Sequential IDs (for hierarchical data)
```python
# Example: cp_001, cp_002, cp_003
def generate_sequential_id(prefix: str, existing_ids: list) -> str:
    if not existing_ids:
        return f"{prefix}_001"

    numbers = [int(id.split('_')[1]) for id in existing_ids if id.startswith(prefix)]
    next_num = max(numbers, default=0) + 1
    return f"{prefix}_{next_num:03d}"
```

### Timestamp IDs (for flat structures)
```python
import time

def generate_timestamp_id(prefix: str) -> str:
    return f"{prefix}_{int(time.time() * 1000)}"
```

## Form Handling Pattern

### Frontend Form Component
```typescript
import { useState } from 'react';
import type { MyFeatureFormData } from '../../types/my_feature';

interface Props {
  initialData?: MyFeatureFormData;
  onSubmit: (data: MyFeatureFormData) => Promise<void>;
  onCancel: () => void;
}

export default function MyFeatureForm({ initialData, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState<MyFeatureFormData>(
    initialData || { name: '' }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Common Pitfalls to Avoid

### 1. Import Errors (Backend)
❌ **Wrong**: `from investment_profiles import ...`
✅ **Correct**: `from .investment_profiles import ...` (relative import)

### 2. Configuration Property Access
❌ **Wrong**: `current_app.config['EXCEL_FILE_PATH']` (property doesn't work)
✅ **Correct**: Calculate path from base config values

### 3. API Response Format
❌ **Wrong**: `return jsonify(data)` (inconsistent)
✅ **Correct**: `return jsonify({"success": True, "data": data})`

### 4. TypeScript Type Mismatches
❌ **Wrong**: Field name `createdAt` in TypeScript but `created_at` in JSON
✅ **Correct**: Use `created_at` everywhere to match backend

### 5. Missing Error Handling
❌ **Wrong**: No try/catch blocks
✅ **Correct**: Wrap async operations in try/catch

### 6. Hardcoded URLs
❌ **Wrong**: `fetch('http://localhost:5000/api/...')`
✅ **Correct**: `import { API_BASE_URL } from '../config'`

### 7. Missing Authentication
❌ **Wrong**: Sensitive endpoints without `@login_required`
✅ **Correct**: Add `@login_required` decorator

### 8. Direct JSON File Manipulation
❌ **Wrong**: `json.dump(data, open(path, 'w'))`
✅ **Correct**: Use `write_json_file()` utility (creates backups)

## Testing Checklist

Before committing new features:

- [ ] Backend API returns correct response format
- [ ] Frontend displays data correctly
- [ ] Forms validate required fields
- [ ] Error messages are user-friendly
- [ ] Create/Update/Delete operations work
- [ ] Authentication is enforced (if required)
- [ ] Backup `.bak` files are created on save
- [ ] Navigation links work
- [ ] Mobile responsive (test at 640px, 768px, 1024px)
- [ ] No console errors in browser
- [ ] No Python errors in terminal

## Code Style

### Backend (Python)
- Use Black formatter: `black backend/src/`
- Follow PEP 8 conventions
- Add docstrings to all functions
- Use type hints where helpful

### Frontend (TypeScript)
- Run ESLint: `npm run lint`
- Use functional components with hooks
- Prefer named exports for utilities, default exports for pages
- Add TypeScript types for all props and state

## When to Create a Service vs. Inline Logic

**Create a Service When**:
- Logic will be reused across multiple components
- Complex data transformation is needed
- Business logic should be separated from UI

**Use Inline Logic When**:
- Simple one-time operations
- Component-specific state management
- No reuse expected

## Documentation

When adding significant features:

1. **Update CLAUDE.md** if adding new architectural patterns
2. **Add comments** for complex logic
3. **Update API endpoint list** in this file or CLAUDE.md
4. **Document any new environment variables** in backend README

## Getting Help

Look at these reference implementations:

- **Simple CRUD**: Capital Partners module
- **Hierarchical data**: Liquidity module (Partners → Teams → Contacts)
- **Form handling**: `ContactForm.tsx`
- **API endpoints**: `backend/src/api/capital_partners.py`
- **Service layer**: `frontend/src/services/capitalPartnersService.ts`
- **Charts**: `USAHistoricalYieldsPage.tsx`

When in doubt, follow the existing pattern.
