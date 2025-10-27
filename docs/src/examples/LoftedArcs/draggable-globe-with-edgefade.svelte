<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import {
		Chart,
		GeoEdgeFade,
		GeoPath,
		GeoPoint,
		GeoSpline,
		getSettings,
		Graticule,
		Layer
	} from 'layerchart';

	import { getWorldLinks, getWorldGeojson } from '$lib/data.remote.js';

	const geojson = await getWorldGeojson();
	const worldLinks = await getWorldLinks();

	const countries = feature(geojson, geojson.objects.countries);

	let settings = getSettings();

	const data = { countries, worldLinks };

	export { data };
</script>

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries,
		applyTransform: ['rotate']
	}}
	padding={{ top: 80, bottom: 80 }}
	height={600}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
		<Graticule class="stroke-surface-content/20 pointer-events-none" />
		{#each countries.features as country}
			<GeoPath geojson={country} class="stroke-surface-content/50 fill-white pointer-events-none" />
		{/each}
		{#each worldLinks as link}
			<GeoEdgeFade {link}>
				<GeoPoint lat={link.source[1]} long={link.source[0]} r={2} class="fill-black" />
				<GeoPoint lat={link.target[1]} long={link.target[0]} r={2} class="fill-black" />
				<GeoSpline {link} class="stroke-gray-500/30 stroke-2" />
				<GeoSpline {link} class="stroke-danger stroke-2" loft={1.3} />
			</GeoEdgeFade>
		{/each}
	</Layer>
</Chart>
