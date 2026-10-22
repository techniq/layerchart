<script module lang="ts">
	import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
	const airports = await getWorldAirports();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, Layer, Tooltip } from 'layerchart';
	import { GeoBin, GeoPath } from 'layerchart/geo';

	const countries = feature(topology, topology.objects.countries);

	export { airports as data };
</script>

<!-- Airports binned into cells on the sphere, which stay put as the globe turns -->
<Chart
	data={airports}
	x="longitude"
	y="latitude"
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries
	}}
	transform={{ mode: 'projection' }}
	padding={8}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-200 stroke-surface-content/20" />
			<GeoPath geojson={countries} class="fill-surface-content/10 stroke-none" />
			<GeoBin
				size={16}
				grid
				class="hover:stroke-surface-content"
				onpointermove={(e, cell) => context.tooltip.show(e, cell)}
				onpointerleave={() => context.tooltip.hide()}
			/>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.data[0].name}{data.count > 1 ? ' and nearby' : ''}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Airports" value={data.count} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
