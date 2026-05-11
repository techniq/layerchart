import type { ComponentCatalog } from '@layerstack/docs/catalog';
import { getMarkdownComponent, loadExamplesFromMarkdown } from '$lib/content.js';
import type { Examples } from '$lib/types.js';

export const load = async ({ params, url, parent }) => {
	// Get examples from parent layout
	const parentData = await parent();

	const allCatalogs = import.meta.glob('/src/examples/catalog/*.json', {
		import: 'default'
	});

	const { PageComponent, metadata } = await getMarkdownComponent(params.name);

	// Load the catalog file for the current component
	const catalogPath = `/src/examples/catalog/${params.name}.json`;
	const catalog: ComponentCatalog | null =
		catalogPath in allCatalogs ? ((await allCatalogs[catalogPath]()) as ComponentCatalog) : null;

	// Eagerly load examples referenced in the markdown content
	// Only examples explicitly in the markdown are included (not the full catalog)
	const pageExamples = await loadExamplesFromMarkdown(
		metadata.content,
		params.name // default component for implicit <Example name="..." /> usage
	);

	// If navigating directly to an individual example page, also load that specific example.
	// This is necessary because Component functions aren't serializable, so page.data.example
	// from [example]/+page.ts can't be used to update context after initialization.
	const urlSegments = url.pathname.split('/');
	const exampleName = urlSegments.length >= 5 ? urlSegments[4] : null;
	// Skip known route names that aren't actual examples
	const knownRoutes = ['examples', 'llms.txt'];
	if (
		exampleName &&
		!knownRoutes.includes(exampleName) &&
		!pageExamples[params.name]?.[exampleName]
	) {
		const { loadExample } = await import('$lib/examples.js');
		const loaded = await loadExample(params.name, exampleName);
		if (loaded) {
			if (!pageExamples[params.name]) pageExamples[params.name] = {};
			pageExamples[params.name][exampleName] = loaded;
		}
	}

	// Merge with parent examples (from /docs layout)
	// Page examples take precedence
	const examples: Examples = { ...parentData.examples, ...pageExamples };

	return {
		PageComponent,
		metadata,
		catalog,
		examples
	};
};
