<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { timeMinute, timeDay } from 'd3-time';
	import { Duration } from 'svelte-ux';
	import { BarChart, Tooltip } from 'layerchart';
	import { getRandomInteger } from '$lib/utils/data.js';
	import { applyLanes } from 'layerchart';

	const count = 10;
	const now = timeDay.floor(new Date());
	let lastStartDate = now;

	const generatedData = Array.from({ length: count }).map((_, i) => {
		const startDate = timeMinute.offset(lastStartDate, getRandomInteger(0, 60));
		const endDate = timeMinute.offset(startDate, getRandomInteger(0, 60));
		lastStartDate = startDate;
		return {
			name: `Item ${i + 1}`,
			startDate,
			endDate
		};
	});

	const data = applyLanes(generatedData, { start: 'startDate', end: 'endDate' });

	export { data };
</script>

<BarChart
	{data}
	x={['startDate', 'endDate']}
	xScale={scaleTime()}
	y="lane"
	c="name"
	cRange={[
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-success)',
		'var(--color-info)'
	]}
	axis="x"
	grid={{ x: true, y: false, bandAlign: 'between' }}
	rule={false}
	orientation="horizontal"
	padding={{ left: 36, bottom: 36 }}
	height={300}
	props={{ tooltip: { context: { mode: 'bounds' } } }}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="start" value={data.startDate} format="day" />
					<Tooltip.Item label="end" value={data.endDate} format="day" />
					<Tooltip.Separator />
					<Tooltip.Item label="duration" valueAlign="right">
						<Duration start={data.startDate} end={data.endDate} totalUnits={2} />
					</Tooltip.Item>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
