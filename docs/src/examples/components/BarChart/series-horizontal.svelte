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
	y="date"
	orientation="horizontal"
	series={[
		{ key: 'baseline', color: 'var(--color-surface-content)', props: { fillOpacity: 0.2 } },
		{ key: 'value', color: 'var(--color-primary)', props: { insets: { y: 4 } } }
	]}
	height={400}
/>
