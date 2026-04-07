<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Axis, Bars, Grid } from 'layerchart';
	import { scaleBand } from 'd3-scale';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: { category: string; value: number }[];
		width: number;
		height: number;
		capture?: CaptureTarget;
		onCapture?: (data: CaptureTarget) => void;
	} = $props();
</script>

<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	{data}
	x="category"
	xScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Bars fill="rgb(59, 130, 246)" radius={4} />
</ServerChart>
