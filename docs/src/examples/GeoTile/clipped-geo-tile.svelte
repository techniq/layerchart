<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { ClipPath, Chart, GeoPath, GeoTile, Layer, Tooltip } from 'layerchart';
	import { RangeField, SelectField } from 'svelte-ux';
	import TilesetField from '$lib/components/TilesetField.svelte';
	import { getUsStatesTopology } from '$lib/data.remote';

	const data = $derived(await getUsStatesTopology());

	const states = feature(data, data.objects.states);

	const filteredStates = {
		...states,
		features: states.features.filter(
			(d) => Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii'
		)
	};

	let selectedFeature: typeof filteredStates | (typeof filteredStates.features)[0] =
		$state(filteredStates);

	// Simple tile service URL function for OpenStreetMap
	let serviceUrl = $state<ComponentProps<typeof GeoTile>['url']>(
		(x: number, y: number, z: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
	);

	let zoomDelta = $state(0);

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 my-2">
	<TilesetField bind:serviceUrl />
	<RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
</div>

<div class="h-[600px] overflow-hidden">
	<Chart
		geo={{
			projection: geoMercator,
			fitGeojson: selectedFeature
		}}
		height={600}
	>
		{#snippet children({ context })}
			<Layer>
				<ClipPath useId="clip">
					<GeoTile url={serviceUrl} {zoomDelta} />
				</ClipPath>
				<GeoPath geojson={selectedFeature} id="clip" class="stroke-none" />
				{#each filteredStates.features as feature}
					<GeoPath
						geojson={feature}
						tooltipContext={context.tooltip}
						class="stroke-black/20 hover:fill-white/30"
						onclick={() =>
							(selectedFeature = selectedFeature === feature ? filteredStates : feature)}
					/>
				{/each}
			</Layer>

			<Tooltip.Root>
				{#snippet children({ data })}
					{@const [longitude, latitude] =
						context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? []}
					<Tooltip.Header>{data.properties.name}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="longitude" value={longitude} format="decimal" />
						<Tooltip.Item label="latitude" value={latitude} format="decimal" />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</Chart>
</div>
