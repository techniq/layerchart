import type { Component } from 'svelte';
import { createGlobExampleLoaders } from '@layerstack/docs/examples';

export const { loadExample, loadExamples, loadExampleByPath } = createGlobExampleLoaders({
	// `@layerchart/webgl`'s components are `webgl/<name>`, their examples a folder down (a dynamic
	// import's variables can't span folders)
	loadComponentExample: (type, component, name) =>
		component.startsWith('webgl/')
			? import(`../examples/${type}/webgl/${component.slice(6)}/${name}.svelte`)
			: import(`../examples/${type}/${component}/${name}.svelte`),
	loadRawExampleModule: (type, component, name) =>
		component.startsWith('webgl/')
			? import(`../examples/${type}/webgl/${component.slice(6)}/${name}.svelte?raw`)
			: import(`../examples/${type}/${component}/${name}.svelte?raw`),
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
