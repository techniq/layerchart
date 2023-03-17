<script lang="ts">
	import { geoGraticule } from 'd3-geo';
	import type { ComponentProps } from 'svelte';

	import GeoPath from './GeoPath.svelte';

	// TODO: Support full api (stepMinor/Major, extent[Minor/Major], etc
	export let lines: Omit<ComponentProps<GeoPath>, 'geojson'> | boolean | undefined = undefined;
	export let outline: Omit<ComponentProps<GeoPath>, 'geojson'> | boolean | undefined = undefined;
	export let step: [number, number] = [10, 10];

	$: graticule = geoGraticule();

	$: graticule.step(step);
</script>

<g class="graticule">
	<!-- TODO: Any reason to still render the single `MultiLineString` path if using `lines` and/or `outline` -->
	{#if !lines && !outline}
		<GeoPath geojson={graticule()} {...$$restProps} />
	{/if}

	{#if lines}
		{#each graticule.lines() as line}
			<GeoPath geojson={line} {...lines} />
		{/each}
	{/if}

	{#if outline}
		<GeoPath geojson={graticule.outline()} {...outline} />
	{/if}
</g>
