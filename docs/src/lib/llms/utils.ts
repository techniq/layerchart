import { allComponents, allUtils, allGuides } from 'content-collections';
import { sortCollection } from '@layerstack/docs/collections';
import type { ComponentAPI } from '@layerstack/docs/api';
import {
	generateApiTable,
	generateGuideMarkdown as generateGuideMarkdownContent,
	generateReferenceMarkdown as generateReferenceMarkdownDoc,
	linkListSection,
	markdownResponse,
	trimCode,
	type ExampleSourceResolver,
	type ExampleUrlResolver
} from '@layerstack/docs/llms';

export { markdownResponse };

const exampleSources = import.meta.glob<string>('/src/examples/**/*.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const apiFiles = import.meta.glob<string>('/generated/api/*.json', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const guideSources = import.meta.glob<string>('/src/content/guides/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const gettingStartedSource = import.meta.glob<string>('/src/routes/docs/getting-started/+page.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const catalogFiles = import.meta.glob<string>('/src/examples/catalog/*.json', {
	eager: true,
	query: '?raw',
	import: 'default'
});

/** Generate URL for a docs page */
function docsUrl(baseUrl: string, type: 'components' | 'utils' | 'guides', slug: string): string {
	if (type === 'guides') {
		return `${baseUrl}/docs/${slug}`;
	}
	return `${baseUrl}/docs/${type}/${slug}`;
}

/** Generate URL for an llms.txt endpoint */
function llmsUrl(baseUrl: string, type: 'components' | 'utils' | 'guides', slug: string): string {
	return `${docsUrl(baseUrl, type, slug)}/llms.txt`;
}

interface GenerateMarkdownOptions {
	/** Base URL for the site (e.g. 'https://layerchart.com') */
	baseUrl: string;
	/** Heading level for the title. 1 = "#", 2 = "##", etc. Default: 1 */
	headingLevel?: number;
	/** Whether to inline all example code blocks. Default: false */
	inlineExamples?: boolean;
}

/**
 * Resolve an example's raw source by (component, name), trying both the components
 * and utils example directories (component/util names are unique across them).
 */
const resolveSource: ExampleSourceResolver = (component, name) => {
	if (!component) return undefined;
	return (
		getExampleSource('components', component, name) ?? getExampleSource('utils', component, name)
	);
};

/** Build the docs URL for a (cross-component) example reference that wasn't inlined. */
const makeExampleUrl =
	(baseUrl: string): ExampleUrlResolver =>
	(component, name) =>
		`${docsUrl(baseUrl, 'components', component)}/${name}`;

/**
 * Generate markdown for a component (delegates to the shared reference template, supplying
 * LayerChart-specific metadata, API, and example sections).
 */
export function generateComponentMarkdown(
	component: (typeof allComponents)[number],
	options: GenerateMarkdownOptions
): string {
	const { baseUrl, headingLevel = 1, inlineExamples = false } = options;
	const h = (level: number) => '#'.repeat(level);

	// Metadata (rendered before the content)
	const leadingSections = [
		component.category ? `**Category:** ${component.category}` : null,
		component.layers?.length ? `**Supported Layers:** ${component.layers.join(', ')}` : null
	];

	// API section (loaded from generated JSON)
	let apiSection: string | null = null;
	const apiContent = apiFiles[`/generated/api/${component.slug}.json`];
	if (apiContent) {
		const api: ComponentAPI = JSON.parse(apiContent);
		const parts = [`${h(headingLevel + 1)} API`];
		const table = generateApiTable(api);
		if (table) parts.push(table);
		if (api.extends?.length) {
			parts.push(`**Extends:** ${api.extends.map((e) => `\`${e.fullType}\``).join(', ')}`);
		}
		apiSection = parts.join('\n\n');
	}

	// Examples section (from the catalog)
	let examplesSection: string | null = null;
	const catalog = getCatalog(component.slug);
	const examples = catalog?.examples as Array<{ name: string; path: string }> | undefined;
	if (examples?.length) {
		const links = examples
			.map((ex) => `- [${ex.name}](${docsUrl(baseUrl, 'components', component.slug)}/${ex.name})`)
			.join('\n');
		examplesSection = `${h(headingLevel + 1)} Examples\n\n${links}`;
	}

	return generateReferenceMarkdownDoc(component, {
		headingLevel,
		inlineExamples,
		resolveSource,
		exampleUrl: makeExampleUrl(baseUrl),
		defaultComponent: component.slug,
		leadingSections,
		extraSections: [apiSection, examplesSection],
		relatedUrl: (r) => docsUrl(baseUrl, 'components', r)
	});
}

/**
 * Generate markdown for a utility (delegates to the shared reference template).
 */
export function generateUtilMarkdown(
	util: (typeof allUtils)[number],
	options: GenerateMarkdownOptions
): string {
	const { baseUrl, headingLevel = 1, inlineExamples = false } = options;

	return generateReferenceMarkdownDoc(util, {
		headingLevel,
		inlineExamples,
		resolveSource,
		exampleUrl: makeExampleUrl(baseUrl),
		defaultComponent: util.slug,
		relatedUrl: (r) => docsUrl(baseUrl, 'utils', r)
	});
}

/**
 * Get sorted guides list with the getting-started entry prepended
 */
function getSortedGuides(): Array<{ slug: string; name: string; description: string }> {
	return [
		{
			slug: 'getting-started',
			name: 'Getting Started',
			description: 'Installation and setup guide for LayerChart'
		},
		...sortCollection(allGuides.filter((g) => !g.draft)).map((g) => ({
			slug: `guides/${g.slug}`,
			name: g.name,
			description: g.description ?? ''
		}))
	];
}

/**
 * Load and generate markdown for a guide (delegates to the shared guide template).
 */
export function generateGuideMarkdown(options: {
	/** The name/slug of the guide (e.g., 'getting-started', 'styles') */
	name: string;
	/** Optional explicit title. If not provided, title is extracted from frontmatter,
	 *  falling back to title-casing the name. */
	title?: string;
}): string {
	const { name, title } = options;

	const raw =
		name === 'getting-started'
			? gettingStartedSource['/src/routes/docs/getting-started/+page.md']
			: guideSources[`/src/content/guides/${name}.md`];

	if (!raw) {
		throw new Error(`Guide "${name}" not found`);
	}

	const fallbackTitle = name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	return generateGuideMarkdownContent(raw, { title, fallbackTitle });
}

/**
 * Get the raw source for an example svelte file.
 */
function getExampleSource(
	type: 'components' | 'utils',
	componentSlug: string,
	exampleName: string
): string | undefined {
	const key = `/src/examples/${type}/${componentSlug}/${exampleName}.svelte`;
	return exampleSources[key];
}

/**
 * Get the parsed catalog JSON for a component.
 */
function getCatalog(componentSlug: string): Record<string, unknown> | null {
	const key = `/src/examples/catalog/${componentSlug}.json`;
	const raw = catalogFiles[key];
	if (!raw) return null;
	return JSON.parse(raw);
}

/**
 * Get all example file paths from the glob map (for listing).
 */
function getAllExamplePaths(): string[] {
	return Object.keys(exampleSources)
		.filter((key) => key.startsWith('/src/examples/components/'))
		.sort();
}

/**
 * Section listing collection items as links to their llms.txt endpoints (with a fallback
 * description), built on the shared `linkListSection` helper.
 */
function collectionListSection(
	baseUrl: string,
	title: string,
	items: Array<{ slug: string; name: string; description?: string }>,
	type: 'components' | 'utils' | 'guides'
): string {
	const fallbackLabel =
		type === 'components' ? 'component' : type === 'utils' ? 'utility' : 'guide';

	return linkListSection(
		title,
		items
			.filter((item) => item.slug && item.name)
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((item) => ({
				name: item.name,
				url: llmsUrl(baseUrl, type, item.slug),
				description: item.description || `Documentation for ${item.name} ${fallbackLabel}`
			}))
	);
}

/**
 * Generate markdown for a single component example
 */
export function generateExampleMarkdown(
	baseUrl: string,
	componentSlug: string,
	exampleName: string
): string | null {
	const raw = getExampleSource('components', componentSlug, exampleName);
	if (!raw) return null;

	const exampleSource = trimCode(raw);
	const component = allComponents.find((c) => c.slug === componentSlug);

	// Find components used in this example from the catalog
	const catalog = getCatalog(componentSlug);
	const exampleInfo = (
		catalog?.examples as
			| Array<{ name: string; components: Array<{ component: string }> }>
			| undefined
	)?.find((e) => e.name === exampleName);
	const usedComponentNames = [...new Set(exampleInfo?.components.map((c) => c.component) ?? [])];
	const usedComponents = usedComponentNames
		.map((c) => allComponents.find((ac) => ac.name === c))
		.filter((c) => c != null);

	const sections: string[] = [];

	sections.push(`# ${componentSlug} - ${exampleName}`);

	if (component?.description) {
		sections.push(component.description);
	}

	sections.push('## Code');
	sections.push('```svelte\n' + exampleSource + '\n```');

	if (usedComponents.length > 0) {
		sections.push('## Components');
		const links = usedComponents
			.map((comp) => `- [${comp.name}](${llmsUrl(baseUrl, 'components', comp.slug)})`)
			.join('\n');
		sections.push(links);
	}

	return sections.join('\n\n');
}

/**
 * Generate the llms.txt index with links to all documentation
 */
export function generateLlmsTxt(baseUrl: string): string {
	const sections: string[] = [];

	// Header
	sections.push(`# LayerChart Documentation for LLMs

> LayerChart is a powerful, composable charting library for Svelte built on top of D3.

This file contains links to LLM-optimized documentation in markdown format.`);

	// Guides
	sections.push(collectionListSection(baseUrl, 'Guides', getSortedGuides(), 'guides'));

	// Components
	sections.push(collectionListSection(baseUrl, 'Components', allComponents, 'components'));

	// Utilities
	sections.push(collectionListSection(baseUrl, 'Utilities', allUtils, 'utils'));

	// Examples
	const exampleItems = getAllExamplePaths()
		.map((path) => path.match(/\/src\/examples\/components\/([^/]+)\/([^/]+)\.svelte$/))
		.filter((match): match is RegExpMatchArray => match != null)
		.map(([, componentName, exampleName]) => ({
			name: `${componentName}/${exampleName}`,
			url: llmsUrl(baseUrl, 'components', `${componentName}/${exampleName}`),
			description: `Example code for ${componentName}`
		}));
	if (exampleItems.length > 0) {
		sections.push(linkListSection('Examples', exampleItems));
	}

	return sections.join('\n\n');
}

/**
 * Generate the full llms.txt with all components and utilities
 */
export function generateFullLlmsTxt(baseUrl: string): string {
	const sections: string[] = [];

	// Header
	sections.push(`# LayerChart Full Documentation for LLMs

> LayerChart is a powerful, composable charting library for Svelte built on top of D3.

This file contains the complete LLM-optimized documentation for all components and utilities.`);

	sections.push(collectionListSection(baseUrl, 'Guides', getSortedGuides(), 'guides'));

	// Components section - full content
	sections.push('---');
	sections.push('# Components');

	const sortedComponents = allComponents
		.filter((c) => c.slug && c.name)
		.sort((a, b) => a.name.localeCompare(b.name));

	for (const component of sortedComponents) {
		sections.push(generateComponentMarkdown(component, { baseUrl, headingLevel: 2 }));
	}

	// Utilities section - full content
	sections.push('---');
	sections.push('# Utilities');

	const sortedUtils = allUtils
		.filter((u) => u.slug && u.name)
		.sort((a, b) => a.name.localeCompare(b.name));

	for (const util of sortedUtils) {
		sections.push(generateUtilMarkdown(util, { baseUrl, headingLevel: 2 }));
	}

	return sections.join('\n\n');
}
