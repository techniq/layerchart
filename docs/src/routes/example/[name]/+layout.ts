import type { Component } from 'svelte';
import type { Examples } from '$lib/types.js';

export const load = async ({ params }) => {
	const allExamples = import.meta.glob('/src/examples/**/*', {
import: 'default'
});

	const allSources = import.meta.glob('/src/examples/**/*', {
import: 'default',
query: '?raw'
});

	// Load all examples for the given component
	const examples: Examples = {};
	for (const path in allExamples) {
		const [_, __, ___, componentName, filename] = path.split('/');

		// Only load examples for the current component
		if (componentName === params.name) {
			const component = (await allExamples[path]()) as Component;
			const source = (await allSources[path]()) as string;
			const name = filename.replace('.svelte', '');

			// Remove `export { data };`
			const cleanupSource = source.replace(/^.*export .*;.*$/gm, '');

			if (!examples[componentName]) {
				examples[componentName] = {};
			}
			examples[componentName][name] = { component, source: cleanupSource };
		}
	}

	return {
		examples
	};
};
