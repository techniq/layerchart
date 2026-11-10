import { getMarkdownLayers } from '$lib/server/markdownLayers.js';

export const load = async () => {
	const page = await import('./+page.md?raw');
	return { layers: await getMarkdownLayers(page.default) };
};
