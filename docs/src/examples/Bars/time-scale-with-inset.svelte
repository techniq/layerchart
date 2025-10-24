<script lang="ts">
	import { timeDay } from 'd3-time';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<Chart
	{data}
	x="value"
	xDomain={[0, null]}
	xNice={4}
	y="date"
	yInterval={timeDay}
	padding={{ left: 20, bottom: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Bars class="fill-primary" insets={{ y: 2 }} />
	</Layer>
</Chart>
