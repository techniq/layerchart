<script lang="ts">
	import { getContext } from 'svelte';
	import { geoPath as d3geoPath, type GeoPermissibleObjects } from 'd3-geo';

	import { geoContext } from './GeoContext.svelte';
	import type { TooltipContextValue } from './TooltipContext.svelte';
	import { scaleCanvas } from 'layercake';

	export let geojson: GeoPermissibleObjects;

	export let fill: string | undefined = undefined;
	export let fillScale = false;
	export let stroke: string | undefined = undefined;
	export let strokeWidth: number | string | undefined = undefined;

	/**
	 * Tooltip context to setup mouse events to show tooltip for related data
	 */
	export let tooltip: TooltipContextValue | undefined = undefined;

	const { rGet, width, height } = getContext('LayerCake');
	const canvas = getContext('canvas');
	const geo = geoContext();

	$: geoPath = d3geoPath($geo.projection);

	$: renderContext = canvas ? 'canvas' : 'svg';

	$: ctx = canvas?.ctx;
	$: if (renderContext === 'canvas' && $ctx) {
		// console.count('render');
		scaleCanvas($ctx, $width, $height);
		$ctx.clearRect(0, 0, $width, $height);

		geojson.features.forEach((feature) => {
			$ctx.beginPath();
			// Set the context here since setting it in `$: geoPath` is a circular reference
			geoPath.context($ctx);
			geoPath(feature);

			$ctx.fillStyle = fill || (fillScale && $rGet(feature.properties)) || 'transparent';
			$ctx.fill();

			$ctx.lineWidth = strokeWidth;
			$ctx.strokeStyle = stroke;
			$ctx.stroke();
		});
	}
</script>

{#if renderContext === 'svg'}
	<path
		d={geoPath(geojson)}
		fill={fill || (fillScale && $rGet(geojson.properties)) || 'transparent'}
		stroke={stroke || 'black'}
		on:mousemove={(e) => tooltip?.show(e, geojson)}
		on:mouseleave={(e) => tooltip?.hide()}
		{...$$restProps}
	/>
{/if}
