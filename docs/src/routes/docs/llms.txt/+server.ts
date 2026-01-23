import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import type { ComponentAPI } from '$lib/api-types.js';
import { allComponents, allUtils } from 'content-collections';

const BASE_URL = 'https://layerchart.com';

const guides = [
	{ slug: 'getting-started', name: 'Getting Started', description: 'Installation and setup guide for LayerChart' },
	{ slug: 'guides/scales', name: 'Scales', description: 'Understanding scales, domains, and ranges' },
	{ slug: 'guides/layers', name: 'Layers', description: 'Working with SVG, Canvas, and HTML layers' },
	{ slug: 'guides/state', name: 'State', description: 'Managing chart state and reactivity' },
	{ slug: 'guides/styles', name: 'Styles', description: 'Styling and theming your charts' },
	{ slug: 'guides/primitives', name: 'Primitives', description: 'Low-level building blocks for custom charts' },
	{ slug: 'guides/simplified-charts', name: 'Simplified Charts', description: 'Quick chart components for common use cases' },
	{ slug: 'guides/features', name: 'Features', description: 'Overview of LayerChart features and capabilities' }
];

export const GET: RequestHandler = async () => {
	const content = generateFullLlmsTxt();

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
};

function generateFullLlmsTxt(): string {
	const sections: string[] = [];

	// Header
	sections.push(`# LayerChart Full Documentation for LLMs

> LayerChart is a powerful, composable charting library for Svelte built on top of D3.

This file contains the complete LLM-optimized documentation for all components and utilities.`);

	// General section (links only, as these are markdown pages)
	sections.push(`## General

${guides.map((g) => `- [${g.name}](${BASE_URL}/docs/${g.slug}): ${g.description}`).join('\n')}`);

	// Components section - full content
	sections.push('---\n\n# Components');

	const sortedComponents = allComponents
		.filter((c) => c.slug && c.name)
		.sort((a, b) => a.name.localeCompare(b.name));

	for (const component of sortedComponents) {
		const componentContent = generateComponentMarkdown(component);
		sections.push(componentContent);
	}

	// Utilities section - full content
	sections.push('---\n\n# Utilities');

	const sortedUtils = allUtils
		.filter((u) => u.slug && u.name)
		.sort((a, b) => a.name.localeCompare(b.name));

	for (const util of sortedUtils) {
		const utilContent = generateUtilMarkdown(util);
		sections.push(utilContent);
	}

	return sections.join('\n\n');
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
	return text
		.replace(/\|/g, '\\|')
		.replace(/\n/g, ' ')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
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
function generateComponentMarkdown(component: (typeof allComponents)[number]): string {
	const sections: string[] = [];

	// Title and description
	sections.push(`## ${component.name}`);
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
	sections.push(`**Full Documentation:** [${component.name}](${BASE_URL}/docs/components/${component.slug})`);

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
		sections.push('### Example');
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
		sections.push('### API');
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
		sections.push('### Related');
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
function generateUtilMarkdown(util: (typeof allUtils)[number]): string {
	const sections: string[] = [];

	// Title and description
	sections.push(`## ${util.name}`);
	if (util.description) {
		sections.push(util.description);
	}

	// Documentation link
	sections.push(`**Full Documentation:** [${util.name}](${BASE_URL}/docs/utils/${util.slug})`);

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
		sections.push('### Example');
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// Related
	if (util.related && util.related.length > 0) {
		sections.push('### Related');
		const relatedLinks = util.related
			.map((r) => `- [${r}](${BASE_URL}/docs/utils/${r})`)
			.join('\n');
		sections.push(relatedLinks);
	}

	return sections.join('\n\n');
}
