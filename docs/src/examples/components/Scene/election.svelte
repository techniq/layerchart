<script module lang="ts">
	import { getUsCountiesAlbersTopology, getUsPresidentialElection2020 } from '$lib/geo.remote.js';
	const topology = await getUsCountiesAlbersTopology();
	const election = await getUsPresidentialElection2020();
</script>

<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { rollup } from 'd3-array';
	import { interpolateRgb } from 'd3-interpolate';
	import { geoIdentity, type GeoProjection } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, GeoPath, Scene, Tooltip, perspective } from '@layerchart/3d';

	const states = feature(topology, topology.objects.states);

	// Each state's share of the vote, by party
	const shares = rollup(
		election,
		(counties) => {
			const total = counties.reduce((sum, d) => sum + d.total_votes, 0);
			return {
				dem: counties.reduce((sum, d) => sum + d.votes_dem, 0) / total,
				gop: counties.reduce((sum, d) => sum + d.votes_gop, 0) / total
			};
		},
		(d) => d.state_name
	);

	const parties = { dem: '#2166ac', gop: '#d6322b' };
	let party = $state<keyof typeof parties>('dem');

	const shareOf = (state: any) => shares.get(state.properties.name)?.[party] ?? 0;

	const data = { topology, election };
	export { data };
</script>

<Field label="Party" class="w-fit">
	<ToggleGroup bind:value={party} variant="outline">
		<ToggleOption value="dem">Democratic</ToggleOption>
		<ToggleOption value="gop">Republican</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Each state raised by its share of the vote, measured by `zScale` -->
<Chart
	view={perspective({ rotate: -2, tilt: 40 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={{ projection: geoIdentity as unknown as () => GeoProjection, fitGeojson: states }}
	zDomain={[0, 1]}
	zRange={[0, 50]}
	tooltipContext
	height={550}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene>
		<GeoPath
			tooltip
			geojson={states}
			z={shareOf}
			fill={(state) => interpolateRgb('white', parties[party])(shareOf(state))}
			stroke="color-mix(in oklab, black 25%, var(--color-surface-100))"
			strokeWidth={0.5}
			motion={{ type: 'tween', duration: 800, easing: cubicInOut }}
		/>
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			{@const share = shares.get(data.properties.name)}
			<Tooltip.Header>{data.properties.name}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="Democratic" value={share?.dem} format="percent" />
				<Tooltip.Item label="Republican" value={share?.gop} format="percent" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
