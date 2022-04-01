<script lang="ts">
	import { getContext } from 'svelte';

	import Circle from './Circle.svelte';
	import { isScaleBand } from '../utils/scales';
	import type { ScaleBand } from 'd3-scale';

	const context = getContext('LayerCake') as any;
	const { data, xGet, yGet, xScale, yScale, config } = context;

	type Offset = number | ((value: number, context: any) => number);

	export let r = 5;
	export let offsetX: Offset = undefined;
	export let offsetY: Offset = undefined;

	function getOffset(value, offset: Offset, scale: any) {
		if (typeof offset === 'function') {
			return offset(value, context);
		} else if (offset != null) {
			return offset;
		} else if (isScaleBand(scale)) {
			return scale.bandwidth() / 2;
		} else {
			return 0;
		}
	}

	$: points = $data.flatMap((d) => {
		if (Array.isArray($config.x)) {
			/*
				x={["prop1" ,"prop2"]}
				y="prop3"
			*/
			return $xGet(d).map((x) => {
				return {
					x: x + getOffset(x, offsetX, $xScale),
					y: $yGet(d) + getOffset($yGet(d), offsetY, $yScale)
				};
			});
		} else if (Array.isArray($config.y)) {
			/*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
			return $yGet(d).map((y) => {
				return {
					x: $xGet(d) + getOffset($xGet(d), offsetX, $xScale),
					y: y + getOffset(y, offsetY, $yScale)
				};
			});
		} else {
			/*
				x="prop1"
				y="prop2"
			*/
			return {
				x: $xGet(d) + getOffset($xGet(d), offsetX, $xScale),
				y: $yGet(d) + getOffset($yGet(d), offsetY, $yScale)
			};
		}
	});
</script>

<g class="point-group">
	{#each points as p}
		<Circle cx={p.x} cy={p.y} {r} {...$$restProps} />
	{/each}
</g>
