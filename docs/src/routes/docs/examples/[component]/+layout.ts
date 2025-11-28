import type { Component } from 'svelte';
import type { Examples } from '$lib/types.js';

export const load = async ({ params, parent }) => {
	// Get allExamples and allSources from parent layout
	const parentData = await parent();
	const { allExamples, allSources } = parentData;

	// Load all examples for this component directly from the glob imports
	const examples: Examples = {};
	const componentName = params.component;

	for (const path in allExamples) {
		// Match paths like /src/examples/components/Area/basic.svelte
		const match = path.match(/\/src\/examples\/components\/([^/]+)\/([^/]+)\.svelte$/);
		if (match && match[1] === componentName) {
			const [, comp, exampleName] = match;

			const component = (await allExamples[path]()) as Component;
			const source = (await allSources[path]()) as string;

			// Remove `export { data };`
			const cleanupSource = source.replace(/^.*export .*;.*$/gm, '');

			if (!examples[comp]) {
				examples[comp] = {};
			}
			examples[comp][exampleName] = { component, source: cleanupSource };
		}
	}

	// Merge with parent examples
	const mergedExamples = { ...parentData.examples, ...examples };

	return {
		examples: mergedExamples
	};
};
