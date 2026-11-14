<script module lang="ts">
	import { getUsStatesTopology } from '$lib/geo.remote.js';
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, GeoPath, GeoTile, WebGL } from '@layerchart/webgl';
	import { getSettings } from 'layerchart';
	import TransformControls from '$lib/components/controls/TransformContextControls.svelte';
	import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';

	const settings = getSettings();
	const states = feature(topology, topology.objects.states);
	const contiguous = {
		...states,
		features: states.features.filter(
			(d) => Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii'
		)
	};

	let serviceUrl = $state<ComponentProps<typeof GeoTile>['url']>(null!);
	let zoomDelta = $state(0);

	const data = { topology };
	export { data };
</script>

<GeoTileControls bind:serviceUrl bind:doubleScale={zoomDelta} class="mb-4" />

<!-- LayerChart's zoomable tiles, drawn by WebGL: zooming the projection loads sharper tiles -->
{#if serviceUrl}
	<Chart
		geo={{ projection: geoMercator, fitGeojson: contiguous }}
		transform={{ mode: 'projection', scrollMode: 'scale' }}
		height={600}
	>
		<TransformControls />
		<WebGL>
			<GeoTile url={serviceUrl} {zoomDelta} debug={settings.debug} />
			<GeoPath
				geojson={contiguous}
				fill={null}
				stroke="color-mix(in oklab, black 30%, transparent)"
			/>
		</WebGL>
	</Chart>
{/if}
