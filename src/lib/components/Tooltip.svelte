<script lang="ts" context="module">
	import type { Readable } from 'svelte/store';

	export const tooltipContextKey = {};

	export type TooltipContext = Readable<{
		top: number;
		left: number;
		data: any;
	}>;

	export function tooltipContext() {
		return getContext<TooltipContext>(tooltipContextKey);
	}

	function setTooltipContext(tooltip: TooltipContext) {
		setContext(tooltipContextKey, tooltip);
	}
</script>

<script lang="ts">
	/*
		TODO:
		  - [ ] Fix jumping when initally displayed and needs container adjusted
			  - Consider moving container adjustments within Tooltip and not TooltipContainer.  This might affect Highlight
			- [ ] Add showTooltip/hideTooltip to context
			- [ ] Support `events` mode
			  - Consider only support this mode.  Create Voronoi, Bisect, ..., components
			- [ ] Add example for other shapes
			  - [ ] Pie
				- [ ] Treemap
				- [ ] ...more...
	*/
	import { getContext, setContext, createEventDispatcher } from 'svelte';
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
	export let radius = Infinity;
	export let debug = false;

	const tooltip = writable({ top: 0, left: 0, data: null });
	setTooltipContext(tooltip);

	let hideTimeout: NodeJS.Timeout;

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

	function showTooltip(event: MouseEvent | TouchEvent, tooltipData?: any) {
		// Cancel hiding tooltip if from previous event loop
		clearTimeout(hideTimeout);

		const referenceNode = (event.target as Element).closest('.layercake-container');
		const point = localPoint(referenceNode, event);
		const localX = point?.x - $padding.left ?? 0;
		const localY = point?.y - $padding.top ?? 0;

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
			$tooltip = {
				left: snapToDataX ? $xGet(tooltipData) : localX,
				top: snapToDataY ? $yGet(tooltipData) : localY,
				data: tooltipData
			};
		} else {
			// Hide tooltip if unable to locate
			hideTooltip();
		}
	}

	function hideTooltip() {
		// Wait an event loop tick in case `showTooltip` is called immediately on another element, to allow tweeneing (ex. moving between bands/bars)
		hideTimeout = setTimeout(() => {
			$tooltip = { ...$tooltip, data: null };
		});
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

<slot data={$tooltip.data} />

{#if ['bisect-x', 'bisect-y', 'bisect-band', 'quadtree'].includes(mode)}
	<Html>
		<div
			class="absolute"
			style="width: {$width}px; height: {$height}px; background: _red; z-index: 9999"
			on:touchstart={showTooltip}
			on:touchmove={showTooltip}
			on:mousemove={showTooltip}
			on:mouseleave={hideTooltip}
			on:click={(e) => {
				dispatch('click', { data: $tooltip?.data });
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
					on:mousemove={(e) => showTooltip(e, point.data)}
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
					on:mousemove={(e) => showTooltip(e, rect.data)}
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
