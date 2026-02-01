import { readFileSync } from 'fs';
import { join } from 'path';
import type { ComponentAPI } from '$lib/api-types.js';
import { allComponents, allUtils, allGuides } from 'content-collections';

export const BASE_URL = 'https://layerchart.com';

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
	return text
		.replace(/\|/g, '\\|')
		.replace(/\n/g, ' ')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
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

	// Documentation link
	sections.push(
		`**Full Documentation:** [${component.name}](${BASE_URL}/docs/components/${component.slug})`
	);

	// Load example
	let exampleSource = '';
	if (component.usageExample) {
		try {
			const examplePath = join(
				process.cwd(),
				`src/examples/components/${component.slug}/${component.usageExample}.svelte`
			);
			exampleSource = readFileSync(examplePath, 'utf-8');
			exampleSource = trimCode(exampleSource);
		} catch (e) {
			// Example file may not exist
		}
	}

	if (exampleSource) {
		sections.push(`${h(headingLevel + 1)} Example`);
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// Load API
	let api: ComponentAPI | null = null;
	try {
		const apiPath = join(process.cwd(), `src/generated/api/${component.slug}.json`);
		const apiContent = readFileSync(apiPath, 'utf-8');
		api = JSON.parse(apiContent);
	} catch (e) {
		// API file may not exist
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
			.map((r) => `- [${r}](${BASE_URL}/docs/components/${r})`)
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

	// Documentation link
	sections.push(
		`**Full Documentation:** [${util.name}](${BASE_URL}/docs/utils/${util.slug})`
	);

	// Load example
	let exampleSource = '';
	if (util.usageExample) {
		try {
			const examplePath = join(
				process.cwd(),
				`src/examples/utils/${util.slug}/${util.usageExample}.svelte`
			);
			exampleSource = readFileSync(examplePath, 'utf-8');
			exampleSource = trimCode(exampleSource);
		} catch (e) {
			// Example file may not exist
		}
	}

	if (exampleSource) {
		sections.push(`${h(headingLevel + 1)} Example`);
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// Related
	if (util.related && util.related.length > 0) {
		sections.push(`${h(headingLevel + 1)} Related`);
		const relatedLinks = util.related
			.map((r) => `- [${r}](${BASE_URL}/docs/utils/${r})`)
			.join('\n');
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
		...allGuides
			.filter((g) => !g.draft)
			.sort((a, b) => {
				if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
				if (a.order !== undefined) return -1;
				if (b.order !== undefined) return 1;
				return a.name.localeCompare(b.name);
			})
			.map((g) => ({ slug: `guides/${g.slug}`, name: g.name, description: g.description ?? '' }))
	];
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
 * Create a markdown response with Content-Disposition header
 */
export function markdownResponse(content: string, filename: string): Response {
	return new Response(content, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${filename}"`
		}
	});
}
