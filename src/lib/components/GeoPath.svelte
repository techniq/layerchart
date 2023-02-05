<script lang="ts">
	import { getContext } from 'svelte';
	import { geoPath as d3geoPath } from 'd3-geo';

	import { geoContext } from './GeoContext.svelte';
	import type { TooltipContextValue } from './TooltipContext.svelte';

	const { rGet } = getContext('LayerCake');

	const geo = geoContext();
	$: geoPath = d3geoPath($geo.projection);

	export let geojson: any;

	/**
	 * Tooltip context to setup mouse events to show tooltip for related data
	 */
	export let tooltip: TooltipContextValue | undefined = undefined;
</script>

<path
	d={geoPath(geojson)}
	fill={$rGet(geojson.properties)}
	stroke="black"
	on:mousemove={(e) => tooltip?.show(e, geojson)}
	on:mouseleave={(e) => tooltip?.hide()}
	{...$$restProps}
/>
