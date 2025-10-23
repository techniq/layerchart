<script lang="ts">
	import { BarChart, Highlight } from 'layerchart';
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

<BarChart {data} x="date" y="value" props={{ highlight: { area: false } }} height={300}>
	{#snippet belowMarks()}
		<Highlight area={{ class: 'fill-surface-content/10' }} />
	{/snippet}
</BarChart>
