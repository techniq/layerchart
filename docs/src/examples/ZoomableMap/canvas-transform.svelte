<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Layer, Tooltip, geoFitObjectTransform, getSettings } from 'layerchart';
	import TransformControls from '$lib/components/TransformControls.svelte';
	import { SelectField } from 'svelte-ux';

	import type { GeometryObjectA } from 'topojson-specification';
	import { getUsCountiesTopology } from '$lib/data.remote.js';

	const geojson = await getUsCountiesTopology();
	let settings = getSettings();

	let projection = $state(geoAlbersUsa);
	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Mercator', value: geoMercator }
	];

	const counties = feature(geojson, geojson.objects.counties);
	const states = feature(geojson, geojson.objects.states);

	const contiguousStates = $derived({
		...states,
		features: states.features.filter((d) => {
			// Contiguous states
			return Number(d.id) < 60 && d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii';
		})
	});

	let selectedStateId: GeometryObjectA['id'] | null = $state(null);
	const selectedCountiesFeatures = $derived(
		selectedStateId
			? counties.features.filter((f) => (f.id as string).slice(0, 2) === selectedStateId)
			: []
	);

	const data = { geojson, counties, states, contiguousStates };

	export { data };
</script>

<div class="grid grid-cols-[1fr_2fr] gap-2 my-2">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<div class="h-[600px] relative overflow-hidden">
	<Chart
		geo={{
			projection,
			fitGeojson: projection === geoMercator ? contiguousStates : states
		}}
		transform={{
			mode: 'canvas',
			initialScrollMode: 'none',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}}
		height={600}
	>
		{#snippet children({ context })}
			<TransformControls />

			<Layer>
				{#each states.features as feature}
					<GeoPath
						geojson={feature}
						class="stroke-surface-content fill-surface-100 hover:fill-surface-content/10"
						strokeWidth={1 / context.transform.scale}
						tooltipContext={context.tooltip}
						onclick={(e, geoPath) => {
							context.tooltip.hide();
							if (selectedStateId === feature.id) {
								selectedStateId = null;
								context.transform.reset();
							} else {
								selectedStateId = feature.id;
								if (!geoPath) return;
								const [[left, top], [right, bottom]] = geoPath.bounds(feature);
								const width = right - left;
								const height = bottom - top;
								const x = (left + right) / 2;
								const y = (top + bottom) / 2;
								const padding = 20;
								context.transform.zoomTo(
									{ x, y },
									{ width: width + padding, height: height + padding }
								);
							}
						}}
					/>
				{/each}

				{#each selectedCountiesFeatures as feature (feature.id)}
					<g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
						<GeoPath
							geojson={feature}
							tooltipContext={context.tooltip}
							strokeWidth={1 / context.transform.scale}
							class="stroke-surface-content/10 hover:stroke-surface-content/50 hover:fill-surface-content/10"
							onclick={() => {
								selectedStateId = null;
								context.transform.reset();
							}}
						/>
					</g>
				{/each}
			</Layer>

			<!-- Provides better performance by rendering tooltip path on separate <Canvas> -->
			<Layer pointerEvents={false}>
				{#if context.tooltip.data && settings.layer === 'canvas'}
					<GeoPath
						geojson={context.tooltip.data}
						strokeWidth={1 / context.transform.scale}
						class="stroke-surface-content/50 fill-surface-content/20"
					/>
				{/if}
			</Layer>

			<Tooltip.Root>
				{#snippet children({ data })}
					{data.properties.name}
					<!-- TODO: How to handle scale (when using canvas and not projection transforms) -->
					<!-- {@const [longitude, latitude] = projection.invert?.([tooltip.x, tooltip.y]) ?? []}
        <Tooltip.Header>{data.properties.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="longitude" value={longitude} format="decimal" />
          <Tooltip.Item label="latitude" value={latitude} format="decimal" />
        </Tooltip.List> -->
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</Chart>
</div>
