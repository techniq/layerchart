<script lang="ts">
	import { index } from 'd3-array';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import GeoPoint from '$lib/components/GeoPoint.svelte';
	import Text from '$lib/components/Text.svelte';

	import geojson from '../_data/geo/us-states-topojson.js';
	import capitals from '../_data/geo/us-state-capitals.csv';

	const states = feature(geojson, geojson.objects.collection);
</script>

# Examples

## SVG

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoAlbersUsa,
				fitGeojson: states,
			}}
		>
			<Svg>
				<g class="states">
					{#each states.features as feature}
						<GeoPath geojson={feature} class="fill-gray-200 stroke-white hover:fill-gray-300" />
					{/each}
				</g>
				<g class="labels pointer-events-none">
					{#each states.features as feature}
						<GeoPath geojson={feature} let:geoPath>
							{@const [x,y] = geoPath.centroid(feature)}
							<Text {x} {y} value={feature.properties.name} textAnchor="middle" verticalAnchor="middle" class="text-[8px] stroke-white [stroke-width:2px]" />
						</GeoPath>
					{/each}
				</g>
			</Svg>
		</Chart>
	</div>
</Preview>

## Canvas

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoAlbersUsa,
				fitGeojson: states,
			}}
		>
			<Canvas>
				<GeoPath geojson={states} fill="#e5e7eb" stroke="white" />
			</Canvas>
			{#each states.features as feature}
				<Canvas>
					<GeoPath geojson={feature} render={(ctx, { geoPath }) => {
							const [x, y] = geoPath.centroid(feature);
							ctx.font = "8px sans-serif";
							ctx.textAlign = "center";
							ctx.strokeStyle = 'white';
							ctx.lineWidth = 2;
							ctx.fillStyle = 'black';
							ctx.strokeText(feature.properties.name, x, y);
							ctx.fillText(feature.properties.name, x, y);
						}}
					/>
				</Canvas>
			{/each}
		</Chart>
	</div>
</Preview>
