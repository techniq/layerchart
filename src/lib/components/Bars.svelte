<script lang="ts">
	import { getContext } from 'svelte';
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
	import { scaleBand } from 'd3-scale';
	import { max, min } from 'd3-array';
	import { unique } from 'svelte-ux/utils/array';

	import Rect from './Rect.svelte';

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
	// TODO: change to offset?
	export let widthOffset = 0;
	export let heightOffset = 0;

	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	// See: https://svelte.dev/repl/7000c5ce05b84cd98ccbfb2768b4be3d?version=3.38.3

	export let groupBy: string | undefined = undefined;
	export let groupPaddingInner = 0.2;
	export let groupPaddingOuter = 0;

	// 	$: console.log({ $data, $flatData, groupBy, stackBy })

	$: groupKeys = unique($flatData.map((d) => d[groupBy])) as string[];

	$: x1Scale = $xScale.bandwidth
		? scaleBand()
				.domain(groupKeys)
				.range([0, $xScale.bandwidth()])
				.paddingInner(groupPaddingInner)
				.paddingOuter(groupPaddingOuter)
		: null;

	$: y1Scale = $yScale.bandwidth
		? scaleBand()
				.domain(groupKeys)
				.range([0, $yScale.bandwidth()])
				.paddingInner(groupPaddingInner)
				.paddingOuter(groupPaddingOuter)
		: null;

	// TODO: Simplify and reuse in Labels, etc
	$: getDimensions = (item) => {
		if ($xScale.bandwidth) {
			return getDimensionsVertical(item);
		} else if ($yScale.bandwidth) {
			return getDimensionsHorizontal(item);
		} else {
			// TODO: Handle both $xScale.bandwidth and $yScale.bandwidth?
			// TODO: Handle neither $xScale.bandwidth or $yScale.bandwidth? `Math.max(0, $xGet(d)[1] - $xGet(d)[0])` instead of `$xScale.bandwidth()`
		}
	};

	$: getDimensionsVertical = (item) => {
		// console.log({ item, y: $y(item) });

		const x = $xGet(item) + (groupBy ? x1Scale(item[groupBy]) : 0) - widthOffset / 2;

		const width = Math.max(0, (groupBy ? x1Scale.bandwidth() : $xScale.bandwidth()) + widthOffset);

		const yValue = _y(item);

		let yTop = 0;
		let yBottom = 0;
		if (Array.isArray(yValue)) {
			// Array contains both top and bottom values (stack, etc);
			yTop = max(yValue);
			yBottom = min(yValue);
		} else if (yValue == null) {
			// null/undefined value
			yTop = 0;
			yBottom = 0;
		} else if (yValue > 0) {
			// Positive value
			yTop = yValue;
			yBottom = min($yRange); // or `0`?
		} else {
			// Negative value
			yTop = min($yRange); // or `0`?
			yBottom = yValue;
		}

		return {
			x,
			y: $yScale(yTop),
			width,
			height: $yScale(yBottom) - $yScale(yTop)
		};
	};

	$: getDimensionsHorizontal = (item) => {
		// console.log({ item, y: $y(item) });

		const y = $yGet(item) + (groupBy ? y1Scale(item[groupBy]) : 0) - heightOffset / 2;

		const height = Math.max(
			0,
			(groupBy ? y1Scale.bandwidth() : $yScale.bandwidth()) + heightOffset
		);

		const xValue = _x(item);

		let xLeft = 0;
		let xRight = 0;
		if (Array.isArray(xValue)) {
			// Array contains both top and bottom values (stack, etc);
			xLeft = min(xValue);
			xRight = max(xValue);
		} else if (xValue == null) {
			// null/undefined value
			xLeft = 0;
			xRight = 0;
		} else if (xValue > 0) {
			// Positive value
			xLeft = min($xRange); // or `0`?
			xRight = xValue;
		} else {
			// Negative value
			xLeft = xValue;
			xRight = min($xRange); // or `0`?
		}

		return {
			x: $xScale(xLeft),
			y,
			width: $xScale(xRight) - $xScale(xLeft),
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

<g class="column-group">
	{#each $data as item, index (getKey(item, index))}
		<Rect
			class="group-rect"
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
