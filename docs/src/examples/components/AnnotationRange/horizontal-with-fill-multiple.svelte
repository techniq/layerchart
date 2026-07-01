<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';

	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	height={300}
	padding={defaultChartPadding({ left: 25, bottom: 15 })}
>
	{#snippet belowMarks({ context })}
		<AnnotationRange y={[0, 400]} class="fill-success/10" />
		<AnnotationRange y={[400, 600]} class="fill-warning/10" />
		<AnnotationRange y={[600, null]} class="fill-danger/10" />
	{/snippet}
</LineChart>
