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
			type: 'line',
			data: { y: 50 },
			props: {
				class: 'stroke-danger stroke-2'
			}
		}
	]}
	height={300}
/>
