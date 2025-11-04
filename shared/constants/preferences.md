# Investment Preferences - Canonical Definition

**Last Updated**: 2025-10-08
**Source of Truth**: This document defines all investment preference keys used across the application.

## Overview

Investment preferences are Y/N/any toggles that describe investment criteria for capital partners and sponsors. There are **24 total preference keys**, of which **10 are "shared"** (used for cross-CRM matching).

## All Preference Keys (24 Total)

### Asset Classes & Instruments (7 keys)
1. **`investment_grade`** - Investment grade debt
2. **`high_yield`** - High yield debt
3. **`infra_debt`** - Infrastructure debt
4. **`senior_secured`** - Senior secured debt
5. **`subordinated`** - Subordinated debt
6. **`bonds`** - Bonds
7. **`loan_agreement`** - Loan agreements

### Geographic Focus (10 keys) - **SHARED**
8. **`us_market`** - United States market ⭐
9. **`emerging_markets`** - Emerging markets ⭐
10. **`asia_em`** - Asia emerging markets ⭐
11. **`africa_em`** - Africa emerging markets ⭐
12. **`emea_em`** - EMEA emerging markets ⭐
13. **`vietnam`** - Vietnam ⭐
14. **`mongolia`** - Mongolia ⭐
15. **`turkey`** - Turkey ⭐

### Sector Focus (2 keys) - **SHARED**
16. **`transport_infra`** - Transport infrastructure ⭐
17. **`energy_infra`** - Energy infrastructure ⭐

### Constraints & Requirements (4 keys)
18. **`quasi_sovereign_only`** - Quasi-sovereign only
19. **`public_bond_high_yield`** - Public bond high yield
20. **`coal`** - Coal exposure
21. **`more_expensive_than_usual`** - More expensive than usual
22. **`require_bank_guarantee`** - Requires bank guarantee

## Shared Preference Keys (10 Total)

These keys are used for cross-CRM matching between capital partners and sponsors:

```
transport_infra
energy_infra
us_market
emerging_markets
asia_em
africa_em
emea_em
vietnam
mongolia
turkey
```

## Value Definitions

- **`Y`** - Yes, this preference is required/preferred
- **`N`** - No, this preference is excluded
- **`any`** - No preference (default)

### Normalization Rules

**True values** → `Y`: `"y"`, `"yes"`, `"true"`, `"1"`
**False values** → `N`: `"n"`, `"no"`, `"false"`, `"0"`, `""`
**Other values** → `any`: `null`, undefined, or any other string

## Implementation

### TypeScript (Frontend)

```typescript
// frontend/src/types/liquidity.ts (all 24 keys)
export interface InvestmentPreferences {
  investment_grade: string;
  high_yield: string;
  infra_debt: string;
  senior_secured: string;
  subordinated: string;
  bonds: string;
  loan_agreement: string;
  quasi_sovereign_only: string;
  public_bond_high_yield: string;
  us_market: string;
  emerging_markets: string;
  asia_em: string;
  africa_em: string;
  emea_em: string;
  vietnam: string;
  mongolia: string;
  turkey: string;
  coal: string;
  energy_infra: string;
  transport_infra: string;
  more_expensive_than_usual: string;
  require_bank_guarantee: string;
}

// frontend/src/constants/shared.ts (shared 10 keys)
export const SHARED_PREFERENCE_KEYS = [
  'transport_infra',
  'energy_infra',
  'us_market',
  'emerging_markets',
  'asia_em',
  'africa_em',
  'emea_em',
  'vietnam',
  'mongolia',
  'turkey'
] as const;
```

### Python (Backend)

```python
# backend/src/constants/shared.py (shared 10 keys)
SHARED_PREFERENCE_KEYS = (
    "transport_infra",
    "energy_infra",
    "us_market",
    "emerging_markets",
    "asia_em",
    "africa_em",
    "emea_em",
    "vietnam",
    "mongolia",
    "turkey",
)
```

## Sync Requirements

⚠️ **IMPORTANT**: When updating preferences, you MUST update:
1. This canonical definition (`shared/constants/preferences.md`)
2. Frontend type definition (`frontend/src/types/liquidity.ts`)
3. Frontend shared keys (`frontend/src/constants/shared.ts`)
4. Backend shared keys (`backend/src/constants/shared.py`)
5. Run validation: `python shared/scripts/validate-sync.py`

## Used In

**Frontend:**
- `frontend/src/types/liquidity.ts`
- `frontend/src/types/sponsors.ts`
- `frontend/src/types/counsel.ts`
- `frontend/src/components/liquidity/PreferencesGrid.tsx`
- `frontend/src/pages/investment-strategies/InvestmentStrategiesPage.tsx`

**Backend:**
- `backend/src/services/investment_profiles.py`
- `backend/src/services/investment_matching.py`

## Notes

- **Liquidity Module**: Uses all 24 preference keys
- **Sponsors Module**: Uses simplified 8 preference keys (subset)
- **Counsel Module**: Uses all 24 preference keys (same as Liquidity)
- **Matching Engine**: Only uses the 10 shared keys for cross-CRM matching
