<script lang="ts">
	import { BarChart, LinearGradient, Bars } from 'layerchart';
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
	{#snippet marks({ series, getBarsProps })}
		{#each series as s, i (s.key)}
			<LinearGradient class="from-blue-500 to-green-400" vertical units="userSpaceOnUse">
				{#snippet children({ gradient })}
					<Bars {...getBarsProps(s, i)} fill={gradient} />
				{/snippet}
			</LinearGradient>
		{/each}
	{/snippet}
</BarChart>
