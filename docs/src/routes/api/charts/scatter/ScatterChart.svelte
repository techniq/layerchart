<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Axis, Grid, Points } from 'layerchart';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: { x: number; y: number }[];
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
	x="x"
	y="y"
	padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
	<Grid y stroke="rgba(0,0,0,0.1)" />
	<Axis placement="bottom" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Axis placement="left" rule stroke="rgba(0,0,0,0.3)" fill="rgba(0,0,0,0.5)" />
	<Points fill="rgba(59, 130, 246, 0.6)" stroke="rgb(59, 130, 246)" strokeWidth={1} r={5} />
</ServerChart>
