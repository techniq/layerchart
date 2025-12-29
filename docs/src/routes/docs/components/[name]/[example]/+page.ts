import type { LoadedExample } from '$lib/types.js';

export async function load({ params, parent }) {
	const { allExamples, allSources } = await parent();

	// Eagerly load the specific example for this page
	const examplePath = `/src/examples/components/${params.name}/${params.example}.svelte`;

	let example: LoadedExample | null = null;

	if (allExamples[examplePath] && allSources[examplePath]) {
		const [componentModule, rawSource] = await Promise.all([
			allExamples[examplePath](),
			allSources[examplePath]()
		]);

		const component = componentModule.default ?? componentModule;
		// Clean up source by removing export statements
		const source = (rawSource as string).replace(/^.*export .*;.*$/gm, '');

		example = { component, source };
	}

	return {
		example,
		meta: {
			tableOfContents: false
		}
	};
}
