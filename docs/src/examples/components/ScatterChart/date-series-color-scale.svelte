<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { scaleThreshold } from 'd3-scale';

	const data = createDateSeries({ count: 30, min: 20, max: 100, value: 'integer' });
	export { data };
</script>

<ScatterChart
	{data}
	x="date"
	y="value"
	yBaseline={0}
	c="value"
	cScale={scaleThreshold()}
	cDomain={[50]}
	cRange={['var(--color-danger)', 'var(--color-success)']}
	padding={24}
	height={400}
/>
