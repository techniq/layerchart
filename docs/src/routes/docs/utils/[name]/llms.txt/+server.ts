import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { allUtils } from 'content-collections';
import { generateUtilMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	const util = allUtils.find((u) => u.slug === name);
	if (!util) {
		error(404, `Utility "${name}" not found`);
	}

	const markdown = generateUtilMarkdown(util, { inlineExamples: true });

	return markdownResponse(markdown, `${name}.md`);
};
