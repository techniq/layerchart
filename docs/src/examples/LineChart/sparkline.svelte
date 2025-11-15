<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 50, min: 50, max: 100 });

	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	yDomain={null}
	axis={false}
	grid={false}
	props={{
		highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
	}}
	padding={{ left: 20 }}
	width={124}
	height={18}
/>
