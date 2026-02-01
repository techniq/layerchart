import type { RequestHandler } from './$types';
import { generateGuideMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	const markdown = generateGuideMarkdown({ name: 'getting-started', title: 'Getting Started' });

	return markdownResponse(markdown, 'getting-started.md');
};
