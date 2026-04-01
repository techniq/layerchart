import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateExampleMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params, url }) => {
	const { name, example } = params;

	const markdown = generateExampleMarkdown(url.origin, name, example);
	if (!markdown) {
		error(404, `Example "${example}" not found for component "${name}"`);
	}

	return markdownResponse(markdown, `${name}-${example}.md`);
};
