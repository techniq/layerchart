<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };
</script>

<BarChart
	{data}
	x="date"
	y="value"
	axis="y"
	padding={defaultChartPadding({ bottom: 10 })}
	height={300}
/>
