# Test Fixtures for API Extraction

This directory contains Svelte component fixtures used for testing the API extraction script. These fixtures provide controlled, isolated test cases that cover all the different features and edge cases.

## 📁 Fixture Components

### Simple.svelte

Basic component demonstrating:

- Optional properties with `@default` tags
- Required properties
- JSDoc descriptions
- `@bindable` tags
- Simple type definitions (number, string)

**Properties:** 6

- `x`, `y` - Optional with defaults
- `width`, `height` - Required
- `fill` - Optional styling
- `ref` - Bindable reference

### Nested.svelte

Component with nested object types:

- Object properties with nested structure
- Multiple levels of nesting
- `classes` object pattern
- `props` object pattern

**Properties:** 3 (with nested objects)

- `label` - Simple string
- `props` - Object with `label` and `line` properties
- `classes` - Object with `root`, `label`, and `line` properties

### WithCommonStyle.svelte

Demonstrates type intersection:

- Intersection types (`&` operator)
- CommonStyleProps expansion
- Combined type definitions

**Properties:** 9

- Direct: `x`, `y`, `size`
- From CommonStyleProps: `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `strokeOpacity`, `opacity`

### Complex.svelte

Advanced features and edge cases:

- Union types (`|`)
- Array types
- Generic types (`Array<T>`, `Record<K, V>`)
- Function types
- Multi-line JSDoc descriptions
- Custom tags (`@experimental`)
- Deeply nested objects
- Required vs optional callbacks

**Properties:** 10+

- Union types: `position`
- Arrays: `values`, `data`
- Nested objects: `config` (with `display` and `constraints`)
- Functions: `onUpdate`, `onChange`
- Custom tags: `experimental`

### Minimal.svelte

Edge case with minimal properties:

- Single property component
- Required string property
- Simplest possible structure

**Properties:** 1

- `value` - Required string

### NoProps.svelte

Negative test case:

- Component without `PropsWithoutHTML` naming
- Should be skipped by extraction
- Tests component filtering logic

## 🧪 Test Coverage

These fixtures enable testing of:

### ✅ Type Extraction

- Simple types (string, number, boolean)
- Union types
- Array types
- Generic types
- Function types
- Object types

### ✅ JSDoc Features

- Descriptions
- `@default` tags
- `@bindable` tags
- Custom tags (e.g., `@experimental`)
- Multi-line descriptions

### ✅ Property Metadata

- Optional vs required
- Default values
- Nested properties
- Type intersections

### ✅ Edge Cases

- Single property components
- Components with many properties
- Deeply nested objects
- Components without PropsWithoutHTML type

## 🚀 Usage

The fixtures are used directly by the main extraction script in `../../scripts/generate-component-api.ts`:

```typescript
import { extractAPIs } from '../scripts/generate-component-api.js';

// Extract all APIs from the fixtures directory
const apis = extractAPIs(fixturesDir);
```

This ensures that **the tests validate the same code that's used in production**, eliminating duplication and keeping tests aligned with actual functionality.

## 📊 Test Results

All 34 tests pass using these fixtures:

- ✅ Component discovery (7 tests)
- ✅ Basic properties (5 tests)
- ✅ Nested objects (4 tests)
- ✅ Type expansion (2 tests)
- ✅ Advanced features (7 tests)
- ✅ Edge cases (2 tests)
- ✅ Type formatting (2 tests)
- ✅ JSDoc extraction (3 tests)
- ✅ Data validation (2 tests)

## 🎯 Benefits

Using fixtures with the main extraction script:

1. **No Duplication** - Tests use the same code as production
2. **Isolation** - Tests don't depend on actual component implementations
3. **Control** - Precise control over test cases
4. **Coverage** - Comprehensive coverage of all features
5. **Speed** - Faster test execution
6. **Stability** - Tests won't break when actual components change
7. **Clarity** - Clear examples of each feature being tested
8. **Alignment** - Tests validate the actual production code path
