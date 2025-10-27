<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data1 = createDateSeries({
		count: 30,
		min: 20,
		max: 80,
		value: 'integer',
		keys: ['value']
	});

	const data2 = createDateSeries({
		count: 30,
		min: 40,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	export { data1, data2 };
</script>

<div class="h-[300px] p-4 border rounded-sm">
	<Chart
		data={data1}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y="value"
		yNice
		padding={{ left: 16, bottom: 24 }}
		tooltip={{ mode: 'bisect-x' }}
		height={300}
	>
		<Axis placement="left" grid rule format="integer" />
		<Axis placement="bottom" />
		<Bars data={data1} rounded="top" strokeWidth={1} class="fill-primary" opacity={0.7} />
		<Bars data={data2} rounded="top" strokeWidth={1} class="fill-secondary" opacity={0.7} />
		<Highlight area />
	</Chart>
</div>
