<script lang="ts">
	import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer, Tooltip } from 'layerchart';
	import GeopathControls from '$lib/components/controls/GeoPathStatesControls.svelte';
	import { sort } from '@layerstack/utils';

	import { getUsCountiesTopology } from '$lib/geo.remote.js';

	const topology = await getUsCountiesTopology();
	const counties = feature(topology, topology.objects.counties);
	const states = feature(topology, topology.objects.states);

	const stateOptions = sort(
		states.features
			.filter((x) => Number(x.id) < 60)
			.map((x) => ({ label: x.properties.name, value: x.id })),
		(d) => d.value
	);
	let selectedStateId = $state('54'); // 'West Virginia';
	const selectedStateFeature = $derived(states.features.find((f) => f.id === selectedStateId));
	const selectedCountiesFeatures = $derived(
		counties.features.filter((f) => String(f.id).slice(0, 2) === selectedStateId)
	);

	let projection = $state(geoAlbersUsa);
	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Mercator', value: geoMercator }
	];

	const data = { topology, counties, states, selectedStateFeature, selectedCountiesFeatures };

	export { data };
</script>

<GeopathControls {stateOptions} {projections} bind:selectedStateId bind:projection />

<Chart
	geo={{
		projection,
		fitGeojson: selectedStateFeature
	}}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			{#each selectedCountiesFeatures as feature}
				<GeoPath
					geojson={feature}
					class="fill-surface-100 stroke-surface-content/10 hover:fill-surface-content/20"
					tooltipContext={context.tooltip}
				/>
			{/each}
			<GeoPath
				geojson={selectedStateFeature}
				class="fill-none stroke-surface-content pointer-events-none"
			/>
		</Layer>

		<Tooltip.Root>
			{context.tooltip.data?.properties.name}
		</Tooltip.Root>
	{/snippet}
</Chart>
