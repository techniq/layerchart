import type { Examples } from '$lib/types.js';
import { getComponentDoc } from '$lib/markdown/utils.js';
import type { Component } from 'svelte';

export const load = async ({ params }) => {
	const allExamples = import.meta.glob('/src/examples/**/*', {
		import: 'default'
	});

	const allSources = import.meta.glob('/src/examples/**/*', {
		import: 'default',
		query: '?raw'
	});

	const examples: Examples = {};
	for (const path in allExamples) {
		if (path.includes(`/src/examples/${params.name}/`)) {
			const component = (await allExamples[path]()) as Component;
			const source = (await allSources[path]()) as string;
			const name = path.split('/')?.pop()?.replace('.svelte', '') ?? 'unknown';

			// Remove `export { data };`
			// TODO: Also remove blank lines left behind
			const cleanupSource = source.replace(/^.*export .*;.*$/gm, '');

			examples[name] = { component, source: cleanupSource };
		}
	}

	return {
		...(await getComponentDoc(params.name)),
		examples,
		meta: {
			tableOfContents: true
		}
	};
};
