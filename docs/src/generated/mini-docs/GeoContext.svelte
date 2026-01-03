
<!--
	@component
	## GeoContext

	## Description

	Geographic component which provides geographic projection and scaling context to children for accurate rendering of geographic data.

	## Category

	[[Geo](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Geo.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [GeoContext](/docs/components/GeoContext)

	## API Properties

	* projection:<() => GeoProjection> - A d3 projection function. Pass this in as an uncalled function, e.g.
`projection={geoAlbersUsa}`. 
	* fitGeojson:<GeoPermissibleObjects> - undefined 
	* fixedAspectRatio:<number> - By default, the map fills to fit the $width and $height. If instead you want a
fixed-aspect ratio, like for a server-side rendered map, set that here. 
	* clipAngle:<number> - undefined 
	* clipExtent:<[ [ number, number ], [ number, number ] ]> - undefined 
	* rotate:<{ yaw: number; pitch: number; roll: number; }> - undefined 
	* scale:<number> - undefined 
	* translate:<[ number, number ]> - undefined 
	* center:<[ number, number ]> - undefined 
	* applyTransform:<('scale' | 'translate' | 'rotate')[]> - Apply TransformContext to the selected properties.  Typically `translate` or `rotate` are
mutually selected 
	* reflectX:<boolean> - undefined 
	* reflectY:<boolean> - undefined 
	* geoContext:<GeoContextValue> - Exposed to allow binding in Chart 
	* children:<Snippet<[ { geoContext: GeoContextValue; } ]>> - undefined  (REQUIRED)

	## Related

	[Chart](/docs/components/Chart)

	@example
	```svelte
	<script lang="ts">
		import {
			geoAlbersUsa,
			geoAlbers,
			geoEqualEarth,
			geoEquirectangular,
			geoMercator,
			geoNaturalEarth1,
			geoOrthographic,
			geoStereographic,
			geoGnomonic
		} from 'd3-geo';
		import { feature } from 'topojson-client';

		import { Chart, GeoPath, Graticule, Layer, Tooltip } from 'layerchart';
		import { getCountriesTopology, getCountriesDetailTopology } from '$lib/geo.remote';
		import GeoContextPlaygroundControls from '$lib/components/controls/GeoContextPlaygroundControls.svelte';

		let config = $state({
			projection: geoOrthographic,
			detailed: false,
			rotate: {
				yaw: 0,
				pitch: 0,
				roll: 0
			},
			scale: 0
		});

		const projections = [
			{ label: 'Albers', value: geoAlbers },
			{ label: 'Albers USA', value: geoAlbersUsa },
			{ label: 'Equal Earth', value: geoEqualEarth },
			{ label: 'Equirectangular', value: geoEquirectangular },
			{ label: 'Mercator', value: geoMercator },
			{ label: 'Natural Earth', value: geoNaturalEarth1 },
			{ label: 'Orthographic', value: geoOrthographic },
			{ label: 'Stereographic', value: geoStereographic },
			{ label: 'Gnomonic', value: geoGnomonic }
		];

		const topology = $derived(
			await (config.detailed ? getCountriesDetailTopology() : getCountriesTopology())
		);
		const geojson = $derived(feature(topology, topology.objects.countries));
		const features = $derived(
			config.projection === geoAlbersUsa
				? geojson.features.filter((f) => f.properties.name === 'United States of America')
				: geojson.features
		);
	</script>

	<GeoContextPlaygroundControls
		{projections}
		bind:projection={config.projection}
		bind:scale={config.scale}
		bind:detailed={config.detailed}
		bind:rotate={config.rotate}
	/>

	<Chart
		geo={{
			projection: config.projection,
			fitGeojson: geojson,
			rotate: config.rotate,
			scale: config.scale
			// applyTransform: ['rotate'],
		}}
		padding={{ left: 100, right: 100 }}
		height={600}
	>
		{#snippet children({ context })}
			<Layer>
				<GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content fill-blue-400/50" />
				<Graticule class="stroke-surface-content/20 pointer-events-none" />
				{#each features as feature}
					<GeoPath
						geojson={feature}
						tooltipContext={context.tooltip}
						class="stroke-surface-content/50 fill-white hover:fill-gray-300"
					/>
				{/each}
			</Layer>

			<Tooltip.Root>
				{context.tooltip.data?.properties.name}
			</Tooltip.Root>
		{/snippet}
	</Chart>
	```
-->
