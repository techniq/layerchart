<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, Circle, GeoPath, GeoPoint, getSettings, Layer, Text } from 'layerchart';
	import { getUsStatesTopology, getUsCapitals } from '$lib/geo.remote';

	const [usData, capitalsData] = await Promise.all([getUsStatesTopology(), getUsCapitals()]);
	const data = $state({ us: { topology: usData, capitals: capitalsData } });

	const states = feature(data.us.topology, data.us.topology.objects.states);

	let settings = getSettings();

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
		{#each states.features as feature}
			<GeoPath
				geojson={feature}
				class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
			/>
		{/each}

		<g class="points pointer-events-none">
			{#each data.us.capitals as capital}
				<!-- TODO: Improve GeoPoint to standardize svg/canvas -->
				{#if settings.layer === 'svg'}
					<GeoPoint lat={capital.latitude} long={capital.longitude}>
						<Circle r={2} class="fill-white stroke-danger" />
						<Text
							y="-6"
							value={capital.description}
							textAnchor="middle"
							class="text-[8px] stroke-surface-100 [stroke-width:2px]"
						/>
					</GeoPoint>
				{:else if settings.layer === 'canvas'}
					<GeoPoint lat={capital.latitude} long={capital.longitude}>
						{#snippet children({ x, y })}
							<Circle cx={x} cy={y} r={2} class="fill-white stroke-danger" />
							<Text
								{x}
								y={y - 6}
								value={capital.description}
								textAnchor="middle"
								class="text-[8px] stroke-surface-100 [stroke-width:2px]"
							/>
						{/snippet}
					</GeoPoint>
				{/if}
			{/each}
		</g>
	</Layer>
</Chart>
