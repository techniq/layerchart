<script lang="ts">
	import { getContext, createEventDispatcher } from 'svelte';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { bisector } from 'd3-array';

	import { Svg, Html } from '$lib/components/Chart.svelte';

	import { localPoint } from '$lib/utils/event';
	import { isScaleBand, scaleBandInvert } from '$lib/utils/scales';

	const dispatch = createEventDispatcher<{ click: { data: any } }>();

	const { flatData, x, xScale, xGet, yScale, yGet, width, height, padding } =
		getContext('LayerCake');

	export let snapToDataX: boolean = false;
	export let snapToDataY: boolean = false;
	export let findTooltipData: 'closest' | 'left' | 'right' = 'closest';
	export let topOffset = 10;
	export let leftOffset = 10;
	export let contained: 'container' | false = 'container'; // TODO: Support 'window' using getBoundingClientRect()
	export let animate = true;

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

	function handleTooltip(event: MouseEvent | TouchEvent) {
		const point = localPoint(event.target as Element, event);
		const localX = point?.x ?? 0;
		const localY = point?.y ?? 0;

		let tooltipData;
		if (isScaleBand($xScale)) {
			// `x` value at mouse/touch coordinate
			const valueAtPoint = scaleBandInvert($xScale)(localX);
			tooltipData = $flatData.find((d) => $x(d) === valueAtPoint);
		} else {
			// `x` value at mouse/touch coordinate
			const valueAtPoint = $xScale.invert(localX);

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
							Number(valueAtPoint) - Number($x(data0)) > Number($x(data1)) - Number(valueAtPoint)
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

		if (tooltipData) {
			tooltip = {
				left: snapToDataX ? $xGet(tooltipData) : localX,
				top: snapToDataY ? $yGet(tooltipData) : localY,
				data: tooltipData
			};
		}
	}

	function hideTooltip(event: MouseEvent | TouchEvent) {
		tooltip = null;
	}
</script>

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
