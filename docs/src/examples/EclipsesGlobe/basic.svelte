<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { extent } from 'd3-array';
	import { scaleDiverging } from 'd3-scale';
	import { interpolateGreens, interpolatePurples } from 'd3-scale-chromatic';
	import { feature } from 'topojson-client';

	import {
		Chart,
		GeoPath,
		Graticule,
		Legend,
		Layer,
		Tooltip,
		type ChartContextValue
	} from 'layerchart';

	import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';
	import { TimerState } from '@layerstack/svelte-state';

	import { getCountriesTopology, getEclipses } from '$lib/geo.remote.js';

	const topology = await getCountriesTopology();
	const eclipsesData = await getEclipses();

	const countries = feature(topology, topology.objects.countries);
	const eclipses = feature(eclipsesData, eclipsesData.objects.eclipses);

	let context = $state<ChartContextValue>(null!);

	let velocity = $state(3);
	const timer = new TimerState({
		delay: 1,
		tick: () => {
			const value = context.transform.translate;

			context.transform.translate = {
				x: (value.x += velocity),
				y: value.y
			};
		},
		disabled: true
	});

	const dateExtents = $derived(extent(eclipses.features.map((f) => f.properties.Date)));
	const colorScale = $derived(
		scaleDiverging<string>([dateExtents[0] ?? 0, new Date(), dateExtents[1] ?? 0], (t) =>
			t < 0.5 ? interpolatePurples(1 - t) : interpolateGreens(t)
		)
	);

	const data = { countries, eclipses };

	export { data };
</script>

<div class="flex gap-2 items-end mb-4">
	<div class="mb-2 flex gap-6">
		<Field label="Spin:" dense labelPlacement="left" let:id>
			<ButtonGroup size="sm" variant="fill-light">
				<Button on:click={timer.start} disabled={timer.running}>Start</Button>
				<Button on:click={timer.stop} disabled={!timer.running}>Stop</Button>
			</ButtonGroup>
		</Field>

		<RangeField
			label="Velocity:"
			bind:value={velocity}
			min={-10}
			max={10}
			disabled={!timer.running}
			labelPlacement="left"
		/>
	</div>
</div>

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries,
		applyTransform: ['rotate']
	}}
	ondragstart={timer.stop}
	bind:context
	padding={{ top: 60 }}
	height={600}
>
	{#snippet children({ context })}
		<Legend scale={colorScale} title="Eclipse date" tickFormat="year" />

		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-200 stroke-surface-content/20" />
			<Graticule class="stroke-surface-content/20" />
			<GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />

			{#each eclipses.features as feature}
				{@const hasColor =
					context.tooltip.data == null || context.tooltip.data.ID === feature.properties.ID}

				<GeoPath
					geojson={feature}
					fill={hasColor ? colorScale(feature.properties.Date) : undefined}
					class={cls('transition-colors', !hasColor && 'fill-surface-content/10')}
					onpointermove={(e) => context.tooltip.show(e, feature.properties)}
					onpointerleave={(e) => context.tooltip.hide()}
				/>
			{/each}
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				{format(data.Date, 'day', { variant: 'long' })}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
