import { redirect } from '@sveltejs/kit';
import { allComponents } from 'content-collections';

/**
 * `@layerchart/webgl`'s components had pages of their own here (ex. `webgl/Points`), now sections
 * of LayerChart's (ex. `Points#webgl`), or pages beside them (ex. `Surface`).  Their examples
 * moved to LayerChart's folders, those named as one there already renamed.
 */
const renamed: Record<string, string> = {
	'Arc/concentric': 'Arc/concentric-3d',
	'Area/ridgeline': 'Area/ridgeline-3d',
	'Bin/walmart': 'Bin/walmart-3d',
	'GeoRaster/globe': 'GeoRaster/globe-3d',
	'GeoRaster/planets': 'GeoRaster/planets-3d',
	'GeoRaster/projections': 'GeoRaster/projections-3d',
	'GeoTile/zoomable': 'GeoTile/zoomable-webgl',
	'Rule/lollipop': 'Rule/lollipop-webgl'
};

/** Pages of `@layerchart/webgl`'s alone, rather than a section of LayerChart's */
const webglOnly = new Set(['Light', 'Surface', 'WebGL']);

export function load({ params }) {
	const [name, ...rest] = params.path.split('/');
	if (rest.length) {
		const example = `${name}/${rest.join('/')}`;
		redirect(308, `/docs/components/${renamed[example] ?? example}`);
	}
	const known = allComponents.some((c) => c.slug === name);
	redirect(
		308,
		known && !webglOnly.has(name) ? `/docs/components/${name}#webgl` : `/docs/components/${name}`
	);
}
