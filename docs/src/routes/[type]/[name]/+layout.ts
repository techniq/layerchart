import type { Component } from 'svelte';
import type { Examples } from '$lib/types.js';
import type { ComponentAPI } from '$lib/api-types.js';
import { getMarkdownComponent } from '$lib/markdown/utils.js';

export const load = async ({ params }) => {
	const allExamples = import.meta.glob('/src/examples/**/*', {
		import: 'default'
	});

	const allSources = import.meta.glob('/src/examples/**/*', {
		import: 'default',
		query: '?raw'
	});

	const allAPIs = import.meta.glob('/src/generated/api/*.json', {
		import: 'default'
	});

	const { PageComponent, metadata } = await getMarkdownComponent(
		params.type as 'components' | 'examples',
		params.name
	);

	// Extract all <Example component="..." name="..."> from markdown page
	const regex = /<Example\s+([^>]*?)\/>/g;
	const matches = [...metadata.content.matchAll(regex)];

	const pageExamples = matches.map((match) => {
		const attrs = match[1];
		const component = attrs.match(/component="([^"]*?)"/)?.[1] || params.name; // use page component name if not explicit (ex. <Example name="basic" />);
		const name = attrs.match(/name="([^"]*?)"/)?.[1] || null;
		return { component, name };
	});

	const examples: Examples = {};
	for (const path in allExamples) {
		if (
			pageExamples.some(
				(example) => path === `/src/examples/${example.component}/${example.name}.svelte`
			)
		) {
			const component = (await allExamples[path]()) as Component;
			const source = (await allSources[path]()) as string;
			const [_, __, ___, componentName, filename] = path.split('/');
			const name = filename.replace('.svelte', '');

			// Remove `export { data };`
			// TODO: Also remove blank lines left behind
			const cleanupSource = source.replace(/^.*export .*;.*$/gm, '');

			if (!examples[componentName]) {
				examples[componentName] = {};
			}
			examples[componentName][name] = { component, source: cleanupSource };
		}
	}

	// Load component API if this is a component page
	let api: ComponentAPI | null = null;
	if (params.type === 'components') {
		const apiPath = `/src/generated/api/${params.name}.json`;
		if (allAPIs[apiPath]) {
			try {
				api = (await allAPIs[apiPath]()) as ComponentAPI;
			} catch (error) {
				console.warn(`Failed to load API file for component: ${params.name}`, error);
			}
		} else {
			console.warn(`No API file found for component: ${params.name}`);
		}
	}

	return {
		PageComponent,
		metadata,
		examples,
		api,
		meta: {
			tableOfContents: true
		}
	};
};
