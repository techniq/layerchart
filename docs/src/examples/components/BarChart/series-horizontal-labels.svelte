<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 2,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };
</script>

<BarChart
	{data}
	y="date"
	orientation="horizontal"
	series={[
		{ key: 'baseline', color: 'var(--color-surface-content)', props: { fillOpacity: 0.2 } },
		{ key: 'value', color: 'var(--color-primary)', props: { insets: { y: 4 } } }
	]}
	labels={{ seriesKey: 'value', placement: 'inside', fill: 'white' }}
	padding={defaultChartPadding({ left: 30, right: 25 })}
	height={200}
/>
