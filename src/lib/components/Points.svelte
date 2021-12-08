<script lang="ts">
	import { getContext } from 'svelte';

	import Circle from './Circle.svelte';

	const context = getContext('LayerCake') as any;
	const { data, xGet, yGet, config } = context;

	type Offset = number | ((value: number, context: any) => number);

	export let r = 5;
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
			return $xGet(d).map((x) => {
				return {
					x: x + getOffset(x, offsetX),
					y: $yGet(d) + getOffset($yGet(d), offsetY)
				};
			});
		} else if (Array.isArray($config.y)) {
			/*
				x="prop1"
				y={["prop2" ,"prop3"]}
			*/
			return $yGet(d).map((y) => {
				return {
					x: $xGet(d) + getOffset($xGet(d), offsetX),
					y: y + getOffset(y, offsetY)
				};
			});
		} else {
			/*
				x="prop1"
				y="prop2"
			*/
			return {
				x: $xGet(d) + getOffset($xGet(d), offsetX),
				y: $yGet(d) + getOffset($yGet(d), offsetY)
			};
		}
	});
</script>

<g class="point-group">
	{#each points as p}
		<Circle cx={p.x} cy={p.y} {r} {...$$restProps} />
	{/each}
</g>
