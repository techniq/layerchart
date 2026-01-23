import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { allComponents } from 'content-collections';
import { processMarkdownContent } from '$lib/markdown/utils.js';

const BASE_URL = 'https://layerchart.com';

export const GET: RequestHandler = async ({ params }) => {
	const { name, example } = params;

	// Find component metadata
	const component = allComponents.find((c) => c.slug === name);

	// Load example source code
	let exampleSource = '';
	try {
		const examplePath = join(process.cwd(), `src/examples/components/${name}/${example}.svelte`);
		exampleSource = readFileSync(examplePath, 'utf-8');
		exampleSource = trimCode(exampleSource);
	} catch (e) {
		error(404, `Example "${example}" not found for component "${name}"`);
	}

	let markdown = generateMarkdown(name, example, component, exampleSource);
	markdown = processMarkdownContent(markdown);

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${name}-${example}.md"`
		}
	});
};

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
 * Generate the markdown document
 */
function generateMarkdown(
	componentName: string,
	exampleName: string,
	component: (typeof allComponents)[number] | undefined,
	exampleSource: string
): string {
	const sections: string[] = [];

	// Title
	sections.push(`# ${componentName} - ${exampleName}`);

	// Component description if available
	if (component?.description) {
		sections.push(component.description);
	}

	// Links
	sections.push(`**Component Documentation:** [${componentName}](${BASE_URL}/docs/components/${componentName})`);

	// Example code
	sections.push('## Code');
	sections.push('```svelte\n' + exampleSource + '\n```');

	return sections.join('\n\n');
}
