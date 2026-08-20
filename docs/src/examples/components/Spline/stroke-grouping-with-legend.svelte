<script lang="ts">
	import { Axis, Chart, defaultChartPadding, Layer, Legend, Spline } from 'layerchart';
	import { scalePoint } from 'd3-scale';
	import { sort } from '@layerstack/utils';
	import { longData } from '$lib/utils/data.js';

	// A point scale takes the domain in data order, so the years have to arrive in it
	const data = sort(longData, 'year');

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' },
		{ key: 'grapes', color: 'var(--color-grapes)' }
	];

	export { data };
</script>

<!--
	One `Spline` draws a line per fruit: `stroke="fruit"` names the column that splits them, and
	takes each line's color from the matching `series`.  Because the legend is naming those same
	fruit, hovering an item singles out its line and clicking hides it — even though a single mark
	drew them all.
-->
<Chart
	{data}
	x="year"
	xScale={scalePoint()}
	y="value"
	yNice
	{series}
	padding={defaultChartPadding({ legend: true, left: 24, bottom: 20 })}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule format="metric" />
		<Axis placement="bottom" rule format="none" />
		<Spline stroke="fruit" class="stroke-2" />
	</Layer>

	<Legend placement="bottom" />
</Chart>
