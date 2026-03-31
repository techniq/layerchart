<script lang="ts">
	import { index } from 'd3-array';
	import { geoIdentity, geoPath as d3GeoPath, type GeoProjection } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer, Vector, Tooltip } from 'layerchart';

	import { getUsCountiesAlbersTopology, getUsPresidentialElection2020 } from '$lib/geo.remote.js';

	const topology = await getUsCountiesAlbersTopology();
	const electionData = await getUsPresidentialElection2020();

	const projection = geoIdentity as unknown as () => GeoProjection;

	const states = feature(topology, topology.objects.states);
	const counties = feature(topology, topology.objects.counties);

	// Index election data by FIPS code
	const electionByFips = index(electionData, (d) => String(d.county_fips).padStart(5, '0'));

	// Index county features by FIPS for hover highlight
	const countyFeatureByFips = index(counties.features, (d) => String(d.id).padStart(5, '0'));

	// Compute raw centroids
	const geoPathGenerator = d3GeoPath(geoIdentity()!);

	const vectorData = counties.features
		.map((feat) => {
			const fips = String(feat.id).padStart(5, '0');
			const election = electionByFips.get(fips);
			if (!election) return null;

			const centroid = geoPathGenerator.centroid(feat);
			if (!isFinite(centroid[0]) || !isFinite(centroid[1])) return null;

			const demWon = election.votes_dem > election.votes_gop;

			return {
				fips,
				cx: centroid[0],
				cy: centroid[1],
				voteDiff: Math.abs(election.diff),
				party: demWon ? 'dem' : 'gop',
				county_name: election.county_name,
				state_name: election.state_name,
				votes_dem: election.votes_dem,
				votes_gop: election.votes_gop,
				total_votes: election.total_votes
			};
		})
		.filter(Boolean) as Array<{
		fips: string;
		cx: number;
		cy: number;
		voteDiff: number;
		party: string;
		county_name: string;
		state_name: string;
		votes_dem: number;
		votes_gop: number;
		total_votes: number;
	}>;

	const data = { topology, electionData };

	export { data };
</script>

<Chart
	data={vectorData}
	x="cx"
	y="cy"
	geo={{
		projection,
		fitGeojson: states
	}}
	r="voteDiff"
	rRange={[0, 50]}
	height={600}
	clip
	tooltipContext={{ mode: 'quadtree' }}
>
	{#snippet children({ context })}
		<Layer>
			<GeoPath geojson={states} class="fill-surface-content/10 stroke-surface-100" />

			<Vector
				x="cx"
				y="cy"
				length="voteDiff"
				rotate={(d) => (d.party === 'dem' ? -60 : 60)}
				shape="arrow-filled"
				anchor="start"
				data={vectorData}
				class={(d) => (d.party === 'dem' ? 'fill-blue-500' : 'fill-red-500')}
			/>
		</Layer>

		<Layer pointerEvents={false}>
			{#if context.tooltip.data}
				{@const countyFeature = countyFeatureByFips.get(context.tooltip.data.fips)}
				{#if countyFeature}
					<GeoPath
						geojson={countyFeature}
						class="fill-surface-content/10 stroke-surface-content"
						strokeWidth={1}
					/>
				{/if}
			{/if}
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.county_name}, {data.state_name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Democrat" value={data.votes_dem} format="integer" valueAlign="right" />
					<Tooltip.Item label="Republican" value={data.votes_gop} format="integer" valueAlign="right" />
					<Tooltip.Item label="Total" value={data.total_votes} format="integer" valueAlign="right" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
