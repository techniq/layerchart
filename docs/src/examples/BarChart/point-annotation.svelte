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

<div class="h-[300px] p-4 border rounded-sm">
	<BarChart
		{data}
		x="date"
		y="value"
		annotations={[
			{
				type: 'point',
				x: data[data.length - 1].date,
				r: 4,
				label: 'Today',
				labelPlacement: 'bottom',
				labelYOffset: 16,
				props: {
					circle: { class: 'fill-secondary' },
					label: { class: 'text-xs fill-secondary font-bold' }
				}
			}
		]}
		height={300}
	/>
</div>
