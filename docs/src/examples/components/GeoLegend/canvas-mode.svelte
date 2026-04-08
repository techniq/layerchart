<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, GeoLegend, GeoPath, Layer } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { getUsCountiesTopology } from '$lib/geo.remote';

	const topology = await getUsCountiesTopology();
	const states = feature(topology, topology.objects.states);
</script>

<Chart
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	transform={{
		mode: 'canvas',
		scrollMode: 'scale'
	}}
	padding={{ bottom: 60 }}
	height={500}
	clip
>
	<TransformContextControls />

	<Layer>
		<GeoPath geojson={states} class="fill-surface-100 stroke-surface-content" />
	</Layer>

	<GeoLegend units="mi" placement="bottom-left" class="m-2" />
</Chart>
