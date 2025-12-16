import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Set Cross-Origin headers for WebContainer support (SharedArrayBuffer requirement)
	// Only apply to the playground page to minimize impact
	if (event.url.pathname.startsWith('/docs/playground')) {
		response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
		response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	}

	return response;
};
