/**
 * Bump when the cards change.  Sharing sites keep a picture for as long as its address stays the
 * same, and the edge cache files cards under it too, so this is what makes both draw them again.
 */
export const OG_VERSION = '1';

/** The sections under `/docs` that `routes/og/[...path]` draws a card for */
const sections = new Set([
	'components',
	'utils',
	'guides',
	'getting-started',
	'examples',
	'showcase',
	'releases'
]);

/**
 * The share card for a page: `/og` followed by the page's path (ex. `/og/docs/components/AreaChart/basic`),
 * drawn by `routes/og/[...path]`.  The home page, and anything that is not a docs page, keep the
 * designed `og-image.png`.
 */
export function ogImageUrl(url: URL) {
	const path = url.pathname.replace(/\/+$/, '');
	const [, root, section] = path.split('/');

	if (root === 'docs' && sections.has(section)) {
		return `${url.origin}/og${path}?v=${OG_VERSION}`;
	}
	return `${url.origin}/images/og-image.png`;
}
