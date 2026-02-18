## Critical Patterns

### Form Handling in SvelteKit

**NEVER click submit buttons** in SvelteKit forms - they trigger full
page navigation:

```typescript
// ❌ DON'T - Causes navigation/hangs
const submit = page.getByRole('button', { name: /submit/i });
await submit.click(); // ⚠️ Infinite hang

// ✅ DO - Test form state directly
render(MyForm, { props: { errors: { email: 'Required' } } });

const emailInput = page.getByRole('textbox', { name: /email/i });
await emailInput.fill('test@example.com');

// Verify form state
await expect.element(emailInput).toHaveValue('test@example.com');

// Test error display
await expect.element(page.getByText('Required')).toBeInTheDocument();
```

### Semantic Queries (Preferred)

Use semantic role-based queries for better accessibility and
maintainability:

```typescript
// ✅ BEST - Semantic queries
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('heading', { name: 'Welcome', level: 1 });
page.getByLabel('Email address');
page.getByText('Welcome back');

// ⚠️ OK - Use when no role available
page.getByTestId('custom-widget');
page.getByPlaceholder('Enter your email');

// ❌ AVOID - Brittle, implementation-dependent
container.querySelector('.submit-button');
```

### Common Role Mistakes

```typescript
// ❌ WRONG: "input" is not a role
page.getByRole('input', { name: 'Email' });

// ✅ CORRECT: Use "textbox" for input fields
page.getByRole('textbox', { name: 'Email' });

// ❌ WRONG: Using link role when element has role="button"
page.getByRole('link', { name: 'Submit' }); // <a role="button">

// ✅ CORRECT: Use the actual role attribute
page.getByRole('button', { name: 'Submit' });

// ✅ Check actual roles in browser DevTools
// Right-click element → Inspect → Accessibility tab
```

### Avoid Testing Implementation Details

Test user-visible behavior, not internal implementation:

```typescript
// ❌ BRITTLE - Tests exact SVG path
expect(html).toContain(
	'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
);
// Breaks when icon library updates!

// ✅ ROBUST - Tests semantic structure
expect(html).toContain('text-success'); // CSS class
expect(html).toContain('<svg'); // Icon present

// ✅ BEST - Tests user experience
await expect
	.element(page.getByRole('img', { name: /success/i }))
	.toBeInTheDocument();
```

### Using `force: true` for Animations

```typescript
// Some elements require force: true due to animations
await button.click({ force: true });
await input.fill('text', { force: true });
```

---
