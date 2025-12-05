<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	onTooltipClick={(e, detail) => {
		console.log(e, detail);
		alert(JSON.stringify(detail));
	}}
	padding={{ ...defaultChartPadding(), right: 10 }}
	height={300}
/>
