# Core Principles

## 1. Always Use Locators, Never Containers

vitest-browser-svelte uses Playwright-style locators with automatic
retry logic. **Never** use the `container` object.

```typescript
// ❌ NEVER - No retry logic, brittle tests
const { container } = render(MyComponent);
const button = container.querySelector('button');

// ✅ ALWAYS - Auto-retry, resilient tests
render(MyComponent);
const button = page.getByRole('button', { name: 'Submit' });
await button.click();
```

## 2. Handle Strict Mode Violations

When multiple elements match a locator, use `.first()`, `.nth()`, or
`.last()`:

```typescript
// ❌ FAILS: "strict mode violation: resolved to 2 elements"
page.getByRole('link', { name: 'Home' }); // Desktop + mobile nav

// ✅ CORRECT: Handle multiple elements explicitly
page.getByRole('link', { name: 'Home' }).first();
page.getByRole('link', { name: 'Home' }).nth(1); // Second element
page.getByRole('link', { name: 'Home' }).last();
```

## 3. Use `untrack()` for $derived Values

Svelte 5 runes require `untrack()` when accessing `$derived` values in
tests:

```typescript
import { untrack } from 'svelte';

// ✅ Access $derived values
const value = untrack(() => component.derivedValue);
expect(value).toBe(42);

// ✅ For getters: get function first, then untrack
const derivedFn = component.computedValue;
expect(untrack(() => derivedFn())).toBe(expected);
```

## 4. Real FormData/Request Objects

Use real web APIs instead of heavy mocking to catch client-server
mismatches:

```typescript
// ❌ BRITTLE: Mocks hide API mismatches
const mockRequest = {
	formData: vi.fn().mockResolvedValue({
		get: vi.fn().mockReturnValue('test@example.com'),
	}),
};

// ✅ ROBUST: Real FormData catches mismatches
const formData = new FormData();
formData.append('email', 'test@example.com');
const request = new Request('http://localhost/api/users', {
	method: 'POST',
	body: formData,
});

// Only mock external services
vi.mocked(database.createUser).mockResolvedValue({
	id: '123',
	email: 'test@example.com',
});
```
