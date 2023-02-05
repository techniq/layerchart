<script lang="ts" context="module">
	import { getContext, setContext } from 'svelte';
	import { writable, type Readable } from 'svelte/store';
	import { geoMercator, type GeoIdentityTransform, type GeoProjection } from 'd3-geo';

	export const geoContextKey = {};

	export type GeoContextValue = {
		projection: GeoProjection | GeoIdentityTransform;
	};

	export type GeoContext = Readable<GeoContextValue>;

	const defaultContext: GeoContext = writable({
		projection: geoMercator()
	});

	export function geoContext() {
		return getContext<GeoContext>(geoContextKey) ?? defaultContext;
	}

	function setGeoContext(geo: GeoContext) {
		setContext(geoContextKey, geo);
	}
</script>

<script lang="ts">
	const { data, width, height } = getContext('LayerCake');

	/** @type {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`. */
	export let projection: () => GeoProjection | GeoIdentityTransform = geoMercator;
	// https://github.com/topojson/us-atlas#us-atlas-topojson
	// export let projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

	/** By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here. */
	export let fixedAspectRatio: number | undefined = undefined;

	$: fitSizeRange = (fixedAspectRatio ? [100, 100 / fixedAspectRatio] : [$width, $height]) as [
		number,
		number
	];

	$: projectionFn = projection().fitSize(fitSizeRange, $data);

	const geo = writable({ projection: projectionFn });
	setGeoContext(geo);
</script>

<slot />
