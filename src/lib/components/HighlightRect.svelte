<script lang="ts">
	import { getContext } from 'svelte';
	import { max, min } from 'd3-array';

	import { isScaleBand } from '$lib/utils/scales';
	import Rect from './Rect.svelte';
	import { tooltipContext } from './Tooltip.svelte';

	const { flatData, x, xScale, xDomain, xRange, xGet, yScale, yDomain, yRange, yGet } =
		getContext('LayerCake');
	const tooltip = tooltipContext();

	export let axis: 'x' | 'y' | 'both' = isScaleBand($yScale) ? 'y' : 'x';

	let dimensions = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	$: {
		if ($tooltip.data) {
			let xCoord = $xGet($tooltip.data);
			let yCoord = $yGet($tooltip.data);

			if (axis === 'x' || axis === 'both') {
				if (isScaleBand($xScale)) {
					dimensions.width = $xScale.step();
				} else if (Array.isArray(xCoord)) {
					// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
					// Use first/last values for width
					dimensions.width = max(xCoord) - min(xCoord);
					xCoord = min(xCoord); // Use left-most value for top left of rect
				} else {
					// Find width to next data point
					const index = $flatData.findIndex((d) => Number($x(d)) === Number($x($tooltip.data)));
					const isLastPoint = index + 1 === $flatData.length;
					const nextDataPoint = isLastPoint ? max($xDomain) : $x($flatData[index + 1]);
					dimensions.width = ($xScale(nextDataPoint) ?? 0) - (xCoord ?? 0);
				}

				dimensions.x =
					xCoord - (isScaleBand($xScale) ? ($xScale.padding() * $xScale.step()) / 2 : 0);

				if (axis === 'x') {
					dimensions.height = max($yRange);
				}
			}

			if (axis === 'y' || axis === 'both') {
				if (isScaleBand($yScale)) {
					dimensions.height = $yScale.step();
				} else if (Array.isArray(xCoord)) {
					// `y` accessor with multiple properties (ex. `y={['start', 'end']})`)
					// Use first/last values for width
					dimensions.height = max(yCoord) - min(yCoord);
					yCoord = min(yCoord); // Use left-most value for top left of rect
				} else {
					// Find width to next data point
					const index = $flatData.findIndex((d) => Number($x(d)) === Number($x($tooltip.data)));
					const isLastPoint = index + 1 === $flatData.length;
					const nextDataPoint = isLastPoint ? max($yDomain) : $x($flatData[index + 1]);
					dimensions.height = ($yScale(nextDataPoint) ?? 0) - (yCoord ?? 0);
				}

				dimensions.y =
					yCoord - (isScaleBand($yScale) ? ($yScale.padding() * $yScale.step()) / 2 : 0);

				if (axis === 'y') {
					dimensions.width = max($xRange);
				}
			}
		}
	}
</script>

{#if $tooltip.data && Number.isFinite(dimensions.x)}
	<Rect spring {...dimensions} fill="rgba(0,0,0,.1)" on:click />
{/if}
