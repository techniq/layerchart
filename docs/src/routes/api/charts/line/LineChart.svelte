<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Axis, Grid, Spline } from 'layerchart';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: { date: number; value: number }[];
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
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
