<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, Layer } from 'layerchart';
	import { GeoPath, Graticule } from 'layerchart/geo';
	import { RangeField, Switch, Field } from 'svelte-ux';
	const countries = feature(topology, topology.objects.countries);

	let decay = $state(0.99);
	let minVelocity = $state(0.1);
	let enabled = $state(true);

	const data = { topology, countries };
	export { data };
</script>

<div class="flex gap-3 items-end mb-2 screenshot-hidden">
	<Field label="Enabled" let:id>
		<Switch bind:checked={enabled} {id} size="md" />
	</Field>
	<RangeField label="Decay" bind:value={decay} min={0.9} max={0.999} step={0.001} />
	<RangeField label="Min velocity" bind:value={minVelocity} min={0.01} max={0.5} step={0.01} />
</div>

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries
	}}
	transform={{
		mode: 'projection',
		motion: 'spring',
		inertia: enabled ? { decay, minVelocity } : false,
		constrain: ({ scale, translate }) => ({
			scale,
			translate: {
				x: translate.x,
				y: Math.max(-90, Math.min(90, translate.y))
			}
		})
	}}
	padding={{ top: 5, bottom: 5, left: 5, right: 5 }}
	height={400}
>
	{#snippet children()}
		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/20" />
			<Graticule class="stroke-surface-content/20" />
			{#each countries.features as feature}
				<GeoPath geojson={feature} class="stroke-surface-100/30 fill-surface-content/70" />
			{/each}
		</Layer>
	{/snippet}
</Chart>
