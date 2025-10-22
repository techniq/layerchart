<script lang="ts">
	import { AnnotationRange, BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	let { data } = $props();

	const dateSeriesData = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<BarChart data={dateSeriesData} x="date" y="value" height={300}>
	{#snippet belowMarks({ context })}
		<AnnotationRange
			x={[dateSeriesData[2].date, dateSeriesData[2].date]}
			pattern={{
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.2
				}
			}}
		/>
	{/snippet}
</BarChart>
