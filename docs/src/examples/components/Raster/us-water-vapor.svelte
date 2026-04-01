<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdYlBu } from 'd3-scale-chromatic';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, ClipPath, Contour, GeoPath, Layer, Legend, Raster } from 'layerchart';

	import { getWaterVapor } from '$lib/data.remote.js';
	import { getUsCountiesTopology } from '$lib/geo.remote.js';

	const [waterVapor, topology] = await Promise.all([getWaterVapor(), getUsCountiesTopology()]);
	const colorScale = scaleSequential(interpolateRdYlBu).domain([0, 2.5]);

	const nation = feature(topology as any, (topology as any).objects.nation);
	const states = feature(topology, topology.objects.states);
</script>

<Chart
	cScale={colorScale}
	cDomain={[0, 2.5]}
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	padding={{ top: 56 }}
	height={500}
>
	<Legend
		scale={colorScale}
		title="Water vapor (cm)"
		placement="top-left"
		width={340}
		tickValues={[0, 0.5, 1, 1.5, 2, 2.5]}
	/>

	<Layer>
		<ClipPath>
			{#snippet clip()}
				<GeoPath geojson={nation} class="stroke-none" />
			{/snippet}

			<Raster
				data={waterVapor.values}
				width={waterVapor.width}
				height={waterVapor.height}
				x1={-180}
				y1={90}
				x2={180}
				y2={-90}
				interpolate="barycentric"
				blur={10}
			/>
			<Contour
				data={waterVapor.values}
				width={waterVapor.width}
				height={waterVapor.height}
				x1={-180}
				y1={90}
				x2={180}
				y2={-90}
				fill="none"
				stroke="#2f2f2f"
				strokeWidth={0.5}
				thresholds={40}
				blur={10}
			/>
		</ClipPath>

		<GeoPath geojson={nation} class="fill-none stroke-[#2f2f2f]" strokeWidth={1.25} />
	</Layer>
</Chart>
