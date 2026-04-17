<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, GeoLegend, GeoPath, Layer } from 'layerchart';
	const countries = feature(topology, topology.objects.countries);
</script>

<Chart
	geo={{
		projection: geoNaturalEarth1,
		fitGeojson: countries
	}}
	transform={{
		mode: 'projection',
		scrollMode: 'scale'
	}}
	padding={{ bottom: 60 }}
	height={500}
	clip
>
	<Layer>
		<GeoPath geojson={countries} class="fill-surface-100 stroke-surface-content" />
	</Layer>

	<GeoLegend units="km" tickFormat="metric" placement="bottom-left" class="m-2" />
</Chart>
