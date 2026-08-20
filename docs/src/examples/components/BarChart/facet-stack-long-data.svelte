<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };
</script>

<BarChart
	{data}
	fx="year"
	x="basket"
	y="value"
	c="fruit"
	axis="y"
	bandPadding={0.2}
	tooltipContext={{ mode: 'facet' }}
	facet={{ padding: 0.1, axis: { placement: 'bottom', tickLabelProps: { dy: 8 } } }}
	padding={defaultChartPadding({ axis: 'y', legend: true, bottom: 24 })}
	cRange={[
		'var(--color-apples)',
		'var(--color-bananas)',
		'var(--color-cherries)',
		'var(--color-grapes)'
	]}
	legend
	props={{
		facetAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: { header: { format: 'none' } }
	}}
	height={300}
/>
