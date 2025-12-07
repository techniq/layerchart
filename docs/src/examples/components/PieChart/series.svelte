<script lang="ts">
	import { PieChart } from 'layerchart';
	import { fruitColors } from '$lib/utils/fruits';
	import { longData } from '$lib/utils/data';
	import { group } from 'd3-array';

	const data = group(longData, (d) => d.year);
	export { data };
</script>

<PieChart
	key="fruit"
	cRange={fruitColors}
	value="value"
	series={Array.from(data, ([key, data]) => ({
		key: key.toString(),
		data
	}))}
	outerRadius={-25}
	innerRadius={-20}
	cornerRadius={5}
	padAngle={0.01}
	height={300}
/>
