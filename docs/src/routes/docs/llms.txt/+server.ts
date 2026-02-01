import type { RequestHandler } from './$types';
import { allComponents, allUtils } from 'content-collections';
import {
	generateGuidesSection,
	generateComponentMarkdown,
	generateUtilMarkdown,
	textResponse
} from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	const content = generateFullLlmsTxt();
	return textResponse(content);
};

function generateFullLlmsTxt(): string {
	const sections: string[] = [];

	// Header
	sections.push(`# LayerChart Full Documentation for LLMs

> LayerChart is a powerful, composable charting library for Svelte built on top of D3.

This file contains the complete LLM-optimized documentation for all components and utilities.`);

	sections.push(generateGuidesSection());

	// Components section - full content
	sections.push('---\n\n# Components');

	const sortedComponents = allComponents
		.filter((c) => c.slug && c.name)
		.sort((a, b) => a.name.localeCompare(b.name));

	for (const component of sortedComponents) {
		sections.push(generateComponentMarkdown(component, { headingLevel: 2 }));
	}

	// Utilities section - full content
	sections.push('---\n\n# Utilities');

	const sortedUtils = allUtils
		.filter((u) => u.slug && u.name)
		.sort((a, b) => a.name.localeCompare(b.name));

	for (const util of sortedUtils) {
		sections.push(generateUtilMarkdown(util, { headingLevel: 2 }));
	}

	return sections.join('\n\n');
}
