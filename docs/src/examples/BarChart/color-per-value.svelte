<script lang="ts">
	import { BarChart } from 'layerchart';
	import { longData } from '$lib/utils/data.js';

	const data = longData.filter((d) => d.year === 2019);

	export { data };
</script>

<BarChart
	{data}
	x="fruit"
	y="value"
	c="fruit"
	cRange={[
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-success)',
		'var(--color-info)'
	]}
	props={{
		yAxis: { format: 'metric' }
	}}
	height={300}
/>
