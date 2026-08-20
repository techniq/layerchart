<script lang="ts">
	import { rollup, sum } from 'd3-array';
	import { timeDay } from 'd3-time';
	import { Area, Chart, ChartGroup, Layer, LineChart } from 'layerchart';
	import { randomWalk } from '$lib/utils/data.js';

	const regions = ['North', 'South', 'West'];
	const start = timeDay.offset(new Date(), -90);

	const data = regions.flatMap((region) => {
		const walk = randomWalk({ count: 90 });
		const floor = Math.min(...walk);
		return walk.map((value, i) => ({
			region,
			date: timeDay.offset(start, i),
			value: Math.round(120 + (value - floor) * 12)
		}));
	});
	export { data };

	const totals = Array.from(
		rollup(
			data,
			(rows) => sum(rows, (d) => d.value),
			(d) => +d.date
		),
		([date, value]) => ({ date: new Date(date), value })
	).sort((a, b) => +a.date - +b.date);
</script>

<!--
	The brush the other way round: it lives on the total below rather than in a panel, and the
	panels follow it.

	The window narrows the panels by *filtering* rather than by `xDomain` alone.  A domain narrower
	than the data leaves the rows outside it positioned outside their panel, where they'd be drawn
	over the neighbouring one — the panel clip that prevents this is on while a chart is brushing or
	transforming, and this one is doing neither.  Dropping those rows is both the smaller change and
	the one that reads: each panel draws the window, and the shared scales keep the three
	comparable.

	`fxDomain` holds the panels in place, so a window a region has no rows in stays an empty panel
	rather than disappearing.
-->
<ChartGroup>
	{#snippet children({ group })}
		{@const window = group.brush.active ? (group.brush.x as [Date, Date]) : undefined}
		{@const visible = data.filter((d) => group.brush.contains({ x: d.date }))}

		<div class="grid gap-2">
			<LineChart
				data={visible}
				x="date"
				y="value"
				fx="region"
				fxDomain={regions}
				xDomain={window}
				yDomain={[0, null]}
				props={{ xAxis: { ticks: 3 } }}
				padding={{ left: 40, bottom: 24, top: 20 }}
				height={200}
			/>

			<div>
				<div class="text-sm text-surface-content/70">All regions — drag to narrow the panels</div>
				<Chart
					data={totals}
					x="date"
					y="value"
					yDomain={[0, null]}
					brush={{ axis: 'x' }}
					padding={{ left: 40, bottom: 4 }}
					height={64}
				>
					<Layer>
						<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
					</Layer>
				</Chart>
			</div>
		</div>
	{/snippet}
</ChartGroup>
