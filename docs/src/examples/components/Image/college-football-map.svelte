<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Image, Layer, Tooltip } from 'layerchart';
	import { SelectField } from 'svelte-ux';
	import { getUsStatesTopology, getD1FootballTeams } from '$lib/geo.remote';

	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	const [topology, allTeams] = $derived(
		await Promise.all([getUsStatesTopology(), getD1FootballTeams()])
	);
	const states = $derived(feature(topology, topology.objects.states));

	const conferences = $derived([...new Set(allTeams.map((t) => t.conference))].sort());
	const conferenceOptions = $derived(conferences.map((c) => ({ label: c, value: c })));

	let selectedConference = $state<string | undefined>(undefined);

	const teams = $derived(
		selectedConference ? allTeams.filter((t) => t.conference === selectedConference) : allTeams
	);

	const data = $derived({ topology, allTeams });

	export { data };
</script>

<div class="flex gap-3 items-end mb-2">
	<SelectField
		label="Conference"
		options={conferenceOptions}
		bind:value={selectedConference}
		placeholder="All conferences"
		clearable
		toggleIcon={null}
	/>
</div>

<Chart
	data={teams}
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	transform={{
		mode: 'projection',
		initialScrollMode: 'scale'
	}}
	tooltipContext={{ mode: 'voronoi' }}
	x="longitude"
	y="latitude"
	height={600}
	clip
	padding={{ right: 32 }}
>
	{#snippet children({ context })}
		<TransformContextControls />

		<Layer>
			{#each states.features as feature (feature.id)}
				<GeoPath geojson={feature} class="fill-surface-content/5 stroke-surface-content/20" />
			{/each}

			<Image
				href={(d) => `https://a.espncdn.com/i/teamlogos/ncaa/500/${d.espn_id}.png`}
				x="longitude"
				y="latitude"
				width={24}
				height={24}
				preserveAspectRatio="xMidYMid slice"
			/>
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.team}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Location" value="{data.city}, {data.state}" />
					<Tooltip.Item label="Conference" value={data.conference} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
