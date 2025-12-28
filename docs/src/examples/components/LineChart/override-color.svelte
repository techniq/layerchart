<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			visits: d.value
		};
	});
	export { data };
</script>

<LineChart
	{data}
	x="date"
	series={[{ key: 'value', color: 'var(--color-secondary)' }]}
	padding={defaultChartPadding({ right: 10 })}
	height={300}
/>
