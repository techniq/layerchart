/**
 * Glob-based example loaders
 *
 * ONLY import this module when you need to iterate over ALL examples
 * (e.g., screenshot generation). For normal page loading, use $lib/examples.ts instead.
 *
 * Using import.meta.glob causes Vite to pre-transform all matched files during development.
 */

export const componentExamples = import.meta.glob(
	'/src/examples/components/**/*.svelte',
	{ import: 'default' }
);

export const componentSources = import.meta.glob(
	'/src/examples/components/**/*.svelte',
	{ import: 'default', query: '?raw' }
);

export const utilExamples = import.meta.glob(
	'/src/examples/utils/**/*.svelte',
	{ import: 'default' }
);

export const utilSources = import.meta.glob(
	'/src/examples/utils/**/*.svelte',
	{ import: 'default', query: '?raw' }
);
