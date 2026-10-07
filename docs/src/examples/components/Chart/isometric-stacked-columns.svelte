<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Cell, Chart, Frame, Grid, Layer, Legend, type ChartState } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };

	const fruits = ['apples', 'bananas', 'cherries', 'grapes'];

	// The rows the legend leaves showing, stacked by fruit within each year's basket — so hiding a
	// fruit closes its gap
	let context = $state<ChartState<(typeof data)[number], any, any>>();
	const stacks = $derived.by(() => {
		const tops = new Map<string, number>();
		const shown = [...((context?.data as typeof data | undefined) ?? data)].sort(
			(a, b) => fruits.indexOf(a.fruit) - fruits.indexOf(b.fruit)
		);
		return new Map(
			shown.map((d) => {
				const stack = `${d.year}-${d.basket}`;
				const start = tops.get(stack) ?? 0;
				tops.set(stack, start + d.value);
				return [d, [start, start + d.value] as [number, number]];
			})
		);
	});
	const tallest = $derived(Math.max(...[...stacks.values()].map(([, end]) => end)));
</script>

<!-- Years across the floor, each basket a row into the depth, its fruit stacked up off it -->
<Chart
	bind:context
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.3)}
	y="basket"
	yScale={scaleBand().paddingInner(0.5)}
	z={(d) => stacks.get(d) ?? [0, 0]}
	zDomain={[0, tallest]}
	zRange={({ height }) => [0, height * 1.2]}
	c="fruit"
	cDomain={fruits}
	cRange={[
		'var(--color-apples)',
		'var(--color-bananas)',
		'var(--color-cherries)',
		'var(--color-grapes)'
	]}
	isometric={{ rotate: -25, tilt: 65 }}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={{ top: 24, bottom: 40, left: 40, right: 24 }}
	height={500}
	clip
>
	<TransformContextControls />

	<Layer>
		<Frame class="fill-surface-content/3 stroke-surface-content/20" />
		<Grid z />
		<Axis placement="bottom" format="none" tickLabelProps={{ viewport: true }} />
		<Axis placement="left" format={(d) => `Basket ${d}`} tickLabelProps={{ viewport: true }} />
		<Axis placement="back" format="metric" />
		<Cell x="year" y="basket" fill="fruit" class="stroke-surface-100/40" />
	</Layer>

	<Legend placement="top-left" variant="swatches" />
</Chart>
