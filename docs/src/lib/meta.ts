import { ogImageUrl } from './og';

/** A page's name and description, as its `load` returns them under `metadata` */
export type PageMetadata = { name?: string; description?: string };

export const SITE_DESCRIPTION =
	'Composable Svelte chart components to build a large variety of visualizations';

/**
 * A page's `<title>`, and its `<meta>` tags for search and link previews (as `[attribute, key,
 * content]`, ex. `['property', 'og:title', 'AreaChart · LayerChart']`)
 */
export function pageMeta(url: URL, metadata?: PageMetadata | null) {
	const title = metadata?.name ? `${metadata.name} · LayerChart` : 'LayerChart';
	const description = metadata?.description ?? SITE_DESCRIPTION;
	const image = ogImageUrl(url);

	const tags: [attribute: 'name' | 'property', key: string, content: string][] = [
		['name', 'description', description],

		['property', 'og:type', 'website'],
		['property', 'og:title', title],
		['property', 'og:description', description],
		['property', 'og:image', image],
		['property', 'og:image:type', 'image/png'],
		['property', 'og:image:width', '1200'],
		['property', 'og:image:height', '630'],
		['property', 'og:url', url.href],
		['property', 'og:site_name', 'LayerChart'],

		['name', 'twitter:card', 'summary_large_image'],
		['name', 'twitter:site', '@techniq35'],
		['name', 'twitter:title', title],
		['name', 'twitter:description', description],
		['name', 'twitter:image', image]
	];
	return { title, tags };
}
