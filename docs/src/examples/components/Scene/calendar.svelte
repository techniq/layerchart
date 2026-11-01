<script lang="ts">
	import { scaleBand, scaleThreshold } from 'd3-scale';
	import { range } from 'd3-array';
	import { timeWeek, timeYear } from 'd3-time';
	import { Bars, Chart, Scene, Tooltip } from '@layerchart/3d';
	import { createDateSeries } from '$lib/utils/data.js';

	const end = new Date();
	const start = timeWeek.floor(timeYear.offset(end, -1));

	const data = createDateSeries({ count: 365, min: 0, max: 20, value: 'integer' }).map((d) => ({
		...d,
		// Some days off
		value: Math.random() > 0.25 ? d.value : 0
	}));

	export { data };

	const week = (d: { date: Date }) => timeWeek.count(start, d.date);
</script>

<!-- A year of days, each as tall as its count: weeks across, Sundays at the back -->
<Chart
	{data}
	x={week}
	xScale={scaleBand()}
	xDomain={range(54)}
	y={(d) => d.date.getDay()}
	yScale={scaleBand()}
	yDomain={range(7)}
	c="value"
	cScale={scaleThreshold().unknown('var(--color-surface-200)')}
	cDomain={[1, 5, 10, 15]}
	cRange={['var(--color-surface-200)', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
	z="value"
	zDomain={[0, 20]}
	zRange={[0, 60]}
	tooltipContext
	height={260}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene rotate={-20} tilt={55} margin={0} scrollActivationKey="shift">
		<!-- Every day a thin tile on the floor, so days off still show -->
		<Bars z={1.5} insets={1} fill="var(--color-surface-200)" />
		<Bars insets={1} tooltip />
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="contributions" value={data.value ?? 0} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
