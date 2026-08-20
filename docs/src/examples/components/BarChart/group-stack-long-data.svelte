<script lang="ts">
	import { BarChart } from 'layerchart';
	import { longData } from '$lib/utils/data.js';
	import { scaleBand } from 'd3-scale';

	const data = longData;
	export { data };
</script>

<BarChart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.4).paddingOuter(0.2)}
	x1="basket"
	x1Scale={scaleBand().padding(0.1)}
	x1Range={({ xScale }) => [0, xScale.bandwidth?.() ?? 0]}
	y="value"
	c="fruit"
	cRange={[
		'var(--color-apples)',
		'var(--color-bananas)',
		'var(--color-cherries)',
		'var(--color-grapes)'
	]}
	legend
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: { header: { format: 'none' } }
	}}
	height={300}
/>
