import type { ComponentAPI } from '$lib/api-types.js';
import { allComponents, allUtils, allGuides } from 'content-collections';
import { sortCollection } from '$lib/collections.js';
// Use import.meta.glob to load files at build time (Cloudflare Workers compatible)
const exampleSources = import.meta.glob<string>('/src/examples/**/*.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const apiFiles = import.meta.glob<string>('/src/generated/api/*.json', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const guideSources = import.meta.glob<string>('/src/content/guides/*.md', {
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

export const BASE_URL = 'https://layerchart.com';

/** Generate URL for a docs page */
export function docsUrl(type: 'components' | 'utils' | 'guides', slug: string): string {
	if (type === 'guides') {
		return `${BASE_URL}/docs/${slug}`;
	}
	return `${BASE_URL}/docs/${type}/${slug}`;
}

/** Generate URL for an llms.txt endpoint */
export function llmsUrl(type: 'components' | 'utils' | 'guides', slug: string): string {
	return `${docsUrl(type, slug)}/llms.txt`;
}

export interface GenerateMarkdownOptions {
	/** Heading level for the title. 1 = "#", 2 = "##", etc. Default: 1 */
	headingLevel?: number;
}

export interface GuideEntry {
	slug: string;
	name: string;
	description: string;
}

/**
 * Process markdown content for LLMs by removing custom syntax and converting to vanilla markdown
 */
export function processMarkdownContent(content: string): string {
	// Remove frontmatter (YAML between --- markers at start of file)
	content = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

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

	// Convert :example to reference link
	content = content.replace(
		/:example\{component="([^"]+)"\s+name="([^"]+)"[^}]*\}/g,
		'See example: [$1/$2](https://layerchart.com/docs/components/$1/$2)'
	);

	// Clean up multiple blank lines
	content = content.replace(/\n{3,}/g, '\n\n');

	return content.trim();
}

/**
 * Trim code to remove module exports and data export statement
 */
export function trimCode(code: string): string {
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
export function generateApiTable(api: ComponentAPI): string {
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
	options: GenerateMarkdownOptions = {}
): string {
	const { headingLevel = 1 } = options;
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
		const processed = processMarkdownContent(component.content);
		if (processed) {
			sections.push(processed);
		}
	}

	// Load example
	let exampleSource = '';
	if (component.usageExample) {
		const key = `/src/examples/components/${component.slug}/${component.usageExample}.svelte`;
		const raw = exampleSources[key];
		if (raw) {
			exampleSource = trimCode(raw);
		}
	}

	if (exampleSource) {
		sections.push(`${h(headingLevel + 1)} Example`);
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// Load API
	let api: ComponentAPI | null = null;
	const apiKey = `/src/generated/api/${component.slug}.json`;
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

	// Related
	if (component.related && component.related.length > 0) {
		sections.push(`${h(headingLevel + 1)} Related`);
		const relatedLinks = component.related
			.map((r) => `- [${r}](${docsUrl('components', r)})`)
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
	options: GenerateMarkdownOptions = {}
): string {
	const { headingLevel = 1 } = options;
	const h = (level: number) => '#'.repeat(level);

	const sections: string[] = [];

	// Title and description
	sections.push(`${h(headingLevel)} ${util.name}`);
	if (util.description) {
		sections.push(util.description);
	}

	// Documentation content from markdown
	if (util.content) {
		const processed = processMarkdownContent(util.content);
		if (processed) {
			sections.push(processed);
		}
	}

	// Load example
	let exampleSource = '';
	if (util.usageExample) {
		const key = `/src/examples/utils/${util.slug}/${util.usageExample}.svelte`;
		const raw = exampleSources[key];
		if (raw) {
			exampleSource = trimCode(raw);
		}
	}

	if (exampleSource) {
		sections.push(`${h(headingLevel + 1)} Example`);
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// Related
	if (util.related && util.related.length > 0) {
		sections.push(`${h(headingLevel + 1)} Related`);
		const relatedLinks = util.related.map((r) => `- [${r}](${docsUrl('utils', r)})`).join('\n');
		sections.push(relatedLinks);
	}

	return sections.join('\n\n');
}

/**
 * Get sorted guides list with the getting-started entry prepended
 */
export function getSortedGuides(): GuideEntry[] {
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
 * Generate the "General" section listing all guides as links.
 */
export function generateGuidesSection(): string {
	const guides = getSortedGuides();
	return `## General\n\n${guides.map((g) => `- [${g.name}](${docsUrl('guides', g.slug)}): ${g.description}`).join('\n')}`;
}

export interface GenerateGuideMarkdownOptions {
	/** The name/slug of the guide (e.g., 'getting-started', 'styles') */
	name: string;
	/** Optional explicit title. If not provided, title is extracted from frontmatter,
	 *  falling back to title-casing the name. */
	title?: string;
}

/**
 * Load and generate markdown for a guide.
 * Uses import.meta.glob to read files (Cloudflare Workers compatible).
 */
export function generateGuideMarkdown(options: GenerateGuideMarkdownOptions): string {
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

	const content = processMarkdownContent(raw);
	return `# ${title}\n\n${content}`;
}

/**
 * Get the raw source for an example svelte file.
 */
export function getExampleSource(
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
export function getCatalog(componentSlug: string): Record<string, unknown> | null {
	const key = `/src/examples/catalog/${componentSlug}.json`;
	const raw = catalogFiles[key];
	if (!raw) return null;
	return JSON.parse(raw);
}

/**
 * Get all example file paths from the glob map (for listing).
 */
export function getAllExamplePaths(): string[] {
	return Object.keys(exampleSources)
		.filter((key) => key.startsWith('/src/examples/components/'))
		.sort();
}

export interface CollectionListOptions {
	title: string;
	items: Array<{ slug: string; name: string; description?: string }>;
	type: 'components' | 'utils';
}

/**
 * Generate a markdown section listing collection items as links to their llms.txt endpoints.
 */
export function generateCollectionListSection(options: CollectionListOptions): string {
	const { title, items, type } = options;

	const lines = items
		.filter((item) => item.slug && item.name)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((item) => {
			const description =
				item.description ||
				`Documentation for ${item.name} ${type === 'components' ? 'component' : 'utility'}`;
			return `- [${item.name}](${llmsUrl(type, item.slug)}): ${description}`;
		});

	return `## ${title}\n\n${lines.join('\n')}`;
}

/**
 * Create a plain text response
 */
export function textResponse(content: string): Response {
	return new Response(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
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
