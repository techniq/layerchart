import type { ComponentAPI } from '$lib/api-types.js';
import type { ComponentCatalog } from '$examples/catalog/types.js';
import { getMarkdownComponent, loadExamplesFromMarkdown } from '$lib/markdown/utils.js';

export const load = async ({ params, parent }) => {
	// Get allExamples, allSources, and examples from parent layout
	const parentData = await parent();
	const { allExamples, allSources } = parentData;

	const allAPIs = import.meta.glob('/src/generated/api/*.json', {
		import: 'default'
	});

	const allCatalogs = import.meta.glob('/src/examples/catalog/*.json', {
		import: 'default'
	});

	const { PageComponent, metadata } = await getMarkdownComponent(params.name, 'utils');

	// Load the catalog file for the current util
	const catalogPath = `/src/examples/catalog/${params.name}.json`;
	const catalog: ComponentCatalog | null =
		catalogPath in allCatalogs ? ((await allCatalogs[catalogPath]()) as ComponentCatalog) : null;

	// Load examples from markdown content and catalog
	const pageExamples = await loadExamplesFromMarkdown(
		metadata.content,
		catalog,
		allExamples,
		allSources,
		params.name, // default component for implicit <Example name="..." /> usage
		'utils' // type parameter to look in /src/examples/utils/
	);

	// Merge with parent examples (from /docs layout)
	// Page examples take precedence
	const examples = { ...parentData.examples, ...pageExamples };

	// Load component API (utils may have API documentation too)
	let api: ComponentAPI | null = null;
	const apiPath = `/src/generated/api/${params.name}.json`;
	if (allAPIs[apiPath]) {
		try {
			api = (await allAPIs[apiPath]()) as ComponentAPI;
		} catch (error) {
			console.warn(`Failed to load API file for util: ${params.name}`, error);
		}
	}

	return {
		PageComponent,
		metadata,
		catalog,
		examples,
		api,
		meta: {
			tableOfContents: true
		}
	};
};
