import { allGuides } from 'content-collections';
import { getMarkdownLayers } from '$lib/server/markdownLayers.js';

export const load = async ({ params }) => {
	const guide = allGuides.find((g) => g.slug === params.name);
	return { layers: guide ? await getMarkdownLayers(guide.content) : [] };
};
