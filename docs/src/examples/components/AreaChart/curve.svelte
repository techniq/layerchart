<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { curveCatmullRom } from 'd3-shape';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	props={{ area: { curve: curveCatmullRom } }}
	padding={{ ...defaultChartPadding(), right: 10 }}
	height={300}
/>
