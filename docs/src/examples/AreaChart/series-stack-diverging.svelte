<script lang="ts">
	import { AreaChart } from 'layerchart';
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

<AreaChart
	{data}
	x="date"
	series={[
		{ key: 'apples', value: (d) => -d.apples, color: 'var(--color-danger)' },
		{
			key: 'bananas',
			color: 'var(--color-success)'
		},
		{
			key: 'oranges',
			color: 'var(--color-warning)'
		}
	]}
	seriesLayout="stackDiverging"
	height={300}
/>
