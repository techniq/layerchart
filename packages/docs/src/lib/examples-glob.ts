/**
 * Glob-based example loaders.
 *
 * ONLY import this module when you need to iterate over ALL examples
 * (for example, screenshot generation). For normal page loading, keep a
 * docs-local lazy dynamic import adapter.
 *
 * Using import.meta.glob causes Vite to pre-transform all matched files during development.
 */

export const componentExamples = import.meta.glob('/src/examples/components/**/*.svelte', {
	import: 'default'
});

export const componentSources = import.meta.glob('/src/examples/components/**/*.svelte', {
	import: 'default',
	query: '?raw'
});

export const utilExamples = import.meta.glob('/src/examples/utils/**/*.svelte', {
	import: 'default'
});

export const utilSources = import.meta.glob('/src/examples/utils/**/*.svelte', {
	import: 'default',
	query: '?raw'
});
