import type { ComponentAPI } from '@layerstack/docs/api';
import { allComponents, allUtils, allGuides } from 'content-collections';
import { sortCollection } from '$lib/collections.js';

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
 * Replace :example{...} directives with inlined code blocks.
 * Must be called BEFORE processMarkdownContent.
 */
function inlineExampleDirectives(
	content: string,
	slug: string,
	type: 'components' | 'utils',
	baseUrl: string
): string {
	// Remove HTML comments first to avoid inlining commented-out examples
	content = content.replace(/<!--[\s\S]*?-->/g, '');

	// Cross-component examples: :example{ component="X" name="Y" ... }
	// Must run before same-component regex to avoid greedy matching
	content = content.replace(
		/:example\{\s*component="([^"]+)"\s+name="([^"]+)"[^}]*\}/g,
		(_match, component: string, name: string) => {
			const raw = getExampleSource('components', component, name);
			if (raw) {
				return '```svelte\n' + trimCode(raw) + '\n```';
			}
			return `See example: [${component}/${name}](${docsUrl(baseUrl, 'components', component)}/${name})`;
		}
	);

	// Same-component examples: :example{ name="Y" ... }
	content = content.replace(/:example\{\s*name="([^"]+)"[^}]*\}/g, (_match, name: string) => {
		const raw = getExampleSource(type, slug, name);
		if (raw) {
			return '```svelte\n' + trimCode(raw) + '\n```';
		}
		return `See example: ${name}`;
	});

	return content;
}

/**
 * Process markdown content for LLMs by removing custom syntax and converting to vanilla markdown
 */
function processMarkdownContent(content: string, baseUrl: string): string {
	// Remove frontmatter (YAML between --- markers at start of file)
	content = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

	// Remove HTML comments
	content = content.replace(/<!--[\s\S]*?-->/g, '');

	// Remove Svelte script blocks and components ONLY outside of code blocks
	// Split by code blocks, process only non-code-block parts, then rejoin
	content = content
		.split(/(```[\s\S]*?```)/g)
		.map((part, index) => {
			// Odd indices are code blocks (matched by the capture group)
			if (index % 2 === 1) return part;
			// Remove Svelte script blocks
			part = part.replace(/<script[^>]*>[\s\S]*?<\/script>\n*/g, '');
			// Remove Svelte components (self-closing and with content)
			part = part.replace(/<[A-Z][a-zA-Z]*[^>]*\/>\n*/g, '');
			part = part.replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>\n*/g, '');
			return part;
		})
		.join('');

	// Extract title from code blocks and add as "File:" line before (must run before tabs processing)
	content = content.replace(/(```\w*)\s+([^\n]*title="[^"]+")[^\n]*$/gm, (_, lang, meta) => {
		const titleMatch = meta.match(/title="([^"]+)"/);
		if (titleMatch) {
			return `File: ${titleMatch[1]} ${lang}`;
		}
		return lang;
	});

	// Process tabs - convert to table
	content = content.replace(
		/:::tabs\{key="([^"]+)"\}\s*([\s\S]*?)(?=\n:::(?:\s*$|\s*\n))\n:::/gm,
		(_, key, tabsContent) => {
			const tabs: { label: string; content: string }[] = [];
			const tabRegex =
				/::tab\{label="([^"]+)"[^}]*\}\s*([\s\S]*?)\s*(?=\n\s*::(?:\s*$|\s+))\n\s*::/gm;
			let match;
			while ((match = tabRegex.exec(tabsContent)) !== null) {
				tabs.push({ label: match[1], content: match[2].trim() });
			}

			if (tabs.length === 0) return '';

			// Build table with capitalized key as header
			const header = key.charAt(0).toUpperCase() + key.slice(1);
			let table = `| ${header} | Details |\n|-----------|---------|`;
			for (const tab of tabs) {
				// Clean up content: remove :button syntax, convert to links, unwrap code blocks
				const cleanContent = tab.content
					.replace(/:button\{label="([^"]+)"\s+href="([^"]+)"[^}]*\}/g, '[$1]($2)')
					.replace(/```\w*\n([\s\S]*?)```/g, '$1') // Remove code block fences, keep content
					.replace(/\n/g, ' ')
					.trim();
				table += `\n| ${tab.label} | ${cleanContent} |`;
			}
			return table;
		}
	);

	// Convert ::note/:::note, ::tip/:::tip, etc. to blockquote (2 or 3 colons)
	content = content.replace(
		/:{2,3}(note|tip|warning|caution)\s*([\s\S]*?)(?=\n:{2,3}(?:\s*$|\s*\n))\n:{2,3}/gm,
		(_, variant, noteContent) => {
			return `> ${variant}: ${noteContent.trim()}\n`;
		}
	);

	// Convert ::steps to numbered list (convert ## headings to numbered items)
	content = content.replace(
		/::steps\s*([\s\S]*?)(?=\n::(?:\s*$|\s*\n))\n::/gm,
		(_, stepsContent: string) => {
			let stepNum = 0;
			return stepsContent.replace(/^## (.+)$/gm, (_match: string, heading: string) => {
				stepNum++;
				return `**${stepNum}. ${heading}**`;
			});
		}
	);

	// Remove any remaining standalone ::
	content = content.replace(/^::\s*$/gm, '');

	// Remove :icon syntax, keep text if in brackets, otherwise just remove icon
	content = content.replace(/\[:icon\{[^}]+\}\s*([^\]]+)\]/g, '$1');
	content = content.replace(/:icon\{[^}]+\}\s*/g, '');

	// Convert :example with component to reference link
	content = content.replace(
		/:example\{component="([^"]+)"\s+name="([^"]+)"[^}]*\}/g,
		(_match, comp: string, name: string) =>
			`See example: [${comp}/${name}](${docsUrl(baseUrl, 'components', comp)}/${name})`
	);

	// Convert remaining :example directives (same-component, not inlined) to plain text
	content = content.replace(/:example\{\s*name="([^"]+)"[^}]*\}/g, 'See example: $1');

	// Clean up multiple blank lines
	content = content.replace(/\n{3,}/g, '\n\n');

	return content.trim();
}

/**
 * Trim code to remove module exports and data export statement
 */
function trimCode(code: string): string {
	return code
		.replace(/<script\s+module>[\s\S]*?<\/script>\n*/g, '')
		.replace(/\n*\s*export \{ data \};\s*\n*\s*<\/script>/gm, '\n</script>')
		.trim();
}

/**
 * Escape special markdown characters in table cells
 */
function escapeMarkdown(text: string): string {
	return text.replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Generate markdown API table from component properties
 */
function generateApiTable(api: ComponentAPI): string {
	if (!api.properties || api.properties.length === 0) {
		return '';
	}

	const rows = api.properties.map((prop) => {
		const name = prop.required ? `**${prop.name}** (required)` : prop.name;
		const type = `\`${escapeMarkdown(prop.type)}\``;
		const defaultVal = prop.default ? `\`${escapeMarkdown(prop.default)}\`` : '-';
		const description = prop.description ? escapeMarkdown(prop.description) : '-';
		return `| ${name} | ${type} | ${defaultVal} | ${description} |`;
	});

	return `| Property | Type | Default | Description |
|----------|------|---------|-------------|
${rows.join('\n')}`;
}

