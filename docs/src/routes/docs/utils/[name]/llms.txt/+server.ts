import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { allUtils } from 'content-collections';
import { processMarkdownContent, generateUtilMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	const util = allUtils.find((u) => u.slug === name);
	if (!util) {
		error(404, `Utility "${name}" not found`);
	}

	let markdown = generateUtilMarkdown(util);
	markdown = processMarkdownContent(markdown);

	return markdownResponse(markdown, `${name}.md`);
};
