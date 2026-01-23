import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import type { ComponentAPI } from '$lib/api-types.js';
import { allComponents } from 'content-collections';
import { processMarkdownContent } from '$lib/markdown/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	// Find component metadata from content-collections
	const component = allComponents.find((c) => c.slug === name);
	if (!component) {
		error(404, `Component "${name}" not found`);
	}

	// Load API JSON
	let api: ComponentAPI | null = null;
	try {
		const apiPath = join(process.cwd(), `src/generated/api/${name}.json`);
		const apiContent = readFileSync(apiPath, 'utf-8');
		api = JSON.parse(apiContent);
	} catch (e) {
		// API file may not exist for all components
	}

	// Load first example source code
	let exampleSource = '';
	if (component.usageExample) {
		try {
			const examplePath = join(
				process.cwd(),
				`src/examples/components/${name}/${component.usageExample}.svelte`
			);
			exampleSource = readFileSync(examplePath, 'utf-8');
			exampleSource = trimCode(exampleSource);
		} catch (e) {
			// Example file may not exist
		}
	}

	// Build markdown content
	let markdown = generateMarkdown(component, api, exampleSource);
	markdown = processMarkdownContent(markdown);

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${name}.md"`
		}
	});
};

/**
 * Trim code to remove module exports and data export statement
 */
function trimCode(code: string): string {
	return code
		.replace(/<script\s+module>[\s\S]*?<\/script>\n*/g, '') // remove module exports section
		.replace(/\n*\s*export \{ data \};\s*\n*\s*<\/script>/gm, '\n</script>') // remove data export statement
		.trim();
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
 * Generate the full markdown document
 */
function generateMarkdown(
	component: (typeof allComponents)[number],
	api: ComponentAPI | null,
	exampleSource: string
): string {
	const sections: string[] = [];

	// Title and description
	sections.push(`# ${component.name}`);
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
	sections.push(`**Full Documentation:** [${component.name}](https://layerchart.com/docs/components/${component.slug})`);

	// Example (before API)
	if (exampleSource) {
		sections.push('## Example');
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// API table
	if (api) {
		sections.push('## API');
		const table = generateApiTable(api);
		if (table) {
			sections.push(table);
		}

		// Extended types
		if (api.extends && api.extends.length > 0) {
			const extendsList = api.extends.map((e) => `\`${e.fullType}\``).join(', ');
			sections.push(`**Extends:** ${extendsList}`);
		}
	}

	// Related components
	if (component.related && component.related.length > 0) {
		sections.push('## Related');
		const relatedLinks = component.related
			.map((r) => `- [${r}](https://layerchart.com/docs/components/${r})`)
			.join('\n');
		sections.push(relatedLinks);
	}

	return sections.join('\n\n');
}
