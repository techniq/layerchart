## Complete Examples

### Example 1: Client-Side Component Test

Real browser testing with user interactions:

```typescript
// button.svelte.test.ts
import { render } from 'vitest-browser-svelte';
import { test, expect, describe } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import Button from './button.svelte';

describe('Button Component', () => {
	test('increments counter on click', async () => {
		const { page } = render(Button, { props: { label: 'Click me' } });

		const button = page.getByRole('button', { name: /click me/i });

		await userEvent.click(button);
		await expect.element(button).toHaveTextContent('Clicked: 1');

		await userEvent.click(button);
		await expect.element(button).toHaveTextContent('Clicked: 2');
	});

	test('supports keyboard interaction', async () => {
		render(Button, { props: { label: 'Press me' } });

		const button = page.getByRole('button', { name: /press me/i });
		await button.focus();
		await userEvent.keyboard('{Enter}');

		await expect.element(button).toHaveTextContent('Clicked: 1');
	});

	test('handles multiple buttons with .first()', async () => {
		render(ButtonGroup); // Renders multiple buttons

		// Handle multiple buttons explicitly
		const firstButton = page.getByRole('button').first();
		const secondButton = page.getByRole('button').nth(1);

		await firstButton.click();
		await expect.element(firstButton).toHaveTextContent('Clicked: 1');

		await secondButton.click();
		await expect
			.element(secondButton)
			.toHaveTextContent('Clicked: 1');
	});
});
```

### Example 2: Testing Svelte 5 Runes

```typescript
// counter.svelte.test.ts
import { render } from 'vitest-browser-svelte';
import { test, expect } from 'vitest';
import { untrack, flushSync } from 'svelte';
import Counter from './counter.svelte';

test('$state and $derived reactivity', async () => {
	const { component } = render(Counter);

	// Access $state value directly
	expect(component.count).toBe(0);

	// Update state
	component.increment();

	// Force synchronous update
	flushSync(() => {});

	// Access $derived value with untrack
	const doubled = untrack(() => component.doubled);
	expect(doubled).toBe(2);
});

test('form validation lifecycle', async () => {
	const { component } = render(FormComponent);

	// Initially valid (no validation run yet)
	expect(untrack(() => component.isFormValid())).toBe(true);

	// Trigger validation
	component.validateAllFields();

	// Now invalid (empty required fields)
	expect(untrack(() => component.isFormValid())).toBe(false);

	// Fix validation errors
	component.email.value = 'test@example.com';
	component.validateAllFields();

	// Valid again
	expect(untrack(() => component.isFormValid())).toBe(true);
});
```

### Example 3: Server-Side API Test

Test with real FormData/Request objects:

```typescript
// api/users/server.test.ts
import { test, expect, describe, vi } from 'vitest';
import { POST } from './+server';
import * as database from '$lib/server/database';

vi.mock('$lib/server/database');

describe('POST /api/users', () => {
	test('creates user with valid data', async () => {
		// Mock only external services
		vi.mocked(database.createUser).mockResolvedValue({
			id: '123',
			email: 'user@example.com',
		});

		// Use real FormData
		const formData = new FormData();
		formData.append('email', 'user@example.com');
		formData.append('password', 'securepass123');

		// Use real Request object
		const request = new Request('http://localhost/api/users', {
			method: 'POST',
			body: formData,
		});

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.email).toBe('user@example.com');
		expect(database.createUser).toHaveBeenCalledWith({
			email: 'user@example.com',
			password: 'securepass123',
		});
	});

	test('rejects invalid email format', async () => {
		const formData = new FormData();
		formData.append('email', 'invalid-email');
		formData.append('password', 'pass123');

		const request = new Request('http://localhost/api/users', {
			method: 'POST',
			body: formData,
		});

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.errors.email).toBeDefined();
		expect(database.createUser).not.toHaveBeenCalled();
	});

	test('handles missing required fields', async () => {
		const formData = new FormData();
		// Missing email and password

		const request = new Request('http://localhost/api/users', {
			method: 'POST',
			body: formData,
		});

		const response = await POST({ request });
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.errors.email).toBeDefined();
		expect(data.errors.password).toBeDefined();
	});
});
```

---
