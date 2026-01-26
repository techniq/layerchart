import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { processMarkdownContent } from '$lib/markdown/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	let content = '';
	try {
		const mdPath = join(process.cwd(), `src/routes/docs/guides/${name}/+page.md`);
		content = readFileSync(mdPath, 'utf-8');
	} catch (e) {
		error(404, `Guide "${name}" not found`);
	}

	// Extract title from frontmatter before processing
	let title: string | undefined;
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n*/);
	if (frontmatterMatch) {
		const frontmatter = frontmatterMatch[1];
		const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
		if (titleMatch) {
			title = titleMatch[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
		}
	}

	// Process content (removes frontmatter)
	content = processMarkdownContent(content);

	// Use frontmatter title if available, otherwise generate from name
	if (!title) {
		title = name
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	const markdown = `# ${title}\n\n${content}`;

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${name}.md"`
		}
	});
};
