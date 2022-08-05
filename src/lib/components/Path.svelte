<script lang="ts">
	/*
		TODO:
		- [ ] Show path progressively show / animated in on load.  Also fix sliding in from left side (at last in from bottom)
	*/
	import { getContext } from 'svelte';
	import type { tweened as tweenedStore } from 'svelte/motion';
	import { line as d3Line } from 'd3-shape';
	import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';
	// import { interpolateString } from 'd3-interpolate';
	import { interpolatePath } from 'd3-interpolate-path';

	import { motionStore } from '$lib/stores/motionStore';

	const { data: contextData, xGet, yGet } = getContext('LayerCake');

	// Properties to override what is used from context
	export let data: any = undefined; // TODO: Update Type
	export let x: any = undefined; // TODO: Update Type
	export let y: any = undefined; // TODO: Update Type
	export let pathData: string = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	export let curve: CurveFactory | CurveFactoryLineOnly = undefined;
	export let defined: Parameters<Line<any>['defined']>[0] = undefined;
	export let color = 'black';
	export let width = undefined;

	$: tweenedOptions = tweened ? { interpolate: interpolatePath, ...tweened } : false;
	$: tweened_d = motionStore('', { tweened: tweenedOptions });
	$: {
		const path = d3Line()
			.x(x ?? $xGet)
			.y(y ?? $yGet);
		if (curve) path.curve(curve);
		if (defined) path.defined(defined);

		const d = pathData ?? path(data ?? $contextData);
		tweened_d.set(d);
	}
</script>

<path class="path-line" d={$tweened_d} stroke={color} stroke-width={width} {...$$restProps} />

<style lang="postcss">
	.path-line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
</style>
