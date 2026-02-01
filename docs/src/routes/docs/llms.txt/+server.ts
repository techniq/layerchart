import type { RequestHandler } from './$types';
import { allComponents, allUtils } from 'content-collections';
import {
	BASE_URL,
	getSortedGuides,
	generateComponentMarkdown,
	generateUtilMarkdown,
	textResponse
} from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	const content = generateFullLlmsTxt();
	return textResponse(content);
};

function generateFullLlmsTxt(): string {
	const guides = getSortedGuides();
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
