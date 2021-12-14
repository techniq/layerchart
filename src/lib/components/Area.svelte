<script lang="ts">
	import { getContext } from 'svelte';
	import { area as d3Area } from 'd3-shape';
	import type { CurveFactory } from 'd3-shape';

	import Path from './Path.svelte';

	const { data: contextData, xGet, yGet, yRange } = getContext('LayerCake');

	// Properties to override what is used from context
	export let data: any = undefined; // TODO: Update Type
	export let x: any = undefined; // TODO: Update Type
	export let y0: any = undefined; // TODO: Update Type
	export let y1: any = undefined; // TODO: Update Type
	export let pathData: string = undefined;
	export let clipPath: string = undefined;

	export let curve: CurveFactory = undefined;
	export let defined: Parameters<typeof path.defined>[0] = undefined;
	export let color = 'var(--color-blue-500)';
	export let opacity = 0.3;
	export let line: boolean | any = false;

	// TODO: Add tweened prop.  See Path

	$: path = d3Area()
		.x(x ?? $xGet)
		.y0(y0 ?? $yRange[0])
		.y1(y1 ?? $yGet);
	$: if (curve) path.curve(curve);
	$: if (defined) path.defined(defined);
</script>

{#if line}
	<Path {curve} {defined} {color} {...line} />
{/if}

<path
	class="path-area"
	d={pathData ?? path(data ?? $contextData)}
	clip-path={clipPath}
	fill={color}
	fill-opacity={opacity}
	{...$$restProps}
/>
