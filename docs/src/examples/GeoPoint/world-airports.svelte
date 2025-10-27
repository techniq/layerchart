<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, GeoPath, GeoPoint, getSettings, Layer, Tooltip } from 'layerchart';
	import { getWorldGeojson, getWorldAirports } from '$lib/data.remote';

	const [worldData, airportsData] = $derived(
		await Promise.all([getWorldGeojson(), getWorldAirports()])
	);
	const data = $state({ world: { geojson: worldData, airports: airportsData } });

	const countries = feature(data.world.geojson, data.world.geojson.objects.countries);

	let tooltipMode = $state<'quadtree' | 'voronoi'>('quadtree');
	let tooltipRadius = $state(30);

	let settings = getSettings();

	export { data };
</script>

<div class="flex gap-2">
	<Field label="Tooltip mode" class="grow">
		<ToggleGroup bind:value={tooltipMode} variant="outline">
			<ToggleOption value="quadtree">quadtree</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
		</ToggleGroup>
	</Field>

	<RangeField label="Tooltip radius" bind:value={tooltipRadius} max={100} class="grow" />
</div>

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
