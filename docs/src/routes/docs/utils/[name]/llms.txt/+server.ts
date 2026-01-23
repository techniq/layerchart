import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { allUtils } from 'content-collections';
import { processMarkdownContent } from '$lib/markdown/utils.js';

export const GET: RequestHandler = async ({ params }) => {
	const { name } = params;

	// Find util metadata from content-collections
	const util = allUtils.find((u) => u.slug === name);
	if (!util) {
		error(404, `Utility "${name}" not found`);
	}

	// Load first example source code
	let exampleSource = '';
	if (util.usageExample) {
		try {
			const examplePath = join(
				process.cwd(),
				`src/examples/utils/${name}/${util.usageExample}.svelte`
			);
			exampleSource = readFileSync(examplePath, 'utf-8');
			exampleSource = trimCode(exampleSource);
		} catch (e) {
			// Example file may not exist
		}
	}

	// Build markdown content
	let markdown = generateMarkdown(util, exampleSource);
	markdown = processMarkdownContent(markdown);

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `inline; filename="${name}.md"`
		}
	});
};

/**
 * Trim code to remove module exports and data export statement
 */
function trimCode(code: string): string {
	return code
		.replace(/<script\s+module>[\s\S]*?<\/script>\n*/g, '') // remove module exports section
		.replace(/\n*\s*export \{ data \};\s*\n*\s*<\/script>/gm, '\n</script>') // remove data export statement
		.trim();
}

/**
 * Generate the full markdown document
 */
function generateMarkdown(
	util: (typeof allUtils)[number],
	exampleSource: string
): string {
	const sections: string[] = [];

	// Title and description
	sections.push(`# ${util.name}`);
	if (util.description) {
		sections.push(util.description);
	}

	// Documentation link
	sections.push(`**Full Documentation:** [${util.name}](https://layerchart.com/docs/utils/${util.slug})`);

	// Example
	if (exampleSource) {
		sections.push('## Example');
		sections.push('```svelte\n' + exampleSource + '\n```');
	}

	// Related
	if (util.related && util.related.length > 0) {
		sections.push('## Related');
		const relatedLinks = util.related
			.map((r) => `- [${r}](https://layerchart.com/docs/utils/${r})`)
			.join('\n');
		sections.push(relatedLinks);
	}

	return sections.join('\n\n');
}
