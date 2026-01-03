
<!--
	@component
	## GeoPath

	## Description

	Geographic component which renders shapes such as countries, states, or regions by drawing their boundaries based on coordinate data.

	## Category

	[[Geo](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Geo.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [GeoPath](/docs/components/GeoPath)

	## API Properties

	* geojson:<GeoPermissibleObjects | null> - GeoJSON data to render 
	* tooltipContext:<TooltipContextValue | undefined> - Tooltip context to setup pointer events to show tooltip for related data 
	* onclick:<((e: MouseEvent, geoPath: ReturnType<typeof geoCurvePath> | undefined) => void) | undefined> - Click event handler 
	* curve:<CurveFactory | CurveFactoryLineOnly>=curveLinearClosed - Curve of path drawn. Imported via d3-shape. 
	* geoTransform:<(projection: GeoProjection | GeoIdentityTransform) => GeoTransformPrototype> - Apply geo transform to projection.
Useful to draw straight lines with `geoMercator` projection. 
	* ref:<SVGPathElement> - A reference to the underlying `<path>` element 
	* children:<Snippet<[ { geoPath: ReturnType<typeof geoCurvePath> | undefined; } ]>> - undefined 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[Graticule](/docs/components/Graticule)

	@example
	```svelte
	<script lang="ts">
		import { geoAlbersUsa } from 'd3-geo';
		import { Chart, GeoPath, getSettings, Layer, Tooltip } from 'layerchart';
		import { getUsCountiesTopology } from '$lib/geo.remote';
		import { feature } from 'topojson-client';

		const settings = getSettings();

		let topology = $state(await getUsCountiesTopology());
		const states = feature(topology, topology.objects.states);
		const counties = feature(topology, topology.objects.counties);
	</script>

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
						class="stroke-surface-content fill-surface-100 hover:fill-surface-content/20"
						tooltipContext={context.tooltip}
					/>
				{/each}

				<GeoPath geojson={counties} class="fill-none stroke-surface-content/10 pointer-events-none" />
			</Layer>

			<!-- Draw tooltip path for canvas since hover: not supported -->
			<!-- Provides better performance by rendering tooltip path on separate <Canvas> layer -->
			{#if settings.layer === 'canvas'}
				<Layer pointerEvents={false}>
					{#if context.tooltip.data}
						<GeoPath
							geojson={context.tooltip.data}
							class="stroke-surface-content fill-surface-content/20"
						/>
					{/if}
				</Layer>
			{/if}

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
