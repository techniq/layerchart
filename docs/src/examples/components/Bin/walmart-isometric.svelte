<script module lang="ts">
	import { getUsStatesTopology, getWalmarts } from '$lib/geo.remote.js';
	const walmarts = await getWalmarts();
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';
	import { Bin, Chart, isometric, Layer } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';

	const states = feature(topology, topology.objects.states);
	const nation = feature(topology, topology.objects.nation);
	const statemesh = mesh(topology, topology.objects.states, (a, b) => a !== b);

	export { walmarts as data };
</script>

<!-- Each hexagon raised by its number of stores, measured by `zScale`.  The floor takes the map's
     shape (Albers USA's 975 × 610), rather than a square it would sit small in.  Drag to rotate, and hold
     shift to zoom. -->
<Chart
	data={walmarts}
	x="longitude"
	y="latitude"
	geo={{ projection: geoAlbersUsa, fitGeojson: states }}
	zRange={({ height }) => [0, height * 0.3]}
	view={isometric({ rotate: -15, tilt: 55, aspect: 975 / 610 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	padding={24}
	height={550}
>
	<Layer type="canvas">
		<GeoPath geojson={nation} class="fill-surface-content/5 stroke-surface-content/30" />
		<GeoPath geojson={statemesh} class="fill-none stroke-surface-content/20" />
		<Bin size={8} z="count" />
	</Layer>
</Chart>
