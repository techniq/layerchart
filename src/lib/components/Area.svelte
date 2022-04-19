<script lang="ts">
	import { getContext } from 'svelte';
	import type { tweened as tweenedStore } from 'svelte/motion';
	import { Area, area as d3Area } from 'd3-shape';
	import type { CurveFactory } from 'd3-shape';

	import { interpolatePath } from 'd3-interpolate-path';

	import { createMotionStore } from '$lib/stores/motionStore';

	import Path from './Path.svelte';

	const { data: contextData, xGet, yGet, yRange } = getContext('LayerCake');

	// Properties to override what is used from context
	export let data: any = undefined; // TODO: Update Type
	export let x: any = undefined; // TODO: Update Type
	export let y0: any = undefined; // TODO: Update Type
	export let y1: any = undefined; // TODO: Update Type
	export let pathData: string = undefined;
	export let clipPath: string = undefined;
	export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

	export let curve: CurveFactory = undefined;
	export let defined: Parameters<Area<any>['defined']>[0] = undefined;
	export let color = 'var(--color-blue-500)';
	export let opacity = 0.3;
	export let line: boolean | any = false;

	$: tweenedOptions = tweened ? { interpolate: interpolatePath, ...tweened } : false;
	$: tweened_d = createMotionStore('', { tweened: tweenedOptions });
	$: {
		const path = d3Area()
			.x(x ?? $xGet)
			.y0(y0 ?? $yRange[0])
			.y1(y1 ?? $yGet);
		if (curve) path.curve(curve);
		if (defined) path.defined(defined);

		const d = pathData ?? path(data ?? $contextData);
		tweened_d.set(d);
	}
</script>

{#if line}
	<Path {curve} {defined} {color} {tweened} {...line} />
{/if}

<path
	class="path-area"
	d={$tweened_d}
	clip-path={clipPath}
	fill={color}
	fill-opacity={opacity}
	{...$$restProps}
/>
