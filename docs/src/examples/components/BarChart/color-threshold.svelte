<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { scaleThreshold } from 'd3-scale';

	const data = createDateSeries({ count: 10, min: -20, max: 50, value: 'integer' });

	export { data };
</script>

<BarChart
	{data}
	x="date"
	y="value"
	c="value"
	cScale={scaleThreshold()}
	cDomain={[0]}
	cRange={['var(--color-danger)', 'var(--color-success)']}
	height={300}
/>
