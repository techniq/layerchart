import { readdirSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { allComponents, allUtils, allGuides } from 'content-collections';

const BASE_URL = 'https://layerchart.com';

const guides = [
	{ slug: 'getting-started', name: 'Getting Started', description: 'Installation and setup guide for LayerChart' },
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

export const GET: RequestHandler = async () => {
	const content = generateLlmsTxt();

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
};

function generateLlmsTxt(): string {
	const sections: string[] = [];

	// Header
	sections.push(`# LayerChart Documentation for LLMs

> LayerChart is a powerful, composable charting library for Svelte built on top of D3.

This file contains links to LLM-optimized documentation in markdown format.`);

	// General section
	sections.push(`## General

${guides.map((g) => `- [${g.name}](${BASE_URL}/docs/${g.slug}): ${g.description}`).join('\n')}`);

	// Components section
	const componentsList = allComponents
		.filter((c) => c.slug && c.name)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((c) => {
			const description = c.description || `Documentation for ${c.name} component`;
			return `- [${c.name}](${BASE_URL}/docs/components/${c.slug}/llms.txt): ${description}`;
		})
		.join('\n');

	sections.push(`## Components

${componentsList}`);

	// Utilities section
	const utilsList = allUtils
		.filter((u) => u.slug && u.name)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((u) => {
			const description = u.description || `Documentation for ${u.name} utility`;
			return `- [${u.name}](${BASE_URL}/docs/utils/${u.slug}/llms.txt): ${description}`;
		})
		.join('\n');

	sections.push(`## Utilities

${utilsList}`);

	// Examples section
	const examplesList = getExamplesList();
	sections.push(`## Examples

${examplesList}`);

	return sections.join('\n\n');
}

/**
 * Get list of all examples from the filesystem
 */
function getExamplesList(): string {
	const examplesDir = join(process.cwd(), 'src/examples/components');
	const examples: string[] = [];

	try {
		const componentDirs = readdirSync(examplesDir, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name)
			.sort();

		for (const componentName of componentDirs) {
			const componentDir = join(examplesDir, componentName);

			try {
				const exampleFiles = readdirSync(componentDir)
					.filter((file) => file.endsWith('.svelte'))
					.sort();

				for (const exampleFile of exampleFiles) {
					const exampleName = exampleFile.replace('.svelte', '');
					examples.push(
						`- [${componentName}/${exampleName}](${BASE_URL}/docs/components/${componentName}/${exampleName}/llms.txt): Example code for ${componentName}`
					);
				}
			} catch (e) {
				// Skip directories that can't be read
			}
		}
	} catch (e) {
		return 'Could not read examples directory.';
	}

	return examples.join('\n');
}
