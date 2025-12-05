<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			value: Math.random() < 0.2 ? null : d.value
		};
	});
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	points
	padding={{ ...defaultChartPadding(), right: 10 }}
	height={300}
/>
