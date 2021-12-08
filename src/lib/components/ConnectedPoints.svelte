<script lang="ts">
	/*
		TODO:
			- [ ] Consider becoming LinkLine using d3-path buider https://github.com/d3/d3-path
			  - https://github.com/airbnb/visx/blob/master/packages/visx-shape/src/shapes/link/line/LinkHorizontalLine.tsx
	*/

	import { getContext } from 'svelte';
	import { extent } from 'd3-array';
	import Line from './Line.svelte';

	const context = getContext('LayerCake') as any;
	const { data, xGet, yGet, config } = context;

	type Offset = number | ((value: number, context: any) => number);

	export let offsetX: Offset = 0;
	export let offsetY: Offset = 0;

	function getOffset(value, offset: Offset) {
		if (typeof offset === 'function') {
			return offset(value, context);
		} else {
			return offset;
		}
	}

	$: points = $data.flatMap((d) => {
		if (Array.isArray($config.x)) {
			/*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
			const [xMin, xMax] = extent($xGet(d));
			return {
				x1: xMin + getOffset(xMin, offsetX),
				y1: $yGet(d) + getOffset($yGet(d), offsetY),
				x2: xMax + getOffset(xMax, offsetX),
				y2: $yGet(d) + getOffset($yGet(d), offsetY)
			};
		} else if (Array.isArray($config.y)) {
			/*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
			const [yMin, yMax] = extent($yGet(d));
			return {
				x1: $xGet(d) + getOffset($xGet(d), offsetX),
				y1: yMin + getOffset(yMin, offsetY),
				x2: $xGet(d) + getOffset($xGet(d), offsetX),
				y2: yMax + getOffset(yMax, offsetY)
			};
		} else {
			/*
				x="prop1"
				y="prop2"
			*/
			// Not really supported (nothing to connect...)
			return {
				x1: $xGet(d) + getOffset($xGet(d), offsetX),
				y1: $yGet(d) + getOffset($yGet(d), offsetY),
				x2: $xGet(d) + getOffset($xGet(d), offsetX),
				y2: $yGet(d) + getOffset($yGet(d), offsetY)
			};
		}
	});
</script>

<g class="connected-points">
	{#each points as p}
		<Line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} {...$$restProps} />
	{/each}
</g>
