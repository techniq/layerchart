<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { mean } from 'd3-array';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };
</script>

<BarChart
	{data}
	x="date"
	y="value"
	annotations={[
		{
			type: 'line',
			y: mean(data, (d) => d.value),
			label: 'Avg',
			props: {
				line: { class: '[stroke-dasharray:2,2] stroke-danger' },
				label: { class: 'fill-danger' }
			}
		}
	]}
	height={300}
/>
