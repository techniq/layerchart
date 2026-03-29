<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlGnBu } from 'd3-scale-chromatic';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';

	import { Chart, Circle, Density, GeoPath, Layer, Tooltip } from 'layerchart';
	import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

	import { getWalmarts, getUsStatesTopology } from '$lib/geo.remote.js';

	const walmarts = await getWalmarts();
	const geojson = await getUsStatesTopology();

	const states = feature(geojson, geojson.objects.states);
	const nation = feature(geojson, geojson.objects.nation);
	const statemesh = mesh(geojson, geojson.objects.states, (a, b) => a !== b);

	export { walmarts as data };
</script>

<Chart
	data={walmarts}
	x="longitude"
	y="latitude"
	cScale={scaleSequential(interpolateYlGnBu)}
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	transform={{
		mode: 'canvas',
		scrollMode: 'scale',
		motion: 'spring'
	}}
	tooltipContext={{ mode: 'quadtree' }}
	clip
	height={500}
>
	{#snippet children({ context })}
		<TransformControls />

		<Layer>
			<Density data={walmarts} x="longitude" y="latitude" bandwidth={10} fillOpacity={0.7} />
			<GeoPath geojson={statemesh} class="fill-none stroke-surface-content/30" strokeWidth={0.5} />
			<GeoPath geojson={nation} class="fill-none stroke-surface-content" strokeWidth={1} />
			<Circle cx="longitude" cy="latitude" r={1} fill="currentColor" />
		</Layer>

		<Layer>
			{#if context.tooltip.data}
				<Circle
					data={[context.tooltip.data]}
					cx="longitude"
					cy="latitude"
					r={4}
					class="stroke-surface-content/30 fill-surface-content/10 pointer-events-none"
					motion="spring"
				/>
			{/if}
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.city}, {data.state}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Type" value={data.type} />
					<Tooltip.Item label="Opened" value={data.date} format="day" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
