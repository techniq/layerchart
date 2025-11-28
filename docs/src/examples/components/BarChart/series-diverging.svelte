<script lang="ts">
	import { BarChart } from 'layerchart';
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
	series={[
		{
			key: 'value',
			color: 'var(--color-primary)'
		},
		{
			key: 'baseline',
			value: (d) => -d.baseline,
			color: 'var(--color-secondary)'
		}
	]}
	height={300}
/>
