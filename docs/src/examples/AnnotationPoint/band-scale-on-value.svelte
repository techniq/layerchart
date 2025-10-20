<script lang="ts">
	import { AnnotationPoint, BarChart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

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
	{#snippet aboveContext({ context })}
		<Layer>
			<AnnotationPoint
				x={dateSeriesData[3].date}
				y={dateSeriesData[3].value}
				r={4}
				label="Featured"
				labelPlacement="top"
				props={{
					circle: { class: 'fill-secondary' },
					label: { class: 'text-xs fill-secondary font-bold' }
				}}
			/>
		</Layer>
	{/snippet}
</BarChart>
