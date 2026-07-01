import { loadExamplesFromMarkdown } from '$lib/content.js';

export const load = async ({ url }) => {
	let examples = {};

	// Only load examples for standalone markdown pages (not component/example routes)
	// Component/example routes handle their own example loading via their layout
	const isComponentOrExampleRoute = url.pathname.match(/^\/docs\/(components|examples)\//);

	if (!isComponentOrExampleRoute) {
		// Try to load markdown file for standalone pages like /docs/getting-started
		const allMarkdown = import.meta.glob('/src/routes/docs/**/*.md', {
			query: '?raw',
			import: 'default',
			eager: false
		});

		// Build potential markdown file paths for this route
		const pathname = url.pathname;
		const relativePath = pathname.replace(/^\/docs\/?/, '');

		const possiblePaths = [
			`/src/routes/docs/${relativePath}/+page.md`,
			`/src/routes/docs/${relativePath}.md`
		].filter(Boolean);

		// Try each possible path
		for (const mdPath of possiblePaths) {
			if (allMarkdown[mdPath]) {
				try {
					const markdownContent = (await allMarkdown[mdPath]()) as string;
					// Eagerly load examples referenced in the markdown
					examples = await loadExamplesFromMarkdown(
						markdownContent,
						undefined, // no default component
						'components',
						pathname // for resolving relative paths
					);
					break;
				} catch (e) {
					console.warn(`Failed to load markdown at ${mdPath}:`, e);
				}
			}
		}
	}

	return {
		examples
	};
};
