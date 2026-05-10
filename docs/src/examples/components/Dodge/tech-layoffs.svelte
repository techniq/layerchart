<script module lang="ts">
	import { getLayoffs } from '$lib/data.remote';
	import { sortFunc } from '@layerstack/utils';

	const all = await getLayoffs();
	// Only events with a known headcount, then largest first so smaller ones nestle in.
	const data = [...all]
		.filter((d) => d.totalLaidOff != null && d.totalLaidOff > 0)
		.sort(sortFunc('totalLaidOff', 'desc')) as Array<
		import('$lib/data.remote').Layoff & { totalLaidOff: number }
	>;
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Text, Tooltip } from 'layerchart';

	export { data };

	// Annotate companies with ≥5,000 announced layoffs.
	const labelThreshold = 5_000;
</script>

<Chart
	{data}
	x="date"
	r="totalLaidOff"
	rRange={[1, 20]}
	padding={{ top: 12, bottom: 24, left: 12, right: 12 }}
	height={1000}
	axis={{ placement: 'bottom', rule: true }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="bottom" padding={1}>
			{#snippet children({ items })}
				{#each items as { data: layoff, x, y, r, index } (index)}
					<Circle
						cx={x}
						cy={y}
						{r}
						class="fill-danger/30 stroke-danger"
						onpointermove={(e) => context.tooltip.show(e, layoff)}
						onpointerleave={context.tooltip.hide}
					/>
				{/each}
				{#each items.filter((d) => d.data.totalLaidOff >= labelThreshold) as { data: layoff, x, y, r, index } (index)}
					<Text
						{x}
						{y}
						value={layoff.company}
						textAnchor="middle"
						verticalAnchor="middle"
						fontSize={10}
						stroke="var(--color-surface-100)"
						strokeWidth={3}
						class="pointer-events-none"
					/>
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.company}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Date" value={data.date} format="day" />
					<Tooltip.Item label="Laid off" value={data.totalLaidOff} format="integer" />
					{#if data.percentageLaidOff != null}
						<Tooltip.Item
							label="Of workforce"
							value={data.percentageLaidOff}
							format="percentRound"
						/>
					{/if}
					<Tooltip.Item label="Industry" value={data.industry} />
					<Tooltip.Item label="Location" value={data.location} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
