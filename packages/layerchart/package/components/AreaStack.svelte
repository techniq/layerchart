<script>import { getContext } from 'svelte';
import Area from './Area.svelte';
import Path from './Path.svelte';
const { data, yScale, rGet } = getContext('LayerCake');
export let curve = undefined;
export let defined = undefined;
export let opacity = 0.3;
export let line = false;
export let tweened = undefined;
// Render in reverse order so bottom stacks are rendered last (and stack above the upper stacks).  Fixes when upper stack has 0 value
$: lineData = [...$data].reverse();
</script>

{#if line}
	<g class="line-group">
		{#each lineData as seriesData}
			<Path
				data={seriesData}
				y={(d) => $yScale(d[1])}
				color={$rGet(seriesData)}
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
			color={$rGet(seriesData)}
			{curve}
			{defined}
			{opacity}
			{tweened}
		/>
	{/each}
</g>
