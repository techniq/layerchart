
<!--
	@component
	## GeoSpline

	## Description

	Geographic component which renders smooth, curved lines connecting geographic points to represent paths or flows on a map.

	## Category

	[[Geo](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Geo.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [GeoSpline](/docs/components/GeoSpline)

	## API Properties

	* link:<{ source: [ number, number ]; target: [ number, number ]; }> - Link between two points on the globe.  (REQUIRED)
	* loft:<number>=1.0 - The amount of loft to apply to the middle of the curve. 
	* curve:<CurveFactory | CurveFactoryLineOnly>=curveNatural - Curve of spline drawn. Imported via d3-shape. 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { geoNaturalEarth1 } from 'd3-geo';
		import { flatRollup } from 'd3-array';
		import { feature } from 'topojson-client';

		import { Chart, GeoPath, GeoPoint, GeoSpline, Graticule, Layer } from 'layerchart';

		import { getWorldLinks, getCountriesTopology } from '$lib/geo.remote.js';

		const topology = await getCountriesTopology();
		const worldLinks = await getWorldLinks();

		const countries = feature(topology, topology.objects.countries);

		// Use a single link per source
		const singleLinks = flatRollup(
			worldLinks,
			(values) => {
				return values[1];
			},
			(d) => d.sourceId
		).map((d) => d[1]);

		const data = { countries, singleLinks };
	</script>

	<Chart
		geo={{
			projection: geoNaturalEarth1,
			fitGeojson: countries
		}}
		padding={{ top: 16, bottom: 16, left: 16, right: 16 }}
		height={600}
	>
		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
			<Graticule class="stroke-surface-content/20" />
			{#each countries.features as country}
				<GeoPath geojson={country} class="stroke-surface-content/50 fill-white" />
			{/each}
			{#each singleLinks as link}
				<GeoSpline {link} class="stroke-gray-500/30 stroke-2" />
				<GeoSpline {link} class="stroke-danger stroke-2" loft={1.3} />
				<GeoPoint lat={link.source[1]} long={link.source[0]} r={2} class="fill-black" />
				<GeoPoint lat={link.target[1]} long={link.target[0]} r={2} class="fill-black" />
			{/each}
		</Layer>
	</Chart>
	```
-->
