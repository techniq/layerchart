import { allComponents, allUtils } from 'content-collections';
import { readdirSync } from 'fs';
import { join } from 'path';

import type { RequestHandler } from './$types';
import {
	generateGuidesSection,
	generateCollectionListSection,
	llmsUrl,
	textResponse
} from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	const content = generateLlmsTxt();
	return textResponse(content);
};

function generateLlmsTxt(): string {
	const sections: string[] = [];

	// Header
	sections.push(`# LayerChart Documentation for LLMs

> LayerChart is a powerful, composable charting library for Svelte built on top of D3.

This file contains links to LLM-optimized documentation in markdown format.`);

	sections.push(generateGuidesSection());
	sections.push(generateCollectionListSection({ title: 'Components', items: allComponents, type: 'components' }));
	sections.push(generateCollectionListSection({ title: 'Utilities', items: allUtils, type: 'utils' }));

	// Examples section
	const examplesList = getExamplesList();
	sections.push(`## Examples\n\n${examplesList}`);

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
						`- [${componentName}/${exampleName}](${llmsUrl('components', `${componentName}/${exampleName}`)}): Example code for ${componentName}`
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
