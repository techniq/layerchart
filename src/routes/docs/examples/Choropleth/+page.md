---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { geoIdentity } from 'd3-geo';
	import { feature } from 'topojson-client';

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	import statesData from '../_data/geo/us-states-data.json';

	export let data;

	const states = feature(data.geojson, data.geojson.objects.states);
	const counties = feature(data.geojson, data.geojson.objects.counties);

	const dataByStateName = index(statesData, (d) => d.name);
</script>

## SVG

<Preview>
	<div class="h-[600px]">
		<Chart
			data={statesData}
			r={(d) => dataByStateName.get(d.name)?.value}
			rScale={scaleQuantize()}
			rRange={['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33']}
			geo={{
				projection: geoIdentity,
				fitGeojson: states
			}}
			tooltip={{ mode: 'manual', raiseTarget: true }}
			let:tooltip
		>
			<Svg>
				<g>
					{#each states.features as feature}
						<GeoPath geojson={feature} {tooltip} fillScale={{ name: feature.properties.name }} class="hover:stroke-red-500 hover:stroke-2" />
					{/each}
				</g>
				<g>
					{#each counties.features as feature}
						<GeoPath geojson={feature} class="fill-none stroke-black/10 pointer-events-none" />
					{/each}
				</g>
			</Svg>
			<Tooltip header={(data) => data.properties.name} let:data>
				<TooltipItem
					label="value"
					value={dataByStateName.get(data.properties.name)?.value}
					format="currency"
				/>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Canvas

<Preview>
	<div class="h-[600px]">
		<Chart
			data={statesData}
			r={(d) => dataByStateName.get(d.name)?.value}
			rScale={scaleQuantize()}
			rRange={['#ffdecc', '#ffc09c', '#ffa06b', '#ff7a33']}
			geo={{
				projection: geoIdentity,
				fitGeojson: states
			}}
		>
			{#each states.features as feature}
				<Canvas>
					<GeoPath geojson={feature} fillScale={{ name: feature.properties.name }} />
				</Canvas>
			{/each}
			<Canvas>
				<GeoPath geojson={counties} stroke="rgba(0,0,0,.1)" />
			</Canvas>
		</Chart>
	</div>
</Preview>
