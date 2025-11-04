# Utils Directory

This directory contains utility functions and helpers used throughout the application.

## Purpose

The `utils/` directory is for **your code** - reusable helper functions that you write to support your application logic.

## Organization

Recommended file structure:

```
utils/
├── format.ts         # Formatting helpers
├── validation.ts     # Form and data validation
├── helpers.ts        # General utility functions
├── date.ts           # Date manipulation helpers
├── string.ts         # String manipulation helpers
└── index.ts          # Central exports (optional)
```

## Examples

### Formatting Helpers (`format.ts`)
```typescript
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date, format: string = 'short'): string => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format as any,
  }).format(date);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};
```

### Validation Helpers (`validation.ts`)
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};
```

### General Helpers (`helpers.ts`)
```typescript
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
```

## Best Practices

1. **Keep functions pure** - Avoid side effects when possible
2. **Single responsibility** - Each function should do one thing well
3. **Type safety** - Use TypeScript types and generics
4. **Document complex functions** - Add JSDoc comments
5. **Test your utilities** - Utils should have unit tests

## Difference from `lib/`

- **`utils/`** = Your helper functions (code you write)
- **`lib/`** = Third-party library wrappers and configurations (code you configure)

## See Also

- [lib/README.md](../lib/README.md) - Third-party library wrappers
- [constants/README.md](../constants/README.md) - Application constants
