import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { processMarkdownContent } from '$lib/markdown/utils.js';

export const GET: RequestHandler = async () => {
	const mdPath = join(process.cwd(), 'src/routes/docs/getting-started/+page.md');
	let content = readFileSync(mdPath, 'utf-8');

	content = processMarkdownContent(content);

	const markdown = `# Getting Started\n\n${content}`;

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': 'inline; filename="getting-started.md"'
		}
	});
};

