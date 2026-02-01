import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { allComponents } from 'content-collections';
import { processMarkdownContent } from '$lib/markdown/utils.js';
import { BASE_URL, trimCode, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name, example } = params;

	const component = allComponents.find((c) => c.slug === name);

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

	return markdownResponse(markdown, `${name}-${example}.md`);
};

function generateMarkdown(
	componentName: string,
	exampleName: string,
	component: (typeof allComponents)[number] | undefined,
	exampleSource: string
): string {
	const sections: string[] = [];

	sections.push(`# ${componentName} - ${exampleName}`);

	if (component?.description) {
		sections.push(component.description);
	}

	sections.push(
		`**Component Documentation:** [${componentName}](${BASE_URL}/docs/components/${componentName})`
	);

	sections.push('## Code');
	sections.push('```svelte\n' + exampleSource + '\n```');

	return sections.join('\n\n');
}
