<script module lang="ts">
	import { getWalmarts, getUsStatesTopology } from '$lib/geo.remote.js';
	const walmarts = await getWalmarts();
	const geojson = await getUsStatesTopology();
</script>

<script lang="ts">
	import { median } from 'd3-array';
	import { scaleSequential } from 'd3-scale';
	import { interpolateSpectral } from 'd3-scale-chromatic';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';

	import { Bin, Chart, Layer, Legend } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';

	const states = feature(geojson, geojson.objects.states);
	const nation = feature(geojson, geojson.objects.nation);
	const statemesh = mesh(geojson, geojson.objects.states, (a, b) => a !== b);

	export { walmarts as data };
</script>

<!-- Each hexagon sized by its number of stores, and colored by when they typically opened -->
<Chart
	data={walmarts}
	x="longitude"
	y="latitude"
	cScale={scaleSequential(interpolateSpectral)}
	cDomain={[new Date(1970, 0, 1), new Date(2006, 0, 1)]}
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	padding={{ top: 56 }}
	height={500}
>
	<Legend title="Median opening date" tickFormat="year" placement="top-left" />
	<Layer>
		<GeoPath geojson={nation} class="fill-surface-content/5 stroke-none" />
		<GeoPath geojson={statemesh} class="fill-none stroke-surface-content/30" strokeWidth={0.5} />
		<Bin
			size={14}
			r="count"
			fill={(cell) => median(cell.data, (d) => d.date)}
			stroke="var(--color-surface-content)"
			strokeOpacity={0.3}
			strokeWidth={0.5}
		/>
	</Layer>
</Chart>
