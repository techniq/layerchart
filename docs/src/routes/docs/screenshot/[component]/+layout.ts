import type { Component } from 'svelte';
import type { Examples } from '@layerstack/docs/examples';
// Use glob-based imports for screenshot generation (needs to iterate all examples)
import { componentExamples, componentSources } from '@layerstack/docs/examples-glob';

export const load = async ({ params }) => {
	// Load all examples for this component directly from the glob imports
	const examples: Examples = {};
	const componentName = params.component;

	for (const path in componentExamples) {
		// Match paths like /src/examples/components/Area/basic.svelte
		const match = path.match(/\/src\/examples\/components\/([^/]+)\/([^/]+)\.svelte$/);
		if (match && match[1] === componentName) {
			const [, comp, exampleName] = match;

			try {
				const component = (await componentExamples[path]()) as Component;
				const source = (await componentSources[path]()) as string;

				// Remove `export { data };`
				const cleanupSource = source.replace(/(\n\s*)*^.*export .*;.*$(\n\s*)*/gm, '\n');

				if (!examples[comp]) {
					examples[comp] = {};
				}
				examples[comp][exampleName] = { component, source: cleanupSource, module: {} };
			} catch (err) {
				// Skip broken examples so one failure doesn't kill the whole batch load
				console.warn(`Failed to load example ${comp}/${exampleName}:`, err);
			}
		}
	}

	return {
		examples
	};
};
