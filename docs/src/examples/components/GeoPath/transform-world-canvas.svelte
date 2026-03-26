<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { geoMercator, geoNaturalEarth1, geoEqualEarth, geoEquirectangular } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Graticule, Layer, Tooltip, getSettings } from 'layerchart';
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
		mode: 'canvas',
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
			<Graticule class="stroke-surface-content/20" strokeWidth={1 / context.transform.scale} />

			{#each countries.features as feature}
				<GeoPath
					geojson={feature}
					class={cls(
						'stroke-surface-content/50 fill-white cursor-pointer',
						selectedCountryId === feature.id
							? 'stroke-primary-900 fill-primary'
							: 'hover:fill-gray-200'
					)}
					strokeWidth={1 / context.transform.scale}
					tooltip
					onclick={(e, geoPath) => {
						context.tooltip.hide();
						if (selectedCountryId === feature.id) {
							selectedCountryId = null;
							context.transform.reset();
						} else {
							selectedCountryId = feature.id as string;
							if (!geoPath) return;
							// Use centroid (area-weighted) instead of bounds center
							// so countries with distant territories (e.g. US, France)
							// center on the main landmass
							const [cx, cy] = geoPath.centroid(feature);
							const [[left, top], [right, bottom]] = geoPath.bounds(feature);
							const width = right - left;
							const height = bottom - top;
							const padding = 20;
							context.transform.zoomTo(
								{ x: cx, y: cy },
								{ width: width + padding, height: height + padding }
							);
						}
					}}
				/>
			{/each}
		</Layer>

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
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
