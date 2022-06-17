<script lang="ts">
	import { isScaleBand } from '$lib/utils/scales';

	import { getContext } from 'svelte';
	import { get } from 'svelte/store';

	import Circle from './Circle.svelte';
	import Line from './Line.svelte';

	export let data;
	export let color = undefined;

	const { xGet, yScale, yRange, yGet, zScale, padding } = getContext('LayerCake');

	// TODO: Fix circle points being backwards for stack (see AreaStack)

	$: x = $xGet(data);

	function getColor(index) {
		return color ?? get(zScale)(index) ?? 'var(--color-blue-500)';
	}

	let lines = [];
	$: if (Array.isArray(x)) {
		// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
		lines = x.map((xItem, i) => ({
			x1: xItem,
			y1: 0,
			x2: xItem,
			y2: $yRange[0]
		}));
	} else {
		lines = [
			{
				x1: x,
				y1: 0,
				x2: x,
				y2: $yRange[0]
			}
		];
	}

	let points = [];
	$: yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;
	$: if (Array.isArray(x)) {
		// `x` accessor with multiple properties (ex. `x={['start', 'end']})`)
		points = x.map((xItem, i) => ({
			x: xItem,
			y: $yGet(data) + yOffset,
			color: getColor(i)
		}));
	} else if (Array.isArray(data)) {
		// Stack series
		points = data.map((yValue, i) => ({
			x,
			y: $yScale(yValue) + yOffset,
			color: getColor(i)
		}));
	} else {
		points = [
			{
				x,
				y: $yGet(data) + yOffset,
				color: getColor(0)
			}
		];
	}
</script>

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
