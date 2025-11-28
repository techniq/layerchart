<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const dateSeriesData = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	const dateSeriesBaselineData = dateSeriesData.map((d) => ({ ...d, value: d.baseline }));

	const data = { dateSeriesData, dateSeriesBaselineData };

	export { data };
</script>

<BarChart
	x="date"
	y="value"
	series={[
		{
			key: 'baseline',
			data: dateSeriesBaselineData,
			color: 'var(--color-surface-content)',
			props: { fillOpacity: 0.2 }
		},
		{
			key: 'value',
			data: dateSeriesData,
			color: 'var(--color-primary)',
			props: { insets: { x: 8 } }
		}
	]}
	height={300}
/>
