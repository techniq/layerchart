<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { ClipPath, Chart, GeoPath, GeoTile, Layer, Tooltip } from 'layerchart';
	import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';
	import { getUsStatesTopology } from '$lib/geo.remote';

	const topology = await getUsStatesTopology();
	const states = feature(topology, topology.objects.states);

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
</script>

<GeoTileControls bind:serviceUrl bind:doubleScale={zoomDelta} />

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
					onclick={() => (selectedFeature = selectedFeature === feature ? filteredStates : feature)}
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
