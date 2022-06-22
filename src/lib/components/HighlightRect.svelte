<script lang="ts">
	import { getContext } from 'svelte';
	import { max, min } from 'd3-array';

	import { isScaleBand } from '$lib/utils/scales';
	import Rect from './Rect.svelte';

	export let data;

	const { flatData, xScale, xDomain, x, xGet, yRange } = getContext('LayerCake');

	$: isBand = isScaleBand($xScale);
	$: xCoord = $xGet(data);

	let width = 0;
	$: if (isBand) {
		width = $xScale.step();
	} else if (Array.isArray(xCoord)) {
		// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
		// Use first/last values for width
		width = max(xCoord) - min(xCoord);
		xCoord = min(xCoord); // Use left-most value for top left of rect
	} else {
		// Find width to next data point
		const index = $flatData.findIndex((d) => Number($x(d)) === Number($x(data)));
		const isLastPoint = index + 1 === $flatData.length;
		const nextDataPoint = isLastPoint ? max($xDomain) : $x($flatData[index + 1]);
		width = ($xScale(nextDataPoint) ?? 0) - (xCoord ?? 0);
	}

	$: dimensions = {
		x: xCoord - (isBand ? ($xScale.padding() * $xScale.step()) / 2 : 0),
		y: 0,
		width,
		height: $yRange[0]
	};
</script>

{#if Number.isFinite(dimensions.x)}
	<Rect spring {...dimensions} fill="rgba(0,0,0,.1)" on:click />
{/if}
