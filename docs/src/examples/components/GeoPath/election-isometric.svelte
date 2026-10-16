<script module lang="ts">
	import { getUsCountiesAlbersTopology, getUsPresidentialElection2020 } from '$lib/geo.remote.js';
	const topology = await getUsCountiesAlbersTopology();
	const election = await getUsPresidentialElection2020();
</script>

<script lang="ts">
	import { rollup } from 'd3-array';
	import { interpolateRgb } from 'd3-interpolate';
	import { geoIdentity, geoPath, type GeoProjection } from 'd3-geo';
	import { cubicInOut } from 'svelte/easing';
	import { feature } from 'topojson-client';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, isometric, Layer, Tooltip } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';

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

	// Already projected (Albers, 975 × 610), so each state's centre is where it stands on the floor
	const centroids = new Map(states.features.map((f) => [f, geoPath().centroid(f)]));

	const data = { topology, election };
	export { data };
</script>

<Field label="Party" class="w-fit">
	<ToggleGroup bind:value={party} variant="outline">
		<ToggleOption value="dem">Democratic</ToggleOption>
		<ToggleOption value="gop">Republican</ToggleOption>
	</ToggleGroup>
</Field>

<Chart
	geo={{ projection: geoIdentity as unknown as () => GeoProjection, fitGeojson: states }}
	view={isometric({ rotate: -2, tilt: 40, aspect: 975 / 610 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={24}
	height={550}
	clip
>
	{#snippet children({ context })}
		{@const m = context.isometricMatrix}

		<Layer>
			<!-- Sort back to front by each state's center, so nearer ones cover farther ones. -->
			{#each [...states.features].sort((a, b) => {
				const [ax, ay] = centroids.get(a)!;
				const [bx, by] = centroids.get(b)!;
				return m ? m.b * (ax - bx) + m.d * (ay - by) : 0;
			}) as state (state.properties.name)}
				{@const share = shares.get(state.properties.name)?.[party] ?? 0}
				<GeoPath
					geojson={state}
					z={share * 50}
					motion={{ type: 'tween', duration: 800, easing: cubicInOut }}
					fill={interpolateRgb('white', parties[party])(share)}
					class="stroke-black/20"
					strokeWidth={0.5 / context.transform.scale}
					tooltip
				/>
			{/each}
		</Layer>

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
	{/snippet}
</Chart>
