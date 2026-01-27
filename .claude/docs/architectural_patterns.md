# Architectural Patterns

This document describes the recurring architectural patterns, design decisions, and conventions used throughout the codebase.

## State Management

### Lifted State Pattern

All application state is centralized in `App.tsx` and passed down via props.

**Implementation:** `src/App.tsx:11-13`
```
const [dishes, setDishes] = useLocalStorage<Dish[]>(STORAGE_KEY, []);
const [activeTab, setActiveTab] = useState<TabType>('create');
const [editingDish, setEditingDish] = useState<Dish | null>(null);
```

**Why:** Simple application complexity doesn't warrant Redux/Zustand. Single source of truth prevents state sync issues.

### localStorage Persistence Hook

Custom hook wraps useState with automatic localStorage sync.

**Implementation:** `src/hooks/useLocalStorage.ts:1-23`

**Pattern:**
- Generic type parameter for type safety
- JSON serialization/deserialization
- useEffect for sync on state changes
- Error handling for storage quota

**Usage locations:**
- `src/App.tsx:11` - Dish storage

---

## Component Patterns

### Presentational vs Container Separation

**Presentational Components** (pure display, receive all data via props):
- `Header.tsx` - Static title
- `SearchBar.tsx` - Controlled input with callback
- `ConfirmDialog.tsx` - Modal display only
- `TabNavigation.tsx` - Button group
- `IngredientInput.tsx` - Single form field

**Container Components** (manage local state, business logic):
- `BrowseDishes.tsx:16-37` - Selection state, search filtering, memoization
- `CreateDishForm.tsx:13-21` - Form state, validation
- `ConsolidatedList.tsx:19-27` - Clipboard interaction

### Callback Props Pattern

Components expose typed callback props for parent-child communication.

**Example:** `src/components/BrowseDishes.tsx:10-14`
```typescript
interface BrowseDishesProps {
  dishes: Dish[];
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
}
```

**Applied in:**
- `DishCard.tsx:8-12` - onEdit, onDelete, onSelect callbacks
- `CreateDishForm.tsx:8-11` - onSave callback
- `CategoryIngredients.tsx:9-12` - onChange callback
- `IngredientInput.tsx:5-9` - onChange, onRemove callbacks

---

## Data Flow

### Unidirectional Flow

All data flows down, events flow up:

```
User Action → Component Handler → Callback Prop → Parent setState → Re-render
```

**Example - Dish Creation:** `src/components/CreateDishForm.tsx:61-83`
1. User submits form
2. `handleSubmit` validates data
3. Calls `onSave(newDish)` prop
4. `App.handleSaveDish` updates state
5. `useLocalStorage` syncs to storage
6. All components re-render with new data

### Memoization for Derived Data

Expensive computations wrapped in `useMemo` with dependency arrays.

**Implementations:**
- `src/components/BrowseDishes.tsx:21-26` - Filtered dishes list
- `src/components/BrowseDishes.tsx:28-31` - Selected dishes array
- `src/components/BrowseDishes.tsx:33-36` - Consolidated shopping list

---

## Validation Pattern

### Functional Validation

Pure functions return arrays of validation errors.

**Implementation:** `src/utils/validation.ts:9-54`

**Structure:**
```typescript
interface ValidationError {
  field: string;
  message: string;
}

function validateDish(...): ValidationError[]
```

**Functions:**
- `validateDishName()` - Empty check, duplicate check (case-insensitive)
- `validateIngredients()` - At least one ingredient required
- `validateDish()` - Aggregates all validation

**Usage:** `src/components/CreateDishForm.tsx:63-67`

---

## TypeScript Patterns

### Central Type Definitions

All shared types defined in single file.

**Location:** `src/types.ts:1-18`

**Types exported:**
- `CategoryName` - Union type for category literals
- `Dish` - Main data entity
- `ConsolidatedIngredient` - Aggregated ingredient with count
- `ConsolidatedList` - Record type for categorized ingredients
- `TabType` - Navigation state
- `ValidationError` - Form error structure

### Discriminated Category Unions

Categories used as discriminants for type-safe mapping.

**Example:** `src/components/ConsolidatedList.tsx:11-15`
```typescript
const CATEGORY_STYLES: Record<CategoryName, { bg: string; border: string }> = {
  'Fruit shop': { bg: 'bg-green-50', border: 'border-green-200' },
  'Butchery': { bg: 'bg-red-50', border: 'border-red-200' },
  'Supermarket': { bg: 'bg-blue-50', border: 'border-blue-200' },
};
```

**Also in:** `src/components/CategoryIngredients.tsx:11-16`

---

## Utility Patterns

### Pure Business Logic Functions

Business logic extracted to pure functions in `utils/`.

**Consolidation:** `src/utils/consolidation.ts:4-42`
- `consolidateIngredients()` - Aggregates ingredients from multiple dishes
  - Case-insensitive deduplication
  - Count tracking for display
  - Alphabetical sorting per category

- `formatConsolidatedListForClipboard()` - Text formatting for clipboard

**Validation:** `src/utils/validation.ts:9-54`
- Pure validation functions with no side effects
- Return error arrays, never throw

---

## UI Patterns

### Tailwind Category Color Mapping

Each category has consistent color scheme across components.

**Pattern:** Record type maps CategoryName to Tailwind classes

**Locations:**
- `src/components/ConsolidatedList.tsx:11-15`
- `src/components/CategoryIngredients.tsx:11-16`
- `src/components/DishCard.tsx:11-15`

### Controlled Form Components

All form inputs are controlled (value + onChange).

**Examples:**
- `SearchBar.tsx:14-19` - Search input
- `IngredientInput.tsx:14-21` - Ingredient text input
- `CreateDishForm.tsx:85-91` - Dish name input

---

## Async Patterns

### Clipboard API

Modern async Clipboard API with error handling.

**Implementation:** `src/components/ConsolidatedList.tsx:19-27`
```typescript
const handleCopy = async () => {
  const text = formatConsolidatedListForClipboard(consolidatedList);
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

---

## Constants Management

Configuration values centralized in constants file.

**Location:** `src/constants.ts:1-7`

**Contains:**
- `CATEGORIES` - Array of category names
- `STORAGE_KEY` - localStorage key for persistence

**Why:** Single source for magic strings, easy to modify, type-safe imports.
