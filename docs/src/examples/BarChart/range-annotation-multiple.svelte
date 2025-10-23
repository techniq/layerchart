<script lang="ts">
	import { BarChart } from 'layerchart';
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

<BarChart
	{data}
	x="date"
	y="value"
	annotations={[
		{
			type: 'range',
			data: {
				x: [data[1]?.date, data[3]?.date],
				y: [0, 100]
			},
			props: {
				class: 'fill-danger/20 stroke-danger'
			}
		},
		{
			type: 'range',
			data: {
				x: [data[6]?.date, data[8]?.date],
				y: [0, 100]
			},
			props: {
				class: 'fill-success/20 stroke-success'
			}
		}
	]}
	height={300}
/>
