<script lang="ts">
	import { getContext } from 'svelte';
	import { line as d3Line } from 'd3-shape';
	import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';

	const { data: contextData, xGet, yGet, zGet } = getContext('LayerCake');

	// Properties to override what is used from context
	export let data: any = undefined; // TODO: Update Type
	export let x: any = undefined; // TODO: Update Type
	export let y: any = undefined; // TODO: Update Type
	export let pathData: string = undefined;

	export let curve: CurveFactory | CurveFactoryLineOnly = undefined;
	export let defined: Parameters<Line<any>['defined']>[0] = undefined;
	export let color = 'black';
	export let width = undefined;

	let d;
	$: {
		const path = d3Line()
			.x(x ?? $xGet)
			.y(y ?? $yGet);
		if (curve) path.curve(curve);
		if (defined) path.defined(defined);

		d = pathData ?? path(data ?? $contextData);
	}
</script>

<path class="path-line" {d} stroke={color} stroke-width={width} {...$$restProps} />

<style lang="postcss">
	.path-line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
</style>
