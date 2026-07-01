import { extractTocFromMarkdown } from '@layerstack/docs/markdown';

export const load = async () => {
	const page = await import('./+page.md?raw');
	const toc = extractTocFromMarkdown(page.default);

	return {
		metadata: {
			title: 'Getting Started'
			//toc
		}
	};
};
