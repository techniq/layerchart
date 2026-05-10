import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { allComponents } from 'content-collections';
import { generateComponentMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params, url }) => {
	const { name } = params;

	const component = allComponents.find((c) => c.slug === name);
	if (!component) {
		error(404, `Component "${name}" not found`);
	}

	const markdown = generateComponentMarkdown(component, {
		baseUrl: url.origin,
		inlineExamples: true
	});

	return markdownResponse(markdown, `${name}.md`);
};
