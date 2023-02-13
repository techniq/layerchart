---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { geoIdentity, geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoContext from '$lib/components/GeoContext.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import GeoPoint from '$lib/components/GeoPoint.svelte';
	import Text from '$lib/components/Text.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	// import geojson from '../data/geo/states-albers-10m.json';
	import capitals from '../data/geo/us-state-capitals.csv';

	export let data;
	// console.log({ data });

	const states = feature(data.geojson, data.geojson.objects.states);
</script>

Example mixing pre-projected maps (using geoIdentity) with non-projected points

## SVG

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoAlbersUsa,
				_scale: 1300,
				_translate: [487.5, 305],
				geojson: states,
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
			let:projection
		>
			<div>{projection.scale()}</div>
			<div>{projection.translate()}</div>
			<Svg>
				<GeoContext
					projection={geoIdentity}
					_scale={projection.scale()}
					scale={projection.scale() / 1300}
					_translate={[487.5 * (487.5 / projection.translate()[0]), 305 * (305 / projection.translate()[1])]}
					__translate={[256.43 * 0.96, -13.11 * 0.96]}
					___translate={[240,5]}
					____translate={[projection.translate()[0] - 487.5, projection.translate()[1] - 305]}
					geojson={states}
					let:projection
				>
					<g class="states">
						{#each states.features as feature}
							<GeoPath geojson={feature} {tooltip} class="fill-white hover:fill-gray-300" />
						{/each}
					</g>
					<text y={100}>{projection.scale()}</text>
					<text y={120}>{projection.translate()}</text>
				</GeoContext>
				<g class="points">
					{#each capitals as capital}
						<GeoPoint lat={capital.latitude} long={capital.longitude}>
							<circle r="2" fill="red" />
							<Text y="-6" value={capital.description} textAnchor="middle" class="text-[8px]" />
						</GeoPoint>
					{/each}
				</g>
			</Svg>
		</Chart>
	</div>
</Preview>
