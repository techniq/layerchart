import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { allComponents } from 'content-collections';
import type { ComponentCatalog } from '$examples/catalog/types.js';
import { processMarkdownContent } from '$lib/markdown/utils.js';
import {
	llmsUrl,
	trimCode,
	markdownResponse,
	getExampleSource,
	getCatalog
} from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name, example } = params;

	const component = allComponents.find((c) => c.slug === name);

	const raw = getExampleSource('components', name, example);
	if (!raw) {
		error(404, `Example "${example}" not found for component "${name}"`);
	}
	const exampleSource = trimCode(raw);

	// Load catalog to find components used in this example
	const catalog = getCatalog(name) as ComponentCatalog | null;

	const exampleInfo = catalog?.examples.find((e) => e.name === example);
	const usedComponentNames = [...new Set(exampleInfo?.components.map((c) => c.component) ?? [])];
	const usedComponents = usedComponentNames
		.map((c) => allComponents.find((ac) => ac.name === c))
		.filter((c) => c != null);

	let markdown = generateMarkdown(name, example, component, exampleSource, usedComponents);
	markdown = processMarkdownContent(markdown);

	return markdownResponse(markdown, `${name}-${example}.md`);
};

function generateMarkdown(
	componentName: string,
	exampleName: string,
	component: (typeof allComponents)[number] | undefined,
	exampleSource: string,
	usedComponents: (typeof allComponents)[number][]
): string {
	const sections: string[] = [];

	sections.push(`# ${componentName} - ${exampleName}`);

	if (component?.description) {
		sections.push(component.description);
	}

	sections.push('## Code');
	sections.push('```svelte\n' + exampleSource + '\n```');

	if (usedComponents.length > 0) {
		sections.push('## Component Docs');
		const links = usedComponents
			.map((comp) => `- [${comp.name}](${llmsUrl('components', comp.slug)})`)
			.join('\n');
		sections.push(links);
	}

	return sections.join('\n\n');
}
