<script lang="ts">
	import { getContext, createEventDispatcher } from 'svelte';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { bisector, max, min } from 'd3-array';
	import { Delaunay } from 'd3-delaunay';
	import { quadtree as d3Quadtree } from 'd3-quadtree';

	import { Svg, Html } from '$lib/components/Chart.svelte';
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';

	import { localPoint } from '$lib/utils/event';
	import { isScaleBand, scaleInvert } from '$lib/utils/scales';
	import { quadtreeRects } from '$lib/utils/quadtree';
	import { createPropertySortFunc, createSortFunc } from 'svelte-ux/utils/sort';

	const dispatch = createEventDispatcher<{ click: { data: any } }>();

	const { flatData, x, xScale, xGet, xRange, y, yScale, yGet, yRange, width, height, padding } =
		getContext('LayerCake');

	/*
		TODO: Defaults to consider (if possible to detect scale type, which might not be possible)
		- scaleTime / scaleLinear: bisect
		- scaleTime / scaleLinear (multi/stack): bisect 
		- scaleTime / scaleBand: bisect (or band)
		- scaleTime (multi) / scaleBand: bounds (or possible band if not overlapping)
		- scaleBand, scaleLinear: band (or bounds)
		- scaleBand, scaleLinear: band (or bounds) - multiple (overlapping) bars
		- scaleLinear, scaleLinear: voronoi (or quadtree)
	*/
	export let mode:
		| 'bisect-x'
		| 'bisect-y'
		| 'band'
		| 'bisect-band'
		| 'bounds'
		| 'voronoi'
		| 'quadtree' = 'bisect-x';
	export let snapToDataX: boolean = false;
	export let snapToDataY: boolean = false;
	export let findTooltipData: 'closest' | 'left' | 'right' = 'closest';
	export let topOffset = 10;
	export let leftOffset = 10;
	export let contained: 'container' | false = 'container'; // TODO: Support 'window' using getBoundingClientRect()
	export let animate = true;
	export let radius = Infinity;
	export let debug = false;

	let tooltip = null;
	let tooltipWidth = 0;
	let tooltipHeight = 0;

	let top = animate ? spring(0) : writable(0);
	$: if (tooltip) {
		const containerHeight = $height + $padding.bottom;

		if (contained === 'container' && tooltip.top + topOffset + tooltipHeight > containerHeight) {
			// change side
			$top = tooltip.top - (topOffset + tooltipHeight);
		} else {
			$top = tooltip.top + topOffset;
		}
	}

	let left = animate ? spring(0) : writable(0);
	$: if (tooltip) {
		const containerWidth = $width + $padding.right;

		if (contained === 'container' && tooltip.left + leftOffset + tooltipWidth > containerWidth) {
			// change side
			$left = tooltip.left - (leftOffset + tooltipWidth);
		} else {
			$left = tooltip.left + leftOffset;
		}
	}

	$: bisectX = bisector((d) => {
		const value = $x(d);
		if (Array.isArray(value)) {
			// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
			// Using first value.  Consider using average, max, etc
			// const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
			// return midpoint;
			return value[0];
		} else {
			return value;
		}
	}).left;

	$: bisectY = bisector((d) => {
		const value = $y(d);
		if (Array.isArray(value)) {
			// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
			// Using first value.  Consider using average, max, etc
			// const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
			// return midpoint;
			return value[0];
		} else {
			return value;
		}
	}).left;

	function findData(previousValue, currentValue, valueAtPoint, accessor) {
		switch (findTooltipData) {
			case 'closest':
				if (currentValue === undefined) {
					return previousValue;
				} else if (previousValue === undefined) {
					return currentValue;
				} else {
					return Number(valueAtPoint) - Number(accessor(previousValue)) >
						Number(accessor(currentValue)) - Number(valueAtPoint)
						? currentValue
						: previousValue;
				}
			case 'left':
				return previousValue;
			case 'right':
			default:
				return currentValue;
		}
	}

	function handleTooltip(event: MouseEvent | TouchEvent, tooltipData: any) {
		const point = localPoint(event.target as Element, event);
		const localX = point?.x ?? 0;
		const localY = point?.y ?? 0;

		// If tooltipData not provided already (voronoi, etc), attempt to find it
		// TODO: When using bisect-x/y/band, values should be sorted.  Tyipcally are for `x`, but not `y` (and band depends on if x or y scale)
		if (tooltipData == null) {
			if (mode === 'quadtree') {
				tooltipData = quadtree.find(localX, localY, radius);
			} else if (mode === 'bisect-band') {
				// `x` and `y` values at mouse/touch coordinate
				const xValueAtPoint = scaleInvert($xScale, localX);
				const yValueAtPoint = scaleInvert($yScale, localY);

				if (isScaleBand($xScale)) {
					// Find point closest to pointer within the x band
					const bandData = $flatData
						.filter((d) => $x(d) === xValueAtPoint)
						.sort(createSortFunc($y)); // sort for bisect
					const index = bisectY(bandData, yValueAtPoint, 1);
					const previousValue = bandData[index - 1];
					const currentValue = bandData[index];
					tooltipData = findData(previousValue, currentValue, yValueAtPoint, $y);
				} else if (isScaleBand($yScale)) {
					// Find point closest to pointer within the y band
					const bandData = $flatData
						.filter((d) => $y(d) === yValueAtPoint)
						.sort(createSortFunc($x)); // sort for bisect
					const index = bisectX(bandData, xValueAtPoint, 1);
					const previousValue = bandData[index - 1];
					const currentValue = bandData[index];
					tooltipData = findData(previousValue, currentValue, xValueAtPoint, $x);
				} else {
					// TODO: Support `bisect-band` without band?  Fallback to bisect?
				}
			} else if (mode === 'bisect-x') {
				// `x` value at mouse/touch coordinate
				const xValueAtPoint = scaleInvert($xScale, localX);

				const index = bisectX($flatData, xValueAtPoint, 1);
				const previousValue = $flatData[index - 1];
				const currentValue = $flatData[index];
				tooltipData = findData(previousValue, currentValue, xValueAtPoint, $x);
			} else if (mode === 'bisect-y') {
				// `y` value at mouse/touch coordinate
				const yValueAtPoint = scaleInvert($yScale, localY);

				const index = bisectY($flatData, yValueAtPoint, 1);
				const previousValue = $flatData[index - 1];
				const currentValue = $flatData[index];
				tooltipData = findData(previousValue, currentValue, yValueAtPoint, $y);
			}
		}

		if (tooltipData) {
			tooltip = {
				left: snapToDataX ? $xGet(tooltipData) : localX,
				top: snapToDataY ? $yGet(tooltipData) : localY,
				data: tooltipData
			};
		} else {
			// Hide tooltip if unable to locate
			tooltip = null;
		}
	}

	function hideTooltip(event: MouseEvent | TouchEvent) {
		tooltip = null;
	}

	let points;
	let voronoi;
	$: if (mode === 'voronoi') {
		points = $flatData.map((d) => {
			const xValue = $xGet(d);
			const yValue = $yGet(d);

			const x = Array.isArray(xValue) ? min(xValue) : xValue;
			const y = Array.isArray(yValue) ? min(yValue) : yValue;

			const point = [x, y];
			point.data = d;
			return point;
		});
		voronoi = Delaunay.from(points).voronoi([0, 0, Math.max($width, 0), Math.max($height, 0)]); // width and/or height can sometimes be negative (when loading data remotely and updately)
	}

	let quadtree;
	$: if (mode === 'quadtree') {
		quadtree = d3Quadtree()
			.extent([
				[0, 0],
				[$width, $height]
			])
			.x((d) => {
				const value = $xGet(d);

				if (Array.isArray(value)) {
					// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
					// Using first value.  Consider using average, max, etc
					// const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
					// return midpoint;
					return min(value);
				} else {
					return value;
				}
			})
			.y((d) => {
				const value = $yGet(d);

				if (Array.isArray(value)) {
					// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
					// Using first value.  Consider using average, max, etc
					// const midpoint = new Date((value[1].valueOf() + value[0].getTime()) / 2);
					// return midpoint;
					return min(value);
				} else {
					return value;
				}
			})
			.addAll($flatData);
	}

	let rects = [];
	$: if (mode === 'bounds' || mode === 'band') {
		rects = $flatData
			.map((d) => {
				const xValue = $xGet(d);
				const yValue = $yGet(d);

				const x = Array.isArray(xValue) ? min(xValue) : xValue;
				const y = Array.isArray(yValue) ? max(yValue) : yValue;

				const xOffset = isScaleBand($xScale) ? ($xScale.padding() * $xScale.step()) / 2 : 0;
				const yOffset = isScaleBand($yScale) ? ($yScale.padding() * $yScale.step()) / 2 : 0;

				const fullWidth = max($xRange) - min($xRange);
				const fullHeight = max($yRange) - min($yRange);

				if (mode === 'band') {
					// full band width/height regardless of value
					return {
						x: isScaleBand($xScale) ? x - xOffset : min($xRange),
						y: isScaleBand($yScale) ? y - yOffset : min($yRange),
						width: isScaleBand($xScale) ? $xScale.step() : fullWidth,
						height: isScaleBand($yScale) ? $yScale.step() : fullHeight,
						data: d
					};
				} else if (mode === 'bounds') {
					return {
						x: isScaleBand($xScale) || Array.isArray(xValue) ? x - xOffset : min($xRange),
						// y: isScaleBand($yScale) || Array.isArray(yValue) ? y - yOffset : min($yRange),
						y: y - yOffset,

						width: Array.isArray(xValue)
							? xValue[1] - xValue[0]
							: isScaleBand($xScale)
							? $xScale.step()
							: min($xRange) + x,
						height: Array.isArray(yValue)
							? yValue[1] - yValue[0]
							: isScaleBand($yScale)
							? $yScale.step()
							: max($yRange) - y,
						data: d
					};
				}
			})
			.sort(createPropertySortFunc('x'));
		// console.log({ rects });
	}
