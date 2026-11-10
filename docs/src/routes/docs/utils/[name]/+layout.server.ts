import { allUtils } from 'content-collections';
import { getMarkdownLayers } from '$lib/server/markdownLayers.js';

export const load = async ({ params }) => {
	const util = allUtils.find((u) => u.slug === params.name);
	return { layers: util ? await getMarkdownLayers(util.content, params.name) : [] };
};
