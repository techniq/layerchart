<script lang="ts" context="module">
	import { getContext, setContext } from 'svelte';
	import { writable, type Readable } from 'svelte/store';
	import {
		geoMercator,
		type GeoIdentityTransform,
		type GeoPermissibleObjects,
		type GeoProjection
	} from 'd3-geo';

	export const geoContextKey = {};

	export type GeoContextValue = {
		projection: GeoProjection | GeoIdentityTransform;
		geojson: GeoPermissibleObjects;
		clipAngle?: number;
		clipExtent?: [[number, number], [number, number]];
		/**
		 * Set projections three-axis spherical rotation
		 * see: https://github.com/d3/d3-geo#projection_rotate
		 */
		rotate?: {
			/** Lambda (Center Meridian) */
			yaw: number;
			/** Phi */
			pitch: number;
			/** Gamma */
			roll: number;
		};
		scale?: number;
	};

	export type GeoContext = Readable<GeoContextValue>;

	export function geoContext() {
		return getContext<GeoContext>(geoContextKey);
	}

	function setGeoContext(geo: GeoContext) {
		setContext(geoContextKey, geo);
	}
</script>

<script lang="ts">
	const { width, height } = getContext('LayerCake');

	/** @type {Function} projection - A D3 projection function. Pass this in as an uncalled function, e.g. `projection={geoAlbersUsa}`. */
	export let projection: () => GeoContextValue['projection'] = geoMercator;
	// https://github.com/topojson/us-atlas#us-atlas-topojson
	// export let projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

	export let geojson: GeoContextValue['geojson'];

	export let clipAngle: GeoContextValue['clipAngle'];
	export let clipExtent: GeoContextValue['clipExtent'];
	export let rotate: GeoContextValue['rotate'];
	export let scale: GeoContextValue['scale'];

	/** By default, the map fills to fit the $width and $height. If instead you want a fixed-aspect ratio, like for a server-side rendered map, set that here. */
	export let fixedAspectRatio: number | undefined = undefined;

	$: fitSizeRange = (fixedAspectRatio ? [100, 100 / fixedAspectRatio] : [$width, $height]) as [
		number,
		number
	];

	$: projectionFn = projection().fitSize(fitSizeRange, geojson);

	$: if (scale && 'scale' in projectionFn) {
		projectionFn.scale(scale);
	}

	$: if (clipAngle && 'clipAngle' in projectionFn) {
		projectionFn.clipAngle(clipAngle);
	}

	$: if (clipExtent && 'clipExtent' in projectionFn) {
		projectionFn.clipExtent(clipExtent);
	}

	$: if (rotate && 'rotate' in projectionFn) {
		projectionFn.rotate([rotate.yaw, rotate.pitch, rotate.roll]);
	}

	const geo = writable<GeoContextValue>();
	$: $geo = { projection: projectionFn, geojson };
	setGeoContext(geo);
</script>

<slot />
