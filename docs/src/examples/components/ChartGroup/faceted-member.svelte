<script lang="ts">
	import { ChartGroup, LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { rollup, sum } from 'd3-array';

	const regions = ['North', 'South', 'West'];

	// One series per region, over the same days
	const data = regions.flatMap((region) =>
		createDateSeries({ count: 30, min: 100, max: 400, value: 'integer', keys: ['value'] }).map(
			(d) => ({
				...d,
				region
			})
		)
	);

	const totals = Array.from(
		rollup(
			data,
			(rows) => sum(rows, (d) => d.value),
			(d) => +d.date
		),
		([date, value]) => ({ date: new Date(date), value })
	).sort((a, b) => +a.date - +b.date);

	export { data };
</script>

<!--
	The two live together: the faceted chart is a single member of the group — one `Chart`, one id —
	so hovering a panel moves the crosshair on the total below it, and hovering the total puts the
	crosshair in every panel.

	`facetAll` marks the hovered date in *every* region and gives each panel its own tooltip beside
	its own point — the same shape as a group giving every chart one.
-->
<ChartGroup>
	<div class="grid gap-2">
		<div class="border rounded-sm p-2">
			<div class="text-sm text-surface-content/70">By region</div>
			<LineChart
				{data}
				x="date"
				y="value"
				fx="region"
				highlight={{ lines: true, points: true, facetAll: true }}
				props={{ tooltip: { root: { facetAll: true } } }}
				height={140}
				padding={{ left: 40, bottom: 20, top: 20 }}
			/>
		</div>

		<div class="border rounded-sm p-2">
			<div class="text-sm text-surface-content/70">Total</div>
			<LineChart data={totals} x="date" y="value" height={100} padding={{ left: 40, bottom: 20 }} />
		</div>
	</div>
</ChartGroup>
