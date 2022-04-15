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
	import { formatNumberAsStyle, FormatNumberStyle } from 'svelte-ux/utils/number';
	import { isScaleBand } from '$lib/utils/scales';
	import { greatestAbs, unique } from 'svelte-ux/utils/array';

	const { data, flatData, xGet, yRange, xScale, yScale, x, y, custom } = getContext('LayerCake');

	export let orientation: 'outside' | 'inside' | 'auto' = 'auto';
	export let significantDigits = 3;
	export let formatStyle: FormatNumberStyle = null;
	export let overlap = false;

	$: yBaseline = $custom?.yBaseline ?? 0;

	export let groupBy: string = undefined;

	const x1Scale = scaleBand();
	$: if (isScaleBand($xScale) && groupBy) {
		const groupKeys = unique($flatData.map((d) => d[groupBy])) as string[];
		x1Scale.domain(groupKeys).range([0, $xScale.bandwidth()]).paddingInner(0.2);
	}

	$: getDimensions = (item) => {
		// console.log({ item, y: $y(item) });

		let x = $xGet(item);
		let width = 0;
		if (isScaleBand($xScale)) {
			width = groupBy ? x1Scale.bandwidth() : $xScale.bandwidth();
			x += (groupBy ? x1Scale(item[groupBy]) : 0) + width / 2;
		}

		const yValue = $y(item);
		let yTop = 0;
		let yBottom = 0;
		if (Array.isArray(yValue)) {
			// Array contains both top and bottom values;
			yTop = max(yValue);
			yBottom = min(yValue);
		} else if (yValue == null) {
			// null/undefined value
			yTop = 0;
			yBottom = 0;
		} else if (yValue > 0) {
			// Positive value
			yTop = yValue;
			yBottom = $yRange[1]; // or `0`?
		} else {
			// Negative value
			yTop = $yRange[1]; // or `0`?
			yBottom = yValue;
		}

		if (yBottom < 0) {
			// Show label below
			return {
				x,
				y: $yScale(yBottom),
				dy: '0.5em',
				width
			};
		} else {
			// Show label above
			return {
				x,
				y: $yScale(yTop),
				dy: '-0.6em',
				width
			};
		}
	};

	$: getValue = (item) => {
		const value = $y(item);

		const labelValue = Array.isArray(value) ? greatestAbs(value) : value;
		return labelValue != null
			? formatNumberAsStyle(labelValue + yBaseline, formatStyle, 0, significantDigits) ?? ''
			: '';
	};
</script>

<g class="label-group">
	{#each $data as item, index}
		<Text
			class="group-rect"
			textAnchor="middle"
			verticalAnchor="middle"
			value={getValue(item)}
			style="font-size: 0.7em; stroke: white; stroke-width: 2px;"
			{...getDimensions(item)}
			{...$$restProps}
		/>
	{/each}
</g>
