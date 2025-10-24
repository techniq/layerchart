<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { Duration } from 'svelte-ux';
	import { BarChart, Bars, Tooltip } from 'layerchart';
	import { getCivilizationEvents } from '$lib/data.remote.js';

	const data = getCivilizationEvents();

	export { data };
</script>

<BarChart
	{data}
	x={['start', 'end']}
	xScale={scaleTime()}
	y="name"
	grid={{ x: false, y: true, bandAlign: 'between' }}
	orientation="horizontal"
	padding={{ left: 120, bottom: 36 }}
	props={{
		highlight: {
			axis: 'x',
			area: true,
			bars: true
		}
	}}
	height={300}
>
	{#snippet marks()}
		<Bars />
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="start"
						value={data.start}
						format={{ type: 'time', options: { variant: 'medium' } }}
					/>
					<Tooltip.Item
						label="end"
						value={data.end}
						format={{ type: 'time', options: { variant: 'medium' } }}
					/>
					<Tooltip.Separator />
					<Tooltip.Item label="duration" valueAlign="right">
						<Duration start={data.start} end={data.end} totalUnits={2} />
					</Tooltip.Item>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
