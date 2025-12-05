<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { scalePoint } from 'd3-scale';
	import { longData } from '$lib/utils/data.js';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<AreaChart
	{data}
	xScale={scalePoint()}
	x="fruit"
	y="value"
	padding={{ ...defaultChartPadding(), left: 30, right: 15 }}
	height={300}
/>
