<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { scaleTime } from 'd3-scale';

	const data = createDateSeries({
		count: 100,
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
	props={{ xAxis: { ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks() } }}
	height={300}
/>
