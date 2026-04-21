<script module lang="ts">
	import { getUsStatesTopology } from '$lib/geo.remote';
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { AnnotationPoint, Chart, GeoPath, Layer, type Placement } from 'layerchart';
	import type { ComponentProps } from 'svelte';

	const states = feature(topology, topology.objects.states);

	const annotations: Array<
		{
			lon: number;
			lat: number;
		} & ComponentProps<typeof AnnotationPoint>
	> = [
		{
			label: 'Seattle',
			lon: -122.3321,
			lat: 47.6062,
			labelPlacement: 'top-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Los Angeles',
			lon: -118.2437,
			lat: 34.0522,
			labelPlacement: 'bottom-left',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Houston',
			lon: -95.3698,
			lat: 29.7604,
			labelPlacement: 'bottom',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Chicago',
			lon: -87.6298,
			lat: 41.8781,
			labelPlacement: 'top',
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'New York',
			lon: -74.006,
			lat: 40.7128,
			labelPlacement: 'bottom-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		},
		{
			label: 'Miami',
			lon: -80.1918,
			lat: 25.7617,
			labelPlacement: 'top-right',
			labelXOffset: 10,
			labelYOffset: 10,
			props: {
				circle: { class: 'fill-secondary stroke-surface-100' },
				label: { class: 'fill-surface-content text-xs font-bold' }
			}
		}
	];

	const data = { topology, states };
	export { data };
</script>

<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }} height={500} padding={{ right: 40 }}>
	<Layer>
		<GeoPath geojson={states} class="fill-surface-content/10 stroke-surface-100" />

		{#each annotations as annotation (annotation.label)}
			<AnnotationPoint {...annotation} x={annotation.lon} y={annotation.lat} r={4} link />
		{/each}
	</Layer>
</Chart>