</script>

{#if tooltip}
	<Html>
		<div
			class="absolute pointer-events-none z-50"
			style="
      top: {$top}px;
      left: {$left}px;
      max-width: {$width / 2}px;
    "
			transition:fade={{ duration: 100 }}
			bind:clientWidth={tooltipWidth}
			bind:clientHeight={tooltipHeight}
		>
			<slot data={tooltip?.data} />
		</div>
	</Html>

	<Svg>
		<slot name="highlight" data={tooltip?.data} />
	</Svg>
{/if}

{#if ['bisect-x', 'bisect-y', 'bisect-band', 'quadtree'].indexOf(mode) != -1}
	<Html>
		<div
			class="absolute"
			style="width: {$width}px; height: {$height}px; background: _red; z-index: 9999"
			on:touchstart={handleTooltip}
			on:touchmove={handleTooltip}
			on:mousemove={handleTooltip}
			on:mouseleave={hideTooltip}
			on:click={(e) => {
				dispatch('click', { data: tooltip?.data });
			}}
		/>
	</Html>
{:else if mode === 'voronoi'}
	<Svg>
		{#each points as point, i}
			<g class="tooltip-voronoi">
				<path
					d={voronoi.renderCell(i)}
					style:fill={debug ? 'red' : 'transparent'}
					style:fill-opacity={debug ? 0.1 : 0}
					style:stroke={debug ? 'red' : 'transparent'}
					on:mousemove={(e) => handleTooltip(e, point.data)}
					on:mouseleave={hideTooltip}
					on:click={(e) => {
						dispatch('click', { data: point.data });
					}}
				/>
			</g>
		{/each}
	</Svg>
{:else if mode === 'bounds' || mode === 'band'}
	<Svg>
		<g class="tooltip-rects">
			{#each rects as rect}
				<rect
					x={rect.x}
					y={rect.y}
					width={rect.width}
					height={rect.height}
					style:fill={debug ? 'red' : 'transparent'}
					style:fill-opacity={debug ? 0.1 : 0}
					style:stroke={debug ? 'red' : 'transparent'}
					on:mousemove={(e) => handleTooltip(e, rect.data)}
					on:mouseleave={hideTooltip}
					on:click={(e) => {
						dispatch('click', { data: rect.data });
					}}
				/>
			{/each}
		</g>
	</Svg>
{/if}

{#if mode === 'quadtree' && debug}
	<Svg>
		<ChartClipPath>
			<g class="tooltip-quadtree">
				{#each quadtreeRects(quadtree, false) as rect}
					<rect
						x={rect.x}
						y={rect.y}
						width={rect.width}
						height={rect.height}
						style:fill={debug ? 'red' : 'transparent'}
						style:fill-opacity={debug ? 0.1 : 0}
						stroke="red"
					/>
				{/each}
			</g>
		</ChartClipPath>
	</Svg>
{/if}
