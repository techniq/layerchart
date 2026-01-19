## Client-Server Alignment

### The Problem

Heavy mocking in server tests can hide client-server mismatches that
only appear in production.

### The Solution

Use real `FormData` and `Request` objects. Only mock external services
(database, APIs).

```typescript
// ❌ BRITTLE APPROACH
const mockRequest = {
	formData: vi.fn().mockResolvedValue({
		get: vi.fn((key) => {
			if (key === 'email') return 'test@example.com';
			if (key === 'password') return 'pass123';
		}),
	}),
};
// This passes even if real FormData API differs!

// ✅ ROBUST APPROACH
const formData = new FormData();
formData.append('email', 'test@example.com');
formData.append('password', 'pass123');

const request = new Request('http://localhost/register', {
	method: 'POST',
	body: formData,
});

// Only mock external services
vi.mocked(database.createUser).mockResolvedValue({
	id: '123',
	email: 'test@example.com',
});

const response = await POST({ request });
```

### Shared Validation Logic

Use the same validation on client and server:

```typescript
// lib/validation.ts
export function validateEmail(email: string) {
	if (!email) return 'Email is required';
	if (!email.includes('@')) return 'Invalid email format';
	return null;
}

// Component test
import { validateEmail } from '$lib/validation';
test('validates email', () => {
	expect(validateEmail('')).toBe('Email is required');
	expect(validateEmail('invalid')).toBe('Invalid email format');
	expect(validateEmail('test@example.com')).toBe(null);
});

// Server test - same validation!
const emailError = validateEmail(formData.get('email'));
if (emailError) {
	return json({ errors: { email: emailError } }, { status: 400 });
}
```

---
