# Dish Ingredient Manager

A React web application for managing dishes with categorized ingredients and generating consolidated shopping lists organized by store category.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework with functional components/hooks |
| TypeScript | 5.9.3 | Type safety (strict mode enabled) |
| Vite | 7.2.4 | Build tool and dev server with HMR |
| Tailwind CSS | 4.1.18 | Utility-first styling |
| ESLint | 9.39.1 | Code linting |

## Project Structure

```
src/
├── components/     # React UI components (11 files)
├── hooks/          # Custom React hooks
├── utils/          # Business logic utilities
├── types.ts        # Central TypeScript type definitions
├── constants.ts    # App configuration (categories, storage key)
├── App.tsx         # Root component with lifted state
└── main.tsx        # React DOM entry point
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Presentational and container React components |
| `src/hooks/` | Custom hooks (`useLocalStorage` for persistence) |
| `src/utils/` | Pure functions for validation and data consolidation |

### Important Files

| File | Purpose | Reference |
|------|---------|-----------|
| `src/types.ts` | All TypeScript interfaces (`Dish`, `CategoryName`, `ConsolidatedList`) | types.ts:1-18 |
| `src/constants.ts` | Category names and localStorage key | constants.ts:1-7 |
| `src/App.tsx` | State management and component orchestration | App.tsx:11-56 |
| `src/hooks/useLocalStorage.ts` | Browser storage persistence hook | useLocalStorage.ts:1-23 |
| `src/utils/validation.ts` | Form validation logic | validation.ts:9-54 |
| `src/utils/consolidation.ts` | Shopping list aggregation | consolidation.ts:4-42 |

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript compile + Vite production build
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Core Concepts

### Data Model

Three ingredient categories: `Fruit shop`, `Butchery`, `Supermarket` (defined in constants.ts:3)

```typescript
interface Dish {
  id: string;
  name: string;
  ingredients: Record<CategoryName, string[]>;
  createdAt: string;
}
```

### State Management

- All dish state lifted to `App.tsx` (lines 11-13)
- Persisted to browser localStorage via `useLocalStorage` hook
- No external state management library - plain React hooks

### No Backend

All data stored client-side in browser localStorage. No API calls.

## Component Hierarchy

```
App (state owner)
├── Header
├── TabNavigation
├── CreateDishForm
│   └── CategoryIngredients
│       └── IngredientInput
└── BrowseDishes
    ├── SearchBar
    ├── DishList → DishCard
    ├── ConfirmDialog
    └── ConsolidatedList
```

## Testing

No test framework configured. Consider adding Vitest for unit tests.

---

## Additional Documentation

When working on specific areas, consult these files:

| Topic | File | When to Use |
|-------|------|-------------|
| Architecture & Patterns | `.claude/docs/architectural_patterns.md` | Understanding design decisions, component patterns, data flow |
