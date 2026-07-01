<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import {
		geoCentroid,
		geoMercator,
		geoNaturalEarth1,
		geoEqualEarth,
		geoEquirectangular
	} from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, Layer, Tooltip, geoFitObjectTransform, getSettings } from 'layerchart';
	import { GeoPath, Graticule } from 'layerchart/geo';
	import { cls } from '@layerstack/tailwind';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import GeoPathProjectionControls from '$lib/components/controls/GeoPathProjectionControls.svelte';

	import { getCountriesTopology, getCountriesDetailTopology } from '$lib/geo.remote.js';

	const [simpleTopology, detailTopology] = await Promise.all([
		getCountriesTopology(),
		getCountriesDetailTopology()
	]);
	let settings = getSettings();

	let projection = $state(geoNaturalEarth1);
	const projections = [
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular }
	];

	let resolution = $state<'simple' | 'detail'>('simple');
	const simpleCountries = feature(simpleTopology, simpleTopology.objects.countries);
	const detailCountries = feature(detailTopology, detailTopology.objects.countries);
	const countries = $derived(resolution === 'detail' ? detailCountries : simpleCountries);

	let selectedCountryId: string | null = $state(null);

	const data = { simpleTopology, detailTopology, simpleCountries, detailCountries };
	export { data };
</script>

<div class="grid grid-cols-2 gap-2 mb-4">
	<GeoPathProjectionControls {projections} bind:projection />
	<Field label="Resolution">
		<ToggleGroup bind:value={resolution} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="simple">Simple (110m)</ToggleOption>
			<ToggleOption value="detail">Detail (50m)</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	geo={{
		projection,
		fitGeojson: countries
	}}
	transform={{
		mode: 'projection',
		scrollMode: 'scale',
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
	clip
	height={600}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
>
	{#snippet children({ context })}
		<TransformContextControls />

		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
			<Graticule class="stroke-surface-content/20" />

			{#each countries.features as feature}
				<GeoPath
					geojson={feature}
					class={cls(
						'stroke-surface-content/50 fill-white cursor-pointer',
						selectedCountryId === feature.id
							? 'stroke-primary-900 fill-primary'
							: 'hover:fill-gray-200'
					)}
					tooltip
					onclick={() => {
						context.tooltip.hide();
						if (selectedCountryId === feature.id) {
							selectedCountryId = null;
							context.transform.reset();
						} else {
							selectedCountryId = feature.id as string;
							if (context.geo.projection) {
								const featureTransform = geoFitObjectTransform(
									context.geo.projection,
									[context.width, context.height],
									feature
								);
								// Adjust translate to center on geographic centroid
								// instead of bounds center (handles distant territories)
								const centroid = geoCentroid(feature);
								const [px, py] = context.geo.projection(centroid)!;
								const dx = context.width / 2 - px;
								const dy = context.height / 2 - py;
								context.transform.setTranslate({
									x: featureTransform.translate.x + dx,
									y: featureTransform.translate.y + dy
								});
								context.transform.setScale(featureTransform.scale);
							}
						}
					}}
				/>
			{/each}
		</Layer>

		<Layer pointerEvents={false}>
			{#if context.tooltip.data && settings.layer === 'canvas'}
				<GeoPath
					geojson={context.tooltip.data}
					class="stroke-surface-content/50 fill-surface-content/20"
				/>
			{/if}
		</Layer>

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
