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
		'var(--color-apples)',
		'var(--color-bananas)',
		'var(--color-cherries)',
		'var(--color-grapes)'
	]}
	props={{
		yAxis: { format: 'metric' }
	}}
	height={300}
/>
