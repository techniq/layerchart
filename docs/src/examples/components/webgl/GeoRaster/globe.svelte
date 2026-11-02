<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { Chart, GeoPath, GeoRaster, WebGL, Tooltip, globe, perspective } from '@layerchart/webgl';
	import { geoGraticule10 } from 'd3-geo';
	import { feature } from 'topojson-client';

	const countries = feature(topology, topology.objects.countries);

	const data = { topology, countries };
	export { data };
</script>

<!-- NASA Blue Marble wrapped around a sphere, with country borders and a graticule over it -->
<Chart
	view={perspective({ rotate: 20, tilt: 70 })}
	transform={{
		mode: 'canvas',
		drag: 'rotate',
		scrollMode: 'scale',
		scrollActivationKey: 'shift',
		// Zoom in no further than the camera stays outside the globe
		scaleExtent: [0.5, 3],
		// Tip on round to the south pole, rather than stopping edge on
		tiltExtent: [0, 180]
	}}
	geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<GeoRaster src="/images/blue-marble.jpg" tooltip />
		<GeoPath
			geojson={geoGraticule10()}
			stroke="color-mix(in oklab, var(--color-surface-content) 15%, transparent)"
		/>
		<GeoPath
			geojson={countries}
			stroke="color-mix(in oklab, var(--color-surface-content) 40%, transparent)"
		/>
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
				<Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
