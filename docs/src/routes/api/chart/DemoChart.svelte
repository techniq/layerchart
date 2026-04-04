<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Area, Spline } from 'layerchart';

	let {
		data,
		width,
		height,
		capture,
		_onCapture
	}: {
		data: { date: number; value: number }[];
		width: number;
		height: number;
		capture?: CaptureTarget;
		_onCapture?: (data: CaptureTarget) => void;
	} = $props();
</script>

<ServerChart
	{capture}
	{_onCapture}
	{width}
	{height}
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={{ top: 20, right: 20, bottom: 20, left: 40 }}
>
	<Area fill="rgba(59, 130, 246, 0.2)" stroke="none" />
	<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
