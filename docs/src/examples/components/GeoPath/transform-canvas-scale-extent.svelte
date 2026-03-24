<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	import { getUsCountiesTopology } from '$lib/geo.remote.js';

	const geojson = await getUsCountiesTopology();

	const states = feature(geojson, geojson.objects.states);

	const data = { geojson, states };
	export { data };
</script>

<Chart
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	transform={{
		mode: 'canvas',
		scrollMode: 'scale',
		scaleExtent: [1, 8]
	}}
	height={400}
	clip
>
	{#snippet children({ context })}
		<TransformContextControls />

		<Layer>
			{#each states.features as feature (feature.id)}
				<GeoPath
					geojson={feature}
					class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
					strokeWidth={1 / context.transform.scale}
				/>
			{/each}
		</Layer>
	{/snippet}
</Chart>
