<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	xNice
	padding={defaultChartPadding({ top: 25, right: 10 })}
	height={300}
	points
	labels={{ placement: 'smart' }}
/>
