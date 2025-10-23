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
		{ key: 'baseline', color: 'var(--color-surface-content)', props: { fillOpacity: 0.2 } },
		{
			key: 'value',
			color: 'var(--color-primary)',
			props: { insets: { x: 8 } }
		}
	]}
	height={300}
/>
