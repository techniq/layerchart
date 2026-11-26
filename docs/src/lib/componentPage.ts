import type { ComponentCatalog } from '@layerstack/docs/catalog';
import type { Examples } from '@layerstack/docs/examples';
import { getMarkdownComponent, loadExamplesFromMarkdown } from '$lib/content.js';

/**
 * A component page's data, for the component named `componentName`: its slug, and the folder its
 * examples are in under `src/examples/components` (ex. `Points`)
 */
export async function loadComponentPage(
	componentName: string,
	{
		params,
		parent
	}: { params: { example?: string }; parent: () => Promise<{ examples?: Examples }> }
) {
	// Get examples from parent layout
	const parentData = await parent();

	const allCatalogs = import.meta.glob('/src/examples/catalog/**/*.json', {
		import: 'default'
	});

	const { PageComponent, metadata } = await getMarkdownComponent(componentName);

	// Load the catalog file for the current component: LayerChart's, else `@layerchart/webgl`'s (for
	// its own, ex. `Surface`)
	const catalogPath = [
		`/src/examples/catalog/${componentName}.json`,
		`/src/examples/catalog/webgl/${componentName}.json`
	].find((path) => path in allCatalogs);
	const catalog: ComponentCatalog | null = catalogPath
		? ((await allCatalogs[catalogPath]()) as ComponentCatalog)
		: null;

	// Eagerly load examples referenced in the markdown content
	// Only examples explicitly in the markdown are included (not the full catalog)
	const pageExamples = await loadExamplesFromMarkdown(
		metadata.content,
		componentName // default component for implicit <Example name="..." /> usage
	);

	// If navigating directly to an individual example page, also load that specific example.
	// This is necessary because Component functions aren't serializable, so page.data.example
	// from [example]/+page.ts can't be used to update context after initialization.
	const exampleName = params.example;
	if (exampleName && !pageExamples[componentName]?.[exampleName]) {
		const { loadExample } = await import('$lib/examples.js');
		const loaded = await loadExample(componentName, exampleName);
		if (loaded) {
			if (!pageExamples[componentName]) pageExamples[componentName] = {};
			pageExamples[componentName][exampleName] = loaded;
		}
	}

	// Merge with parent examples (from /docs layout)
	// Page examples take precedence
	const examples: Examples = { ...parentData.examples, ...pageExamples };

	return {
		componentName,
		PageComponent,
		metadata,
		catalog,
		examples
	};
}
