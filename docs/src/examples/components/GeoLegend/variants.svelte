<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, GeoLegend, GeoPath, Layer } from 'layerchart';
	import { getUsCountiesTopology } from '$lib/geo.remote';

	const topology = await getUsCountiesTopology();
	const states = feature(topology, topology.objects.states);
</script>

<div class="grid gap-6">
	{#each ['bracket', 'alternating'] as const as variant}
		<div>
			<div class="text-sm font-semibold mb-1">{variant}</div>
			<Chart
				geo={{
					projection: geoAlbersUsa,
					fitGeojson: states
				}}
				height={300}
				padding={{ bottom: 60 }}
			>
				<Layer>
					<GeoPath geojson={states} class="fill-surface-100 stroke-surface-content" />
				</Layer>

				<GeoLegend {variant} units="mi" placement="bottom-left" class="m-2" />
			</Chart>
		</div>
	{/each}
</div>
