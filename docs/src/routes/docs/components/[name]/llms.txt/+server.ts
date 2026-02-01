import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { allComponents } from 'content-collections';
import { processMarkdownContent, generateComponentMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	const component = allComponents.find((c) => c.slug === name);
	if (!component) {
		error(404, `Component "${name}" not found`);
	}

	let markdown = generateComponentMarkdown(component);
	markdown = processMarkdownContent(markdown);

	return markdownResponse(markdown, `${name}.md`);
};
