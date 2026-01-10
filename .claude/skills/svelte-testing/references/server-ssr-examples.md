## SSR Test Examples

Test server-side rendering output:

```typescript
// page.ssr.test.ts
import { test, expect, describe } from 'vitest';
import PageComponent from './+page.svelte';

describe('Page SSR', () => {
	test('renders without errors', () => {
		expect(() =>
			PageComponent.render({
				data: { title: 'Welcome' },
			}),
		).not.toThrow();
	});

	test('renders correct HTML structure', () => {
		const { html } = PageComponent.render({
			data: {
				title: 'Welcome',
				items: ['Alpha', 'Beta', 'Gamma'],
			},
		});

		expect(html).toContain('<h1>Welcome</h1>');
		expect(html).toContain('<li>Alpha</li>');
		expect(html).toContain('<li>Beta</li>');
		expect(html).toContain('<li>Gamma</li>');
	});

	test('applies correct CSS classes', () => {
		const { html } = PageComponent.render({
			data: { status: 'success' },
		});

		// Test semantic CSS classes, not implementation details
		expect(html).toContain('text-success');
		expect(html).toContain('<svg'); // Icon present
	});

	test('handles empty data gracefully', () => {
		const { html } = PageComponent.render({
			data: { items: [] },
		});

		expect(html).toContain('No items found');
	});
});
```

---
