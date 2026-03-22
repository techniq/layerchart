<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Graticule, Layer, Spline } from 'layerchart';
	import { getCountriesTopology, getBeagleVoyage } from '$lib/geo.remote';

	const [topology, voyageData] = $derived(
		await Promise.all([getCountriesTopology(), getBeagleVoyage()])
	);
	const countries = $derived(feature(topology, topology.objects.countries));

	const data = $derived({ topology, voyageData });

	export { data };
</script>

<Chart
	geo={{
		projection: geoNaturalEarth1,
		fitGeojson: countries
	}}
	padding={{ top: 16, bottom: 16, left: 16, right: 16 }}
	height={500}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} />
		<Graticule class="stroke-surface-content/10" />
		{#each countries.features as feature, i (feature.id ?? i)}
			<GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-content/20" />
		{/each}

		<Spline
			data={voyageData}
			x="longitude"
			y="latitude"
			class="fill-none stroke-primary"
			stroke-width={1.5}
			opacity={0.7}
		/>
	</Layer>
</Chart>
