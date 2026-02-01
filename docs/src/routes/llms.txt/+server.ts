import { allComponents, allUtils } from 'content-collections';

import type { RequestHandler } from './$types';
import {
	generateGuidesSection,
	generateCollectionListSection,
	getAllExamplePaths,
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
	sections.push(
		generateCollectionListSection({
			title: 'Components',
			items: allComponents,
			type: 'components'
		})
	);
	sections.push(
		generateCollectionListSection({ title: 'Utilities', items: allUtils, type: 'utils' })
	);

	// Examples section
	const examplesList = getExamplesList();
	sections.push(`## Examples\n\n${examplesList}`);

	return sections.join('\n\n');
}

/**
 * Get list of all examples from import.meta.glob keys
 */
function getExamplesList(): string {
	const paths = getAllExamplePaths();
	const examples: string[] = [];

	for (const path of paths) {
		// path is like "/src/examples/components/Arc/Basic.svelte"
		const match = path.match(/\/src\/examples\/components\/([^/]+)\/([^/]+)\.svelte$/);
		if (match) {
			const [, componentName, exampleName] = match;
			examples.push(
				`- [${componentName}/${exampleName}](${llmsUrl('components', `${componentName}/${exampleName}`)}): Example code for ${componentName}`
			);
		}
	}

	return examples.join('\n');
}
