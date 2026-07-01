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
		<AnnotationRange
			x={[new Date('2010-01-01'), new Date('2010-12-31')]}
			pattern={{
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}}
		/>
	{/snippet}
</LineChart>
