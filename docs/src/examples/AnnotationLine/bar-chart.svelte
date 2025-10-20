<script lang="ts">
	import { AnnotationLine, BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/genData.js';

	const dateSeriesData = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { dateSeriesData as data };
</script>

<BarChart data={dateSeriesData} x="date" y="value" height={300}>
	{#snippet aboveMarks({ context })}
		<AnnotationLine
			y={50}
			label="Avg"
			props={{
				line: { class: '[stroke-dasharray:2,2] stroke-danger' },
				label: { class: 'fill-danger' }
			}}
		/>
	{/snippet}
</BarChart>
