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

<BarChart {data} x="date" y="value" height={300}>
	{#snippet tooltip({ context })}
		<div class="bg-surface-100 p-2 rounded shadow-lg border">
			<div class="font-semibold">Custom Tooltip</div>
			<div>Date: {context.data.date?.toLocaleDateString()}</div>
			<div>Value: {context.data.value}</div>
		</div>
	{/snippet}
</BarChart>
