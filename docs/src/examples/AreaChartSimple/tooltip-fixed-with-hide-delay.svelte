<script lang="ts">
	import { accessor, AreaChart, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

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
		{ key: 'bananas', color: 'var(--color-success)' },
		{ key: 'oranges', color: 'var(--color-warning)' }
	]}
	props={{ tooltip: { context: { hideDelay: 500 } } }}
	height={300}
>
	{#snippet tooltip({ context, setHighlightKey, series })}
		<Tooltip.Root x="data" y={context.height + 24} pointerEvents>
			{#snippet children({ data })}
				<Tooltip.Header>
					{format(context.x(data), 'day')}
				</Tooltip.Header>

				<Tooltip.List>
					{#each series as s}
						{@const valueAccessor = accessor(s.value ?? s.key)}
						{@const value = valueAccessor(data)}
						<Tooltip.Item
							label={s.key}
							color={s.color}
							onpointerenter={() => setHighlightKey(s.key)}
							onpointerleave={() => setHighlightKey(null)}
						>
							{format(value)}
						</Tooltip.Item>
					{/each}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</AreaChart>
