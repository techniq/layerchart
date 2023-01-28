<script lang="ts">
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';
	import { max } from 'd3-array';

	import { isScaleBand } from '$lib/utils/scales';
	import Circle from './Circle.svelte';
	import Line from './Line.svelte';
	import { tooltipContext } from './TooltipContext.svelte';

	const { xScale, xRange, xGet, yScale, yRange, yGet, rGet, y, config } = getContext('LayerCake');
	const tooltip = tooltipContext();

	export let color: string | ((obj: { value: any; item: any; index: number }) => string) =
		'var(--color-blue-500)';
	export let axis: 'x' | 'y' | 'both' | 'none' = 'x';

	// TODO: Fix circle points being backwards for stack (see AreaStack)

	function getColor(item: any, index: number = undefined) {
		if (color) {
			if (typeof color === 'function') {
				return color({ value: $y(item), item, index });
			} else {
				return color;
			}
		} else if ($config.r) {
			return $rGet(item);
		} else {
			return 'var(--color-blue-500)';
		}
	}

	let lines = [];
	let points = [];

	$: if ($tooltip.data) {
		let x = $xGet($tooltip.data);
		let xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;

		let y = $yGet($tooltip.data);
		let yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;

		// Reset lines
		lines = [];

		if (axis === 'x' || axis === 'both') {
			if (Array.isArray(x)) {
				// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
				lines = [
					...lines,
					...x.map((xItem, i) => ({
						x1: xItem + xOffset,
						y1: 0,
						x2: xItem + xOffset,
						y2: max($yRange)
					}))
				];
			} else {
				lines = [
					...lines,
					{
						x1: x + xOffset,
						y1: 0,
						x2: x + xOffset,
						y2: max($yRange)
					}
				];
			}
		}

		if (axis === 'y' || axis === 'both') {
			if (Array.isArray(y)) {
				// `y` accessor with multiple properties (ex. `y={['start', 'end']})`)
				lines = [
					...lines,
					...y.map((yItem, i) => ({
						x1: 0,
						y1: yItem + yOffset,
						x2: max($xRange),
						y2: yItem + yOffset
					}))
				];
			} else {
				lines = [
					...lines,
					{
						x1: 0,
						y1: y + yOffset,
						x2: max($xRange),
						y2: y + yOffset
					}
				];
			}
		}

		if (Array.isArray(x)) {
			// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
			points = x.map((xItem, i) => ({
				x: xItem + xOffset,
				y: $yGet($tooltip.data) + yOffset,
				color: getColor($tooltip.data) // TODO: improve
			}));
		} else if (Array.isArray($tooltip.data)) {
			// Stack series
			points = $tooltip.data.map((yValue, i) => ({
				x: x + xOffset,
				y: $yScale(yValue) + yOffset,
				color: getColor($tooltip.data) // TODO: improve
			}));
		} else {
			points = [
				{
					x: x + xOffset,
					y: $yGet($tooltip.data) + yOffset,
					// color: $rGet($tooltip.data) //getColor($tooltip.data)
					color: getColor($tooltip.data)
				}
			];
		}
	}
</script>

{#if $tooltip.data}
	{#each lines as line}
		<Line
			spring
			x1={line.x1}
			y1={line.y1}
			x2={line.x2}
			y2={line.y2}
			stroke="rgba(0,0,0,.5)"
			stroke-width={2}
			style="pointerEvents: none"
			stroke-dasharray="2,2"
		/>
	{/each}

	{#each points as point}
		<Circle
			spring
			cx={point.x}
			cy={point.y}
			r={7}
			fill="rgba(255,255,255,.9)"
			stroke={point.color}
			stroke-width={2}
		/>
		<Circle spring cx={point.x} cy={point.y} r={3} fill={point.color} />
	{/each}
{/if}
