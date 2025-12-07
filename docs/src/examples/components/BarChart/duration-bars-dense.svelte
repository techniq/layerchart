<script lang="ts">
	import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
	import { scaleTime } from 'd3-scale';
	import { Duration } from 'svelte-ux';
	import { getUsEvents } from '$lib/data.remote';

	const data = await getUsEvents();
	export { data };
</script>

<BarChart
	{data}
	x={['startDate', 'endDate']}
	xScale={scaleTime()}
	y="event"
	axis="x"
	grid={{ x: true, y: false, bandAlign: 'between' }}
	rule={false}
	orientation="horizontal"
	padding={{ ...defaultChartPadding(), right: 25 }}
	height={300}
>
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
</BarChart>
