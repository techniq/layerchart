<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { scaleSqrt } from 'd3-scale';
	import { feature } from 'topojson-client';

	import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
	import { TimerState } from '@layerstack/svelte-state';

	import {
		Chart,
		GeoCircle,
		GeoPath,
		Graticule,
		Layer,
		Tooltip,
		type ChartContextValue
	} from 'layerchart';

	import { getTectonicPlates, getEarthquakes, getCountriesTopology } from '$lib/geo.remote.js';

	const topology = await getCountriesTopology();
	const tectonicPlates = await getTectonicPlates();
	const earthquakes = await getEarthquakes();

	const countries = feature(topology, topology.objects.countries);

	let context = $state<ChartContextValue<(typeof earthquakes)[number]>>();

	let velocity = $state(3);

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!context) return;
			const curr = context.transform.translate;

			context.transform.translate = {
				x: (curr.x += velocity),
				y: curr.y
			};
		},
		disabled: true
	});

	const data = { countries, tectonicPlates, earthquakes };

	export { data };
</script>

<div class="flex gap-2 items-end mb-4">
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

<Chart
	bind:context
	data={earthquakes}
	x="longitude"
	y="latitude"
	r="magnitude"
	rScale={scaleSqrt()}
	rDomain={[0, 100]}
	rRange={[0, 1]}
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries,
		applyTransform: ['rotate']
	}}
	ondragstart={timer.stop}
	height={600}
>
	{#snippet children({ context })}
		<Layer disableHitCanvas={timer.running}>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />

			<Graticule class="stroke-surface-content/20" />

			<GeoPath geojson={countries} class="stroke-surface-100/30 fill-surface-content" />
			<GeoPath geojson={tectonicPlates} class="stroke-danger-100/30" />

			{#each earthquakes as eq}
				<GeoCircle
					center={[eq.longitude, eq.latitude]}
					radius={context.rScale(Math.exp(eq.magnitude))}
					class="stroke-danger fill-danger/20"
					onpointermove={(e) => context.tooltip.show(e, eq)}
					onpointerleave={() => context.tooltip.hide()}
				/>
			{/each}
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.place}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
					<Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
					<Tooltip.Item label="Magnitude" value={data.magnitude} format="decimal" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
