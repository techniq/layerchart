<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Labels, Layer } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';
	import { getUsStatesTopology } from '$lib/geo.remote';

	const topology = $derived(await getUsStatesTopology());
	const states = $derived(feature(topology, topology.objects.states));

	let labelBy = $state<'abbreviation' | 'name'>('abbreviation');

	/** Postal abbreviations by FIPS code (the states' `id`) */
	// prettier-ignore
	const abbreviations: Record<string, string> = {
		'01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE',
		'11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA',
		'20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
		'28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM',
		'36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
		'45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
		'54': 'WV', '55': 'WI', '56': 'WY'
	};

	const data = $derived(topology);
	export { data };
</script>

<div class="flex flex-wrap gap-4 mb-2 screenshot-hidden">
	<Field label="Label">
		<ToggleGroup bind:value={labelBy} variant="outline">
			<ToggleOption value="abbreviation">Abbreviation</ToggleOption>
			<ToggleOption value="name">Name</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }} height={500}>
	<Layer>
		{#each states.features as feature (feature.id)}
			<GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
		{/each}

		<!-- Each state's label nearest its center where it fits (ex. Florida's peninsula, not its panhandle) -->
		<Labels
			data={states.features}
			layout="shape"
			value={(state) =>
				labelBy === 'abbreviation'
					? (abbreviations[state.id as string] ?? '')
					: state.properties.name}
			fontSize={11}
			class="fill-surface-content stroke-surface-100 stroke-[3px] [paint-order:stroke] pointer-events-none"
		/>
	</Layer>
</Chart>
