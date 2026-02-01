import { slug as githubSlug } from 'github-slugger';

/**
 * Extract table of contents from markdown content
 */
export function extractTocFromMarkdown(content: string) {
	const toc: { id: string; text: string; level: number }[] = [];

	// Strip HTML comments so commented-out headings are ignored
	const stripped = content.replace(/<!--[\s\S]*?-->/g, '');

	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	let match;

	while ((match = headingRegex.exec(stripped)) !== null) {
		const level = match[1].length;
		// Strip inline MDC directives (e.g. `:icon{name="lucide:user" class="..."}`)
		const text = match[2].replace(/:[a-zA-Z][\w-]*\{[^}]*\}/g, '').trim();
		if (!text) continue;
		// Use github-slugger then strip leading/trailing dashes (matching rehypeCleanSlugIds)
		const id = githubSlug(text);

		toc.push({ id, text, level });
	}

	return toc;
}
