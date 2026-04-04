<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Area, Spline } from 'layerchart';
	import CanvasGrid from '../CanvasGrid.svelte';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: { date: number; value: number; value2: number }[];
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
	padding={{ top: 20, right: 20, bottom: 24, left: 24 }}
>
	<CanvasGrid yTicks={5} xTicks={6} />
	<Area y="value2" fill="rgba(249, 115, 22, 0.15)" stroke="none" />
	<Spline y="value2" stroke="rgb(249, 115, 22)" strokeWidth={2} />
	<Area fill="rgba(59, 130, 246, 0.15)" stroke="none" />
	<Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
