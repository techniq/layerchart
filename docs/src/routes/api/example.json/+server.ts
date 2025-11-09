import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import stackblitzFiles from '$static/stackblitz-files.json';

// Import all example files at build time using Vite's import.meta.glob
// This works on Cloudflare Workers since files are bundled at build time
const exampleModules = import.meta.glob('/src/examples/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
});

export const GET: RequestHandler = async ({ url }) => {
	const component = url.searchParams.get('component');
	const name = url.searchParams.get('name');

	if (!component || !name) {
		return json({ error: 'Missing component or name parameter' }, { status: 400 });
	}

	try {
		// Construct the path to match import.meta.glob pattern
		const examplePath = `/src/examples/${component}/${name}.svelte`;

		// Get the source code from the pre-loaded modules
		const code = exampleModules[examplePath] as string | undefined;

		if (!code) {
			return json({ error: 'Example not found' }, { status: 404 });
		}

		// Remove `export { data };` from the code
		const cleanCode = code.replace(/^.*export .*;.*$/gm, '');

		return json({
			code: cleanCode,
			files: stackblitzFiles
		});
	} catch (error) {
		console.error('Error loading example:', error);
		return json({ error: 'Failed to load example' }, { status: 500 });
	}
};
