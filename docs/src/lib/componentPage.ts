import type { ComponentCatalog } from '@layerstack/docs/catalog';
import type { Examples } from '@layerstack/docs/examples';
import { allComponents } from 'content-collections';
import { getMarkdownComponent, loadExamplesFromMarkdown } from '$lib/content.js';

/**
 * A component page's data, for the component named `componentName`: its slug, and the folder its
 * examples are in under `src/examples/components` (ex. `Points`, or `webgl/Points` for
 * `@layerchart/webgl`'s, whose names repeat LayerChart's)
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

	// Load the catalog file for the current component
	const catalogPath = `/src/examples/catalog/${componentName}.json`;
	const loaded: ComponentCatalog | null =
		catalogPath in allCatalogs ? ((await allCatalogs[catalogPath]()) as ComponentCatalog) : null;
	const catalog = loaded && componentName.startsWith('webgl/') ? webglCatalog(loaded) : loaded;

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

/**
 * A `@layerchart/webgl` catalog (generated from its own components and examples) with its
 * components named as their pages are, `webgl/<name>`, so its examples load from their folder and
 * its links go to the WebGL pages rather than LayerChart's same-named ones
 */
function webglCatalog(catalog: ComponentCatalog): ComponentCatalog {
	const pages = new Set(
		allComponents.filter((c) => c.slug.startsWith('webgl/')).map((c) => c.slug.slice(6))
	);
	const rename = (name: string) => (pages.has(name) ? `webgl/${name}` : name);
	const repath = (path: string) =>
		path.replace(/^\/docs\/components\/([^/]+)\//, (whole, name) =>
			pages.has(name) ? `/docs/components/webgl/${name}/` : whole
		);
	return {
		...catalog,
		component: rename(catalog.component),
		examples: catalog.examples.map((example) => ({
			...example,
			path: example.path && repath(example.path),
			components: example.components?.map((usage) => ({
				...usage,
				component: rename(usage.component)
			}))
		})),
		usage: catalog.usage?.map((usage) => ({
			...usage,
			component: rename(usage.component),
			path: usage.path && repath(usage.path)
		}))
	} as ComponentCatalog;
}
