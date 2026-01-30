---
name: add-feature
description: Guides adding new features to the dish-manager React app. Use when implementing new functionality, components, hooks, or utilities. Ensures consistency with established architectural patterns.
---

# Add Feature to Dish Manager

Follow these patterns and guidelines when adding features to the dish-manager codebase.

## Architecture Overview

**Tech Stack:** React 19 + TypeScript (strict) + Vite + Tailwind CSS + Firebase

**Key Principle:** Simplicity over abstraction. Only add what's necessary.

## Step-by-Step Feature Implementation

### 1. Plan the Feature

Before coding, identify:
- [ ] What type of feature? (UI component, business logic, data model change, hook)
- [ ] Does it require new state? If yes, add to `App.tsx`
- [ ] Does it need new types? Add to `src/types.ts`
- [ ] Does it need new constants? Add to `src/constants.ts`

### 2. File Placement

| Feature Type | Location | Example |
|--------------|----------|---------|
| React component | `src/components/` | `NewComponent.tsx` |
| Custom hook | `src/hooks/` | `useNewHook.ts` |
| Business logic | `src/utils/` | `newUtility.ts` |
| Types | `src/types.ts` | Add to existing file |
| Constants | `src/constants.ts` | Add to existing file |

### 3. Follow These Patterns

#### State Management
- **All app state lives in `App.tsx`** - no local state for shared data
- Use `useState` for UI state, `useFirestore` hook for persistent data
- Pass state down via props, events up via callbacks

```typescript
// In App.tsx - add new state
const [newState, setNewState] = useState<Type>(initialValue);

// Pass to child
<ChildComponent value={newState} onChange={setNewState} />
```

#### Component Structure
- **Presentational components**: Pure display, all data via props
- **Container components**: Local state + business logic allowed

```typescript
// Presentational - preferred for most components
interface MyComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

export function MyComponent({ data, onAction }: MyComponentProps) {
  return (/* JSX */);
}
```

#### Callback Props Pattern
Always use typed callbacks for parent-child communication:

```typescript
interface Props {
  items: Item[];
  onSelect: (item: Item) => void;
  onDelete: (id: string) => void;
}
```

#### Validation Functions
Add to `src/utils/validation.ts`:

```typescript
export function validateNewThing(value: string): ValidationError | null {
  if (!value.trim()) {
    return { field: 'newThing', message: 'Value is required' };
  }
  return null;
}
```

#### Category-Specific Styling
Use Record type for category colors:

```typescript
const CATEGORY_STYLES: Record<CategoryName, { bg: string; border: string }> = {
  'Fruit shop': { bg: 'bg-green-50', border: 'border-green-200' },
  'Butchery': { bg: 'bg-red-50', border: 'border-red-200' },
  'Supermarket': { bg: 'bg-blue-50', border: 'border-blue-200' },
};
```

### 4. Testing Requirements

**All utility functions MUST have tests.**

Create test file alongside the source:
- `src/utils/newUtility.ts` → `src/utils/newUtility.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './newUtility';

describe('myFunction', () => {
  it('handles normal case', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('handles edge case', () => {
    expect(myFunction('')).toBeNull();
  });
});
```

Run tests: `npm run test:run`

### 5. Integration Checklist

Before completing the feature:

- [ ] Types added to `src/types.ts` if needed
- [ ] Constants added to `src/constants.ts` if needed
- [ ] State lifted to `App.tsx` if shared
- [ ] Props interface defined with proper types
- [ ] Callbacks use the `onAction` naming convention
- [ ] Utility functions are pure (no side effects)
- [ ] Tests written for any new utils
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:run` passes

## Anti-Patterns to Avoid

1. **Don't create new state management** - use lifted state pattern
2. **Don't add Redux/Zustand** - app is simple enough for React state
3. **Don't create helper abstractions** for one-time operations
4. **Don't add error handling** for impossible scenarios
5. **Don't modify existing code style** unless part of the feature

## Component Hierarchy Reference

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

## Data Model

```typescript
interface Dish {
  id: string;
  name: string;
  ingredients: Record<CategoryName, string[]>;
  createdAt: string;
}

type CategoryName = 'Fruit shop' | 'Butchery' | 'Supermarket';
```
