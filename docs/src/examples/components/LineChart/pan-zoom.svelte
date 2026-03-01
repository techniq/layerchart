<script lang="ts">
	import { Axis, Chart, ChartClipPath, Layer, Spline, defaultChartPadding } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	transform={{ mode: 'domain', axis: 'x' }}
	clip
	padding={defaultChartPadding({ right: 10 })}
	height={300}
>
	<TransformContextControls show={['zoomIn', 'zoomOut', 'reset']} placement="top-right" />
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<ChartClipPath>
			<Spline class="stroke-primary stroke-2" />
		</ChartClipPath>
	</Layer>
</Chart>
