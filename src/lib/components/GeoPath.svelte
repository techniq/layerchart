<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import { geoPath as d3geoPath, type GeoPath, type GeoPermissibleObjects } from 'd3-geo';

	import { geoContext } from './GeoContext.svelte';
	import type { TooltipContextValue } from './TooltipContext.svelte';
	import { scaleCanvas } from 'layercake';

	export let geojson: GeoPermissibleObjects;

	export let fill: string | undefined = undefined;
	export let fillScale: Object | undefined = undefined;
	export let stroke: string | undefined = undefined;
	export let strokeWidth: number | string | undefined = undefined;

	/** Render to canvas */
	export let render: ((ctx: CanvasRenderingContext2D, { geoPath: GeoPath }) => any) | undefined =
		undefined;

	/**
	 * Tooltip context to setup mouse events to show tooltip for related data
	 */
	export let tooltip: TooltipContextValue | undefined = undefined;

	const dispatch = createEventDispatcher<{ click: { geoPath: GeoPath; event: MouseEvent } }>();

	const { rGet, width, height } = getContext('LayerCake');
	const canvas = getContext('canvas');
	const geo = geoContext();

	$: geoPath = d3geoPath($geo);

	$: renderContext = canvas ? 'canvas' : 'svg';

	$: ctx = canvas?.ctx;
	$: if (renderContext === 'canvas' && $ctx) {
		// console.count('render');
		scaleCanvas($ctx, $width, $height);
		$ctx.clearRect(0, 0, $width, $height);

		if (render) {
			render($ctx, { geoPath });
		} else {
			$ctx.beginPath();
			// Set the context here since setting it in `$: geoPath` is a circular reference
			geoPath.context($ctx);
			geoPath(geojson);

			$ctx.fillStyle = fill || (fillScale && $rGet(fillScale)) || 'transparent';
			$ctx.fill();

			$ctx.lineWidth = strokeWidth;
			$ctx.strokeStyle = stroke;
			$ctx.stroke();
		}
	}
</script>

{#if renderContext === 'svg'}
	<slot {geoPath}>
		<path
			d={geoPath(geojson)}
			fill={fill || (fillScale && $rGet(fillScale)) || 'transparent'}
			stroke={stroke || 'black'}
			on:mousemove={(e) => tooltip?.show(e, geojson)}
			on:mouseleave={(e) => tooltip?.hide()}
			on:click={(event) => dispatch('click', { geoPath, event })}
			{...$$restProps}
		/>
	</slot>
{/if}
