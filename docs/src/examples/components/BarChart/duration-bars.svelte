<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { timeMinute, timeDay } from 'd3-time';
	import { Duration } from 'svelte-ux';
	import { BarChart, Tooltip } from 'layerchart';
	import { getRandomInteger } from '$lib/utils/data.js';

	const count = 10;
	const now = timeDay.floor(new Date());
	let lastStartDate = now;

	const data = Array.from({ length: count }).map((_, i) => {
		const startDate = timeMinute.offset(lastStartDate, getRandomInteger(0, 60));
		const endDate = timeMinute.offset(startDate, getRandomInteger(0, 60));
		lastStartDate = startDate;
		return {
			name: `Item ${i + 1}`,
			startDate,
			endDate
		};
	});

	export { data };
</script>

<BarChart
	{data}
	x={['startDate', 'endDate']}
	xScale={scaleTime()}
	y="name"
	grid={{ x: false, y: true, bandAlign: 'between' }}
	orientation="horizontal"
	padding={{ left: 36, bottom: 36 }}
	height={300}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="start"
						value={data.startDate}
						format={{ type: 'time', options: { variant: 'short' } }}
					/>
					<Tooltip.Item
						label="end"
						value={data.endDate}
						format={{ type: 'time', options: { variant: 'short' } }}
					/>
					<Tooltip.Separator />
					<Tooltip.Item label="duration" valueAlign="right">
						<Duration start={data.startDate} end={data.endDate} totalUnits={2} />
					</Tooltip.Item>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
