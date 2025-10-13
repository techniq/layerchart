<script lang="ts">
	import { accessor, AreaChart, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';
	import { Button, Kbd } from 'svelte-ux';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };

	let lockedTooltip = $state(false);
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
	props={{ tooltip: { context: { locked: lockedTooltip } } }}
	height={300}
>
	{#snippet tooltip({ context, setHighlightKey, series })}
		<Tooltip.Root pointerEvents>
			{#snippet children({ data })}
				<Tooltip.Header>
					{format(context.x(data), 'day')}
				</Tooltip.Header>

				<Tooltip.List>
					{#each series as s}
						{@const valueAccessor = accessor(s.value ?? s.key)}
						{@const value = Math.abs(valueAccessor(data))}
						<Tooltip.Item
							label={s.key}
							color={s.color}
							onpointerenter={() => setHighlightKey(s.key)}
							onpointerleave={() => setHighlightKey(null)}
						>
							{format(value)}

							<Button
								variant="fill-light"
								size="sm"
								class="ml-2"
								on:click={() => {
									console.log(
										'You clicked on the "' + s.key + '" series with value:"' + value + '"'
									);
								}}
							>
								Click me
							</Button>
						</Tooltip.Item>
					{/each}
				</Tooltip.List>

				<Tooltip.Separator />

				<div class="text-xs">
					Lock position with <Kbd command /> and view console
				</div>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</AreaChart>

<svelte:window
	onkeydown={(e) => {
		if (e.metaKey) {
			lockedTooltip = true;
		}
	}}
	onkeyup={(e) => {
		if (!e.metaKey) {
			lockedTooltip = false;
		}
	}}
/>
