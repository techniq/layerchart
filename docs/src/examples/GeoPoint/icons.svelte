<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Circle, GeoPath, GeoPoint, Layer, Text, Tooltip } from 'layerchart';
	import { getUsStatesTopology, getUsCapitals } from '$lib/data.remote';

	import LucideStar from '~icons/lucide/star';

	const [usData, capitalsData] = $derived(
		await Promise.all([getUsStatesTopology(), getUsCapitals()])
	);
	const data = $state({ us: { geojson: usData, capitals: capitalsData } });

	const states = feature(data.us.geojson, data.us.geojson.objects.states);

	let tooltipMode = $state<'quadtree' | 'voronoi'>('quadtree');
	let tooltipRadius = $state(30);

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
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
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

			{#each data.us.capitals as capital}
				<GeoPoint lat={capital.latitude} long={capital.longitude}>
					<!-- TODO: How best to support canvas? -->
					<LucideStar class="text-danger text-[8px]" x={-5} y={-5} />
					<Text
						y="-6"
						value={capital.description}
						textAnchor="middle"
						class="text-[8px] stroke-surface-100 stroke-[2px]"
					/>
					<Circle
						r={10}
						class="fill-transparent"
						onpointerenter={(e) => context.tooltip.show(e, capital)}
						onpointermove={(e) => context.tooltip.show(e, capital)}
						onpointerleave={(e) => context.tooltip.hide(e)}
					/>
				</GeoPoint>
			{/each}
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				{data.description}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
