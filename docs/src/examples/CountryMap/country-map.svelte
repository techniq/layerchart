<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer, Text } from 'layerchart';
	import { getUsStatesTopology } from '$lib/data.remote.js';

	const geojson = await getUsStatesTopology();
	const states = feature(geojson, geojson.objects.states);

	const data = { geojson, states };

	export { data };
</script>

<Chart
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	height={600}
>
	<Layer>
		<g class="states">
			{#each states.features as feature}
				<GeoPath
					geojson={feature}
					class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
				/>
			{/each}
		</g>
		<g class="labels pointer-events-none">
			{#each states.features as feature}
				<GeoPath geojson={feature}>
					{#snippet children({ geoPath })}
						{@const [x, y] = geoPath?.centroid(feature) ?? []}
						<Text
							{x}
							{y}
							value={feature.properties.name}
							textAnchor="middle"
							verticalAnchor="middle"
							class="text-[8px] stroke-surface-100 stroke-[2px]"
						/>
					{/snippet}
				</GeoPath>
			{/each}
		</g>
	</Layer>
</Chart>
