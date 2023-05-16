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

<h1>Examples</h1>

<h2>SVG</h2>

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoAlbersUsa,
				fitGeojson: states
			}}
		>
			<Svg>
				<g class="states">
					{#each states.features as feature}
						<GeoPath geojson={feature} class="fill-gray-200 stroke-white hover:fill-gray-300" />
					{/each}
				</g>
				<g class="points pointer-events-none">
					{#each capitals as capital}
						<GeoPoint lat={capital.latitude} long={capital.longitude}>
							<circle r="2" class="fill-white stroke-red-500" />
							<Text
								y="-6"
								value={capital.description}
								textAnchor="middle"
								class="text-[8px] stroke-white [stroke-width:2px]"
							/>
						</GeoPoint>
					{/each}
				</g>
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Canvas</h2>

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoAlbersUsa,
				fitGeojson: states
			}}
		>
			<Canvas>
				<GeoPath geojson={states} fill="#e5e7eb" stroke="white" />
			</Canvas>
			{#each capitals as capital}
				<Canvas>
					<GeoPoint
						lat={capital.latitude}
						long={capital.longitude}
						render={(ctx, { x, y }) => {
							// point
							const radius = 2;
							ctx.strokeStyle = 'red';
							ctx.fillStyle = 'white';
							ctx.beginPath();
							ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
							ctx.fill();
							ctx.stroke();
							// label
							ctx.font = '8px sans-serif';
							ctx.textAlign = 'center';
							ctx.strokeStyle = 'white';
							ctx.lineWidth = 2;
							ctx.fillStyle = 'black';
							ctx.strokeText(capital.description, x, y - 6);
							ctx.fillText(capital.description, x, y - 6);
						}}
					/>
				</Canvas>
			{/each}
		</Chart>
	</div>
</Preview>
