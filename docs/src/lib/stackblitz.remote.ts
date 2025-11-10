import { query } from '$app/server';
import { z } from 'zod';
import stackblitzFiles from '$static/stackblitz-files.json';

// Import all example files at build time using Vite's import.meta.glob
// This works on Cloudflare Workers since files are bundled at build time
const exampleModules = import.meta.glob('/src/examples/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
});

export const getExample = query(
	z.object({
		component: z.string(),
		name: z.string()
	}),
	({ component, name }) => {
		// Construct the path to match import.meta.glob pattern
		const examplePath = `/src/examples/${component}/${name}.svelte`;

		// Get the source code from the pre-loaded modules
		const code = exampleModules[examplePath] as string | undefined;

		if (!code) {
			throw new Error('Example not found');
		}

		// Remove `export { data };` from the code
		const cleanCode = code.replace(/^.*export .*;.*$/gm, '');

		return {
			code: cleanCode,
			files: stackblitzFiles as Record<string, string>
		};
	}
);
