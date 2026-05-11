import type { Component } from 'svelte';
import { createExampleLoaders } from '@layerstack/docs/examples';

const pathExamples = import.meta.glob<{ default: Component }>([
	'/src/routes/**/*.svelte',
	'/src/content/**/*.svelte'
]);

const rawPathExamples = import.meta.glob<string>(
	['/src/routes/**/*.svelte', '/src/content/**/*.svelte'],
	{
		query: '?raw',
		import: 'default'
	}
);

export const { loadExample, loadExamples, loadExampleByPath } = createExampleLoaders({
	loadComponentExample: (type, component, name) =>
		import(`../examples/${type}/${component}/${name}.svelte`),
	loadRawExample: async (type, component, name) => {
		const raw = await import(`../examples/${type}/${component}/${name}.svelte?raw`);
		return raw.default as string;
	},
	loadPathExample: (path) => pathExamples[path]?.(),
	loadRawPathExample: (path) => rawPathExamples[path]?.()
});
