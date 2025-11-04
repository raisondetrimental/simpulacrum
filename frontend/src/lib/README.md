# Lib Directory

This directory contains initialized instances and configurations for third-party libraries.

## Purpose

The `lib/` directory is for **third-party code** - wrappers, configurations, and initialized instances of external libraries you use in your application.

## Organization

Recommended file structure:

```
lib/
├── axios.ts          # Axios instance configuration
├── recharts.ts       # Recharts custom theme
├── mermaid.ts        # Mermaid diagram configuration
└── index.ts          # Central exports (optional)
```

## Examples

### Axios Configuration (`axios.ts`)
```typescript
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config';

// Create configured Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Recharts Theme (`recharts.ts`)
```typescript
// Custom Recharts theme configuration
export const chartTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },

  cartesianGrid: {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
  },

  tooltip: {
    contentStyle: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
  },

  legend: {
    wrapperStyle: {
      paddingTop: '20px',
    },
  },
};

// Default chart props
export const defaultChartProps = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
};
```

### Mermaid Configuration (`mermaid.ts`)
```typescript
import mermaid from 'mermaid';

// Initialize Mermaid with custom configuration
export const initializeMermaid = () => {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Georgia, serif',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
  });
};

// Render a Mermaid diagram
export const renderMermaidDiagram = async (
  elementId: string,
  diagramDefinition: string
): Promise<void> => {
  try {
    const { svg } = await mermaid.render(elementId, diagramDefinition);
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = svg;
    }
  } catch (error) {
    console.error('Failed to render Mermaid diagram:', error);
  }
};
```

## When to Use `lib/` vs `utils/`

### Use `lib/` for:
- Axios instance configuration
- Third-party library wrappers
- Library-specific configurations
- Initialized external tools
- API client setup

### Use `utils/` for:
- Your own helper functions
- Data transformations
- Validation logic
- Formatting utilities
- Pure functions

**Rule of Thumb:** If you're wrapping or configuring something from `node_modules`, it goes in `lib/`. If you're writing your own code, it goes in `utils/`.

## Best Practices

1. **Single Source of Truth** - One configuration per library
2. **Type Safety** - Export typed instances
3. **Environment-Aware** - Use environment variables for configuration
4. **Error Handling** - Handle library errors gracefully
5. **Documentation** - Document non-obvious configurations

## Integration with Services

The `lib/` directory provides configured instances that are used by your `services/`:

```typescript
// services/capitalPartnersService.ts
import { apiClient } from '../lib/axios';

export const getCapitalPartners = async () => {
  const response = await apiClient.get('/api/capital-partners');
  return response.data;
};
```

## See Also

- [utils/README.md](../utils/README.md) - Utility functions
- [services/README.md](../services/README.md) - API service layer
- [config.ts](../config.ts) - Application configuration
