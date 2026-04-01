import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateGuideMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	let markdown: string;
	try {
		markdown = generateGuideMarkdown({ name });
	} catch (e) {
		error(404, `Guide "${name}" not found`);
	}

	return markdownResponse(markdown, `${name}.md`);
};
