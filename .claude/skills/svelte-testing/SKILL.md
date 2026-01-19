---
name: svelte-testing
# prettier-ignore
description: Fix and create Svelte 5 tests with vitest-browser-svelte and Playwright. Use when fixing broken tests, debugging failures, writing unit/SSR/e2e tests, or working with vitest/Playwright.
---

# Svelte Testing

## Quick Start

```typescript
// Client-side component test (.svelte.test.ts)
import { render } from 'vitest-browser-svelte';
import { expect } from 'vitest';
import Button from './button.svelte';

test('button click increments counter', async () => {
	const { page } = render(Button);
	const button = page.getByRole('button', { name: /click me/i });

	await button.click();
	await expect.element(button).toHaveTextContent('Clicked: 1');
});
```

## Core Principles

- **Always use locators**: `page.getBy*()` methods, never containers
- **Multiple elements**: Use `.first()`, `.nth()`, `.last()` to avoid
  strict mode violations
- **Use untrack()**: When accessing `$derived` values in tests
- **Real API objects**: Test with FormData/Request, minimal mocking

## Reference Files

- [core-principles](references/core-principles.md) |
  [foundation-first](references/foundation-first.md) |
  [client-examples](references/client-examples.md)
- [server-ssr-examples](references/server-ssr-examples.md) |
  [critical-patterns](references/critical-patterns.md)
- [client-server-alignment](references/client-server-alignment.md) |
  [troubleshooting](references/troubleshooting.md)

## Notes

- Never click SvelteKit form submit buttons - Always use
  `await expect.element()`
- Test files: `.svelte.test.ts` (client), `.ssr.test.ts` (SSR),
  `server.test.ts` (API)

<!--
PROGRESSIVE DISCLOSURE GUIDELINES:
- Keep this file ~50 lines total (max ~150 lines)
- Use 1-2 code blocks only (recommend 1)
- Keep description <200 chars for Level 1 efficiency
- Move detailed docs to references/ for Level 3 loading
- This is Level 2 - quick reference ONLY, not a manual
-->
