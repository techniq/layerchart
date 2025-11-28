<script lang="ts">
	import { AreaChart } from 'layerchart';
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
	height={300}
/>
