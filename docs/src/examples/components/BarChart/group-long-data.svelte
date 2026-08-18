<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };
</script>

<!--
	`x1` names the sub-band inside each `x` band, so long data groups without being pivoted into a
	column per series first.
-->
<BarChart
	{data}
	x="year"
	x1="fruit"
	y="value"
	seriesLayout="group"
	c="fruit"
	legend
	cRange={[
		'var(--color-apples)',
		'var(--color-bananas)',
		'var(--color-cherries)',
		'var(--color-grapes)'
	]}
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	height={300}
/>
