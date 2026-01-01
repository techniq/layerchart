<script lang="ts">
	import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();

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
		<AnnotationRange
			x={[new Date('2011-01-01'), new Date('2011-06-30')]}
			gradient={{
				class: 'from-danger/30 to-danger/1',
				vertical: true
			}}
		/>
	{/snippet}
</LineChart>
