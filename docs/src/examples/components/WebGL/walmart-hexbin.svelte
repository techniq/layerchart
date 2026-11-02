<script module lang="ts">
	import { getUsStatesTopology, getWalmarts } from '$lib/geo.remote.js';
	const walmarts = await getWalmarts();
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';
	import { Bin, Chart, GeoPath, WebGL, Tooltip, perspective } from '@layerchart/webgl';

	const states = feature(topology, topology.objects.states);
	const nation = feature(topology, topology.objects.nation);
	const statemesh = mesh(topology, topology.objects.states, (a, b) => a !== b);

	export { walmarts as data };
</script>

<!-- Each hexagon raised by its number of stores -->
<Chart
	view={perspective({ rotate: 25, tilt: 50 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	data={walmarts}
	x="longitude"
	y="latitude"
	geo={{ projection: geoAlbersUsa, fitGeojson: states }}
	zRange={({ height }) => [0, height * 0.25]}
	tooltipContext
	height={550}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<GeoPath
			geojson={nation}
			fill="color-mix(in oklab, var(--color-surface-content) 5%, var(--color-surface-100))"
			stroke="color-mix(in oklab, var(--color-surface-content) 30%, var(--color-surface-100))"
		/>
		<GeoPath
			geojson={statemesh}
			stroke="color-mix(in oklab, var(--color-surface-content) 20%, var(--color-surface-100))"
		/>
		<!-- Stores binned into hexagons of the map as projected -->
		<Bin size={17} z="count" tooltip />
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="stores" value={data.count} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
