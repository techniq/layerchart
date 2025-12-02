<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { scalePoint } from 'd3-scale';
	import { longData } from '$lib/utils/data.js';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<AreaChart {data} xScale={scalePoint()} x="fruit" y="value" height={300} />
