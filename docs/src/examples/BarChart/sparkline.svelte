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

<div class="w-[124px] h-[24px]">
	<BarChart
		{data}
		x="date"
		y="value"
		axis={false}
		grid={false}
		bandPadding={0.1}
		props={{ bars: { radius: 1, strokeWidth: 0 } }}
	/>
</div>
