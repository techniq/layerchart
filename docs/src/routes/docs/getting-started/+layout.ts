import { extractTocFromMarkdown } from '@layerstack/docs/markdown';

export const load = async ({ data }) => {
	const page = await import('./+page.md?raw');
	const toc = extractTocFromMarkdown(page.default);

	return {
		metadata: {
			title: 'Getting Started',
			// For the tab and link previews
			name: 'Getting Started',
			description:
				'Install LayerChart and build your first chart with Svelte. Tailwind CSS is supported, but optional.'
			//toc
		},
		layers: data.layers
	};
};
