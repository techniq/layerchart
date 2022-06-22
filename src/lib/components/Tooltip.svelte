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

	const dispatch = createEventDispatcher<{ click: { data: any } }>();

	const { flatData, x, xScale, xGet, xRange, yScale, yGet, yRange, width, height, padding } =
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
	export let mode: 'bisect' | 'voronoi' | 'quadtree' | 'bounds' | 'band' = 'bisect';
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

	function handleTooltip(event: MouseEvent | TouchEvent, tooltipData: any) {
		const point = localPoint(event.target as Element, event);
		const localX = point?.x ?? 0;
		const localY = point?.y ?? 0;

		// If tooltipData not provided already (voronoi, etc), attempt to find it
		if (tooltipData == null) {
			if (mode === 'quadtree') {
				tooltipData = quadtree.find(localX, localY, radius);
			} else {
				// `x` value at mouse/touch coordinate
				const valueAtPoint = scaleInvert($xScale, localX);

				if (isScaleBand($xScale)) {
					tooltipData = $flatData.find((d) => $x(d) === valueAtPoint);
				} else {
					// continuous scale (linear, time, etc).  Use bisector to find closest data to mouse location

					const bisectX = bisector((d) => {
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
					const index = bisectX($flatData, valueAtPoint, 1);

					const data0 = $flatData[index - 1];
					const data1 = $flatData[index];

					switch (findTooltipData) {
						case 'closest':
							if (data1 === undefined) {
								tooltipData = data0;
							} else if (data0 === undefined) {
								tooltipData = data1;
							} else {
								tooltipData =
									Number(valueAtPoint) - Number($x(data0)) >
									Number($x(data1)) - Number(valueAtPoint)
										? data1
										: data0;
							}
							break;
						case 'left':
							tooltipData = data0;
							break;
						case 'right':
						default:
							tooltipData = data1;
					}
				}
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
		voronoi = Delaunay.from(points).voronoi([0, 0, $width, $height]);
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
		rects = $flatData.map((d) => {
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
		});
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

{#if mode === 'bisect' || mode === 'quadtree'}
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
					style:fill="transparent"
					style:stroke={debug ? 'red' : 'transparent'}
					on:mousemove={(e) => handleTooltip(e, point.data)}
					on:mouseleave={hideTooltip}
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
					style:fill="transparent"
					style:stroke={debug ? 'red' : 'transparent'}
					on:mousemove={(e) => handleTooltip(e, rect.data)}
					on:mouseleave={hideTooltip}
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
						stroke="red"
						fill="none"
					/>
				{/each}
			</g>
		</ChartClipPath>
	</Svg>
{/if}
