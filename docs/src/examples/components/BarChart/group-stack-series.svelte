<script lang="ts">
	import { BarChart } from 'layerchart';
	import { longData } from '$lib/utils/data.js';
	import { flatGroup } from 'd3-array';
	import { scaleBand } from 'd3-scale';

	// One row per year × basket, with a column per fruit to stack
	const data = flatGroup(
		longData,
		(d) => d.year,
		(d) => d.basket
	).map(([year, basket, rows]) => ({
		year,
		basket,
		...Object.fromEntries(rows.map((d) => [d.fruit, d.value]))
	}));

	export { data };
</script>

<!--
	`x1` puts each basket in its own sub-band, and the series stack within it — so the baskets are
	compared side by side while each keeps its own running total.
-->
<BarChart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.4).paddingOuter(0.2)}
	x1="basket"
	x1Scale={scaleBand().padding(0.1)}
	x1Range={({ xScale }) => [0, xScale.bandwidth?.() ?? 0]}
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' },
		{ key: 'grapes', color: 'var(--color-grapes)' }
	]}
	legend
	props={{
		yAxis: { format: 'metric' },
		tooltip: { header: { format: 'none' } }
	}}
	height={300}
/>
