import { slug as githubSlug } from 'github-slugger';

/**
 * Extract table of contents from markdown content.
 *
 * @param {string} content
 */
export function extractTocFromMarkdown(content) {
	const toc = [];

	// Strip HTML comments so commented-out headings are ignored
	const stripped = content.replace(/<!--[\s\S]*?-->/g, '');

	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	let match;

	while ((match = headingRegex.exec(stripped)) !== null) {
		const level = match[1].length;
		const text = match[2]
			.replace(/:[a-zA-Z][\w-]*\{[^}]*\}/g, '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.trim();
		if (!text) continue;
		const id = githubSlug(text);

		toc.push({ id, text, level });
	}

	return toc;
}
