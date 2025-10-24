<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { Duration } from 'svelte-ux';
	import { BarChart, Tooltip } from 'layerchart';
	import { getUsEvents } from '$lib/data.remote';
	import { applyLanes } from 'layerchart/utils/array.js';

	const usEvents = await getUsEvents();
	const data = applyLanes(usEvents, { start: 'startDate', end: 'endDate' });

	export { data };
</script>

<BarChart
	{data}
	x={['startDate', 'endDate']}
	xScale={scaleTime()}
	y="lane"
	axis="x"
	grid={{ x: true, y: false, bandAlign: 'between' }}
	rule={false}
	orientation="horizontal"
	padding={{ bottom: 36 }}
	height={300}
	props={{ tooltip: { context: { mode: 'bounds' } } }}
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
