<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';
	import { group } from 'd3-array';

	const data = group(longData, (d) => d.year);
	export { data };
</script>

<PieChart
	key="fruit"
	value="value"
	series={[
		{ key: '2019', data: data.get(2019), props: { innerRadius: -20 } },
		{ key: '2018', data: data.get(2018), props: { outerRadius: -30 } }
	]}
	height={300}
/>
