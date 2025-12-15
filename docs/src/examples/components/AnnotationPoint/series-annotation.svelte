<script lang="ts">
	import { AnnotationPoint, LineChart, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	padding={{ ...defaultChartPadding(), right: 45, bottom: 15, left: 25 }}
	height={300}
>
	{#snippet aboveMarks({ context })}
		{@const lastPoint = data[data.length - 1]}
		<AnnotationPoint
			x={lastPoint.date}
			y={lastPoint.value}
			label="Apple"
			labelPlacement="right"
			labelXOffset={4}
			props={{
				circle: { class: 'fill-apples' },
				label: { class: 'fill-apples font-bold' }
			}}
		/>
	{/snippet}
</LineChart>
