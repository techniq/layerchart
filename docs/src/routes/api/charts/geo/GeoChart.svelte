<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { GeoPath } from 'layerchart';
	import type { GeoProjection, GeoPermissibleObjects } from 'd3-geo';

	let {
		states,
		projection,
		width,
		height,
		capture,
		onCapture
	}: {
		states: GeoPermissibleObjects & { features: GeoPermissibleObjects[] };
		projection: () => GeoProjection;
		width: number;
		height: number;
		capture?: CaptureTarget;
		onCapture?: (data: CaptureTarget) => void;
	} = $props();
</script>

<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	geo={{
		projection,
		fitGeojson: states
	}}
	padding={{ top: 10, right: 10, bottom: 10, left: 10 }}
>
	{#each states.features as feature (feature)}
		<GeoPath
			geojson={feature}
			fill="rgba(59, 130, 246, 0.15)"
			stroke="rgb(59, 130, 246)"
			strokeWidth={0.5}
		/>
	{/each}
</ServerChart>
