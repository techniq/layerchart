<script lang="ts">
	import { getContext } from 'svelte';

	const { xRange, yScale, yRange } = getContext('LayerCake');

	export let x = false;
	export let y = false;
</script>

<g class="baseline">
	{#if x}
		<line x1={0} x2={$xRange[1] || 0} y1={$yScale(0) || 0} y2={$yScale(0) || 0} class="baseline" />
	{/if}

	{#if y}
		<line x1={0} x2={0} y1={$yRange[0] || 0} y2={$yRange[1] || 0} class="baseline" />
	{/if}
</g>

<style lang="postcss">
	.baseline {
		stroke: #777;
	}
</style>
