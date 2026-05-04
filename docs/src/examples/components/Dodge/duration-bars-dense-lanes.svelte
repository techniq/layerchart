<script module lang="ts">
	import { getUsEvents } from '$lib/data.remote';
	const data = await getUsEvents();
</script>

<script lang="ts">
	import { Chart, Dodge, Rect, Tooltip } from 'layerchart';
	import { Duration } from 'svelte-ux';

	export { data };
</script>

<Chart
	{data}
	x={['startDate', 'endDate']}
	xNice
	padding={{ top: 12, bottom: 24, left: 10, right: 25 }}
	height={300}
	axis="x"
	grid={{ x: true }}
	props={{ tooltip: { context: { mode: 'bounds' } } }}
>
	{#snippet marks({ context })}
		{@const rowHeight = 40}
		{@const rowPadding = 10}
		{@const barHeight = rowHeight - rowPadding}
		{@const startX = (d: { startDate: Date }) => context.xScale(d.startDate)}
		{@const endX = (d: { endDate: Date }) => context.xScale(d.endDate)}

		<Dodge
			{data}
			axis="y"
			anchor="top"
			padding={2}
			{rowHeight}
			position={(d) => (startX(d) + endX(d)) / 2}
			r={(d) => (endX(d) - startX(d)) / 2}
		>
			{#snippet children({ items })}
				{#each items as { data: ev, y, index } (index)}
					<Rect
						x={startX(ev)}
						y={y - barHeight / 2}
						width={endX(ev) - startX(ev)}
						height={barHeight}
						rx={3}
						class="fill-primary"
						onpointermove={(e) => context.tooltip.show(e, ev)}
						onpointerleave={context.tooltip.hide}
					/>
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.event}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="start" value={data.startDate} valueAlign="right" format="day" />
					<Tooltip.Item label="end" value={data.endDate} valueAlign="right" format="day" />
					<Tooltip.Separator />
					<Tooltip.Item label="duration" valueAlign="right">
						<Duration start={data.startDate} end={data.endDate} totalUnits={2} />
					</Tooltip.Item>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
