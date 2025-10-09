import type { Examples } from '$lib/types.js';
import { getComponentDoc } from '$lib/markdown/utils.js';
import type { Component } from 'svelte';

export const load = async ({ params }) => {
	// const [directory, componentName] = params.slug.split('/');
	const componentName = params.slug;

	const allExamples = import.meta.glob('/src/examples/**/*', {
		import: 'default'
	});

	const allSources = import.meta.glob('/src/examples/**/*', {
		import: 'default',
		query: '?raw'
	});

	const examples: Examples = {};
	for (const path in allExamples) {
		if (path.includes(`/src/examples/${componentName}/`)) {
			const component = (await allExamples[path]()) as Component;
			const source = (await allSources[path]()) as string;
			const name = path.split('/')?.pop()?.replace('.svelte', '') ?? 'unknown';

			examples[name] = { component, source };
		}
	}

	return {
		...(await getComponentDoc(params.slug)),
		examples
	};
};
