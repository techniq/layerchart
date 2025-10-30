<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import { TimerState } from '@layerstack/svelte-state';

	import {
		Chart,
		GeoPath,
		GeoPoint,
		GeoVisible,
		Graticule,
		Layer,
		Tooltip,
		type ChartContextValue
	} from 'layerchart';

	import {
		getCountriesTopology,
		getSubmarineCables,
		getSubmarineCablesLandingPoints
	} from '$lib/geo.remote.js';

	const topology = await getCountriesTopology();
	const cables = await getSubmarineCables();
	const landingPoints = await getSubmarineCablesLandingPoints();

	const countries = feature(topology, topology.objects.countries);

	let context = $state<ChartContextValue>();

	let velocity = $state(3);
	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!context) return;
			const value = context.transform.translate;

			context.transform.translate = {
				x: (value.x += velocity),
				y: value.y
			};
		},
		disabled: true
	});

	const data = { countries, cables, landingPoints };

	export { data };
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end mb-4">
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
	height={600}
>
	{#snippet children({ context })}
		<Layer disableHitCanvas={timer.running}>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-200 stroke-surface-content/20" />
			<Graticule class="stroke-surface-content/20" />
			<GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />

			{#each cables.features as feature}
				{@const hasColor =
					context.tooltip.data == null || context.tooltip.data.id === feature.properties.id}
				<GeoPath
					geojson={feature}
					stroke={hasColor ? feature.properties.color : undefined}
					class={cls(
						'stroke-2 fill-none transition-colors',
						!hasColor && 'stroke-surface-content/10'
					)}
					onpointermove={(e) => context.tooltip.show(e, feature.properties)}
					onpointerleave={(e) => context.tooltip.hide()}
				/>
			{/each}

			{#each landingPoints.features as feature}
				{@const [long, lat] = feature.geometry.coordinates}
				<GeoVisible {lat} {long}>
					<GeoPoint
						{lat}
						{long}
						r={2}
						class="fill-surface-content stroke-surface-100 stroke"
						onpointermove={(e) => context.tooltip.show(e, feature.properties)}
						onpointerleave={(e) => context.tooltip.hide()}
					/>
				</GeoVisible>
			{/each}
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				{data.name}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
