<script lang="ts">
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

	$: points = Array.isArray(data)
		? // Stack series
		  data.map((yValue, i) => ({
				x,
				y: $yScale(yValue),
				color: getColor(i)
		  }))
		: [
				{
					x,
					y: $yGet(data) - $padding.top,
					color: getColor(0)
				}
		  ];
</script>

<Line
	spring
	x1={x}
	y1={0}
	x2={x}
	y2={$yRange[0]}
	stroke="rgba(0,0,0,.5)"
	stroke-width={2}
	style="pointerEvents: none"
	stroke-dasharray="2,2"
/>

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
