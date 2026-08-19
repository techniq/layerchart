<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };
</script>

<!--
	Each area is drawn from the axis rather than from the one below it, so the series are compared
	against each other rather than read as a total. The fills are translucent so the overlaps show.
-->
<AreaChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	]}
	seriesLayout="overlap"
	padding={defaultChartPadding({ right: 10 })}
	height={300}
/>
