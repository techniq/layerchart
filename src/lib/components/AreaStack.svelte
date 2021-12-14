<script lang="ts">
	import { getContext } from 'svelte';
	import type { CurveFactory } from 'd3-shape';

	import Area from './Area.svelte';
	import Path from './Path.svelte';

	const { data, yScale, zGet } = getContext('LayerCake');

	// TODO: Add as generic
	type Datum = any;

	export let curve: CurveFactory = undefined;
	export let defined: (d: Datum, index: number, data: Datum[]) => boolean = undefined;
	export let opacity = 0.3;
	export let line: boolean | any = false;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	// Render in reverse order so bottom stacks are rendered last (and stack above the upper stacks).  Fixes when upper stack has 0 value
	$: lineData = [...$data].reverse();
</script>

{#if line}
	<g class="line-group">
		{#each lineData as seriesData}
			<Path
				data={seriesData}
				y={(d) => $yScale(d[1])}
				color={$zGet(seriesData)}
				{curve}
				{defined}
				{tweened}
				{...line}
			/>
		{/each}
	</g>
{/if}

<g class="area-group">
	{#each $data as seriesData}
		<Area
			data={seriesData}
			y0={(d) => $yScale(d[0])}
			y1={(d) => $yScale(d[1])}
			color={$zGet(seriesData)}
			{curve}
			{defined}
			{opacity}
			{tweened}
		/>
	{/each}
</g>
