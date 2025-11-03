<script lang="ts">
	import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer } from 'layerchart';
	import { SelectField } from 'svelte-ux';
	import { sort } from '@layerstack/utils';

	import { getUsCountiesTopology } from '$lib/geo.remote.js';

	const topology = await getUsCountiesTopology();
	const states = feature(topology, topology.objects.states);

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

	const data = { topology, states, selectedStateFeature };

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-4">
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
	<Layer>
		<GeoPath geojson={selectedStateFeature} class="stroke-surface-content" />
	</Layer>
</Chart>
