<script module lang="ts">
	import { getUsCountiesTopology } from '$lib/geo.remote';
	const topology = await getUsCountiesTopology();
</script>

<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, GeoLegend, GeoPath, Layer } from 'layerchart';
	const states = feature(topology, topology.objects.states);
</script>

<Chart
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	transform={{
		mode: 'projection',
		scrollMode: 'scale'
	}}
	padding={{ bottom: 80 }}
	height={500}
	clip
>
	<Layer>
		<GeoPath geojson={states} class="fill-surface-100 stroke-surface-content" />
	</Layer>

	<GeoLegend units="mi" ticks={1} placement="bottom-left" class="m-2" />
</Chart>
