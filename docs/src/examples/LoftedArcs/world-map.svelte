<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { flatRollup } from 'd3-array';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, GeoPoint, GeoSpline, Graticule, Layer } from 'layerchart';

	import { getWorldLinks, getWorldGeojson } from '$lib/data.remote.js';

	const geojson = await getWorldGeojson();
	const worldLinks = await getWorldLinks();

	const countries = feature(geojson, geojson.objects.countries);

	// Use a single link per source
	const singleLinks = flatRollup(
		worldLinks,
		(values) => {
			return values[1];
		},
		(d) => d.sourceId
	).map((d) => d[1]);

	const data = { countries, singleLinks };

	export { data };
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
