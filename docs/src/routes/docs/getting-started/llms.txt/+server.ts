import { join } from 'path';
import type { RequestHandler } from './$types';
import { generateGuideMarkdown, markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	const filePath = join(process.cwd(), 'src/routes/docs/getting-started/+page.md');
	const markdown = generateGuideMarkdown({ name: 'getting-started', filePath, title: 'Getting Started' });

	return markdownResponse(markdown, 'getting-started.md');
};
