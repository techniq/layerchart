
<!--
	@component
	## GeoTile

	## Description

	Geographic component which renders map tiles in a grid supporting efficient zooming and panning for larger scale maps.

	## Category

	[[Geo](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Geo.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [GeoTile](/docs/components/GeoTile)

	## API Properties

	* url:<(x: number, y: number, z: number) => string> - undefined  (REQUIRED)
	* zoomDelta:<number>=0 - The zoom delta for the tile. 
	* tileSize:<number>=256 - The tile size for the tile. 
	* disableCache:<boolean>=false - Whether to disable the cache for the tile. 
	* group:<Partial<ComponentProps<typeof Group>>> - Additional props to apply to the `Group` component. 
	* debug:<boolean>=false - Whether to enable debug mode for the tile. 
	* children:<Snippet<[ { tiles: any[]; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import type { ComponentProps } from 'svelte';
		import { geoMercator } from 'd3-geo';
		import { feature } from 'topojson-client';

		import { Chart, GeoPath, GeoTile, Layer, Tooltip, getSettings } from 'layerchart';
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
		let settings = getSettings();
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
				<GeoTile url={serviceUrl} {zoomDelta} debug={settings.debug} />
				{#each filteredStates.features as feature}
					<!-- TODO: Renders on canvas if put on separate Layer  -->
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
	```
-->
