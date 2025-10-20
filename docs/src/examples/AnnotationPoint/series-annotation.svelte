<script lang="ts">
	import { AnnotationPoint, defaultChartPadding, LineChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());

	export { data };
</script>

<LineChart {data} x="date" y="value" padding={{ ...defaultChartPadding(), right: 40 }} height={300}>
	{#snippet aboveMarks({ context })}
		{@const lastPoint = data[data.length - 1]}
		<AnnotationPoint
			x={lastPoint.date}
			y={lastPoint.value}
			label="Apple"
			labelPlacement="right"
			labelXOffset={4}
			props={{
				circle: { class: 'fill-primary' },
				label: { class: 'fill-primary font-bold' }
			}}
		/>
	{/snippet}
</LineChart>
