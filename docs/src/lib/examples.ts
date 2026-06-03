import type { Component } from 'svelte';
import { createGlobExampleLoaders } from '@layerstack/docs/examples';

export const { loadExample, loadExamples, loadExampleByPath } = createGlobExampleLoaders({
	loadComponentExample: (type, component, name) =>
		import(`../examples/${type}/${component}/${name}.svelte`),
	loadRawExampleModule: (type, component, name) =>
		import(`../examples/${type}/${component}/${name}.svelte?raw`),
	pathExamples: import.meta.glob<{ default: Component }>([
		'/src/routes/**/*.svelte',
		'/src/content/**/*.svelte'
	]),
	rawPathExamples: import.meta.glob<string>(
		['/src/routes/**/*.svelte', '/src/content/**/*.svelte'],
		{
			query: '?raw',
			import: 'default'
		}
	)
});
