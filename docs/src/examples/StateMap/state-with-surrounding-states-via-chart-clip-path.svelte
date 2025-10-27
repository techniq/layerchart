<script lang="ts">
	import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, ChartClipPath, GeoPath, Layer, Tooltip } from 'layerchart';
	import { SelectField } from 'svelte-ux';
	import { sort } from '@layerstack/utils';

	import { getUsCountiesTopology } from '$lib/data.remote.js';

	const geojson = await getUsCountiesTopology();
	const counties = feature(geojson, geojson.objects.counties);
	const states = feature(geojson, geojson.objects.states);

	const stateOptions = sort(
		states.features
			.filter((x) => Number(x.id) < 60)
			.map((x) => ({ label: x.properties.name, value: x.id })),
		(d) => d.value
	);
	let selectedStateId = $state('54'); // 'West Virginia';
	const selectedStateFeature = $derived(states.features.find((f) => f.id === selectedStateId));

	let projection = $state(geoAlbersUsa);
	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Mercator', value: geoMercator }
	];

	const data = { geojson, counties, states, selectedStateFeature };

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-4">
	<SelectField
		label="State"
		options={stateOptions}
		bind:value={selectedStateId}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<Chart
	geo={{
		projection,
		fitGeojson: selectedStateFeature
	}}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			<ChartClipPath>
				{#each counties.features as feature}
					<GeoPath
						geojson={feature}
						class="fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20"
						tooltipContext={context.tooltip}
					/>
				{/each}
				{#each states.features as feature}
					<GeoPath
						geojson={feature}
						class="fill-none pointer-events-none stroke-surface-content/10"
					/>
				{/each}
				<GeoPath
					geojson={selectedStateFeature}
					class="fill-none stroke-surface-content pointer-events-none"
				/>
			</ChartClipPath>
		</Layer>

		<Tooltip.Root>
			{context.tooltip.data?.properties.name}
		</Tooltip.Root>
	{/snippet}
</Chart>
