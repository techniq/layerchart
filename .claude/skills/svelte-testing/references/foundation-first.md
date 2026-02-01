## Foundation First Methodology

**Aim for 100% test coverage** by planning comprehensive test
structure before implementation.

### Step 1: Create Test Structure with `.skip`

```typescript
// form.svelte.test.ts
import { test, describe } from 'vitest';

describe('ContactForm', () => {
	describe('Initial Rendering', () => {
		test.skip('renders with default props', () => {});
		test.skip('renders all form fields', () => {});
		test.skip('has proper ARIA labels', () => {});
	});

	describe('Form Validation', () => {
		test.skip('validates email format', () => {});
		test.skip('requires all fields', () => {});
		test.skip('shows validation errors', () => {});
		test.skip('validates on blur', () => {});
	});

	describe('User Interactions', () => {
		test.skip('handles input changes', () => {});
		test.skip('clears form on reset', () => {});
		test.skip('disables submit when invalid', () => {});
	});

	describe('Edge Cases', () => {
		test.skip('handles empty submission', () => {});
		test.skip('handles server errors', () => {});
		test.skip('shows loading state', () => {});
	});

	describe('Accessibility', () => {
		test.skip('supports keyboard navigation', () => {});
		test.skip('announces errors to screen readers', () => {});
	});
});
```

### Step 2: Implement Tests Incrementally

Remove `.skip` as you implement each test:

```typescript
describe('ContactForm', () => {
	describe('Initial Rendering', () => {
		test('renders with default props', async () => {
			render(ContactForm);

			await expect
				.element(page.getByRole('textbox', { name: /email/i }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('textbox', { name: /message/i }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /submit/i }))
				.toBeInTheDocument();
		});

		test.skip('renders all form fields', () => {});
		// Continue implementing...
	});
});
```

---
