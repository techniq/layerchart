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
		{ key: 'apples', label: 'Apples 🍎 ', color: 'var(--color-danger)' },
		{
			key: 'bananas',
			label: 'Bananas 🍌',
			color: 'var(--color-success)'
		},
		{
			key: 'oranges',
			label: 'Oranges 🍊',
			color: 'var(--color-warning)'
		}
	]}
	seriesLayout="stack"
	height={300}
	legend
/>
