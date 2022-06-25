<script lang="ts">
	import { getContext } from 'svelte';
	import { min, max } from 'd3-array';

	const { xRange, yScale, yRange } = getContext('LayerCake');

	export let x = false;
	export let y = false;
</script>

<g class="baseline">
	{#if x}
		<line x1={0} x2={max($xRange) || 0} y1={max($yRange)} y2={max($yRange)} class="baseline" />
	{/if}

	{#if y}
		<line x1={0} x2={0} y1={min($yRange) || 0} y2={max($yRange) || 0} class="baseline" />
	{/if}
</g>

<style lang="postcss">
	.baseline {
		stroke: #777;
	}
</style>
