<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlGnBu } from 'd3-scale-chromatic';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';

	import { Chart, Circle, Density, GeoPath, Layer } from 'layerchart';

	import { getWalmarts, getUsStatesTopology } from '$lib/geo.remote.js';

	const walmarts = await getWalmarts();
	const geojson = await getUsStatesTopology();

	const states = feature(geojson, geojson.objects.states);
	const nation = feature(geojson, geojson.objects.nation);
	const statemesh = mesh(geojson, geojson.objects.states, (a, b) => a !== b);

	export { walmarts as data };
</script>

<Chart
	cScale={scaleSequential(interpolateYlGnBu)}
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	height={500}
>
	{#snippet children({ context })}
		{@const proj = context.geo.projection}
		<Layer>
			<Density data={walmarts} x="longitude" y="latitude" bandwidth={10} fillOpacity={0.7} />
			<GeoPath geojson={statemesh} class="fill-none stroke-surface-content/30" strokeWidth={0.5} />
			<GeoPath geojson={nation} class="fill-none stroke-surface-content" strokeWidth={1} />
			<Circle data={walmarts} cx="longitude" cy="latitude" r={1} fill="currentColor" />
		</Layer>
	{/snippet}
</Chart>
