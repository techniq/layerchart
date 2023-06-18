<script lang="ts">
	import { getContext } from 'svelte';
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
	import { max, min } from 'd3-array';

	import Rect from './Rect.svelte';
	import { groupScaleBand, isScaleBand } from '$lib/utils/scales';

	const {
		data,
		flatData,
		xGet,
		yGet,
		xRange,
		yRange,
		xScale,
		yScale,
		x: xContext,
		y: yContext,
		rGet,
		config
	} = getContext('LayerCake');

	/**
	 * Override `x` from context.  Useful for multiple Bar instances
	 */
	export let x = $xContext;
	// Convert x to function
	$: _x = x ? (typeof x === 'string' ? (d) => d[x] : x) : $xContext;

	/**
	 * Override `y` from context.  Useful for multiple Bar instances
	 */
	export let y = $yContext;
	$: _y = y ? (typeof y === 'string' ? (d) => d[y] : y) : $yContext;

	/*
    TODO:
		  - [ ] Support vertical/horizontal layout (Bar/Column)
  */

	export let color: string | ((obj: { value: any; item: any; index: number }) => string) =
		'var(--color-blue-500)';
	export let opacity = 1;
	export let stroke = 'black';
	export let strokeWidth = 0;
	export let radius = 0;
	export let getKey: (item: any, index: number) => any = (item) =>
		$xScale.bandwidth ? _x(item) : _y(item);
	export let getProps: ((obj: { value: any; item: any; index: number }) => any) | undefined =
		undefined;
	/** Inset the rect for amount of padding.  Useful with multiple bars (bullet, overlap, etc) */
	export let padding = 0;

	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	// See: https://svelte.dev/repl/7000c5ce05b84cd98ccbfb2768b4be3d?version=3.38.3

	export let groupBy: string | undefined = undefined;
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

	// TODO: Simplify and reuse in Labels, etc
	$: getDimensions = (item) => {
		if (isScaleBand($xScale)) {
			return getDimensionsVertical(item);
		} else if (isScaleBand($yScale)) {
			return getDimensionsHorizontal(item);
		} else {
			// TODO: Handle both $xScale.bandwidth and $yScale.bandwidth?
			// TODO: Handle neither $xScale.bandwidth or $yScale.bandwidth? `Math.max(0, $xGet(d)[1] - $xGet(d)[0])` instead of `$xScale.bandwidth()`
		}
	};

	$: getDimensionsVertical = (item) => {
		// console.log({ item, y: $y(item) });

		const x = $xGet(item) + (x1Scale ? x1Scale(item[groupBy]) : 0) + padding / 2;
		const width = Math.max(0, (x1Scale ? x1Scale.bandwidth() : $xScale.bandwidth()) - padding);

		const yValue = _y(item);

		let top = 0;
		let bottom = 0;
		if (Array.isArray(yValue)) {
			// Array contains both top and bottom values (stack, etc);
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

		return {
			x,
			y: $yScale(top),
			width,
			height: $yScale(bottom) - $yScale(top)
		};
	};

	$: getDimensionsHorizontal = (item) => {
		// console.log({ item, y: $y(item) });

		const y = $yGet(item) + (y1Scale ? y1Scale(item[groupBy]) : 0) + padding / 2;
		const height = Math.max(0, (y1Scale ? y1Scale.bandwidth() : $yScale.bandwidth()) - padding);

		const xValue = _x(item);

		let left = 0;
		let right = 0;
		if (Array.isArray(xValue)) {
			// Array contains both top and bottom values (stack, etc);
			left = min(xValue);
			right = max(xValue);
		} else if (xValue == null) {
			// null/undefined value
			left = 0;
			right = 0;
		} else if (xValue > 0) {
			// Positive value
			left = min($xRange); // or `0`?
			right = xValue;
		} else {
			// Negative value
			left = xValue;
			right = min($xRange); // or `0`?
		}

		return {
			x: $xScale(left),
			y,
			width: $xScale(right) - $xScale(left),
			height
		};
	};

	function getColor(item: any, index: number) {
		if (typeof color === 'function') {
			return color({ value: _y(item), item, index });
		} else if ($config.r) {
			return $rGet(item);
		} else {
			return color;
		}
	}
</script>

<g class="Bars">
	{#each $data as item, index (getKey(item, index))}
		<Rect
			data-id={index}
			fill={getColor(item, index)}
			fill-opacity={opacity}
			{stroke}
			stroke-width={strokeWidth}
			rx={radius}
			{spring}
			{tweened}
			{...getDimensions(item)}
			{...getProps?.({ value: _y(item), item, index })}
			{...$$restProps}
		/>
	{/each}
</g>
