<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { feature } from 'topojson-client';
	import GeoPointControls from '$lib/components/controls/GeoPointControls.svelte';

	import { Chart, GeoPath, GeoPoint, getSettings, Layer, Tooltip } from 'layerchart';
	import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote';

	const [worldData, airportsData] = $derived(
		await Promise.all([getCountriesTopology(), getWorldAirports()])
	);
	const data = $state({ world: { topology: worldData, airports: airportsData } });

	const countries = feature(data.world.topology, data.world.topology.objects.countries);

	let tooltipMode = $state<'quadtree' | 'voronoi'>('quadtree');
	let tooltipRadius = $state(30);

	let settings = getSettings();

	export { data };
</script>

<GeoPointControls bind:tooltipMode bind:tooltipRadius />

<Chart
	data={data.world.airports}
	x="longitude"
	y="latitude"
	geo={{
		projection: geoNaturalEarth1,
		fitGeojson: countries
	}}
	tooltip={{ mode: tooltipMode, debug: settings.debug, radius: tooltipRadius }}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			{#each countries.features as feature}
				<GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-100" />
			{/each}

			{#each data.world.airports as airport}
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
