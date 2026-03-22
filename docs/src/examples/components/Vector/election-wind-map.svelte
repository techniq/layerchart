<script lang="ts">
	import { index } from 'd3-array';
	import { geoIdentity, geoPath as d3GeoPath, type GeoProjection } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer, Vector } from 'layerchart';

	import { getUsCountiesAlbersTopology, getUsPresidentialElection2020 } from '$lib/geo.remote.js';

	const topology = await getUsCountiesAlbersTopology();
	const electionData = await getUsPresidentialElection2020();

	const projection = geoIdentity as unknown as () => GeoProjection;

	const states = feature(topology, topology.objects.states);
	const counties = feature(topology, topology.objects.counties);

	// Index election data by FIPS code
	const electionByFips = index(electionData, (d) => String(d.county_fips).padStart(5, '0'));

	// Compute raw centroids (pre-projected Albers coords — Chart's fitted geoIdentity will transform these)
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
				cx: centroid[0],
				cy: centroid[1],
				voteDiff: Math.abs(election.diff),
				rotate: demWon ? -60 : 60,
				party: demWon ? 'dem' : 'gop'
			};
		})
		.filter(Boolean) as Array<{
		cx: number;
		cy: number;
		voteDiff: number;
		rotate: number;
		party: string;
	}>;

	const data = { topology, electionData };

	export { data };
</script>

<Chart
	data={vectorData}
	geo={{
		projection,
		fitGeojson: states
	}}
	r="voteDiff"
	rRange={[0, 50]}
	height={600}
	clip
>
	<Layer>
		<GeoPath geojson={states} class="fill-surface-content/10 stroke-surface-100" />

		<Vector
			x="cx"
			y="cy"
			length="voteDiff"
			rotate="rotate"
			anchor="start"
			strokeWidth={1}
			data={vectorData}
			class={(d) => (d.party === 'dem' ? 'stroke-blue-500' : 'stroke-red-500')}
		/>
	</Layer>
</Chart>
