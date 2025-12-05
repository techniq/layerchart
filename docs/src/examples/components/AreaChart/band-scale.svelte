<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { longData } from '$lib/utils/data.js';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<AreaChart
	{data}
	xScale={scaleBand()}
	x="fruit"
	y="value"
	tooltip={{
		mode: 'band'
	}}
	padding={{ ...defaultChartPadding(), left: 30 }}
	height={300}
/>
