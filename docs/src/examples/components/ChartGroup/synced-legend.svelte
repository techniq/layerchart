<script lang="ts">
	import { AreaChart, ChartGroup, LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	];

	const padding = defaultChartPadding({ legend: true, right: 10 });
</script>

<ChartGroup>
	<div class="grid gap-2">
		<LineChart {data} x="date" {series} {padding} height={200} />
		<AreaChart {data} x="date" {series} seriesLayout="stack" {padding} height={200} legend />
	</div>
</ChartGroup>
