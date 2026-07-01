<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { geoNaturalEarth1 } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { AnnotationPoint, Chart, Layer } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';
	import type { ComponentProps } from 'svelte';

	const countries = feature(topology, topology.objects.countries);

	const annotations: Array<
		{
			lon: number;
			lat: number;
		} & ComponentProps<typeof AnnotationPoint>
	> = [
		{
			label: 'Statue of Liberty',
			lon: -74.0445,
			lat: 40.6892,
			labelPlacement: 'left',
			labelXOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Machu Picchu',
			lon: -72.545,
			lat: -13.1631,
			labelPlacement: 'bottom-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Eiffel Tower',
			lon: 2.2945,
			lat: 48.8584,
			labelPlacement: 'top-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Pyramids of Giza',
			lon: 31.1342,
			lat: 29.9792,
			labelPlacement: 'bottom-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Mt. Everest',
			lon: 86.925,
			lat: 27.9881,
			labelPlacement: 'top',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Great Wall',
			lon: 117.2381,
			lat: 40.3587,
			labelPlacement: 'top-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Sydney Opera House',
			lon: 151.2153,
			lat: -33.8568,
			labelPlacement: 'bottom',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		}
	];

	const data = { topology, countries };
	export { data };
</script>

<Chart geo={{ projection: geoNaturalEarth1, fitGeojson: countries }} height={500}>
	<Layer>
		{#each countries.features as f, i (i)}
			<GeoPath geojson={f} class="fill-surface-content/10 stroke-surface-100" />
		{/each}

		{#each annotations as annotation (annotation.label)}
			<AnnotationPoint {...annotation} x={annotation.lon} y={annotation.lat} r={4} link />
		{/each}
	</Layer>
</Chart>
