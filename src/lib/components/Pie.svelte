<script lang="ts">
	import { getContext } from 'svelte';
	import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
	import { pie as d3pie } from 'd3-shape';

	import Arc from './Arc.svelte';
	import Group from './Group.svelte';
	import { degreesToRadians } from '$lib/utils/math';
	import { getMotionStore } from '$lib/stores/motionStore';

	/*
    TODO:
    - [ ] Offset (always, on hover)
    - [ ] Labels
    - [ ] Multiple nested circles (zScale, or take in data to override context data).  See Path/Area/Threshold
    - [ ] Hover events / change radii
    - [ ] innerRadius as offset / ratio of outerRadius
      - 10% of outerRadius: maybe if it's less than 1 it's a percentage of outerRadius
        - innerRadius={0.5}
      - `outerRadius - 30`: maybe if value is negative it's computed
        - innerRadius={-30}
  */

	export let data: any = undefined; // TODO: Update Type

	/**
	 * Range [min,max] in degrees.  See also startAngle/endAngle
	 */
	export let range = [0, 360]; // degrees

	/**
	 * Start angle in radians
	 */
	export let startAngle: number = undefined;

	/**
	 * End angle in radians
	 */
	export let endAngle: number = undefined;

	/**
	 * Define innerRadius.
	 *   value >= 1: discrete value
	 *   value >  0: percent of `outerRadius`
	 *   value <  0: offset of `outerRadius`
	 *   default: yRange min
	 */
	export let innerRadius = undefined;

	/**
	 * Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2)
	 */
	export let outerRadius = undefined;

	export let cornerRadius = 0;
	export let padAngle = 0;
	// export let padRadius = 0;

	export let color: string | ((obj: { value: any; item: any; index: number }) => string) = 'black';

	export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	const { data: contextData, x, y, xRange, rGet, config } = getContext('LayerCake');

	$: resolved_endAngle = endAngle ?? degreesToRadians($config.xRange ? $xRange[1] : range[1]);
	let tweened_endAngle = getMotionStore(0, { spring, tweened });
	$: tweened_endAngle.set(resolved_endAngle);

	$: pie = d3pie()
		.startAngle(startAngle ?? degreesToRadians($config.xRange ? $xRange[0] : range[0]))
		.endAngle($tweened_endAngle)
		.padAngle(padAngle)
		.value($x);

	$: arcs = pie(data ?? $contextData);
	// $: console.log({ arcs, $yRange });

	function getColor(item: any, index: number) {
		if (typeof color === 'function') {
			return color({ value: $y(item), item, index });
		} else if ($config.r) {
			return $rGet(item);
		} else {
			return color;
		}
	}
</script>

<Group center>
	{#each arcs as arc, index}
		<Arc
			startAngle={arc.startAngle}
			endAngle={arc.endAngle}
			padAngle={arc.padAngle}
			{innerRadius}
			{outerRadius}
			{cornerRadius}
			fill={getColor(arc.data, index)}
		/>
	{/each}
</Group>
