<script lang="ts">
	import { getContext } from 'svelte';
	import { isScaleBand } from '$lib/utils/scales';

	import Rect from './Rect.svelte';

	export let data;

	const { flatData, xScale, x, xGet, yRange, padding } = getContext('LayerCake');

	$: isBand = isScaleBand($xScale);

	let width = 0;
	$: if (isBand) {
		width = $xScale.step();
	} else {
		// Find width to next data point
		let index = $flatData.findIndex((d) => Number($x(d)) === Number($x(data)));
		let nextDataPoint = $x($flatData[index + 1]);
		width = ($xScale(nextDataPoint) ?? 0) - ($xGet(data) ?? 0);
	}

	$: dimensions = {
		x: $xGet(data) - (isBand ? ($xScale.padding() * $xScale.step()) / 2 : 0),
		y: -$padding.top,
		width,
		height: $yRange[0]
	};
</script>

{#if Number.isFinite(dimensions.x)}
	<Rect spring {...dimensions} fill="rgba(0,0,0,.1)" on:click />
{/if}
