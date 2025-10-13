<script lang="ts">
	import { Area, AreaChart, LinearGradient } from 'layerchart';
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
	seriesLayout="stack"
	height={300}
>
	{#snippet marks({ series, getAreaProps })}
		{#each series as s, i (s.key)}
			<!-- Can also use basic 'transparent' for second stop for better browser compatibility -->
			<LinearGradient
				stops={s.color
					? [s.color, 'color-mix(in lch, ' + s.color + ' 10%, transparent)']
					: undefined}
				vertical
			>
				{#snippet children({ gradient })}
					<Area {...getAreaProps(s, i)} fill={gradient} />
				{/snippet}
			</LinearGradient>
		{/each}
	{/snippet}
</AreaChart>
