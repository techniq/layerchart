<script lang="ts">
	import { LineChart } from 'layerchart';
	import { scalePoint } from 'd3-scale';
	import { sort } from '@layerstack/utils';
	import { longData } from '$lib/utils/data.js';

	// A point scale takes the domain in data order, so the years have to arrive in it
	const data = sort(longData, 'year');
	export { data };
</script>

<!--
	`c` names the categories the rows already carry, which is enough to split them into a line each
	and color them — no `series`, and nothing pivoted into a column per fruit.
-->
<LineChart
	{data}
	x="year"
	xScale={scalePoint()}
	y="value"
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
		yAxis: { format: 'metric' }
	}}
	height={300}
/>
