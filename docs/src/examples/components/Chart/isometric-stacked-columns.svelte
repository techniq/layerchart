<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Frame, Grid, Layer, Legend } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };
</script>

<!-- Years across the floor, each basket a row into the depth — and the values standing up along
     `z`, where the chart stacks each year's basket by fruit.  The fruit colors at full strength:
     the docs' see-through ones would show each box's insides -->
<Chart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.3)}
	y="basket"
	yScale={scaleBand().paddingInner(0.5)}
	z="value"
	valueAxis="z"
	zRange={({ height }) => [0, height * 1.2]}
	c="fruit"
	cRange={[
		'var(--color-green-500)',
		'var(--color-yellow-500)',
		'var(--color-red-500)',
		'var(--color-purple-500)'
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
		<Bars strokeWidth={1} class="stroke-surface-100/40" />
	</Layer>

	<Legend placement="top-left" variant="swatches" />
</Chart>
