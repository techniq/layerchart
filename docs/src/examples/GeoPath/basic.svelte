<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { Chart, GeoPath, getSettings, Layer, Tooltip } from 'layerchart';
	import { getUsCountiesTopology } from '$lib/data.remote';
	import { feature } from 'topojson-client';

	const settings = getSettings();

	let topology = $state(await getUsCountiesTopology());
	const states = feature(topology, topology.objects.states);
	const counties = feature(topology, topology.objects.counties);
</script>

<Chart
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			{#each states.features as feature}
				<GeoPath
					geojson={feature}
					class="stroke-surface-content fill-surface-100 hover:fill-surface-content/20"
					tooltipContext={context.tooltip}
				/>
			{/each}

			<GeoPath geojson={counties} class="fill-none stroke-surface-content/10 pointer-events-none" />
		</Layer>

		<!-- Draw tooltip path for canvas since hover: not supported -->
		<!-- Provides better performance by rendering tooltip path on separate <canvas> layer -->
		{#if settings.layer === 'canvas'}
			<Layer pointerEvents={false}>
				{#if context.tooltip.data}
					<GeoPath
						geojson={context.tooltip.data}
						class="stroke-surface-content fill-surface-content/20"
					/>
				{/if}
			</Layer>
		{/if}

		<Tooltip.Root>
			{#snippet children({ data })}
				{@const [longitude, latitude] =
					context.geo.projection?.invert?.([context.tooltip.x, context.tooltip.y]) ?? []}
				<Tooltip.Header>{data.properties.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="longitude" value={longitude} format="decimal" />
					<Tooltip.Item label="latitude" value={latitude} format="decimal" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
