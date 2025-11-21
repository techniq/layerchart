<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import GeoPointControls from '$lib/components/controls/GeoPointControls.svelte';

	import { Chart, GeoPath, GeoPoint, getSettings, Layer, Tooltip } from 'layerchart';
	import { getUsStatesTopology, getUsAirports } from '$lib/geo.remote';

	const [usData, airportsData] = $derived(
		await Promise.all([getUsStatesTopology(), getUsAirports()])
	);
	const data = $state({ us: { geojson: usData, airports: airportsData } });

	const states = feature(data.us.geojson, data.us.geojson.objects.states);

	let tooltipMode = $state<'quadtree' | 'voronoi'>('quadtree');
	let tooltipRadius = $state(30);

	let settings = getSettings();

	export { data };
</script>

<GeoPointControls bind:tooltipMode bind:tooltipRadius />

<Chart
	data={data.us.airports}
	x="longitude"
	y="latitude"
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	tooltip={{ mode: tooltipMode, debug: settings.debug, radius: tooltipRadius }}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			{#each states.features as feature}
				<GeoPath
					geojson={feature}
					class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
				/>
			{/each}

			{#each data.us.airports as airport}
				<GeoPoint
					lat={airport.latitude}
					long={airport.longitude}
					r={1}
					class="fill-primary pointer-events-none"
				/>
			{/each}
		</Layer>

		<!-- Render tooltip on separate layer to avoid performance issues (canvas) -->
		<Layer>
			{#if context.tooltip.data}
				<GeoPoint
					lat={context.tooltip.data.latitude}
					long={context.tooltip.data.longitude}
					r={4}
					class="stroke-primary/50 fill-none pointer-events-none"
					motion="spring"
				/>
			{/if}
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
					<Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