/**
 * Generate markdown for a component
 */
export function generateComponentMarkdown(
	component: (typeof allComponents)[number],
	options: GenerateMarkdownOptions
): string {
	const { baseUrl, headingLevel = 1, inlineExamples: shouldInlineExamples = false } = options;
	const h = (level: number) => '#'.repeat(level);

	const sections: string[] = [];

	// Title and description
	sections.push(`${h(headingLevel)} ${component.name}`);
	if (component.description) {
		sections.push(component.description);
	}

	// Metadata
	if (component.category) {
		sections.push(`**Category:** ${component.category}`);
	}
	if (component.layers && component.layers.length > 0) {
		sections.push(`**Supported Layers:** ${component.layers.join(', ')}`);
	}

	// Documentation content from markdown
	if (component.content) {
		let rawContent = component.content;
		if (shouldInlineExamples) {
			rawContent = inlineExampleDirectives(rawContent, component.slug, 'components', baseUrl);
		}
		const processed = processMarkdownContent(rawContent, baseUrl);
		if (processed) {
			sections.push(processed);
		}
	}

	// Load API
	let api: ComponentAPI | null = null;
	const apiKey = `/generated/api/${component.slug}.json`;
	const apiContent = apiFiles[apiKey];
	if (apiContent) {
		api = JSON.parse(apiContent);
	}

	if (api) {
		sections.push(`${h(headingLevel + 1)} API`);
		const table = generateApiTable(api);
		if (table) {
			sections.push(table);
		}

		if (api.extends && api.extends.length > 0) {
			const extendsList = api.extends.map((e) => `\`${e.fullType}\``).join(', ');
			sections.push(`**Extends:** ${extendsList}`);
		}
	}

	// Examples from catalog
	const catalog = getCatalog(component.slug);
	if (catalog) {
		const examples = catalog.examples as Array<{ name: string; path: string }>;
		if (examples && examples.length > 0) {
			sections.push(`${h(headingLevel + 1)} Examples`);
			const exampleLinks = examples
				.map((ex) => `- [${ex.name}](${docsUrl(baseUrl, 'components', component.slug)}/${ex.name})`)
				.join('\n');
			sections.push(exampleLinks);
		}
	}

	// Related
	if (component.related && component.related.length > 0) {
		sections.push(`${h(headingLevel + 1)} Related`);
		const relatedLinks = component.related
			.map((r) => `- [${r}](${docsUrl(baseUrl, 'components', r)})`)
			.join('\n');
		sections.push(relatedLinks);
	}

	return sections.join('\n\n');
}

