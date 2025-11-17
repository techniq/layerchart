<script lang="ts">
	import { LineChart } from 'layerchart';
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

<div class="flex justify-center">
	<LineChart
		{data}
		y="date"
		series={[
			{ key: 'apples', color: 'var(--color-danger)' },
			{
				key: 'bananas',
				color: 'var(--color-success)'
			},
			{
				key: 'oranges',
				color: 'var(--color-warning)'
			}
		]}
		orientation="vertical"
		padding={20}
		height={600}
		width={400}
	/>
</div>
