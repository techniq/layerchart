import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { processMarkdownContent } from '$lib/markdown/utils.js';
import { markdownResponse } from '$lib/llms/utils.js';

export const GET: RequestHandler = async () => {
	const mdPath = join(process.cwd(), 'src/routes/docs/getting-started/+page.md');
	let content = readFileSync(mdPath, 'utf-8');

	content = processMarkdownContent(content);

	const markdown = `# Getting Started\n\n${content}`;

	return markdownResponse(markdown, 'getting-started.md');
};
