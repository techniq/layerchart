<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, Layer } from 'layerchart';
	import { GeoPath, Graticule } from 'layerchart/geo';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	const countries = feature(topology, topology.objects.countries);

	const data = { topology, countries };
	export { data };
</script>

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries
	}}
	transform={{
		mode: 'projection',
		constrain: ({ scale, translate }) => ({
			scale,
			translate: {
				x: translate.x,
				y: Math.max(-90, Math.min(90, translate.y))
			}
		})
	}}
	padding={{ top: 5, bottom: 5, left: 5, right: 5 }}
	height={400}
>
	{#snippet children()}
		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/20" />
			<Graticule class="stroke-surface-content/20" />
			{#each countries.features as feature}
				<GeoPath geojson={feature} class="stroke-surface-100/30 fill-surface-content/70" />
			{/each}
		</Layer>
	{/snippet}
</Chart>