/**
 * Generate markdown for a utility
 */
export function generateUtilMarkdown(
	util: (typeof allUtils)[number],
	options: GenerateMarkdownOptions
): string {
	const { baseUrl, headingLevel = 1, inlineExamples: shouldInlineExamples = false } = options;
	const h = (level: number) => '#'.repeat(level);

	const sections: string[] = [];

	// Title and description
	sections.push(`${h(headingLevel)} ${util.name}`);
	if (util.description) {
		sections.push(util.description);
	}

	// Documentation content from markdown
	if (util.content) {
		let rawContent = util.content;
		if (shouldInlineExamples) {
			rawContent = inlineExampleDirectives(rawContent, util.slug, 'utils', baseUrl);
		}
		const processed = processMarkdownContent(rawContent, baseUrl);
		if (processed) {
			sections.push(processed);
		}
	}

	// Related
	if (util.related && util.related.length > 0) {
		sections.push(`${h(headingLevel + 1)} Related`);
		const relatedLinks = util.related
			.map((r) => `- [${r}](${docsUrl(baseUrl, 'utils', r)})`)
			.join('\n');
		sections.push(relatedLinks);
	}

	return sections.join('\n\n');
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
 * Load and generate markdown for a guide.
 */
export function generateGuideMarkdown(options: {
	/** The name/slug of the guide (e.g., 'getting-started', 'styles') */
	name: string;
	/** Optional explicit title. If not provided, title is extracted from frontmatter,
	 *  falling back to title-casing the name. */
	title?: string;
}): string {
	const { name, title: explicitTitle } = options;

	// Look up from the pre-loaded glob maps
	let raw: string | undefined;
	if (name === 'getting-started') {
		raw = gettingStartedSource['/src/routes/docs/getting-started/+page.md'];
	} else {
		raw = guideSources[`/src/content/guides/${name}.md`];
	}

	if (!raw) {
		throw new Error(`Guide "${name}" not found`);
	}

	// Extract title from frontmatter if not explicitly provided
	let title = explicitTitle;
	if (!title) {
		const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n*/);
		if (frontmatterMatch) {
			const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
			if (titleMatch) {
				title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
			}
		}
	}
	if (!title) {
		title = name
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	const content = processMarkdownContent(raw, '');
	return `# ${title}\n\n${content}`;
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

interface CollectionListOptions {
	baseUrl: string;
	title: string;
	items: Array<{ slug: string; name: string; description?: string }>;
	type: 'components' | 'utils' | 'guides';
}

/**
 * Generate a markdown section listing collection items as links to their llms.txt endpoints.
 */
function generateCollectionListSection(options: CollectionListOptions): string {
	const { baseUrl, title, items, type } = options;

	const fallbackLabel =
		type === 'components' ? 'component' : type === 'utils' ? 'utility' : 'guide';

	const lines = items
		.filter((item) => item.slug && item.name)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((item) => {
			const description = item.description || `Documentation for ${item.name} ${fallbackLabel}`;
			return `- [${item.name}](${llmsUrl(baseUrl, type, item.slug)}): ${description}`;
		});

	return `## ${title}\n\n${lines.join('\n')}`;
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
	sections.push(
		generateCollectionListSection({
			baseUrl,
			title: 'Guides',
			items: getSortedGuides(),
			type: 'guides'
		})
	);

	// Components
	sections.push(
		generateCollectionListSection({
			baseUrl,
			title: 'Components',
			items: allComponents,
			type: 'components'
		})
	);

	// Utilities
	sections.push(
		generateCollectionListSection({ baseUrl, title: 'Utilities', items: allUtils, type: 'utils' })
	);

	// Examples
	const paths = getAllExamplePaths();
	const examples: string[] = [];
	for (const path of paths) {
		const match = path.match(/\/src\/examples\/components\/([^/]+)\/([^/]+)\.svelte$/);
		if (match) {
			const [, componentName, exampleName] = match;
			examples.push(
				`- [${componentName}/${exampleName}](${llmsUrl(baseUrl, 'components', `${componentName}/${exampleName}`)}): Example code for ${componentName}`
			);
		}
	}
	if (examples.length > 0) {
		sections.push(`## Examples\n\n${examples.join('\n')}`);
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

	sections.push(
		generateCollectionListSection({
			baseUrl,
			title: 'Guides',
			items: getSortedGuides(),
			type: 'guides'
		})
	);

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

/**
 * Create a markdown response
 */
export function markdownResponse(content: string, filename: string): Response {
	return new Response(content, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${filename}"`
		}
	});
}
