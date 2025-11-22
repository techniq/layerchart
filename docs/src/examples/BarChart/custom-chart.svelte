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
	{#snippet children({ context })}
		<g>
			<!-- Custom chart implementation would go here -->
			<text x="50" y="50" class="text-sm fill-surface-content">Custom Chart Implementation</text>
		</g>
	{/snippet}
</BarChart>
