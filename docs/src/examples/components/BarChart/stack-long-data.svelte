<script lang="ts">
	import { BarChart } from 'layerchart';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };
</script>

<BarChart
	{data}
	x="year"
	y="value"
	c="fruit"
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
	legend
	height={300}
/>
