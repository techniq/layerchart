<script lang="ts">
	/*
	 * TODO
	 *   - [ ] Support step curves (center like scaleBand())
	 *   - [ ] Support multiple values (threshold, stacks, etc)
	 */
	import { getContext } from 'svelte';
	import { scaleBand } from 'd3-scale';
	import { max, min } from 'd3-array';

	import Text from './Text.svelte';
	import { format as formatValue, type FormatType } from 'svelte-ux';
	import { formatNumberAsStyle, type FormatNumberStyle } from 'svelte-ux/utils/number';
	import { greatestAbs, unique } from 'svelte-ux/utils/array';
	import { groupScaleBand, isScaleBand } from '$lib/utils/scales';

	const { flatData, xGet, yRange, xScale, yScale, x, y, custom } = getContext('LayerCake');

	export let orientation: 'outside' | 'inside' | 'auto' = 'auto';
	export let significantDigits = 3;
	export let format: FormatType = undefined;
	export let formatStyle: FormatNumberStyle = null;
	export let overlap = false;

	$: yBaseline = $custom?.yBaseline ?? 0;

	export let groupBy: string = undefined;
	export let groupPaddingInner = 0.2;
	export let groupPaddingOuter = 0;

	$: x1Scale =
		isScaleBand($xScale) && groupBy
			? groupScaleBand($xScale, $flatData, groupBy, {
					inner: groupPaddingInner,
					outer: groupPaddingOuter
			  })
			: null;

	$: y1Scale =
		isScaleBand($yScale) && groupBy
			? groupScaleBand($yScale, $flatData, groupBy, {
					inner: groupPaddingInner,
					outer: groupPaddingOuter
			  })
			: null;

	$: getDimensions = (item) => {
		let x = $xGet(item);
		let width = 0;
		if (isScaleBand($xScale)) {
			width = groupBy ? x1Scale.bandwidth() : $xScale.bandwidth();
			x += (groupBy ? x1Scale(item[groupBy]) : 0) + width / 2;
		}

		const yValue = $y(item);

		let top = 0;
		let bottom = 0;
		if (Array.isArray(yValue)) {
			// Array contains both top and bottom values;
			top = max(yValue);
			bottom = min(yValue);
		} else if (yValue == null) {
			// null/undefined value
			top = 0;
			bottom = 0;
		} else if (yValue > 0) {
			// Positive value
			top = yValue;
			bottom = min($yRange); // or `0`?
		} else {
			// Negative value
			top = min($yRange); // or `0`?
			bottom = yValue;
		}

		if (bottom < 0) {
			// Show label below
			return {
				x,
				y: $yScale(bottom),
				dy: '0.5em',
				width
			};
		} else {
			// Show label above
			return {
				x,
				y: $yScale(top),
				dy: '-0.6em',
				width
			};
		}
	};

	$: getValue = (item) => {
		const value = isScaleBand($yScale) ? $x(item) : $y(item);

		const labelValue = (Array.isArray(value) ? greatestAbs(value) : value) + yBaseline;

		let formattedValue = labelValue;
		if (labelValue != null) {
			if (format) {
				// Apply more versatile formatting first
				formattedValue = formatValue(labelValue, format ?? $yScale.tickFormat?.());
			} else {
				// Deprecated format
				formattedValue = formatNumberAsStyle(labelValue, formatStyle, 0, significantDigits);
			}
		}

		return formattedValue ?? '';
	};
</script>

<g class="Labels">
	{#each $flatData as item, index}
		<Text
			textAnchor="middle"
			verticalAnchor="middle"
			value={getValue(item)}
			class="text-xs stroke-white [stroke-width:2px]"
			{...getDimensions(item)}
			{...$$restProps}
		/>
	{/each}
</g>
