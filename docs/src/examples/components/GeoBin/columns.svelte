<script module lang="ts">
	import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
	const airports = await getWorldAirports();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, Layer } from 'layerchart';
	import { GeoBin, GeoPath } from 'layerchart/geo';

	const countries = feature(topology, topology.objects.countries);

	export { airports as data };
</script>

<!-- Each cell stood up off the globe by its number of airports.  Drag to rotate. -->
<Chart
	data={airports}
	x="longitude"
	y="latitude"
	zRange={[0, 80]}
	geo={{
		projection: geoOrthographic,
		fitGeojson: { type: 'Sphere' },
		rotate: { yaw: 90, pitch: -30, roll: 0 }
	}}
	transform={{ mode: 'projection' }}
	padding={96}
	height={650}
>
	<Layer type="canvas">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-200 stroke-surface-content/20" />
		<GeoPath geojson={countries} class="fill-surface-content/10 stroke-none" />
		<GeoBin size={14} z="count" />
	</Layer>
</Chart>
