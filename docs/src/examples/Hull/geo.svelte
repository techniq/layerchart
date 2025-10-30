<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { curveLinearClosed } from 'd3-shape';
	import { feature } from 'topojson-client';
	import { Chart, Circle, GeoPath, GeoPoint, Hull, Layer, Text } from 'layerchart';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import { getUsStatesTopology, getUsCapitals } from '$lib/geo.remote';

	let topology = $state(await getUsStatesTopology());
	const states = feature(topology, topology.objects.states);

	let capitals = $state(await getUsCapitals());

	export { capitals as data };

	let curve = $state(curveLinearClosed);
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">
	<CurveMenuField bind:value={curve} showOpenClosed />
</div>

<Chart
	x="longitude"
	y="latitude"
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	height={600}
>
	<Layer>
		<GeoPath geojson={states} class="fill-surface-content/10 stroke-surface-100" />
		<g class="points pointer-events-none">
			<Hull
				data={capitals.filter((d: any) => {
					return !['Alaska', 'Hawaii'].includes(d.name);
				})}
				{curve}
				classes={{
					path: 'pointer-events-none stroke-danger fill-danger/10'
				}}
			/>

			{#each capitals as capital}
				<!-- TODO: Fix GeoPoint to work with Canvas -->
				<GeoPoint lat={capital.latitude} long={capital.longitude}>
					<Circle r={2} class="fill-white stroke-danger" />
					<Text
						value={capital.description}
						textAnchor="middle"
						class="text-[8px] stroke-surface-100 [stroke-width:2px]"
					/>
				</GeoPoint>
			{/each}
		</g>
	</Layer>
</Chart>
