<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Circle, GeoPath, GeoPoint, getSettings, Layer, Text, Tooltip } from 'layerchart';
	import { getCountriesTopology, getWorldCapitals } from '$lib/geo.remote';

	const [worldData, capitalsData] = $derived(
		await Promise.all([getCountriesTopology(), getWorldCapitals()])
	);
	const data = $state({ world: { topology: worldData, capitals: capitalsData } });

	const countries = feature(data.world.topology, data.world.topology.objects.countries);

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
	data={data.world.capitals}
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
				<GeoPath
					geojson={feature}
					class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
				/>
			{/each}

			{#each data.world.capitals as capital}
				<GeoPoint
					lat={capital.latitude}
					long={capital.longitude}
					r={2}
					class="fill-white stroke-danger pointer-events-none"
				/>
			{/each}
		</Layer>

		<!-- Show tooltip as GeoPoint (Svg/Canvas) instead of Tooltip.Point (Html)) -->
		<!-- Render tooltip on separate layer to avoid performance issues (canvas) -->
		<Layer>
			{#if context.tooltip.data}
				{#if settings.layer === 'svg'}
					<GeoPoint
						lat={context.tooltip.data.latitude}
						long={context.tooltip.data.longitude}
						motion="spring"
					>
						<Circle r={4} class="stroke-primary/50 fill-none" />
						<Text
							y="-6"
							value={context.tooltip.data.label}
							textAnchor="middle"
							class="text-[8px] stroke-surface-100 stroke-[2px]"
						/>
					</GeoPoint>
				{:else if settings.layer === 'canvas'}
					<GeoPoint
						lat={context.tooltip.data.latitude}
						long={context.tooltip.data.longitude}
						motion="spring"
					>
						{#snippet children({ x, y })}
							<Circle cx={x} cy={y} r={4} class="stroke-primary/50 fill-none" />
							<Text
								{x}
								y={y - 6}
								value={context.tooltip.data?.label}
								textAnchor="middle"
								class="text-[8px] stroke-surface-100 stroke-[2px]"
							/>
						{/snippet}
					</GeoPoint>
				{/if}
			{/if}
		</Layer>
	{/snippet}
</Chart>
